import assert from 'node:assert/strict';
import test from 'node:test';
import { QuorumScopeApiError, QuorumScopeClient } from '../src/index.ts';

// Payloads use required fields from the committed engine OpenAPI snapshot.
const network = { id: '00000000-0000-0000-0000-000000000001', name: 'Fixture network', passphrase: 'fixture' };

test('normalizes the base URL and supports custom fetch and headers', async () => {
  const calls = [];
  const client = new QuorumScopeClient({
    baseUrl: 'https://api.example.test/',
    headers: { 'X-Test': 'fixture' },
    fetch: async (input, init) => {
      calls.push({ input: String(input), init });
      return Response.json(network);
    },
  });
  assert.deepEqual(await client.network.get(), network);
  assert.equal(calls[0].input, 'https://api.example.test/api/v1/network');
  assert.equal(calls[0].init.headers['X-Test'], 'fixture');
});

test('serializes page parameters and encodes identifiers', async () => {
  const urls = [];
  const client = new QuorumScopeClient({
    baseUrl: 'https://api.example.test',
    fetch: async (input) => {
      urls.push(String(input));
      return Response.json({ items: [], page: 2, page_size: 25 });
    },
  });
  await client.frozenKeys.list({ networkId: network.id, page: 2, pageSize: 25 });
  await client.incidents.timeline('a/b', { page: 3 });
  assert.equal(urls[0], `https://api.example.test/api/v1/frozen-keys?network_id=${network.id}&page=2&page_size=25`);
  assert.equal(urls[1], 'https://api.example.test/api/v1/incidents/a%2Fb/timeline?page=3');
});

test('preserves the actual engine error envelope and request ID', async () => {
  const client = new QuorumScopeClient({
    baseUrl: 'https://api.example.test',
    fetch: async () => Response.json({
      error: { code: 'invalid_network', message: 'Network was not found.' },
      request_id: '00000000-0000-0000-0000-000000000002',
    }, { status: 404 }),
  });
  await assert.rejects(client.network.get(), (error) => {
    assert.ok(error instanceof QuorumScopeApiError);
    assert.equal(error.status, 404);
    assert.equal(error.code, 'invalid_network');
    assert.equal(error.requestId, '00000000-0000-0000-0000-000000000002');
    return true;
  });
});

test('reads the request ID from the nested error and falls back to the top level', async () => {
  const nested = new QuorumScopeClient({
    baseUrl: 'https://api.example.test',
    fetch: async () => Response.json({
      error: { code: 'not_found', message: 'Frozen key not found', details: { field: 'id' }, request_id: network.id },
    }, { status: 404 }),
  });
  await assert.rejects(nested.frozenKeys.get('x'), { code: 'not_found', requestId: network.id, details: { field: 'id' } });
});

test('serializes frozen key and impact filters', async () => {
  const urls = [];
  const client = new QuorumScopeClient({
    baseUrl: 'https://api.example.test',
    fetch: async (input) => {
      urls.push(String(input));
      return Response.json({ items: [], page: 1, page_size: 50 });
    },
  });
  await client.frozenKeys.list({ kind: 'account', active: false, page: 2 });
  await client.impact.get({ evidenceClass: 'direct', keyKind: 'trustline', keyId: 'ab', pageSize: 10 });
  assert.equal(urls[0], 'https://api.example.test/api/v1/frozen-keys?page=2&kind=account&active=false');
  assert.equal(
    urls[1],
    'https://api.example.test/api/v1/impact?page_size=10&evidence_class=direct&key_kind=trustline&key_id=ab',
  );
});

test('preflight sends one JSON POST and never retries on failure', async () => {
  const calls = [];
  const client = new QuorumScopeClient({
    baseUrl: 'https://api.example.test',
    fetch: async (input, init) => {
      calls.push({ url: String(input), init });
      return Response.json({ error: { code: 'storage_error', message: 'Storage read failed', details: {}, request_id: network.id }, request_id: network.id }, { status: 500 });
    },
  });
  await assert.rejects(client.preflight.analyze({ transactionXdr: 'AAAA\nBBBB', networkId: network.id }), { status: 500, code: 'storage_error' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.example.test/api/v1/preflight');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(calls[0].init.body), { transaction_xdr: 'AAAA\nBBBB', network_id: network.id });
});

test('preflight forwards AbortSignal and returns the engine result unchanged', async () => {
  const controller = new AbortController();
  const result = { request_id: network.id, network_id: network.id, status: 'state_unavailable', confidence: 'insufficient_information', is_bypassed: false, freshness: { status: 'unknown', compatibility: 'unknown' }, findings: [] };
  const client = new QuorumScopeClient({
    baseUrl: 'https://api.example.test',
    fetch: async (_input, init) => {
      assert.equal(init.signal, controller.signal);
      return Response.json(result);
    },
  });
  assert.deepEqual(await client.preflight.analyze({ transactionXdr: 'AAAA' }, { signal: controller.signal }), result);
});

test('uses safe messages for unknown errors and malformed success responses', async () => {
  const failed = new QuorumScopeClient({ baseUrl: 'https://api.example.test', fetch: async () => new Response('failure', { status: 500 }) });
  await assert.rejects(failed.status.get(), { code: 'unknown_error', message: 'The API request failed.' });
  const malformed = new QuorumScopeClient({ baseUrl: 'https://api.example.test', fetch: async () => Response.json([]) });
  await assert.rejects(malformed.network.get(), { code: 'invalid_response' });
});

test('forwards AbortSignal', async () => {
  const controller = new AbortController();
  const client = new QuorumScopeClient({
    baseUrl: 'https://api.example.test',
    fetch: async (_input, init) => {
      assert.equal(init.signal, controller.signal);
      return Response.json(network);
    },
  });
  await client.network.get({}, { signal: controller.signal });
});

test('every published read method reaches its engine route and returns the response', async () => {
  const keyId = 'a'.repeat(64);
  const episodeId = '00000000-0000-0000-0000-000000000003';
  const cases = [
    ['/api/v1/network', client => client.network.get(), network],
    ['/api/v1/freeze-state', client => client.freezeState.get(), { network_id: network.id, frozen_key_count: 0, bypass_count: 0, active_incident_count: 0 }],
    ['/api/v1/frozen-keys', client => client.frozenKeys.list(), { items: [], page: 1, page_size: 50 }],
    [`/api/v1/frozen-keys/${keyId}`, client => client.frozenKeys.get(keyId), { id: keyId, network_id: network.id, active: true, history: [] }],
    ['/api/v1/impact', client => client.impact.get(), { items: [], page: 1, page_size: 50, collected_evidence_classes: ['direct'], uncollected_evidence_classes: ['inferred'] }],
    ['/api/v1/bypasses', client => client.bypasses.list(), { items: [], page: 1, page_size: 50 }],
    ['/api/v1/incidents', client => client.incidents.list(), { items: [], page: 1, page_size: 50 }],
    [`/api/v1/incidents/${episodeId}`, client => client.incidents.get(episodeId), { id: episodeId, network_id: network.id, basis: 'fixture', opened_ledger: 1, status: 'fixture' }],
    [`/api/v1/incidents/${episodeId}/timeline`, client => client.incidents.timeline(episodeId), { items: [], page: 1, page_size: 50 }],
    ['/api/v1/status', client => client.status.get(), { network_id: network.id, stream: 'fixture', last_complete_ledger: 1, updated_at: '2026-10-04T00:00:00Z' }],
    ['/health/live', client => client.health.live(), { status: 'fixture' }],
    ['/health/ready', client => client.health.ready(), { status: 'fixture' }],
  ];
  for (const [path, call, payload] of cases) {
    let seen;
    const client = new QuorumScopeClient({
      baseUrl: 'https://api.example.test',
      fetch: async (input, init) => {
        seen = { url: String(input), method: init.method };
        return Response.json(payload);
      },
    });
    assert.deepEqual(await call(client), payload);
    assert.deepEqual(seen, { url: `https://api.example.test${path}`, method: 'GET' });
  }
});

test('every published read method preserves an engine error', async () => {
  const calls = [
    client => client.network.get(),
    client => client.freezeState.get(),
    client => client.frozenKeys.list(),
    client => client.frozenKeys.get('id'),
    client => client.impact.get(),
    client => client.preflight.analyze({ transactionXdr: 'AAAA' }),
    client => client.bypasses.list(),
    client => client.incidents.list(),
    client => client.incidents.get('id'),
    client => client.incidents.timeline('id'),
    client => client.status.get(),
    client => client.health.live(),
    client => client.health.ready(),
  ];
  const client = new QuorumScopeClient({
    baseUrl: 'https://api.example.test',
    fetch: async () => Response.json({ error: { code: 'fixture_error', message: 'Fixture failure.' }, request_id: network.id }, { status: 503 }),
  });
  for (const call of calls) {
    await assert.rejects(call(client), { status: 503, code: 'fixture_error', requestId: network.id });
  }
});

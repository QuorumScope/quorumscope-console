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

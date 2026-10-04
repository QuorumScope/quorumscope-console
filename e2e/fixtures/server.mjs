import { createServer } from 'node:http';

const networkId = '00000000-0000-0000-0000-000000000001';
const episodeId = '00000000-0000-0000-0000-000000000002';
const keyId = 'a'.repeat(64);
const response = (body, status = 200) => ({ body, status });
const page = (url, items) => response({ items: url.searchParams.get('page') === '2' ? [] : items, page: Number(url.searchParams.get('page') || '1'), page_size: 25 });

const network = { id: networkId, name: 'Fixture network', passphrase: 'Fixture network passphrase' };
const freezeState = { network_id: networkId, frozen_key_count: 1, bypass_count: 1, active_incident_count: 1, latest_ledger: 12345 };
const key = { id: keyId, network_id: networkId, active_since: 12340, last_changed: 12344, evidence_ref: 'fixture-key-evidence' };
const bypass = { tx_hash: 'b'.repeat(64), network_id: networkId, active_since: 12341, last_changed: 12343, evidence_ref: 'fixture-bypass-evidence' };
const episode = { id: episodeId, network_id: networkId, basis: 'fixture-basis', opened_ledger: 12340, closed_ledger: null, opened_close_time: '2026-10-04T00:00:00Z', closed_close_time: null, status: 'active' };
const event = { id: 1, incident_id: episodeId, ledger_sequence: 12340, kind: 'fixture-event', evidence_ref: 'fixture-event-evidence', created_at: '2026-10-04T00:00:00Z' };
const status = { network_id: networkId, stream: 'fixture-indexer', last_complete_ledger: 12345, updated_at: '2026-10-04T00:00:00Z' };

const server = createServer((request, reply) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1:4010');
  let result;
  if (request.method !== 'GET') result = response({ error: { code: 'method_not_allowed', message: 'Method is not supported.' }, request_id: networkId }, 405);
  else if (url.pathname === '/api/v1/network') result = response(network);
  else if (url.pathname === '/api/v1/freeze-state') result = response(freezeState);
  else if (url.pathname === '/api/v1/frozen-keys') result = page(url, [key]);
  else if (url.pathname === `/api/v1/frozen-keys/${keyId}`) result = response(key);
  else if (url.pathname === '/api/v1/bypasses') result = page(url, [bypass]);
  else if (url.pathname === '/api/v1/incidents') result = page(url, [episode]);
  else if (url.pathname === `/api/v1/incidents/${episodeId}`) result = response(episode);
  else if (url.pathname === `/api/v1/incidents/${episodeId}/timeline`) result = page(url, [event]);
  else if (url.pathname === '/api/v1/status') result = response(status);
  else if (url.pathname === '/health/live' || url.pathname === '/health/ready') result = response({ status: 'fixture-ready' });
  else result = response({ error: { code: 'not_found', message: 'Fixture route was not found.' }, request_id: networkId }, 404);
  reply.writeHead(result.status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-QuorumScope-Fixture': 'synthetic-openapi-shape' });
  reply.end(JSON.stringify(result.body));
});

server.listen(4010, '127.0.0.1');

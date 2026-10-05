// Fixture engine for browser tests only. Every value is synthetic and shaped from the committed
// OpenAPI snapshot. Nothing here is network data, and it is never part of the production bundle.
import { createServer } from 'node:http';

const origin = 'http://127.0.0.1:3100';
const networkId = '00000000-0000-0000-0000-000000000001';
const episodeId = '00000000-0000-0000-0000-000000000002';
const requestId = '00000000-0000-0000-0000-0000000000aa';
const keyId = 'a'.repeat(64);
const goneKeyId = 'c'.repeat(64);
const response = (body, status = 200) => ({ body, status });
const page = (url, items) => response({ items: url.searchParams.get('page') === '2' ? [] : items, page: Number(url.searchParams.get('page') || '1'), page_size: 25 });
const failure = (code, message, status) => response({ error: { code, message, details: {}, request_id: requestId }, request_id: requestId }, status);

const scenarios = {
  default: {},
  empty: { empty: true },
  stale: { freshness: { status: 'stale', observed_at: '2026-10-03T00:00:00Z' } },
  behind: { freshness: { status: 'indexing_behind', latest_network_ledger: 12400, ingestion_lag_ledgers: 55 } },
  unverified: { freshness: { compatibility: 'unverified_protocol', current_protocol_version: 29 } },
  unavailable: { down: true },
  slow: { delay: 1500 },
};
let scenario = 'default';

function freshness() {
  return {
    status: 'current',
    source_ledger: 12345,
    latest_network_ledger: 12346,
    latest_indexed_ledger: 12345,
    ingestion_lag_ledgers: 1,
    observed_at: '2026-10-04T00:00:00Z',
    last_reconciled_ledger: 12345,
    last_reconciled_at: '2026-10-04T00:00:00Z',
    current_protocol_version: 28,
    verified_protocol_max: 28,
    compatibility: 'verified',
    ...scenarios[scenario].freshness,
  };
}

const network = () => ({ id: networkId, name: 'Fixture network', passphrase: 'Fixture network passphrase', freshness: freshness() });
const freezeState = () => ({
  freshness: freshness(),
  network_id: networkId,
  frozen_key_count: scenarios[scenario].empty ? 0 : 1,
  bypass_count: scenarios[scenario].empty ? 0 : 1,
  active_incident_count: scenarios[scenario].empty ? 0 : 1,
  latest_ledger: 12345,
});
const key = {
  id: keyId, network_id: networkId, active: true, kind: 'account', decoded: { account_id: 'synthetic-account' },
  canonical_xdr: 'AAAAAAAAAAA=', active_since: 12340, first_frozen_ledger: 12300, last_changed: 12344, evidence_ref: 'fixture-key-evidence',
};
const goneKey = { ...key, id: goneKeyId, active: false, active_since: null, evidence_ref: null };
const history = [
  { ledger_sequence: 12300, action: 'freeze', result: 'changed', evidence_ref: 'fixture-history-one', recorded_at: '2026-10-01T00:00:00Z' },
  { ledger_sequence: 12320, action: 'unfreeze', result: 'changed', evidence_ref: 'fixture-history-two', recorded_at: '2026-10-02T00:00:00Z' },
  { ledger_sequence: 12340, action: 'freeze', result: 'changed', evidence_ref: 'fixture-key-evidence', recorded_at: '2026-10-03T00:00:00Z' },
];
const bypass = { tx_hash: 'b'.repeat(64), network_id: networkId, active_since: 12341, last_changed: 12343, evidence_ref: 'fixture-bypass-evidence' };
const episode = { id: episodeId, network_id: networkId, basis: 'fixture-basis', opened_ledger: 12340, closed_ledger: null, opened_close_time: null, closed_close_time: null, status: 'active' };
const event = { id: 1, incident_id: episodeId, ledger_sequence: 12340, kind: 'fixture-event', evidence_ref: 'fixture-event-evidence', created_at: '2026-10-04T00:00:00Z' };
const status = () => ({ freshness: freshness(), network_id: networkId, stream: 'fixture-indexer', last_complete_ledger: 12345, updated_at: '2026-10-04T00:00:00Z' });

const window = (first, last) => ({ first_ledger: first, last_ledger: last, provider: 'fixture_provider', is_complete_for_range: false });
const impact = (url) => ({
  items: (scenarios[scenario].empty ? [] : [
    { evidence_class: 'direct', key_id: keyId, key_kind: 'account', description: 'This key is in the active freeze set. It has been frozen since ledger 12340.', observation_window: window(12340, 12345), evidence_ref: 'fixture-key-evidence', details: { active_since: 12340 } },
    { evidence_class: 'protocol_derived', key_id: null, key_kind: null, description: 'Frozen key counts recorded at ledger 12340, derived from the stored freeze set.', observation_window: window(12340, 12340), evidence_ref: null, details: { frozen_accounts: 1, frozen_trustlines: 0, bypassed_transactions: 1 } },
  ]).filter(r => !url.searchParams.get('evidence_class') || r.evidence_class === url.searchParams.get('evidence_class'))
    .filter(r => !url.searchParams.get('key_kind') || r.key_kind === url.searchParams.get('key_kind')),
  page: 1,
  page_size: 50,
  collected_evidence_classes: ['direct', 'protocol_derived'],
  uncollected_evidence_classes: ['recently_observed', 'dependency_observed', 'inferred'],
});

const finding = (status, confidence, path, explanation, keys = []) => ({ status, confidence, implicated_keys: keys, protocol_path: path, explanation });
const analyses = {
  'fixtureClear': ['clear', 'deterministic', [], false],
  'fixtureBlocked': ['blocked_validation', 'deterministic', [finding('blocked_validation', 'deterministic', 'operation 0 (Payment): destination account', 'The transaction names a ledger key in the active freeze set (operation 0 (Payment): destination account).', [keyId])], false],
  'fixtureBypass': ['allowed_by_bypass', 'deterministic', [finding('blocked_validation', 'deterministic', 'transaction source account', 'The transaction names a ledger key in the active freeze set (transaction source account).', [keyId])], true],
  'fixtureApplyTime': ['apply_time_risk', 'conditional', [finding('apply_time_risk', 'conditional', 'operation 0 (ClaimClaimableBalance): opaque balance or pool identifiers', 'This operation names balances by opaque identifier, so a frozen trustline is detected only when the transaction is applied.')], false],
  'fixtureDex': ['dex_conditional', 'conditional', [finding('dex_conditional', 'conditional', 'operation 0 (ManageSellOffer): offer matching', 'While matching offers, QuorumScope cannot tell whether an offer owner is frozen.'), finding('dex_conditional', 'conditional', 'operation 1 (PathPaymentStrictSend): offer matching', 'Second DEX operation in the same transaction.')], false],
  'fixtureUnsupported': ['unsupported_analysis', 'insufficient_information', [finding('unsupported_analysis', 'insufficient_information', 'operation 0 (EndSponsoringFutureReserves): operation', 'QuorumScope does not analyze which ledger keys this operation touches.')], false],
};

function preflight(body) {
  const xdr = typeof body.transaction_xdr === 'string' ? body.transaction_xdr.replace(/\s+/g, '') : '';
  if (xdr === 'fixtureUnavailable') {
    return { request_id: requestId, network_id: networkId, status: 'state_unavailable', confidence: 'insufficient_information', is_bypassed: false, source_ledger: null, freshness: { ...freshness(), status: 'unknown' }, findings: [finding('state_unavailable', 'insufficient_information', 'freeze state', 'QuorumScope has no indexed freeze state for this network. No clear result was produced.')] };
  }
  if (xdr === 'fixtureServerError') return null;
  const found = analyses[xdr];
  if (!found) {
    return { request_id: requestId, network_id: networkId, status: 'invalid_input', confidence: 'deterministic', is_bypassed: false, source_ledger: 12345, freshness: freshness(), findings: [finding('invalid_input', 'deterministic', 'transaction_xdr', 'transaction_xdr is not a valid transaction envelope.')] };
  }
  const [statusName, confidence, findings, bypassed] = found;
  return { request_id: requestId, network_id: networkId, status: statusName, confidence, transaction_hash: 'd'.repeat(64), is_bypassed: bypassed, source_ledger: 12345, freshness: freshness(), findings };
}

function cors(reply) {
  reply.setHeader('Access-Control-Allow-Origin', origin);
  reply.setHeader('Access-Control-Allow-Headers', 'content-type');
  reply.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  reply.setHeader('Access-Control-Expose-Headers', 'x-request-id');
}

function send(reply, result) {
  const slow = scenarios[scenario].delay && result.status < 400 && !reply.req.url.startsWith('/__fixture/');
  setTimeout(() => {
    reply.writeHead(result.status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-QuorumScope-Fixture': 'synthetic-openapi-shape' });
    reply.end(JSON.stringify(result.body));
  }, slow ? scenarios[scenario].delay : 0);
}

const server = createServer((request, reply) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1:4010');
  cors(reply);
  if (request.method === 'OPTIONS') { reply.writeHead(204); reply.end(); return; }
  if (url.pathname.startsWith('/__fixture/scenario/')) {
    const name = url.pathname.split('/').pop();
    if (!scenarios[name]) return send(reply, response({ error: 'unknown scenario' }, 400));
    scenario = name;
    return send(reply, response({ scenario }));
  }
  if (url.pathname === '/health/ready' && !scenarios[scenario].down) return send(reply, response({ status: 'fixture-ready' }));
  if (scenarios[scenario].down && url.pathname !== '/__fixture/ping') {
    return send(reply, failure('storage_unavailable', 'Storage unavailable', 503));
  }
  if (request.method === 'POST' && url.pathname === '/api/v1/preflight') {
    let raw = '';
    request.on('data', chunk => { raw += chunk; });
    request.on('end', () => {
      let body;
      try { body = JSON.parse(raw); } catch { return send(reply, failure('invalid_input', 'Invalid request', 400)); }
      const result = preflight(body);
      send(reply, result ? response(result) : failure('storage_error', 'Storage read failed', 500));
    });
    return;
  }
  let result;
  if (request.method !== 'GET') result = failure('method_not_allowed', 'Method not allowed', 405);
  else if (url.pathname === '/api/v1/network') result = response(network());
  else if (url.pathname === '/api/v1/freeze-state') result = response(freezeState());
  else if (url.pathname === '/api/v1/frozen-keys') {
    const kind = url.searchParams.get('kind');
    const includeHistory = url.searchParams.get('active') === 'false';
    let items = scenarios[scenario].empty ? [] : [key, ...(includeHistory ? [goneKey] : [])];
    if (kind) items = items.filter(item => item.kind === kind);
    result = page(url, items);
  }
  else if (url.pathname === `/api/v1/frozen-keys/${keyId}`) result = response({ ...key, history });
  else if (url.pathname === `/api/v1/frozen-keys/${goneKeyId}`) result = response({ ...goneKey, history: history.slice(0, 2) });
  else if (url.pathname === '/api/v1/bypasses') result = page(url, scenarios[scenario].empty ? [] : [bypass]);
  else if (url.pathname === '/api/v1/incidents') result = page(url, scenarios[scenario].empty ? [] : [episode]);
  else if (url.pathname === `/api/v1/incidents/${episodeId}`) result = response(episode);
  else if (url.pathname === `/api/v1/incidents/${episodeId}/timeline`) result = page(url, [event]);
  else if (url.pathname === '/api/v1/impact') result = response(impact(url));
  else if (url.pathname === '/api/v1/status') result = response(status());
  else if (url.pathname === '/health/live') result = response({ status: 'fixture-ready' });
  else result = failure('not_found', 'Fixture route was not found.', 404);
  send(reply, result);
});

server.listen(4010, '127.0.0.1');

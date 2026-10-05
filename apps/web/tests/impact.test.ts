import assert from 'node:assert/strict';
import test from 'node:test';
import type { ImpactRecord } from '@quorumscope/sdk';
import { MAX_NODES_PER_LANE, evidenceLabel, evidenceMark, evidenceClasses, isEvidenceClass, layoutMap, shortId } from '../lib/impact.ts';

// Synthetic records shaped from the engine OpenAPI snapshot.
function record(index: number, kind: string, evidenceClass = 'direct'): ImpactRecord {
  return {
    evidence_class: evidenceClass,
    key_id: index.toString(16).padStart(64, '0'),
    key_kind: kind,
    description: 'synthetic',
    details: {},
    observation_window: { first_ledger: 1, last_ledger: 2, provider: 'synthetic', is_complete_for_range: false },
  };
}

test('every evidence class has a label and its own mark', () => {
  assert.deepEqual(evidenceClasses.map(c => evidenceLabel[c]), ['Direct', 'Protocol-derived', 'Recently observed', 'Dependency observed', 'Inferred']);
  assert.equal(new Set(evidenceClasses.map(c => evidenceMark[c])).size, evidenceClasses.length);
  assert.equal(isEvidenceClass('inferred'), true);
  assert.equal(isEvidenceClass('guess'), false);
});

test('layout is deterministic and keeps each key kind in its own lane', () => {
  const records = [record(1, 'account'), record(2, 'trustline'), record(3, 'contract_code'), record(4, 'account')];
  const first = layoutMap(records);
  assert.deepEqual(first, layoutMap(records));
  assert.deepEqual(first.lanes.map(l => [l.kind, l.total]), [['account', 2], ['trustline', 1], ['contract_data', 0], ['contract_code', 1]]);
  const xs = new Set(first.nodes.filter(n => n.kind === 'account').map(n => n.x));
  assert.equal(xs.size, 1);
});

test('a large result set is capped per lane and the rest is counted, not drawn', () => {
  const records = Array.from({ length: 5000 }, (_, i) => record(i, 'account'));
  const layout = layoutMap(records);
  assert.equal(layout.nodes.length, MAX_NODES_PER_LANE);
  assert.equal(layout.lanes[0]?.total, 5000);
  assert.equal(layout.lanes[0]?.hidden, 5000 - MAX_NODES_PER_LANE);
});

test('only direct records with a known key kind reach the map', () => {
  const layout = layoutMap([
    record(1, 'account', 'protocol_derived'),
    record(2, 'account', 'inferred'),
    { ...record(3, 'account'), key_id: null },
    record(4, 'unknown_kind'),
    record(5, 'trustline'),
  ]);
  assert.deepEqual(layout.nodes.map(n => n.kind), ['trustline']);
});

test('long key ids are shortened for display only', () => {
  assert.equal(shortId('abc'), 'abc');
  assert.equal(shortId('a'.repeat(64)), `${'a'.repeat(8)}…${'a'.repeat(6)}`);
});

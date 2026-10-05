import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_XDR_CHARS, confidenceLabel, statusLabel, toneFor, validateXdr } from '../lib/preflight.ts';

const statuses = [
  'clear',
  'blocked_validation',
  'allowed_by_bypass',
  'apply_time_risk',
  'dex_conditional',
  'invalid_input',
  'unsupported_analysis',
  'state_unavailable',
] as const;

test('every engine status has its documented label', () => {
  assert.deepEqual(Object.keys(statusLabel).sort(), [...statuses].sort());
  assert.equal(statusLabel.clear, 'No active freeze conflict detected');
  assert.equal(statusLabel.state_unavailable, 'Current freeze state unavailable');
  assert.equal(confidenceLabel.insufficient_information, 'Insufficient information');
});

const fresh = (status: 'current' | 'indexing_behind' | 'stale' | 'unknown') => ({ status, compatibility: 'verified' as const });

test('calm styling is only for a clear result from current state', () => {
  assert.equal(toneFor({ status: 'clear', freshness: fresh('current') }), 'calm');
  assert.equal(toneFor({ status: 'clear', freshness: fresh('indexing_behind') }), 'neutral');
  assert.equal(toneFor({ status: 'clear', freshness: fresh('stale') }), 'neutral');
});

test('no other status gets calm styling, and state unavailable never looks like success', () => {
  for (const status of statuses.filter(s => s !== 'clear')) {
    assert.notEqual(toneFor({ status, freshness: fresh('current') }), 'calm', status);
  }
  assert.equal(toneFor({ status: 'state_unavailable', freshness: fresh('current') }), 'attention');
  assert.equal(toneFor({ status: 'blocked_validation', freshness: fresh('current') }), 'blocked');
});

test('input validation catches empty, oversized, and non-base64 text but keeps line breaks', () => {
  assert.match(validateXdr('   ') ?? '', /Enter a transaction/);
  assert.match(validateXdr('A'.repeat(MAX_XDR_CHARS + 1)) ?? '', /larger/);
  assert.match(validateXdr('not valid!') ?? '', /Base64/);
  assert.equal(validateXdr('AAAA\nBBBB=\r\n'), undefined);
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const schema = JSON.parse(await readFile('packages/sdk/openapi/quorumscope-engine-v1.json', 'utf8'));

test('snapshot comes from the engine and exposes its current read endpoints', () => {
  assert.equal(schema.info.title, 'QuorumScope API');
  assert.equal(schema.paths['/api/v1/frozen-keys/{id}'].get.operationId, 'frozen_key');
  assert.equal(schema.paths['/api/v1/incidents/{id}/timeline'].get.operationId, 'timeline');
});

test('snapshot exposes preflight and impact with the engine status enums', () => {
  assert.equal(schema.paths['/api/v1/preflight'].post.operationId, 'preflight');
  assert.equal(schema.paths['/api/v1/impact'].get.operationId, 'impact');
  assert.deepEqual(schema.components.schemas.PreflightStatusResponse.enum, [
    'clear',
    'blocked_validation',
    'allowed_by_bypass',
    'apply_time_risk',
    'dex_conditional',
    'invalid_input',
    'unsupported_analysis',
    'state_unavailable',
  ]);
  assert.deepEqual(schema.components.schemas.PreflightConfidenceResponse.enum, [
    'deterministic',
    'conditional',
    'insufficient_information',
  ]);
});

test('freshness reports compatibility and freshness classes', () => {
  assert.deepEqual(schema.components.schemas.FreshnessStatus.enum, [
    'current',
    'indexing_behind',
    'stale',
    'unknown',
  ]);
  assert.deepEqual(schema.components.schemas.Compatibility.enum, [
    'verified',
    'unverified_protocol',
    'unknown',
  ]);
});

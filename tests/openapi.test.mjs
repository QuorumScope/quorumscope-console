import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const schema = JSON.parse(await readFile('packages/sdk/openapi/quorumscope-engine-v1.json', 'utf8'));

test('snapshot comes from the engine and exposes its current read endpoints', () => {
  assert.equal(schema.info.title, 'QuorumScope API');
  assert.equal(schema.paths['/api/v1/frozen-keys/{id}'].get.operationId, 'frozen_key');
  assert.equal(schema.paths['/api/v1/incidents/{id}/timeline'].get.operationId, 'timeline');
});

test('unsupported endpoints are absent from the current engine contract', () => {
  assert.equal(schema.paths['/api/v1/preflight'], undefined);
  assert.equal(schema.paths['/api/v1/impact'], undefined);
});

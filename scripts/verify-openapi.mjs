import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const path = 'packages/sdk/openapi/quorumscope-engine-v1.json';
const raw = await readFile(path);
const schema = JSON.parse(raw);
if (schema.info?.title !== 'QuorumScope API') throw new Error('Unexpected OpenAPI title.');
for (const route of ['/api/v1/network', '/api/v1/freeze-state', '/api/v1/status', '/api/v1/impact']) {
  if (!schema.paths?.[route]?.get) throw new Error(`Missing required route: ${route}`);
}
process.stdout.write(`Engine OpenAPI snapshot SHA-256: ${createHash('sha256').update(raw).digest('hex')}\n`);

if (!schema.paths?.['/api/v1/preflight']?.post) throw new Error('Missing required route: POST /api/v1/preflight');

const directory = await mkdtemp(join(tmpdir(), 'quorumscope-openapi-'));
try {
  const generated = join(directory, 'openapi.ts');
  execFileSync(resolve('node_modules/.bin/openapi-typescript'), [path, '-o', generated], { stdio: 'pipe' });
  const expected = await readFile('packages/sdk/src/generated/openapi.ts', 'utf8');
  const actual = await readFile(generated, 'utf8');
  if (expected !== actual) throw new Error('Generated OpenAPI types are stale. Run pnpm openapi:generate.');
  process.stdout.write('Generated OpenAPI types match the engine snapshot.\n');
} finally {
  await rm(directory, { recursive: true, force: true });
}

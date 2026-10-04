import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const path = 'packages/sdk/openapi/quorumscope-engine-v1.json';
const raw = await readFile(path);
const schema = JSON.parse(raw);
if (schema.info?.title !== 'QuorumScope API') throw new Error('Unexpected OpenAPI title.');
for (const route of ['/api/v1/network', '/api/v1/freeze-state', '/api/v1/status']) {
  if (!schema.paths?.[route]?.get) throw new Error(`Missing required route: ${route}`);
}
process.stdout.write(`Engine OpenAPI snapshot SHA-256: ${createHash('sha256').update(raw).digest('hex')}\n`);

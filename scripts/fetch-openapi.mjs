import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = process.env.QUORUMSCOPE_ENGINE_OPENAPI_SOURCE;
if (!source) {
  throw new Error('Set QUORUMSCOPE_ENGINE_OPENAPI_SOURCE to the real engine OpenAPI JSON file.');
}
const input = resolve(source);
const output = resolve('packages/sdk/openapi/quorumscope-engine-v1.json');
const schema = JSON.parse(await readFile(input, 'utf8'));
if (schema.info?.title !== 'QuorumScope API' || !schema.paths?.['/api/v1/network']) {
  throw new Error('The source is not a recognized QuorumScope engine OpenAPI document.');
}
await mkdir(resolve('packages/sdk/openapi'), { recursive: true });
await copyFile(input, output);
process.stdout.write(`Copied engine OpenAPI from ${input}\n`);

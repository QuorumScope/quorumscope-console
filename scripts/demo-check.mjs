import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { QuorumScopeClient } from '@quorumscope/sdk';

const engine = process.env.QS_ENGINE_URL ?? 'http://127.0.0.1:18080';
const consoleUrl = process.env.QS_CONSOLE_URL ?? 'http://127.0.0.1:3100';
const fixturePath = process.env.QS_DEMO_FIXTURE;
if (!fixturePath) throw new Error('QS_DEMO_FIXTURE is required');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));

const client = new QuorumScopeClient({ baseUrl: engine });
const network = await client.network.get();
const freezeState = await client.freezeState.get();
const keys = await client.frozenKeys.list();
const bypasses = await client.bypasses.list();
const impact = await client.impact.get();
const blocked = await client.preflight.analyze({ transactionXdr: fixture.blocked_transaction_xdr });
const bypassed = await client.preflight.analyze({ transactionXdr: fixture.bypassed_transaction_xdr });

const checks = [
  ['SDK network protocol is 29', network.freshness.current_protocol_version === 29],
  ['SDK reports verified compatibility', network.freshness.compatibility === 'verified'],
  ['SDK sees one frozen key', freezeState.frozen_key_count === 1 && keys.items.length === 1],
  ['SDK sees one active bypass', freezeState.bypass_count === 1 && bypasses.items.length === 1],
  ['SDK sees direct impact evidence', impact.items.some(item => item.evidence_class === 'direct')],
  ['SDK sees blocked preflight', blocked.status === 'blocked_validation'],
  ['SDK sees bypassed preflight', bypassed.status === 'allowed_by_bypass' && bypassed.is_bypassed],
];
for (const [name, ok] of checks) {
  console.log(`${ok ? 'pass' : 'FAIL'}  ${name}`);
  if (!ok) process.exitCode = 1;
}
if (process.exitCode) process.exit(1);

const browser = await chromium.launch();
const page = await browser.newPage();
const requests = [];
page.on('request', request => requests.push({ method: request.method(), url: request.url(), body: request.postData() ?? '' }));

for (const route of ['/', '/network', '/keys', '/bypasses', '/incidents', '/impact', '/status']) {
  const response = await page.goto(`${consoleUrl}${route}`);
  if (response?.status() !== 200) throw new Error(`${route} returned ${response?.status()}`);
}
await page.goto(`${consoleUrl}/keys`);
await page.getByText(fixture.frozen_account, { exact: true }).waitFor();
await page.goto(`${consoleUrl}/preflight`);
await page.getByLabel('Transaction envelope (base64 XDR)').fill(fixture.bypassed_transaction_xdr);
await page.getByRole('button', { name: 'Analyze transaction' }).click();
await page.locator('.result').waitFor();
if (!(await page.locator('.result').innerText()).match(/allowed by bypass/i)) {
  throw new Error('Console did not present the bypassed preflight result');
}
const body = fixture.bypassed_transaction_xdr;
const carriesTransaction = request => request.body.includes(body) || request.url.includes(body);
if (!requests.some(request => request.method === 'POST' && request.url === `${engine}/api/v1/preflight` && carriesTransaction(request))) {
  throw new Error('Browser did not send preflight XDR directly to the Engine');
}
if (requests.some(request => request.url.startsWith(consoleUrl) && carriesTransaction(request))) {
  throw new Error('Console server received the preflight XDR');
}
console.log('pass  Console renders the real Engine-backed non-empty state and direct preflight');
await browser.close();

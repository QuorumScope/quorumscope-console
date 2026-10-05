// Browser check against a running console and a real engine. Not part of CI.
// Usage: QS_CONSOLE_URL=http://127.0.0.1:3100 QS_ENGINE_URL=http://127.0.0.1:18080 \
//        QS_XDR_FILE=path/to/envelope.b64 node scripts/live-check.mjs
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const base = process.env.QS_CONSOLE_URL ?? 'http://127.0.0.1:3100';
const engine = process.env.QS_ENGINE_URL ?? 'http://127.0.0.1:18080';
const xdrFile = process.env.QS_XDR_FILE;
if (!xdrFile) throw new Error('Set QS_XDR_FILE to a file holding a base64 transaction envelope.');
const xdr = readFileSync(xdrFile, 'utf8').trim();
const marker = xdr.slice(0, 40);

const browser = await chromium.launch();
const page = await browser.newPage();
const requests = [];
page.on('request', r => requests.push({ method: r.method(), url: r.url(), body: r.postData() ?? '' }));

const failures = [];
const check = (name, ok) => { console.log(`${ok ? 'pass' : 'FAIL'}  ${name}`); if (!ok) failures.push(name); };

for (const route of ['/', '/network', '/status', '/keys', '/bypasses', '/incidents', '/impact', '/developers', '/preflight']) {
  const response = await page.goto(base + route);
  const text = (await page.locator('main').innerText()).replace(/\n+/g, ' | ');
  console.log(`\n${route} (${response?.status()})\n${text.slice(0, 900)}`);
  check(`${route} loads without an error state`, response?.status() === 200 && (await page.locator('.data-error').count()) === 0);
}

await page.goto(base + '/preflight');
await page.getByLabel('Transaction envelope (base64 XDR)').fill(xdr);
await page.getByRole('button', { name: 'Analyze transaction' }).click();
await page.locator('.result').waitFor();
console.log(`\npreflight result\n${(await page.locator('.result').innerText()).replace(/\n+/g, ' | ').slice(0, 900)}\n`);

const carries = r => r.body.includes(marker) || r.url.includes(marker);
check('the engine received the transaction by POST', requests.some(r => r.method === 'POST' && r.url === `${engine}/api/v1/preflight` && carries(r)));
check('the console server received no transaction', requests.filter(r => r.url.startsWith(base) && carries(r)).length === 0);
check('the transaction is not in the URL', !page.url().includes(marker));
check('the transaction is not in browser storage or cookies', !(await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }) + document.cookie)).includes(marker));
check('no POST went anywhere but the engine', requests.filter(r => r.method === 'POST' && !r.url.startsWith(engine)).length === 0);
check('no request left the console and engine origins', requests.every(r => r.url.startsWith(base) || r.url.startsWith(engine) || r.url.startsWith('data:')));
const other = 'http://127.0.0.1:9';
check('the content security policy blocks another origin', await page.evaluate(async url => { try { await fetch(url); return false; } catch { return true; } }, other));
check('the content security policy allows the engine origin', await page.evaluate(async url => { try { return (await fetch(`${url}/health/live`)).ok; } catch { return false; } }, engine));

await browser.close();
if (failures.length) { console.error(`\n${failures.length} check(s) failed`); process.exit(1); }

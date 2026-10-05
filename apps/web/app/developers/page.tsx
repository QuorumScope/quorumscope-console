import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Developers' };
export const dynamic = 'force-dynamic';

const example = `import { QuorumScopeClient, QuorumScopeApiError } from '@quorumscope/sdk';

const baseUrl = process.env.QUORUMSCOPE_API_BASE_URL;
if (!baseUrl) throw new Error('Set QUORUMSCOPE_API_BASE_URL.');
const client = new QuorumScopeClient({ baseUrl });

const freeze = await client.freezeState.get();
console.log(freeze.frozen_key_count, freeze.freshness.status, freeze.freshness.compatibility);

const keys = await client.frozenKeys.list({ kind: 'account', pageSize: 25 });
const detail = keys.items[0] ? await client.frozenKeys.get(keys.items[0].id) : undefined;
console.log(detail?.history);`;

const preflightExample = `const result = await client.preflight.analyze({ transactionXdr });

// result.status is one of: clear, blocked_validation, allowed_by_bypass, apply_time_risk,
// dex_conditional, invalid_input, unsupported_analysis, state_unavailable.
// Treat anything other than "clear" as a result to read, and never treat
// "state_unavailable" as success.
for (const finding of result.findings) {
  console.log(finding.status, finding.confidence, finding.protocol_path);
}`;

const errorExample = `try {
  await client.network.get();
} catch (error) {
  if (error instanceof QuorumScopeApiError) {
    // status, code (for example "not_found"), message, requestId, and details
    console.error(error.status, error.code, error.requestId);
  }
}`;

export default function DevelopersPage() {
  const baseUrl = process.env.NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL;
  return <>
    <p className="eyebrow">Developer reference</p>
    <h1>Use the engine API</h1>
    <p className="lede">The engine is the source of truth for network state, frozen keys, bypasses, freeze episodes, and service status. Preflight analyzes a transaction against the active freeze set. The TypeScript SDK wraps the API without reproducing protocol rules.</p>
    <section className="panel" aria-labelledby="api-title">
      <div className="panel-header"><h2 id="api-title">API origin</h2></div>
      <p className="mono">{baseUrl || 'No engine API origin is configured for this deployment.'}</p>
      <p>The contract exposes GET endpoints under <code>/api/v1</code> for network, freeze state, frozen keys, bypasses, freeze episodes, impact, and status, and <code>POST /api/v1/preflight</code>. List requests use numbered pages, not cursors. Responses that describe live state include a <code>freshness</code> object, and errors carry a request ID.</p>
      <p><a href="https://github.com/QuorumScope/quorumscope-engine/blob/34cb68e3d78b5c508328f6f51deca12d17ece0e2/openapi/openapi.json" target="_blank" rel="noopener noreferrer">View the source OpenAPI schema</a></p>
    </section>
    <section className="panel" aria-labelledby="sdk-title">
      <div className="panel-header"><h2 id="sdk-title">TypeScript SDK</h2></div>
      <p>The SDK is currently a private workspace package. It is available to repository workspaces as <code>@quorumscope/sdk</code>. Package publication and a public install command are pending.</p>
      <pre className="code-block" tabIndex={0}><code>{example}</code></pre>
      <h3>Preflight</h3>
      <pre className="code-block" tabIndex={0}><code>{preflightExample}</code></pre>
      <p>Preflight sends one POST and the SDK never retries it. The SDK runs in browsers and modern Node (global <code>fetch</code>, Node 24 or later in this workspace).</p>
      <h3>Errors</h3>
      <pre className="code-block" tabIndex={0}><code>{errorExample}</code></pre>
      <p><a href="https://github.com/QuorumScope/quorumscope-console/tree/main/packages/sdk" target="_blank" rel="noopener noreferrer">Browse SDK source</a></p>
    </section>
  </>;
}

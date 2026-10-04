import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Developers' };
export const dynamic = 'force-dynamic';

const example = `import { QuorumScopeClient, QuorumScopeApiError } from '@quorumscope/sdk';

const baseUrl = process.env.QUORUMSCOPE_API_BASE_URL;
if (!baseUrl) throw new Error('Set QUORUMSCOPE_API_BASE_URL.');
const client = new QuorumScopeClient({ baseUrl });

try {
  const network = await client.network.get();
  const freeze = await client.freezeState.get();
  const keys = await client.frozenKeys.list({ page: 1, pageSize: 25 });
  console.log(network.name, freeze.frozen_key_count, keys.items);
} catch (error) {
  if (error instanceof QuorumScopeApiError) {
    console.error(error.code, error.requestId);
  }
}`;

export default function DevelopersPage() {
  const baseUrl = process.env.NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL;
  return <>
    <p className="eyebrow">Developer reference</p>
    <h1>Use the engine API</h1>
    <p className="lede">The engine is the source of truth for network state, frozen keys, bypasses, freeze episodes, and service status. The TypeScript SDK wraps the current read API without reproducing protocol rules.</p>
    <section className="panel" aria-labelledby="api-title">
      <div className="panel-header"><h2 id="api-title">API origin</h2></div>
      <p className="mono">{baseUrl || 'No engine API origin is configured for this deployment.'}</p>
      <p>The current contract exposes GET endpoints under <code>/api/v1</code>. Read requests use numbered pages. Preflight and impact endpoints are not present in the checked-in engine schema.</p>
      <p><a href="https://github.com/QuorumScope/quorumscope-engine/blob/3bab6178414822ce89bd634a317e10242996a6e2/openapi/openapi.json" target="_blank" rel="noopener noreferrer">View the source OpenAPI schema</a></p>
    </section>
    <section className="panel" aria-labelledby="sdk-title">
      <div className="panel-header"><h2 id="sdk-title">TypeScript SDK</h2></div>
      <p>The SDK is currently a private workspace package. It is available to repository workspaces as <code>@quorumscope/sdk</code>. Package publication and a public install command are pending.</p>
      <pre className="code-block"><code>{example}</code></pre>
      <p><a href="https://github.com/QuorumScope/quorumscope-console/tree/main/packages/sdk" target="_blank" rel="noopener noreferrer">Browse SDK source</a></p>
    </section>
  </>;
}

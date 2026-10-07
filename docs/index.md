# QuorumScope Console Documentation

QuorumScope Console is the web interface and TypeScript SDK workspace for the QuorumScope platform, providing full operational visibility into Stellar Quorum Freeze (CAP-77).

## Documentation Index

- [Architecture](architecture.md): Next.js application structure, TypeScript SDK design, and client-direct preflight flow.
- [API Contract](api-contract.md): Alignment between the TypeScript SDK and the QuorumScope Engine OpenAPI specification.
- [Data Freshness](data-freshness.md): Interpretation of freshness indicators, ingestion lag, and compatibility states.
- [Preflight Analysis](preflight.md): In-browser candidate transaction evaluation and status treatments.
- [Impact & Freeze Map](impact.md): Visual Freeze Map lanes, evidence tables, and keyboard accessibility.
- [Accessibility](accessibility.md): Landmarks, color contrast tokens, polite live regions, and keyboard test records.
- [Design System](design-system.md): Visual hierarchy, responsive breakpoints, and theme management.
- [Testing & Verification](testing.md): Automated test suites, fixture provenance, and local/staging Lighthouse records.
- [Deployment](deployment.md): Vercel configuration, environment variables, CSP headers, and verification checklists.
- [Security & Privacy](security.md): Client-direct transaction handling, CSP enforcement, and zero-telemetry posture.
- [Known Limitations](limitations.md): Boundary conditions, testnet empty freeze sets, and infrastructure constraints.
- [Protocol Versions](versions.md): Tracking verified protocol versions and upgrade paths.
- [Release Notes](release-notes.md): Staging release notes for `v0.1.0-staging`.

## Staging Endpoints

- Staging Console: [https://quorumscope-console.vercel.app](https://quorumscope-console.vercel.app)
- Staging Engine API: [https://quorumscope-engine-api.onrender.com](https://quorumscope-engine-api.onrender.com)
- Engine OpenAPI JSON: [https://quorumscope-engine-api.onrender.com/openapi.json](https://quorumscope-engine-api.onrender.com/openapi.json)

## Quick SDK Example

```typescript
import { QuorumScopeClient } from '@quorumscope/sdk';

const client = new QuorumScopeClient({
  baseUrl: 'https://quorumscope-engine-api.onrender.com',
});

// Fetch network status and freshness
const network = await client.network.get();
console.log(`Network: ${network.name}, Status: ${network.freshness.status}`);

// Run candidate transaction preflight check
const preflight = await client.preflight.analyze({
  transactionXdr: '<BASE64_ENVELOPE_XDR>',
});
console.log(`Preflight Result: ${preflight.status}`);
```

# Release Notes

## Release v0.1.0-staging (2026-10-07)

QuorumScope Console `v0.1.0-staging` marks the initial staging deployment of the web console and TypeScript SDK for Stellar Quorum Freeze visibility.

### Summary of Deliverables

- **Next.js Web Console (`apps/web`)**: Provides full visibility into network state, frozen keys, bypass entries, freeze episodes, and data freshness.
- **Interactive Preflight Sandbox**: Evaluates candidate transaction envelopes in the browser against engine freeze sets without transmitting data to intermediate servers.
- **Impact Review & Freeze Map**: Interactive visual map rendering affected keys across structured lanes with keyboard navigation.
- **TypeScript SDK (`packages/sdk`)**: Type-safe SDK generated directly from the engine OpenAPI 3.0 specification.
- **Contract Drift Verification**: Automated testing ensuring TypeScript client types mirror the engine OpenAPI schema.
- **Accessible Design System**: WCAG AA compliant color contrast tokens in both light and dark themes, skip links, and polite live regions.

### Operational Status & Constraints

- **Staging URL**: [https://quorumscope-console.vercel.app](https://quorumscope-console.vercel.app)
- **Engine Staging API**: [https://quorumscope-engine-api.onrender.com](https://quorumscope-engine-api.onrender.com)
- **Protocol Status**: Surfaces `unverified_protocol` badge on testnet (Protocol 29 vs Protocol 28 verified max).
- **Freeze State**: Testnet currently holds 0 frozen keys. Non-empty freeze states are verified via fixture tests.
- **Infrastructure Latency**: Render free tier engine sleeps during inactivity, causing up to 60-second cold starts.
- **Production Scope**: This staging release is intended for testing, review, and feedback; it does not provide an enterprise production SLA.

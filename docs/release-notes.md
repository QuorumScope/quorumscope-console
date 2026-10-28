# Release Notes

## Release v0.1.1-staging (2026-10-28)

This hardening release aligns the Console with Engine Protocol 29 verification and adds a reproducible non-empty fixture demo path.

### What changed

- Added a deterministic cross-repository demo check using the real TypeScript SDK and Console routes.
- Verified Engine OpenAPI 3.1.0 snapshot parity and updated protocol compatibility messaging.
- Added Dependabot configuration for npm and GitHub Actions.
- Updated Next.js to 16.4.3 to clear the production dependency advisories reported by CI.
- Corrected deployed Lighthouse documentation and clarified the privacy boundary for browser-submitted preflight XDR.

### Honest status & constraints

- **Current Stellar network protocol**: Protocol 29 on Mainnet and Testnet.
- **QuorumScope verified maximum**: Protocol 29 for the CAP-77 workflow.
- **Protocol 30**: Upcoming and not active; the Console preserves a visible warning for a network beyond the verified maximum.
- **Live Testnet**: Testnet currently has no non-empty freeze state observed by QuorumScope.
- **Deterministic demo**: The non-empty freeze demonstration is fixture data, explicitly not a live Testnet incident.
- **Render free tier**: The backing Engine may sleep during inactivity; at review time its Render service was returning `Service Suspended`, so the deployed API requires a manual resume before use.
- **Production readiness**: No production SLA is provided.
- **Security audit**: No formal third-party security audit has been completed.

## Release v0.1.0-staging (2026-10-07)

QuorumScope Console `v0.1.0-staging` marks the initial staging deployment of the web console and TypeScript SDK for Stellar Quorum Freeze visibility.

### Summary of Deliverables

- **Next.js Web Console (`apps/web`)**: Provides full visibility into network state, frozen keys, bypass entries, freeze episodes, and data freshness.
- **Interactive Preflight Sandbox**: Evaluates candidate transaction envelopes in the browser against engine freeze sets without transmitting data to intermediate servers.
- **Impact Review & Freeze Map**: Interactive visual map rendering affected keys across structured lanes with keyboard navigation.
- **TypeScript SDK (`packages/sdk`)**: Type-safe SDK generated directly from the engine OpenAPI 3.1.0 specification.
- **Contract Drift Verification**: Automated testing ensuring TypeScript client types mirror the engine OpenAPI schema.
- **Accessible Design System**: WCAG AA compliant color contrast tokens in both light and dark themes, skip links, and polite live regions.

### Operational Status & Constraints

- **Staging URL**: [https://quorumscope-console.vercel.app](https://quorumscope-console.vercel.app)
- **Engine Staging API**: [https://quorumscope-engine-api.onrender.com](https://quorumscope-engine-api.onrender.com)
- **Protocol Status**: Surfaces the Engine's Protocol 29 compatibility status. A warning remains visible whenever a network is newer than the Engine's verified maximum.
- **Freeze State**: Testnet currently holds 0 frozen keys. Non-empty freeze states are verified via fixture tests.
- **Infrastructure Latency**: Render free tier engine sleeps during inactivity, causing up to 60-second cold starts.
- **Production Scope**: This staging release is intended for testing, review, and feedback; it does not provide an enterprise production SLA.

# QuorumScope Console

This repository is the frontend and TypeScript SDK workspace for QuorumScope. The authoritative CAP-77 state and API live in `quorumscope-engine`.

The SDK implements the current engine read endpoints. The web console is not yet implemented or deployed. The checked-in engine OpenAPI snapshot does not expose preflight or impact.

## Current checks

With Node 24.21.0 and pnpm 12.8.2:

```sh
pnpm install
pnpm lint
pnpm typecheck
pnpm test
```

See [API contract](docs/api-contract.md) and [version verification](docs/versions.md) for the current blockers and source details.

The SDK is a private workspace package until its public package build and publication process are complete. A workspace consumer can import `QuorumScopeClient` from `@quorumscope/sdk` and provide its real engine API base URL.

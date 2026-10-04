# QuorumScope Console

This repository is the frontend and TypeScript SDK workspace for QuorumScope. The authoritative CAP-77 state and API live in `quorumscope-engine`.

The SDK implements the current engine read endpoints. The web console has overview, network, status, and frozen-key pages that read the configured engine. Other pages are in progress. The site is not deployed. The checked-in engine OpenAPI snapshot does not expose preflight or impact.

## Current checks

With Node 24.21.0 and pnpm 12.8.2:

```sh
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

See [API contract](docs/api-contract.md) and [version verification](docs/versions.md) for the current blockers and source details.

The SDK is a private workspace package until its public package build and publication process are complete. A workspace consumer can import `QuorumScopeClient` from `@quorumscope/sdk` and provide its real engine API base URL.

Copy `.env.example` to `apps/web/.env.local` and set `NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL` to a real engine origin. Without it, the overview displays an explicit unavailable state.

# QuorumScope Console

This repository is the frontend and TypeScript SDK workspace for QuorumScope. The authoritative CAP-77 state and API live in `quorumscope-engine`.

The SDK implements the current engine read endpoints. The web console has overview, network, status, frozen-key, bypass, freeze-episode, and developer pages. The site is not deployed. The checked-in engine OpenAPI snapshot does not expose preflight or impact.

The interface supports light, dark, and system themes. The theme choice is the only preference saved in browser storage.

`/api/health` reports whether the web process can answer HTTP requests. It does not assert engine or network health. Use `/status` for engine-reported status when an API origin is configured.

## Current checks

With Node 24.21.0 and Corepack using pnpm 12.9.1:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm openapi:check
```

See [API contract](docs/api-contract.md) and [version verification](docs/versions.md) for the current blockers and source details.

The SDK is a private workspace package until its publication process is complete. A workspace consumer can import `QuorumScopeClient` from `@quorumscope/sdk` and provide its real engine API base URL.
Its build emits JavaScript and TypeScript declarations in `packages/sdk/dist`. `pnpm build` builds the SDK before the web app.

Copy `.env.example` to `apps/web/.env.local` and set `NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL` to a real engine origin. Without it, the overview displays an explicit unavailable state.

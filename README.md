# QuorumScope Console

This repository is the frontend and TypeScript SDK workspace for QuorumScope. The authoritative CAP-77 state and API live in `quorumscope-engine`.

The SDK covers every endpoint in the engine contract, including `POST /api/v1/preflight` and impact. The web console has overview, network, frozen-key list and detail with history, preflight, impact with the Freeze Map, freeze-episode, bypass, status, and developer pages. The site is not deployed.

Every page that shows live state also shows its data freshness and whether the network protocol is newer than the engine has verified. Fixture data is used only by browser tests.

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

See [API contract](docs/api-contract.md) and [version verification](docs/versions.md) for source details. Run `corepack pnpm e2e` for browser tests. It needs Playwright browsers installed.

The SDK is a private workspace package until its publication process is complete. A workspace consumer can import `QuorumScopeClient` from `@quorumscope/sdk` and provide its real engine API base URL.
Its build emits JavaScript and TypeScript declarations in `packages/sdk/dist`. `pnpm build` builds the SDK before the web app.

Copy `.env.example` to `apps/web/.env.local` and set `NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL` to a real engine origin. Without it, the overview displays an explicit unavailable state and the preflight form says the API is not configured. The preflight form posts from the browser to this origin, so the engine must list the console origin in its `ALLOWED_ORIGINS` setting.

## More documentation

[Architecture](docs/architecture.md), [data freshness](docs/data-freshness.md), [deployment](docs/deployment.md), [testing](docs/testing.md), [contributing](CONTRIBUTING.md), and [security](SECURITY.md).

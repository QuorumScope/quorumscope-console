# Architecture

```text
browser
  |
  v
quorumscope-console
  |
  v
quorumscope-engine API
  |
  v
Stellar network and QuorumScope database
```

## Responsibilities

`quorumscope-engine` owns CAP-77 state, frozen-key and bypass state, freeze episode derivation, freshness, and service status. This repository does not reimplement any of it.

`quorumscope-console` owns the TypeScript SDK in `packages/sdk` and the Next.js application in `apps/web`. It formats and presents engine responses and does not change their meaning.

## Workspace

- `packages/sdk` is a framework-independent client. Types come from the committed engine OpenAPI snapshot through `openapi-typescript`.
- `apps/web` is an App Router application. Pages are server components that fetch from the engine on each request. Interactive leaves, such as the theme switcher and mobile menu, are client components.
- `e2e` holds Playwright specs and a fixture engine used only by tests.

## Failure behavior

A failed engine request renders an explicit unavailable state. It never renders zero counts or an empty list. `/api/health` reports only that the web process answers HTTP.

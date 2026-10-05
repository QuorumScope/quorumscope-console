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

`quorumscope-engine` owns CAP-77 state, frozen-key and bypass state, preflight classification, impact evidence, freeze episode derivation, freshness, and compatibility. This repository does not reimplement any of it. The console never classifies a transaction and never computes bypass eligibility.

`quorumscope-console` owns the TypeScript SDK in `packages/sdk` and the Next.js application in `apps/web`. It formats and presents engine responses and does not change their meaning.

## Workspace

- `packages/sdk` is a framework-independent client. Types come from the committed engine OpenAPI snapshot through `openapi-typescript`.
- `apps/web` is an App Router application. Read pages are server components that fetch from the engine on each request. Interactive leaves are client components: the theme switcher, the mobile menu, the preflight form, and the Freeze Map.
- `e2e` holds Playwright specs and a fixture engine used only by tests.

## Preflight data path

The preflight form posts the transaction from the browser straight to the configured engine API. The console server never sees it. The transaction is held in component state only. It is not placed in the URL, local storage, session storage, or cookies. The content security policy allows connections only to the page origin and the configured engine origin.

## Failure behavior

A failed engine request renders an explicit unavailable state. It never renders zero counts or an empty list. An empty list is described as empty only when the freshness status is current. `/api/health` reports only that the web process answers HTTP.

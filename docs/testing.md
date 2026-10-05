# Testing record

## Commands

```sh
corepack pnpm lint        # prose check and ESLint
corepack pnpm typecheck   # OpenAPI drift check, SDK and web type checks, SDK build
corepack pnpm test        # OpenAPI snapshot tests, SDK tests, web logic tests (node:test)
corepack pnpm build       # SDK build, then Next.js production build
corepack pnpm e2e         # Playwright on Chromium, Firefox, and WebKit
```

`pnpm e2e` builds the web app against the fixture engine and starts both servers. Set `QS_REUSE_SERVERS=1` to reuse servers you already started: the fixture engine (`node e2e/fixtures/server.mjs`) and `next start -p 3100` built with `NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL=http://127.0.0.1:4010`. Install browsers first with `pnpm exec playwright install`.

## Live and fixture verification

Browser tests (`pnpm e2e`) use a fixture engine. They prove how the console presents engine responses. They do not prove that the engine works. The scenarios (default, empty, stale, behind, unverified, unavailable) and the canned preflight answers are documented in `e2e/fixtures/provenance.md`. The SDK tests use synthetic identifiers and response shapes taken from the OpenAPI snapshot.

### Live verified (2026-10-05, local)

The console, built with `NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL` set to a local engine API, ran against the engine at commit `34cb68e`, real PostgreSQL 16, and Stellar testnet RPC. The engine had run a one-shot index and then watch mode, and `ALLOWED_ORIGINS` listed the console origin. `pnpm live:check` drove a Chromium browser through the overview, network, status, frozen keys, bypasses, freeze episodes, impact, developers, and preflight pages.

Observed:

- Every page loaded without an error state.
- The freshness panel showed `Current`, protocol 29 from testnet, a verified maximum of 28, and the `unverified_protocol` warning on every live page.
- The overview and the frozen key list said no active frozen keys were reported at the source ledger, and only because freshness was `current`.
- The Freeze Map was empty and said that an empty map says nothing about relationships or dependencies.
- A preflight request with a synthetic transaction returned `clear`. Because the protocol is unverified, the result was not styled as confirmed.
- The browser sent the transaction to the engine origin by POST. The console server received no transaction. It was not in the URL, local storage, session storage, or cookies. No POST went to any other origin, and no request left the console and engine origins.
- The content security policy blocked a fetch to another origin and allowed the engine origin.

This live run found one defect that the fixture tests had not: a `clear` result was styled as confirmed on an unverified protocol. It is fixed, and a unit test and a browser test now cover it.

Not proven by the live run: how the console and engine behave when the freeze set is non-empty. Testnet had no frozen keys, bypasses, or freeze episodes. Those states are covered only by fixture tests and by the engine repository's own tests.

To repeat the run, start the engine (`index once`, `index watch`, `serve` with `ALLOWED_ORIGINS` set to the console origin), build and start the console with the engine URL, then run `QS_XDR_FILE=<file with a base64 envelope> pnpm live:check`. The script exits with an error if a check fails. It is not part of CI.

## What is covered

- SDK: request URLs and methods, query serialization, JSON body, nested and top-level request IDs, unknown and non-JSON errors, abort, no retry of preflight, custom fetch and headers, every method's success and error path.
- Web logic (`apps/web/tests`): status and confidence labels, calm styling only for a clear result from current state, input validation, evidence labels and distinct marks, deterministic Freeze Map layout, per-lane cap on a 5,000 record set, and which records reach the map.
- Browser: every preflight status, local validation with an associated message, an API error with its request ID, input kept after errors, keyboard submission, Clear, no transaction in the URL, local storage, session storage, or cookies. Freshness states: current, stale, behind, unverified protocol, empty freeze set, and an unavailable backend. Key filters, key detail with history, impact with evidence classes, filters and coverage notes, Freeze Map keyboard selection, the narrow-screen fallback to the table, theme persistence, mobile menu, and the not-found page.
- Accessibility: axe runs on the overview, network, keys, key detail, preflight (empty and with a result), impact, freeze episodes, episode detail, status, and developers pages.

## What was not done

- Visual regression baselines. Screenshots depend on system fonts that differ between machines, so baselines would fail on other hosts. None are committed.
- Manual keyboard review of every flow, screen reader testing, color contrast measurement, and Lighthouse runs. Automated axe scans do not replace them, and this record makes no accessibility compliance claim.
- Cursor pagination, because the engine does not offer it.
- Component tests with a DOM renderer. The repository has no Vitest or React Testing Library setup. Browser tests cover the interactive components.

## Known gaps in tooling

The CI quality job runs a frozen install, OpenAPI drift check, lint, typecheck, unit tests, production build, and a high-severity production dependency audit. The full development dependency audit reports one high-severity `braces` advisory through `eslint-config-next` and `fast-glob` with no patched release listed. The production dependency audit reports no known vulnerabilities.

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

## Mock versus live

Everything in this repository is tested against a fixture engine or against the committed OpenAPI snapshot. None of it proves that the engine works. The engine repository records what was checked against a live network.

The SDK tests use synthetic identifiers and response shapes taken from the OpenAPI snapshot. The browser tests use `e2e/fixtures/server.mjs`, whose scenarios (default, empty, stale, behind, unverified, unavailable) and canned preflight answers are documented in `e2e/fixtures/provenance.md`. The preflight tests show how the console presents each engine status. They do not show that the engine classifies a real transaction that way.

No live engine check has been run from this repository.

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

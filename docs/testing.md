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
- Web logic (`apps/web/tests`): contrast ratios of the design tokens in both themes, status and confidence labels, calm styling only for a clear result from current state, input validation, evidence labels and distinct marks, deterministic Freeze Map layout, per-lane cap on a 5,000 record set, and which records reach the map.
- Browser: the loading state with a delayed engine, every preflight status, local validation with an associated message, an API error with its request ID, input kept after errors, keyboard submission, Clear, no transaction in the URL, local storage, session storage, or cookies. Freshness states: current, stale, behind, unverified protocol, empty freeze set, and an unavailable backend. Key filters, key detail with history, impact with evidence classes, filters and coverage notes, Freeze Map keyboard selection, the narrow-screen fallback to the table, theme persistence, mobile menu, and the not-found page.
- Accessibility: axe runs on the overview, network, keys, key detail, preflight (empty and with a result), impact, freeze episodes, episode detail, status, and developers pages. Color contrast is also checked in the dark theme, and scripted keyboard tests run in every browser project. Details are in [accessibility.md](accessibility.md).

## Lighthouse

Run on 2026-10-05 against the production build served locally by `next start`, with the fixture engine behind it. This measures the console only, not a deployed site or a real engine. Lighthouse 13.5.0, headless Chromium 153, Linux, default mobile emulation with 4x simulated CPU slowdown, and the desktop preset. One run per page. Scores moved by several points between runs on this machine, so treat them as ranges.

| Page | Mobile (perf / a11y / best practices / SEO) | Desktop |
| --- | --- | --- |
| Overview | 72 / 100 / 100 / 100 | 97 / 100 / 100 / 100 |
| Network | 74 / 100 / 100 / 100 | 96 / 100 / 100 / 100 |
| Frozen keys | 67 / 100 / 100 / 100 | 92 / 100 / 100 / 100 |
| Preflight | 76 / 100 / 100 / 100 | 89 / 100 / 100 / 100 |
| Impact | 74 / 100 / 100 / 100 | 94 / 100 / 100 / 100 |
| Status | 67 / 100 / 100 / 100 | 92 / 100 / 100 / 100 |

The same pages with the fixture engine delayed by 1.5 s, so the loading state is on screen during the run: overview, frozen keys, and impact scored 60 to 69 on mobile and 91 to 96 on desktop.

Cumulative layout shift was 0 on every page, and at most 0.001 with the delayed engine. On mobile, first contentful paint was 0.8 to 1.1 s, largest contentful paint 1.4 to 3.9 s, and total blocking time 1.2 to 2.3 s. Total blocking time is what holds the mobile performance score down. It comes from hydrating the client bundle under 4x simulated CPU slowdown, and it was not reduced.

Lighthouse found three defects that are fixed:

- `/favicon.ico` returned 404, which cost best practices 4 points on every page. The app now serves an icon built from the QuorumScope mark.
- Replacing the loading state with the page caused a layout shift of 0.23 on the desktop overview. Two causes, found by logging the shift sources: the vertical scrollbar appeared when the page grew taller than the loading state, which moved the centered content sideways, and the footer sat inside the first screen during loading and was pushed down. The page now reserves its scrollbar gutter, and the main area is at least one screen tall so the footer starts below the fold.
- An earlier fix removed the loading state to avoid that shift. It is back.

## Loading state

`apps/web/app/loading.tsx` is shown while the engine answers. It has a status role and a heading, and holds no data. It says "No result is shown until it arrives." It never shows a count, a freshness value, an empty-list message, or a preflight result. `e2e/specs/loading.spec.ts` delays the fixture engine and checks all of this on the overview and key list, checks client-side navigation to a slow page, and measures layout shift in the browser (under 0.02).

## What was not done

- Visual regression baselines. Screenshots depend on system fonts that differ between machines, so baselines would fail on other hosts. None are committed.
- Screen reader testing, and review of every flow by a person using only a keyboard. See [accessibility.md](accessibility.md) for what was scripted and checked.
- A Lighthouse run against a deployed site. Nothing is deployed.
- Cursor pagination, because the engine does not offer it.
- Component tests with a DOM renderer. The repository has no Vitest or React Testing Library setup. Browser tests cover the interactive components.

## Transaction handling checks

- The code contains no logging, analytics, or error-reporting calls. The only `console` calls in the web app are inside the SDK examples shown as text on the developers page.
- The only browser storage use is the theme preference.
- After a preflight run, a marker string from the transaction was absent from the console server log.
- `pnpm live:check` showed the transaction went to the engine by POST and was absent from the console server requests, the URL, storage, and cookies (see the live verification above).
- The content security policy is computed when the app is built. It allows `connect-src 'self'` plus the engine origin from `NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL` at that moment. A build with a different value produces a different policy. The live run confirmed that a fetch to another origin is blocked and the engine origin is allowed.

## Known gaps in tooling

The CI quality job runs a frozen install, OpenAPI drift check, lint, typecheck, unit tests, production build, and a high-severity production dependency audit. The full development dependency audit reports one high-severity `braces` advisory through `eslint-config-next` and `fast-glob` with no patched release listed. The production dependency audit reports no known vulnerabilities.

# QuorumScope Console submission pack

This document is a short, factual orientation for a reviewer. It summarizes what Console is, how it
relates to Engine, what is verifiably built, and what is not yet proven. It links to the full
documentation set rather than repeating it.

## Project

- Project: QuorumScope
- Repository: [QuorumScope/quorumscope-console](https://github.com/QuorumScope/quorumscope-console)
- Role: web console and TypeScript SDK for the QuorumScope Engine
- License: Apache-2.0
- Current staging release: [`v0.1.1-staging`](https://github.com/QuorumScope/quorumscope-console/releases/tag/v0.1.1-staging)
- Sibling repository: [QuorumScope/quorumscope-engine](https://github.com/QuorumScope/quorumscope-engine)
- Current Stellar protocol: 29
- QuorumScope verified protocol maximum: 29 (Protocol 30 is not supported or claimed)

## One-line description

QuorumScope Console turns the Engine's Stellar Quorum Freeze (CAP-77) data into an operator-facing
interface and TypeScript SDK for inspecting freeze state, data freshness, transaction preflight, and
impact.

## Problem

CAP-77 freeze state is exposed by the Engine as an API, but raw API responses are not an operator
workflow. Reviewers, operators, and developers need to see at a glance whether freeze data is
current, whether a candidate transaction will be blocked or bypassed, which keys and accounts are
affected, and how that evidence is distinguished from an uncollected or stale state, without reading
JSON responses by hand.

## Solution

Console provides:

- an operator dashboard with network status, freeze counts, bypass totals, and freshness
  indicators;
- a frozen-keys directory with filtering, key detail, and freeze/unfreeze history;
- a bypasses directory and freeze episode timelines;
- an impact view with an interactive Freeze Map grouping affected keys by kind;
- an in-browser preflight sandbox that sends a candidate transaction XDR directly to the Engine;
- explicit freshness and protocol-compatibility states (`current`, `stale`, `behind`,
  `unverified_protocol`, `unavailable`); and
- a typed TypeScript SDK (`@quorumscope/sdk`) and developer documentation for integrating against
  the Engine API directly.

## Why Stellar

Console is not generic dashboard software with a chain selector. Every view is built around CAP-77
semantics: frozen ledger keys (accounts, trustlines, claimable balances, Soroban contract storage),
freeze bypass transaction hashes, and Stellar transaction envelope preflight. The preflight sandbox
accepts Stellar transaction XDR specifically, and the Freeze Map groups entries by Stellar ledger key
kind, not by a generic resource type.

## Relationship to Engine

Engine is authoritative for protocol interpretation: it decodes CAP-77 configuration, reconciles
freeze state, and classifies preflight and impact results. Console consumes the Engine's OpenAPI
3.1.0 contract through the generated TypeScript SDK and does not independently reinterpret CAP-77
state. See the [Engine repository](https://github.com/QuorumScope/quorumscope-engine) for the
indexing and API implementation.

## What is verifiably built

- A real TypeScript SDK (`@quorumscope/sdk`) generated from the Engine OpenAPI contract, with
  request/response, pagination, and error-handling coverage.
- OpenAPI parity: the SDK's committed OpenAPI snapshot matches the Engine's contract byte-for-byte,
  verified by an automated drift check (`pnpm typecheck`, `tests/openapi.test.mjs`).
- A Next.js production build (`apps/web`).
- CI covering linting, type checks, OpenAPI drift, and unit tests.
- Browser end-to-end tests with Playwright across Chromium, Firefox, and WebKit.
- Automated accessibility coverage: axe-core runs across the overview, network, keys, key detail,
  preflight, impact, freeze episodes, episode detail, status, and developers pages, plus scripted
  keyboard navigation and dark-theme contrast checks (see [Accessibility](accessibility.md)).
- Dark and light themes with contrast-checked design tokens.
- An interactive Freeze Map with deterministic layout and keyboard selection.
- A client-direct preflight path: transaction XDR is sent from the browser straight to the Engine
  origin.
- A deterministic non-empty cross-repository demo (see below).
- A deployed staging Console on Vercel.
- Protocol 29 display and compatibility behavior, including an `unverified_protocol` warning if the
  connected network ever reports a protocol above the Engine's verified maximum.

Test suite composition and exact coverage are documented in [Testing & Verification](testing.md) and
are not restated here to avoid drift between this document and the CI-backed source of truth.

## Deterministic cross-repository proof

Running `QS_DEMO_ENGINE_DIR=../quorumscope-engine ./scripts/demo-nonempty.sh` from this repository
builds the SDK and Console against the Engine's local fixture demo API, then exercises the real SDK,
the real Console routes, and the browser preflight path against it. This proves the full chain:
Engine fixture RPC, PostgreSQL, the real Engine, the OpenAPI-generated API, the SDK, the Console, the
Freeze Map, and preflight.

**This is fixture verification, not live Testnet freeze evidence.** It proves that the Console and
SDK correctly present non-empty freeze state produced by the Engine; it does not claim that a
non-empty incident has occurred on a public network. See
[the Engine's deterministic demo documentation](https://github.com/QuorumScope/quorumscope-engine/blob/main/docs/demo.md)
for the shared walkthrough.

## Public deployment

The staging Console is deployed at
[https://quorumscope-console.vercel.app](https://quorumscope-console.vercel.app) and configured
against the Engine's staging API.

The Engine's Render free-tier staging instance may be suspended between billing cycles or asleep
during idle periods. When the Engine is unreachable, the Console enters its documented
`unavailable` freshness state and reports that current state could not be retrieved rather than
displaying stale or fabricated data. The Engine is not presented as live when it is not reachable.

## Privacy and security boundary

- The preflight sandbox sends candidate transaction XDR directly from the browser to the Engine
  origin; it does not pass through the Console's Next.js server.
- Transaction XDR is not intentionally written to the URL, `localStorage`, `sessionStorage`, or
  cookies.
- A content security policy restricts `connect-src` to the Console origin and the configured Engine
  origin.
- The Console does not hold signing keys and does not submit transactions.
- No formal third-party security audit has been performed.

See [Security & Privacy](security.md) and [SECURITY.md](../SECURITY.md) for the full policy.

## Accessibility and testing

Automated coverage includes axe-core audits across core pages, scripted keyboard navigation tests in
every browser project, and color contrast checks for both themes. Honest limitations:

- No manual screen reader audit (NVDA, JAWS, VoiceOver) has been performed yet.
- No deterministic pixel-by-pixel visual regression baseline is implemented.
- A clean deployed Lighthouse baseline, unaffected by Render free-tier wakeups, remains future work.

See [Accessibility](accessibility.md) and [Testing & Verification](testing.md) for detail.

## Differentiation

Console is an operational interface for CAP-77 state produced by the Engine, not a generic chain
explorer or dashboard template. It has no independent protocol-interpretation logic: every freeze,
bypass, freshness, and preflight claim it displays originates from the Engine's API. See the
Engine's [Differentiation](https://github.com/QuorumScope/quorumscope-engine/blob/main/docs/differentiation.md)
document for the full comparison against adjacent projects.

## Honest limitations

- No non-empty freeze set has been observed on public Testnet; non-empty states are verified only
  through fixture tests and mocked Engine servers.
- The deployed Console depends on a Render free-tier Engine instance that is not always-on.
- No manual screen reader audit has been completed.
- No deterministic visual regression baseline exists yet.
- A clean deployed Lighthouse baseline, unaffected by Engine cold starts, is not yet available.
- Pagination across keys, bypasses, episodes, and impact records uses page numbers because the
  Engine API does not provide cursor-based pagination.

See [Known Limitations](limitations.md) for the complete record.

## Current roadmap

- [#1 Manual screen-reader verification across core Console flows](https://github.com/QuorumScope/quorumscope-console/issues/1)
- [#2 Add deterministic visual regression baselines](https://github.com/QuorumScope/quorumscope-console/issues/2)
- [#3 Create an SDK package publication workflow](https://github.com/QuorumScope/quorumscope-console/issues/3)
- [#4 Run a clean deployed Lighthouse baseline](https://github.com/QuorumScope/quorumscope-console/issues/4)

## Reviewer links

- [Console repository](https://github.com/QuorumScope/quorumscope-console)
- [Engine repository](https://github.com/QuorumScope/quorumscope-engine)
- [Staging Console (Vercel)](https://quorumscope-console.vercel.app)
- [Staging Engine API](https://quorumscope-engine-api.onrender.com)
- [Console documentation](https://quorumscope.github.io/quorumscope-console/)
- [Latest release](https://github.com/QuorumScope/quorumscope-console/releases/latest)
- [Deterministic demo](https://github.com/QuorumScope/quorumscope-engine/blob/main/docs/demo.md)
- [Engine OpenAPI JSON](https://quorumscope-engine-api.onrender.com/openapi.json)
- [Security policy](../SECURITY.md)
- [Roadmap / open issues](https://github.com/QuorumScope/quorumscope-console/issues)

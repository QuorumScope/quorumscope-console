# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Dedicated benchmark rerun for deployed staging on an idle testing host.
- Manual assistive technology and screen reader usability audit.
- Protocol 29 interface adaptations once the engine verifies Protocol 29.
- Automated visual regression testing suite.

## [v0.1.0-staging] - 2026-10-07

### Added
- Next.js web console application (`apps/web`) with dark, light, and system theme support.
- Overview dashboard presenting network status, freeze set counts, bypass counts, and live data freshness.
- Frozen keys directory with pagination and filters by key kind (`account`, `trustline`, `contract_data`, `contract_code`) and active state.
- Key detail view displaying decoded fields, canonical XDR, and state transition histories.
- Freeze bypasses tracking page showing paginated transaction hashes.
- Freeze episodes directory and episode detail timelines linking cryptographic evidence references.
- Preflight transaction sandbox providing in-browser envelope evaluation with finding breakdowns.
- Impact analysis page featuring the interactive visual Freeze Map and paginated evidence tables.
- Developer integration guide with code examples and cURL commands.
- TypeScript SDK (`packages/sdk`) generated from the engine OpenAPI 3.0 specification.
- Contract drift check script verifying generated TypeScript types against the OpenAPI snapshot.
- Automated browser E2E and accessibility test suite covering Playwright projects and axe-core checks.
- Staging console deployment on Vercel: [Staging Console](https://quorumscope-console.vercel.app).
- Content Security Policy headers restricting network requests to the configured engine origin.

### Changed
- Refined theme switcher to persist user preferences in localStorage without cookies.
- Standardized status badges across all pages with distinctive marks and labels.

### Fixed
- Fixed layout shifts when loading states transition to content by reserving scrollbar gutter space.
- Corrected contrast tokens on form control borders to meet WCAG AA standards in both themes.
- Updated preflight result styling so `clear` outcomes on unverified protocol versions do not display confirmed styling.

### Known limitations
- **No live non-empty freeze set observed**: Stellar Testnet currently contains 0 frozen keys. Non-empty freeze states, key histories, and impact data are verified using fixtures.
- **Protocol 29 unverified warning**: Stellar Testnet reports Protocol 29, which exceeds the engine verified maximum of 28. The console correctly presents an `unverified_protocol` warning badge.
- **Render free tier sleep**: The backing engine on Render sleeps during inactivity. Initial page loads may take 30 to 60 seconds while the backend wakes up.
- **No deployed Lighthouse clean rerun**: Staging Lighthouse performance numbers were affected by free tier cold starts and high local machine load; staging performance is unmeasured under idle conditions.
- **No manual screen reader review**: While automated axe checks and scripted keyboard tests pass, no manual screen reader review was performed.
- **No cursor pagination**: Pagination relies on page numbers because the engine API does not provide cursor-based navigation.

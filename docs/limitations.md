# Known Limitations

This document provides a factual record of known limitations, verification boundaries, and testing constraints in QuorumScope Console.

## Operational & Verification Boundaries

### 1. No Live Non-Empty Freeze Set Observed
Stellar Testnet currently contains 0 frozen keys and 0 bypass entries. Consequently:
- Live network runs have observed only confirmed empty freeze sets.
- Non-empty freeze states, key detail histories, and multi-key Freeze Map rendering are verified exclusively via fixture tests and mocked engine servers.

### 2. Protocol 29 Compatibility Warning
- Stellar Testnet operates on Protocol 29, whereas the engine is verified up to Protocol 28 (`VERIFIED_PROTOCOL_MAX=28`).
- The console displays an `unverified_protocol` warning badge across all live pages. When preflight returns `clear` under this state, the result is intentionally not styled as confirmed.

### 3. Deployed Performance Benchmarks
- The deployed console runs on Vercel and queries an engine hosted on Render free tier.
- Initial requests when the engine is sleeping can take 30 to 60 seconds.
- Staging Lighthouse runs were subject to Render free tier wakeups and machine load, so staging performance remains unmeasured under idle conditions.

### 4. Assistive Technology Testing
- Automated axe-core audits and scripted keyboard navigation tests pass cleanly across all pages.
- However, no manual testing with screen reader software (e.g. NVDA, JAWS, VoiceOver) has been performed.

### 5. Pagination Model
- Navigation across frozen keys, bypasses, episodes, and impact records relies on page numbers because the engine API does not provide cursor-based pagination.

### 6. Component Testing Environment
- React components are tested via Playwright browser execution and node unit tests rather than jsdom-based DOM renderers.

### 7. Visual Regression Testing
- Automated pixel-by-pixel visual regression baselines are not implemented in the current test pipeline.

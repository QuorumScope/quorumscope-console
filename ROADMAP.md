# Roadmap

This roadmap documents planned features, testing improvements, and interface milestones for QuorumScope Console and the TypeScript SDK.

## Current focus: Staging stabilization

- [x] Full page suite: overview, network, frozen keys, bypasses, episodes, preflight, impact, status, developers.
- [x] Responsive layout with dark, light, and system theme switching.
- [x] Interactive visual Freeze Map with keyboard operability.
- [x] Direct in-browser preflight transaction evaluation.
- [x] TypeScript SDK with complete method coverage and error envelope handling.
- [x] Automated contract drift verification against engine OpenAPI schema.
- [x] Staging deployment on Vercel backed by Render engine API.

## Near-term milestones

### 1. Deployed performance benchmarking
- Execute a clean Lighthouse benchmark against staging from an idle, dedicated runner.
- Establish realistic production performance baselines for cold and warm cache states.

### 2. Accessibility auditing
- Conduct manual testing with screen reader software (NVDA, VoiceOver).
- Verify landmark announcements, focus transitions, and polite live region behavior under real assistive tooling.

### 3. Usability refinements
- Add copy-to-clipboard buttons for hashes, addresses, and base64 XDR strings.
- Add keyboard shortcuts for jumping between filter controls and results tables.

## Long-term milestones

### 4. Protocol 29 interface updates
- Adapt user interface components once the engine formally verifies Protocol 29.
- Remove unverified protocol badges when operating against verified networks.

### 5. Rich non-empty freeze demos
- Provide interactive historical replays and richer demonstrations once non-empty freeze data occurs on public networks.
- Expand Freeze Map dependency connections to include smart contract interaction graphs.

### 6. Visual regression testing
- Implement automated visual regression testing in Playwright to prevent UI regressions across releases.

### 7. SDK package publication
- Finalize npm packaging and automated CI release pipelines for `@quorumscope/sdk`.

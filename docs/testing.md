# Testing record

On 2026-10-04, the local Node 24.21.0 and pnpm 12.9.1 environment passed frozen lockfile install, peer dependency check, OpenAPI drift check, workspace lint, typecheck, seven tests, and a Next.js production build. The SDK tests use synthetic identifiers and response shapes derived from the committed engine OpenAPI schema. They do not verify a live engine.

The local development server was checked with Playwright 1.63.0 and Chromium. The overview loaded with an explicit unavailable state when no engine URL was configured. No page error or Next.js error overlay was observed. The theme control selected dark mode and its choice persisted after reload. Navigation reached the network page, where the API-unavailable state appeared. At a 375 pixel viewport, the overview had no horizontal document overflow and the theme control remained visible.

This was a browser smoke check, not an accessibility certification. Automated axe scans, full keyboard flow checks, deterministic backend fixture E2E tests, and visual baselines remain open.

After the mobile navigation change, a production build was checked in Chromium at 375 pixels. The menu opened, its frozen-key link navigated to `/keys`, the unavailable state rendered, and no page errors or horizontal document overflow were observed.

The CI quality job runs a frozen install, OpenAPI drift check, lint, typecheck, unit tests, production build, and a high-severity production dependency audit. The full development dependency audit currently reports one high-severity `braces` advisory through `eslint-config-next` and `fast-glob`. The advisory has no patched `braces` release listed, and the production dependency audit reports no known vulnerabilities. This review does not mean the development dependency advisory is resolved.

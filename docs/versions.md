# Version verification

Verified 2026-10-04 12:10 UTC. The package registry timed out from this workspace, so package compatibility and installation are still unverified. Feature implementation must wait for the scaffold gate in the Phase 7 prompt.

| Tool or package | Observed version | Source | Status | Check |
| --- | --- | --- | --- | --- |
| Node.js | 24.21.0 | Local `node --version` and [Node release status](https://nodejs.org/en/about/previous-releases) | Node 24 is LTS | Runtime starts locally |
| pnpm | 12.8.2 | Local `pnpm --version` | Installed locally; registry status not confirmed | CLI starts locally |
| Next.js | 16.3.8 | [npm package page](https://www.npmjs.com/package/next) | Latest stable observed | Not installed in this repository |
| React and React DOM | 19.3.0 | [React](https://www.npmjs.com/package/react), [React DOM](https://www.npmjs.com/package/react-dom) | Latest stable observed | Not installed in this repository |
| TypeScript | 6.0.3 selected | [npm package page](https://www.npmjs.com/package/typescript) and local package store | 7.0.2 is latest stable observed | The local Next.js stack has been typechecked with 6.0.3. Compatibility of 7.0.2 is not yet verified, so it was not selected. |
| Tailwind CSS | 4.3.3 | [npm package page](https://www.npmjs.com/package/tailwindcss) | Latest stable observed | Not installed in this repository |
| Vitest | 5.0.3 | [npm package page](https://www.npmjs.com/package/vitest) | Latest stable observed | Not installed in this repository |
| openapi-typescript | 7.13.0 used for generation | [npm package page](https://www.npmjs.com/package/openapi-typescript) and local installed copy | Latest stable observed | The generator ran against the checked-in engine schema. Registry metadata is unavailable, so it is not yet a reproducible direct dependency here. |
| Next.js ESLint config | 16.3.8 selected | [npm package page](https://www.npmjs.com/package/eslint-config-next) and local package store | Stable local version | Scaffold lint passed |
| ESLint | 9.39.5 selected | [npm package page](https://www.npmjs.com/package/eslint) and local package store | Installed local version | Scaffold lint passed; newer 10.11.0 remains to be checked for compatibility |
| Node types | 24.10.4 selected | [npm package page](https://www.npmjs.com/package/@types/node) and local package store | Installed local version | Scaffold typecheck passed |
| React types | 19.2.14 selected | [npm package page](https://www.npmjs.com/package/@types/react) and local package store | Installed local version | Scaffold typecheck passed |
| React DOM types | 19.2.3 selected | [npm package page](https://www.npmjs.com/package/@types/react-dom) and local package store | Installed local version | Scaffold typecheck passed |
| Tailwind PostCSS | 4.3.3 selected | [npm package page](https://www.npmjs.com/package/@tailwindcss/postcss) and local package store | Stable local version | Offline install passed |

All selected direct dependencies are pinned in package manifests. The offline lockfile install, scaffold lint, SDK typecheck, and SDK tests pass. The local pnpm version is pinned for reproducibility, but the registry's cached page showed 12.8.1. This discrepancy requires a fresh registry check when connectivity returns.

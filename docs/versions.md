# Version verification

Verified 2026-10-04 12:10 UTC. The package registry timed out from this workspace, so package compatibility and installation are still unverified. Feature implementation must wait for the scaffold gate in the Phase 7 prompt.

| Tool or package | Observed version | Source | Status | Check |
| --- | --- | --- | --- | --- |
| Node.js | 24.21.0 | Local `node --version` and [Node release status](https://nodejs.org/en/about/previous-releases) | Node 24 is LTS | Runtime starts locally |
| pnpm | 12.8.2 | Local `pnpm --version` | Installed locally; registry status not confirmed | CLI starts locally |
| Next.js | 16.3.8 | [npm package page](https://www.npmjs.com/package/next) | Latest stable observed | Not installed in this repository |
| React and React DOM | 19.3.0 | [React](https://www.npmjs.com/package/react), [React DOM](https://www.npmjs.com/package/react-dom) | Latest stable observed | Not installed in this repository |
| TypeScript | 7.0.2 | [npm package page](https://www.npmjs.com/package/typescript) | Latest stable observed | Compatibility with Next.js tooling not checked |
| Tailwind CSS | 4.3.3 | [npm package page](https://www.npmjs.com/package/tailwindcss) | Latest stable observed | Not installed in this repository |
| Vitest | 5.0.3 | [npm package page](https://www.npmjs.com/package/vitest) | Latest stable observed | Not installed in this repository |
| openapi-typescript | 7.13.0 | [npm package page](https://www.npmjs.com/package/openapi-typescript) | Latest stable observed | Not installed in this repository |

The root package currently has no direct dependency other than its package manager declaration. Versions for each new direct dependency must be added here with a compatibility result before use. The local pnpm version is pinned for reproducibility, but the registry's cached page showed 12.8.1. This discrepancy requires a fresh registry check when connectivity returns.

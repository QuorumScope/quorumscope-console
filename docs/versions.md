# Version verification

Verified on 2026-10-04 between 16:03 and 16:10 UTC using the npm registry, Node release page, installed CLIs, peer dependency check, and workspace build. Every direct dependency is pinned exactly in its package manifest.

| Direct tool or package | Selected | Authoritative source | Release status and compatibility |
| --- | --- | --- | --- |
| Node.js | 24.21.0 | [Node releases](https://nodejs.org/en/about/previous-releases) | Node 24 is LTS. Next.js and pnpm engine ranges accept it. Runtime verified locally. |
| pnpm | 12.9.1 | [npm pnpm](https://www.npmjs.com/package/pnpm) | Current stable registry release. Verified through Corepack. |
| Next.js | 16.3.8 | [npm next](https://www.npmjs.com/package/next) | Current stable registry release. Production build passed. |
| React | 19.3.0 | [npm react](https://www.npmjs.com/package/react) | Current stable registry release. Next.js production build passed. |
| React DOM | 19.3.0 | [npm react-dom](https://www.npmjs.com/package/react-dom) | Current stable registry release. Matches React. |
| TypeScript | 5.9.3 | [npm typescript](https://www.npmjs.com/package/typescript) | Newest compatible stable line for all current peers. Version 7.0.2 is newer, but openapi-typescript 7.13.0 requires TypeScript 5.x. TypeScript ESLint 8.71.0 requires a version below 6.1. |
| openapi-typescript | 7.13.0 | [npm openapi-typescript](https://www.npmjs.com/package/openapi-typescript) | Current stable registry release. Generation and drift check passed. |
| Tailwind CSS | 4.3.3 | [npm tailwindcss](https://www.npmjs.com/package/tailwindcss) | Current stable registry release. Production build passed. |
| Tailwind PostCSS | 4.3.3 | [npm @tailwindcss/postcss](https://www.npmjs.com/package/@tailwindcss/postcss) | Current stable registry release. Matches Tailwind. |
| ESLint | 9.39.5 | [npm eslint](https://www.npmjs.com/package/eslint) | Newest compatible major line for the selected Next.js config. Version 10.12.0 conflicts with peer ranges of eslint-plugin-import, eslint-plugin-jsx-a11y, and eslint-plugin-react. Lint passed with 9.39.5. |
| Next.js ESLint config | 16.3.8 | [npm eslint-config-next](https://www.npmjs.com/package/eslint-config-next) | Matches Next.js. Peer check and lint passed. |
| Node types | 24.19.1 | [npm @types/node](https://www.npmjs.com/package/@types/node) | Latest published Node 24 type release observed. Matches runtime major. |
| React types | 19.3.0 | [npm @types/react](https://www.npmjs.com/package/@types/react) | Current stable registry release. Typecheck passed. |
| React DOM types | 19.3.0 | [npm @types/react-dom](https://www.npmjs.com/package/@types/react-dom) | Current stable registry release. Typecheck passed. |
| Workspace SDK | workspace:* | Local `packages/sdk` | Internal workspace dependency, not a registry release. SDK builds and its compiled import passed. |

`corepack pnpm peers check` reported no peer dependency issues. The exact lockfile is committed. The root Node engine range is limited to the verified Node 24 line.

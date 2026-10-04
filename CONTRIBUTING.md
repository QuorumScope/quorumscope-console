# Contributing

Use Node 24.21.0 and Corepack with pnpm 12.9.1.

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

Run `corepack pnpm e2e` for browser tests. It needs Playwright browsers installed.

## Rules

- The engine OpenAPI document is the contract. Refresh it with `pnpm openapi:fetch`, then `pnpm openapi:generate`, and commit both.
- Do not reimplement CAP-77 logic in the SDK or the web app.
- Do not add fake data. Fixtures belong in `e2e/fixtures` and need provenance.
- Write plain prose without em dashes. `pnpm lint` checks this.
- Keep one logical change per commit and stage specific files.

# Contributing to QuorumScope Console

Thank you for contributing to QuorumScope Console. This document outlines development setup, testing standards, and contribution policies for the web console and TypeScript SDK.

## Development setup

### Prerequisites

- **Node.js**: Version `>=24.21.0 <25` (see `.nvmrc`).
- **Corepack**: Enabled for pnpm management.
- **pnpm**: Version `12.9.1`.

Enable Corepack and verify tool versions:

```bash
corepack enable
pnpm --version
```

### Local setup

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/QuorumScope/quorumscope-console.git
cd quorumscope-console
corepack pnpm install --frozen-lockfile
```

2. Copy the environment template:

```bash
cp .env.example apps/web/.env.local
```

Set `NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL` to your local engine or the staging API URL.

3. Start development servers:

```bash
pnpm dev
```

## Workspace structure

The repository is configured as a pnpm workspace:

| Package | Path | Responsibility |
| --- | --- | --- |
| `@quorumscope/sdk` | `packages/sdk` | TypeScript client library generated from the engine OpenAPI contract |
| `@quorumscope/web` | `apps/web` | Next.js web application with dashboard, preflight tool, and Freeze Map |
| Root tests | `tests/` | Contract drift tests and OpenAPI snapshot validations |
| End-to-end tests | `e2e/` | Playwright test specifications and mock fixture server |

## Exact test commands

Run the check suite before submitting changes:

```bash
# Check markdown prose rules and run ESLint
pnpm lint

# Verify OpenAPI sync, run type checks across SDK and web app
pnpm typecheck

# Run unit tests across SDK and web app
pnpm test

# Build SDK and compile production Next.js output
pnpm build

# Verify SDK types match the engine OpenAPI snapshot
pnpm openapi:check
```

### Browser and accessibility tests

```bash
# Install Playwright browsers (if not already installed)
pnpm exec playwright install --with-deps chromium firefox webkit

# Run Playwright tests on all browsers
pnpm e2e
```

## OpenAPI snapshot update process

The engine API contract in `packages/sdk/openapi/quorumscope-engine-v1.json` is authoritative. When updating API specifications:

1. Ensure the engine API server is running or accessible.
2. Fetch the latest OpenAPI schema:
   ```bash
   pnpm openapi:fetch
   ```
3. Generate updated TypeScript types for the SDK:
   ```bash
   pnpm openapi:generate
   ```
4. Verify there is no drift:
   ```bash
   pnpm openapi:check
   ```
5. Commit both the updated JSON schema and generated TypeScript definitions together.

## Engine compatibility requirement

- Do not reimplement CAP-77 protocol logic, validation, or freeze status derivation in the console or SDK.
- The web console must accurately mirror the engine's responses, status values, and error codes.
- Do not create mock network data in production components; test scenarios must use `e2e/fixtures` with clear provenance.

## Accessibility and browser testing

- All interactive components must be reachable and operable using keyboard navigation alone.
- Do not rely on color alone to indicate status; always provide text labels, marks, or aria-labels.
- Every page must pass automated axe-core checks in both light and dark themes.
- Respect user motion preferences via the `prefers-reduced-motion` media query.

## Privacy policy for transaction XDR

- Transaction XDR entered into the preflight tool must be posted directly from the user's browser to the engine API endpoint.
- Never route transaction envelopes through Next.js server actions or API routes.
- Never log transaction envelopes in browser storage, cookies, URL search parameters, or server logs.

## Updating documentation

- Documentation files live in `docs/`.
- Keep prose concise and factual.
- **Do not use em dashes** (`\u2014`) in markdown files. Run `pnpm lint` to verify prose compliance.
- Never add fake adoption metrics, audit claims, or invented coverage stats.

## Commits and pull requests

### Commit standards

- Follow Conventional Commits format (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
- One logical change per commit.
- **Never use `git add .`** Stage specific files explicitly.
- Do not add automated co-author trailers.

### Pull request checklist

Before opening a pull request, verify:
- [ ] `pnpm lint` passes cleanly with no prose or ESLint errors.
- [ ] `pnpm typecheck` completes without TypeScript or OpenAPI drift errors.
- [ ] `pnpm test` passes all unit tests.
- [ ] `pnpm build` builds the SDK and Next.js app successfully.
- [ ] `pnpm openapi:check` confirms schema alignment.
- [ ] Commits are logical, clean, and follow conventional commit guidelines.

### Issue guidance

- Use the GitHub issue templates for bug reports and feature requests.
- Provide clear reproduction steps and browser environment details.
- For security issues, refer to [SECURITY.md](SECURITY.md).

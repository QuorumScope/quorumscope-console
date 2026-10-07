## Description

Provide a clear and concise summary of the changes made and the motivation behind them.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Accessibility / Design improvement
- [ ] Testing improvement

## Verification Checklist

- [ ] `pnpm lint` passes with no ESLint or prose warnings.
- [ ] `pnpm typecheck` passes with no TypeScript errors.
- [ ] `pnpm test` passes all unit tests.
- [ ] `pnpm build` builds the SDK and Next.js app successfully.
- [ ] `pnpm openapi:check` confirms schema alignment with the engine.
- [ ] Keyboard navigation and accessibility contrast requirements are preserved.
- [ ] All commits follow the Conventional Commits specification.
- [ ] Each commit represents a single logical change.
- [ ] No private keys, credentials, or sensitive data are included.

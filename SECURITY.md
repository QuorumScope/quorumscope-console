# Security Policy

## Scope

QuorumScope Console is the web interface and TypeScript SDK workspace for the QuorumScope platform. It visualizes freeze state, presents data freshness and protocol compatibility warnings, facilitates preflight analysis, and offers typed SDK utilities.

This policy applies to:
- The QuorumScope Console web application in `apps/web`.
- The `@quorumscope/sdk` package in `packages/sdk`.
- Associated test fixtures and deployment configurations.

## Supported versions

| Version | Status | Supported |
| --- | --- | --- |
| `v0.1.x` | Staging / Active Development | Yes |
| Earlier commits | Untagged | No |

Security updates are released directly against active branches and tagged staging versions.

## Private key and custody policy

- **No Private Keys**: QuorumScope Console does not accept, store, generate, or manage secret keys, signer seeds, or account passwords.
- **No Custody**: The console holds no digital assets and performs no custodial duties.
- **No Transaction Submission**: The console has no wallet connector and does not submit transactions to Stellar network nodes.

## Transaction XDR privacy

The preflight interface allows operators to test transaction envelopes before submission:
- **Direct Browser Submission**: Transaction XDR entered in the browser is dispatched directly to the engine API via HTTP POST. It never passes through the Next.js server.
- **No Storage**: The transaction envelope is never written to localStorage, sessionStorage, indexedDB, or cookies.
- **No URL Leakage**: Candidate transaction data is never placed into URL query parameters, state history, or referrers.
- **Form State**: Transaction text remains only in component memory during the user session and is discarded upon navigation or clicking Clear.

## Analytics and telemetry policy

QuorumScope Console contains no third-party tracking scripts, advertising beacons, external telemetry trackers, or third-party error monitoring libraries. The only value persisted in browser localStorage is the chosen color theme (`light`, `dark`, or `system`).

## Content Security Policy (CSP)

The web console enforces strict Content Security Policy headers on every response:
- `default-src 'self'`
- `connect-src 'self' <ENGINE_API_ORIGIN>` (dynamically configured from `NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL`)
- `script-src 'self' 'unsafe-inline'`
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data:`
- `object-src 'none'`
- `base-uri 'self'`
- `form-action 'self'`
- `frame-ancestors 'none'`

This policy guarantees that network requests from the browser cannot leak data to unauthorized third-party endpoints.

## Engine origin policy

To ensure secure communication:
- The engine origin specified in `NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL` must match the API server deployed for the target environment.
- The corresponding engine instance must whitelist the console domain in its `ALLOWED_ORIGINS` setting.

## Dependency expectations

- Node.js dependencies are locked with `pnpm-lock.yaml` and audited regularly using `pnpm audit`.
- The application uses pinned package versions in `package.json` and strict TypeScript configurations.

## Audit status

QuorumScope Console is open-source software built for Stellar protocol visibility. It has **not** undergone a formal third-party security audit. Operators should evaluate the application against their own operational standards.

## Vulnerability reporting

If you identify a security issue or vulnerability in QuorumScope Console, please disclose it responsibly:
1. Navigate to the repository: [QuorumScope/quorumscope-console](https://github.com/QuorumScope/quorumscope-console).
2. Go to the **Security** tab and click **Report a vulnerability**.
3. Include:
   - Affected page, component, or SDK method.
   - Clear reproduction steps or proof-of-concept.
   - Potential impact and risk analysis.
4. Do not include secret keys or proprietary transaction data in your submission.

Do not open public GitHub issues for security vulnerabilities. We will review all reports promptly.

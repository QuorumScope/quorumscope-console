# Security & Privacy Architecture

QuorumScope Console is designed with strict data isolation, zero-custody guarantees, and privacy-preserving client architecture.

## Transaction Privacy

The most critical privacy consideration in blockchain analysis tooling is the confidentiality of unsigned transaction envelopes:
- **Zero Server Exposure**: Candidate transaction XDR entered into the preflight tool is transmitted directly from the client browser to the engine API endpoint. The Next.js application server never handles or inspects transaction envelopes.
- **No Client Persistence**: The form input is maintained only in transient React state. It is never saved to localStorage, sessionStorage, indexedDB, or cookies.
- **No Referrer or URL Leakage**: Form inputs do not mutate the browser URL, preventing sensitive transaction data from leaking through browser history or HTTP referrer headers.

## Network Isolation

### Content Security Policy
The console enforces a restrictive Content Security Policy on all server responses:
- `connect-src 'self' <ENGINE_ORIGIN>` ensures network calls can only be directed to the console server itself and the authorized engine API origin.
- `default-src 'self'` prevents loading unauthorized external scripts, styles, or iframes.

## Zero Tracking Posture

- No external analytics scripts (e.g. Google Analytics, Mixpanel, Hotjar) are loaded.
- No third-party error monitoring beacons (e.g. Sentry, Datadog) are included.
- The console stores exactly one user preference in localStorage: the interface color theme (`light`, `dark`, or `system`).

For instructions on reporting security vulnerabilities, refer to [SECURITY.md](../SECURITY.md).

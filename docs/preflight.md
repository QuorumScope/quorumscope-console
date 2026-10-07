# Preflight Transaction Analysis

The Preflight Sandbox allows developers and operators to test Stellar transaction envelopes against active quorum freeze states prior to submitting them to the network.

## User Interface & Workflow

1. **Input Submission**: The user pastes a base64-encoded Stellar transaction envelope into the preflight form.
2. **Local Validation**: The browser performs client-side validation to ensure input is non-empty, valid base64 format, and within the 256 KiB size limit.
3. **Direct Dispatch**: The browser issues a direct HTTP POST request to `/api/v1/preflight` on the configured engine origin.
4. **Result Rendering**: The response is presented with an appropriate status treatment, finding details, and explanatory text.

## Status Treatments

| Engine Status | Console Label | Visual Treatment | Meaning |
| --- | --- | --- | --- |
| `clear` | Clear | Calm green (only when state is current and protocol verified) | No touched keys are frozen. |
| `blocked_validation` | Blocked | High-contrast alert styling | A touched key (source, destination, trustline, or contract key) is actively frozen. |
| `allowed_by_bypass` | Allowed by Bypass | Info badge with notice | Transaction matches an active bypass hash. Findings are still listed. |
| `dex_conditional` | DEX Conditional | Caution badge | Involves DEX operations that depend on liquidity conditions. |
| `apply_time_risk` | Apply-Time Risk | Cautious treatment | Involves dynamic identifiers that may encounter freeze at apply time. |
| `unsupported_analysis`| Unsupported | Notice treatment | Contains operations not supported by preflight simulation. |
| `state_unavailable` | State Unavailable | Warning treatment | Backend freeze state is stale or unindexed. Never styled as clear. |

## Privacy Safeguards

- Transaction envelopes are never sent to the Next.js server.
- Transaction data is not preserved in browser storage, session cookies, or URL parameters.
- Pressing `Clear` or navigating away completely purges the input from memory.

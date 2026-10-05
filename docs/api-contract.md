# Engine API contract

The checked-in snapshot at `packages/sdk/openapi/quorumscope-engine-v1.json` was copied from the local `quorumscope-engine` checkout at commit `34cb68e3d78b5c508328f6f51deca12d17ece0e2`. The engine repository licenses the schema under Apache-2.0. Snapshot SHA-256: `dc64e3de3e4e0d7f2492ca068fb36040bee227888000407dbe4d10614b1aca56`.

The schema exposes GET requests for network, freeze state, frozen keys (with change history on the detail route), bypasses, freeze episodes, episode timeline, impact, status, and health, and `POST /api/v1/preflight`. Network, freeze state, status, and preflight responses carry a `freshness` object with freshness status, ledgers, lag, protocol version, and compatibility. List endpoints use one-based `page` and `page_size`. They are offset pages, not keyset cursors, and no total count is returned.

Preflight returns HTTP 200 with status `invalid_input` for undecodable XDR. Impact returns the evidence classes the engine stores (`direct`, `protocol_derived`) and lists the uncollected classes in `uncollected_evidence_classes`. The console must not present uncollected classes as empty results.

The error envelope is `{ error: { code, message, details, request_id }, request_id }`. The request ID appears in both places.

The engine does not store ledger close times, so none are shown.

Run `QUORUMSCOPE_ENGINE_OPENAPI_SOURCE=/path/to/engine/openapi/openapi.json pnpm openapi:fetch` to refresh the source snapshot, then `pnpm openapi:generate` to regenerate types and `pnpm openapi:check` to verify that committed types match. The drift check also verifies the snapshot identity and expected endpoints.

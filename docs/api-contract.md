# Engine API contract

The checked-in snapshot at `packages/sdk/openapi/quorumscope-engine-v1.json` was copied from the local `quorumscope-engine` checkout at commit `3bab6178414822ce89bd634a317e10242996a6e2`. The engine repository licenses the schema under Apache-2.0. Snapshot SHA-256: `816bb302a2d004492b7ddeb71177dd1ff70418a3052417375d3397a3da97ed1b`.

The current schema exposes GET requests for network, freeze state, frozen keys, bypasses, freeze episodes, episode timeline, status, and health. It uses one-based `page` and `page_size` parameters for lists. It has no keyset cursor parameters.

The current schema does not expose `/api/v1/preflight` or `/api/v1/impact`. It also lacks protocol compatibility, freshness classification, decoded key content, key history, and detailed service reachability fields described in the Phase 7 product target. The console must not manufacture these values. These are backend contract blockers for the complete Phase 7 product.

The actual error envelope contains `error.code`, `error.message`, and a top-level `request_id`. It does not declare `error.details`. Client error handling must follow this shape.

Run `QUORUMSCOPE_ENGINE_OPENAPI_SOURCE=/path/to/engine/openapi/openapi.json pnpm openapi:fetch` to refresh the source snapshot, then `pnpm openapi:generate` to regenerate types and `pnpm openapi:check` to verify that committed types match. The drift check also verifies the snapshot identity and expected read endpoints.

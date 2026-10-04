# Fixture provenance

`server.mjs` serves deterministic responses constructed from required and optional fields in the committed `quorumscope-engine` OpenAPI snapshot at `packages/sdk/openapi/quorumscope-engine-v1.json`. Every identifier, ledger number, timestamp, name, and evidence reference is synthetic fixture data. The server runs only during browser tests on port 4010. No production route imports it.

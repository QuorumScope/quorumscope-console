# Fixture provenance

`server.mjs` is a fixture engine for browser tests. Its response shapes follow the committed engine OpenAPI snapshot at `packages/sdk/openapi/quorumscope-engine-v1.json`. Every identifier, ledger number, hash, and timestamp is synthetic.

The server has named scenarios: `default`, `empty`, `stale`, `behind`, `unverified`, and `unavailable`. Tests switch them with `GET /__fixture/scenario/<name>`. Preflight answers are chosen by marker text in the posted transaction (for example `fixtureBlocked`) and are canned. They show how the console presents each engine status. They do not show that the engine classifies a real transaction that way. Engine behavior is verified in the engine repository.

These fixtures are used only by `playwright.config.ts` and are not part of the production application.

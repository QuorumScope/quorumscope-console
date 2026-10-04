# QuorumScope Console

This repository is the frontend and TypeScript SDK workspace for QuorumScope. The authoritative CAP-77 state and API live in `quorumscope-engine`.

Implementation is at the contract and version gate. The checked-in engine OpenAPI snapshot currently supports read endpoints but does not expose preflight or impact. The web console and SDK are not yet implemented or deployed.

## Current checks

With Node 24.21.0 and pnpm 12.8.2:

```sh
pnpm install
pnpm lint
pnpm typecheck
pnpm test
```

See [API contract](docs/api-contract.md) and [version verification](docs/versions.md) for the current blockers and source details.

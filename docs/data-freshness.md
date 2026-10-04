# Data freshness

Every live page reads current state from the engine on each request. Nothing is cached between requests, so a page shows the engine response from the moment it was rendered.

## What the engine currently exposes

The engine status endpoint reports ledger and indexing fields. The console shows these values as returned. The current engine schema has no freshness classification, protocol compatibility field, or RPC and database reachability fields. See [API contract](api-contract.md).

Because those fields are absent, the console does not label any state as "current and verified" and does not compute staleness itself. Source ledger and close time are shown where the engine supplies them.

## When state cannot be retrieved

If the engine cannot be reached or returns an error, the page shows an unavailable state with the request ID when one exists. It does not show "no active frozen keys" for an outage. If the API base URL is not configured, the page says so.

When the engine adds freshness and compatibility fields, the console should present them before any healthy styling.

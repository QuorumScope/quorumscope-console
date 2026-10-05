# Data freshness

Every live page reads current state from the engine on each request. Nothing is cached between requests, so a page shows the engine response from the moment it was rendered.

## What the engine reports

Network, freeze state, status, and preflight responses carry a `freshness` object. The console shows it as returned:

- Freshness status: `current`, `indexing_behind`, `stale`, or `unknown`.
- Source ledger, latest network ledger, and ingestion lag in ledgers.
- When the indexer last observed the network, and when stored state last matched the network.
- The network protocol version, the highest protocol the engine has been verified against, and a compatibility status.

The console does not compute any of these. It does not show ledger close times, because the engine does not store them.

## What the console does with it

- The freshness panel appears on the overview, network, status, frozen keys, bypasses, freeze episodes, impact, and preflight pages. Status is shown as text with a distinct mark and border, not by color alone.
- When compatibility is `unverified_protocol`, a warning appears on those pages and on each preflight result. When it is `unknown`, the page says compatibility cannot be confirmed.
- "No active frozen keys" is written only when the engine reports zero keys and freshness is `current`. In any other state the page says the result is not a confirmation that nothing is frozen.
- A preflight result of `clear` gets calm styling only when freshness is `current`. `state_unavailable` never gets success styling.

## When state cannot be retrieved

If the engine cannot be reached or returns an error, the page shows an unavailable state with the request ID when one exists. It does not show an empty list for an outage. If the API base URL is not configured, the page says so.

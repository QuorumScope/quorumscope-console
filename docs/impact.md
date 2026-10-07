# Impact Analysis & Freeze Map

The Impact view provides operational insights into the blast radius of active and historical Stellar Quorum Freeze episodes.

## The Visual Freeze Map

The Freeze Map is an interactive visual component that groups affected ledger entries into horizontal lanes by key kind:
- `account`
- `trustline`
- `contract_data`
- `contract_code`

### Layout & Behavior

- **Lane Capping**: To maintain deterministic performance, each lane displays up to a fixed cap of individual nodes. Additional items are represented by an aggregate count marker.
- **Node Selection**: Selecting a key node reveals its full key hash, kind, and evidence provenance in an adjacent detail panel.
- **Keyboard Operability**: Every node is a focusable button with `aria-pressed`. Users can traverse nodes using Tab and select nodes with Enter or Space.
- **Polite Live Region**: The detail panel is configured as an `aria-live="polite"` region to announce selected key details to assistive technologies.
- **Responsive Fallback**: On screen widths narrower than 720 px, the visual map is automatically hidden, and all records are presented in the responsive evidence table.

## Evidence Categories

The impact table lists records categorized by evidence class:
- `direct`: Active frozen keys observed directly in protocol freeze entries.
- `protocol_derived`: Ledger entries derived from state transitions and count changes.
- `uncollected_evidence_classes`: Indicates classes requiring transaction history indexing (`recently_observed`, `dependency_observed`, `inferred`) that the engine does not currently collect.

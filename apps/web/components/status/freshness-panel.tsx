import type { StateFreshness } from '@quorumscope/sdk';
import { Fact } from '../data/fact';
import { DataError } from '../feedback/data-error';
import { formatLedger, formatUtc } from '../../lib/format';

const statusText: Record<StateFreshness['status'], { label: string; mark: string; detail: string }> = {
  current: {
    label: 'Current',
    mark: '✓',
    detail: 'The indexer read the network recently and is not behind.',
  },
  indexing_behind: {
    label: 'Indexing behind',
    mark: '◐',
    detail: 'The indexer is reading the network but trails the latest ledger.',
  },
  stale: {
    label: 'Stale',
    mark: '!',
    detail: 'The indexer has not read the network recently. The state below may be out of date.',
  },
  unknown: {
    label: 'Unknown',
    mark: '?',
    detail: 'No indexed state exists for this network yet.',
  },
};

export function FreshnessBadge({ status }: { status: StateFreshness['status'] }) {
  const text = statusText[status];
  return <span className={`badge freshness-${status}`}><span aria-hidden="true">{text.mark}</span> {text.label}</span>;
}

export function CompatibilityNotice({ freshness }: { freshness: StateFreshness }) {
  if (freshness.compatibility === 'verified') return null;
  const protocol = freshness.current_protocol_version;
  const max = freshness.verified_protocol_max;
  return <p className="notice" role="note">
    {freshness.compatibility === 'unverified_protocol'
      ? `QuorumScope has not verified compatibility with protocol ${protocol ?? 'unknown'} yet. The highest verified protocol is ${max ?? 'unknown'}. Treat results as unverified for this network.`
      : 'QuorumScope cannot confirm protocol compatibility because the network protocol version or the verified maximum is not known.'}
  </p>;
}

/** Shows how current the engine state is. Place it on every page that presents live engine state. */
export function FreshnessPanel({ freshness }: { freshness: StateFreshness }) {
  const text = statusText[freshness.status];
  return <section className="panel freshness-panel" aria-labelledby="freshness-title">
    <div className="panel-header">
      <h2 id="freshness-title">Data freshness</h2>
      <FreshnessBadge status={freshness.status} />
    </div>
    <p>{text.detail}</p>
    <CompatibilityNotice freshness={freshness} />
    <dl className="facts">
      <Fact label="Source ledger">{formatLedger(freshness.source_ledger)}</Fact>
      <Fact label="Latest network ledger">{formatLedger(freshness.latest_network_ledger)}</Fact>
      <Fact label="Ingestion lag">{freshness.ingestion_lag_ledgers === null || freshness.ingestion_lag_ledgers === undefined ? 'Not reported' : `${freshness.ingestion_lag_ledgers} ledgers`}</Fact>
      <Fact label="Last observed">{formatUtc(freshness.observed_at)}</Fact>
      <Fact label="Last reconciled ledger">{formatLedger(freshness.last_reconciled_ledger)}</Fact>
      <Fact label="Last reconciled">{formatUtc(freshness.last_reconciled_at)}</Fact>
      <Fact label="Network protocol">{freshness.current_protocol_version ?? 'Not reported'}</Fact>
      <Fact label="Highest verified protocol">{freshness.verified_protocol_max ?? 'Not configured'}</Fact>
    </dl>
  </section>;
}

/** Renders freshness from a freeze-state load, or says that it could not be loaded. */
export function FreshnessSection({ result }: { result: { data?: { freshness: StateFreshness }; error?: unknown } }) {
  if (result.data) return <FreshnessPanel freshness={result.data.freshness} />;
  return <DataError title="Data freshness unavailable" message="Freshness could not be retrieved, so the lists on this page cannot be called current." />;
}

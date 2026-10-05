import type { PreflightResult } from '@quorumscope/sdk';
import { CompatibilityNotice, FreshnessBadge } from '../status/freshness-panel';
import { Fact } from '../data/fact';
import { formatLedger, formatUtc } from '../../lib/format';
import {
  confidenceExplanation,
  confidenceLabel,
  statusExplanation,
  statusLabel,
  toneFor,
  toneMark,
} from '../../lib/preflight';

export function PreflightResultView({ result }: { result: PreflightResult }) {
  const tone = toneFor(result);
  const unavailable = result.status === 'state_unavailable';
  return <section className={`result tone-${tone}`} aria-labelledby="result-title">
    <h2 id="result-title"><span aria-hidden="true">{toneMark[tone]}</span> {statusLabel[result.status]}</h2>
    <p>{statusExplanation[result.status]}</p>
    {result.status === 'clear' && result.freshness.status !== 'current'
      ? <p className="notice" role="note">The state is not current, so this result is not styled as confirmed. See the freshness details.</p> : null}
    <CompatibilityNotice freshness={result.freshness} />
    <dl className="facts">
      <Fact label="Confidence"><span title={confidenceExplanation[result.confidence]}>{confidenceLabel[result.confidence]}</span></Fact>
      <Fact label="Freshness"><FreshnessBadge status={result.freshness.status} /></Fact>
      <Fact label="Source ledger">{unavailable ? 'Not available' : formatLedger(result.source_ledger)}</Fact>
      <Fact label="Last observed">{formatUtc(result.freshness.observed_at)}</Fact>
      <Fact label="Bypass for this transaction">{result.is_bypassed ? 'Content hash is in the active bypass set' : 'None'}</Fact>
      <Fact label="Transaction content hash"><span className="mono">{result.transaction_hash ?? 'Not available'}</span></Fact>
    </dl>
    <p className="muted">{confidenceExplanation[result.confidence]}</p>
    <h3>Findings</h3>
    {result.findings.length ? <ul className="record-list">
      {result.findings.map((finding, index) => <li key={`${finding.protocol_path}-${index}`} className="record">
        <p className="record-title">{statusLabel[finding.status]}</p>
        <p>{finding.explanation}</p>
        <dl className="record-facts">
          <div><dt>Where</dt><dd>{finding.protocol_path}</dd></div>
          <div><dt>Confidence</dt><dd>{confidenceLabel[finding.confidence]}</dd></div>
          {finding.implicated_keys.length ? <div><dt>Frozen key hash</dt><dd className="mono">{finding.implicated_keys.join(', ')}</dd></div> : null}
        </dl>
      </li>)}
    </ul> : <p>No findings. The transaction names no key in the freeze set that QuorumScope read.</p>}
    <p className="muted">Request ID <span className="mono">{result.request_id}</span></p>
  </section>;
}

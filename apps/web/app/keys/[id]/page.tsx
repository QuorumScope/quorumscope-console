import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { QuorumScopeApiError } from '@quorumscope/sdk';
import { Fact } from '../../../components/data/fact';
import { DataError } from '../../../components/feedback/data-error';
import { engineClient, errorMessage, load } from '../../../lib/api';
import { formatLedger, formatUtc } from '../../../lib/format';

export const metadata: Metadata = { title: 'Frozen key' };
export const dynamic = 'force-dynamic';

export default async function KeyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-fA-F]{64}$/u.test(id)) notFound();
  const result = await load(() => engineClient().frozenKeys.get(id));
  if (result.error instanceof QuorumScopeApiError && result.error.status === 404) notFound();
  const key = result.data;
  return <>
    <p className="eyebrow">Frozen key evidence</p>
    <h1>Key detail</h1>
    {key ? <>
      <section className="panel" aria-labelledby="identity-title">
        <div className="panel-header"><h2 id="identity-title">Protocol fact: key identity</h2><span className="badge">{key.active ? '\u25cf Frozen' : '\u25cb No longer frozen'}</span></div>
        <dl className="facts">
          <Fact label="Key hash"><span className="mono">{key.id}</span></Fact>
          <Fact label="Kind">{key.kind ?? 'Not stored'}</Fact>
          <Fact label="Network ID"><span className="mono">{key.network_id}</span></Fact>
        </dl>
        <h3>Canonical ledger key XDR</h3>
        {key.canonical_xdr ? <pre className="code-block wrap" tabIndex={0} aria-label="Canonical ledger key XDR"><code>{key.canonical_xdr}</code></pre> : <p>The indexer has not stored the key content.</p>}
        <h3>Decoded fields</h3>
        {key.decoded ? <pre className="code-block wrap" tabIndex={0} aria-label="Decoded key fields"><code>{JSON.stringify(key.decoded, null, 2)}</code></pre> : <p>No decoded fields are stored.</p>}
      </section>
      <section className="panel" aria-labelledby="observed-title">
        <div className="panel-header"><h2 id="observed-title">Observed history</h2></div>
        <dl className="facts">
          <Fact label="Frozen since ledger">{formatLedger(key.active_since)}</Fact>
          <Fact label="First frozen ledger">{formatLedger(key.first_frozen_ledger)}</Fact>
          <Fact label="Latest change ledger">{formatLedger(key.last_changed)}</Fact>
          <Fact label="Latest evidence"><span className="mono">{key.evidence_ref ?? 'Not reported'}</span></Fact>
        </dl>
        {result.data.history.length ? <table className="table">
          <caption>Recorded freeze and unfreeze changes, oldest first</caption>
          <thead><tr><th scope="col">Ledger</th><th scope="col">Change</th><th scope="col">Recorded at</th><th scope="col">Evidence</th></tr></thead>
          <tbody>{result.data.history.map(change => <tr key={`${change.ledger_sequence}-${change.action}-${change.recorded_at}`}>
            <td>{formatLedger(change.ledger_sequence)}</td>
            <td>{change.action === 'freeze' ? 'Frozen' : 'Unfrozen'}</td>
            <td>{formatUtc(change.recorded_at)}</td>
            <td className="mono">{change.evidence_ref ?? 'Not reported'}</td>
          </tr>)}</tbody>
        </table> : <p>No changes are recorded for this key.</p>}
        <p className="muted">This history covers only ledgers the QuorumScope indexer has observed. It polls current state, so changes between polls appear together.</p>
      </section>
    </> : <DataError title="Key detail unavailable" message={errorMessage(result.error)} />}
  </>;
}

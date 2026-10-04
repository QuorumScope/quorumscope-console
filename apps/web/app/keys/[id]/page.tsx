import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { QuorumScopeApiError } from '@quorumscope/sdk';
import { Fact } from '../../../components/data/fact';
import { DataError } from '../../../components/feedback/data-error';
import { engineClient, errorMessage, load } from '../../../lib/api';

export const metadata: Metadata = { title: 'Frozen key' };
export const dynamic = 'force-dynamic';

export default async function KeyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-fA-F]{64}$/u.test(id)) notFound();
  const result = await load(() => engineClient().frozenKeys.get(id));
  if (result.error instanceof QuorumScopeApiError && result.error.status === 404) notFound();
  return <>
    <p className="eyebrow">Frozen key evidence</p>
    <h1>Key detail</h1>
    {result.data ? <section className="panel" aria-labelledby="key-title">
      <div className="panel-header"><h2 id="key-title">Indexed key</h2></div>
      <dl className="facts">
        <Fact label="Key hash"><span className="mono">{result.data.id}</span></Fact>
        <Fact label="Network ID"><span className="mono">{result.data.network_id}</span></Fact>
        <Fact label="Active since ledger">{result.data.active_since}</Fact>
        <Fact label="Last changed ledger">{result.data.last_changed}</Fact>
        <Fact label="Evidence reference"><span className="mono">{result.data.evidence_ref ?? 'Not reported'}</span></Fact>
      </dl>
      <p className="muted">The current engine response does not include canonical key XDR, decoded fields, or complete key history.</p>
    </section> : <DataError title="Key detail unavailable" message={errorMessage(result.error)} />}
  </>;
}

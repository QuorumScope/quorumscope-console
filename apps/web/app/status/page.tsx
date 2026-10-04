import type { Metadata } from 'next';
import { Fact } from '../../components/data/fact';
import { DataError } from '../../components/feedback/data-error';
import { engineClient, errorMessage, load } from '../../lib/api';

export const metadata: Metadata = { title: 'Status' };
export const dynamic = 'force-dynamic';

export default async function StatusPage() {
  const [status, ready] = await Promise.all([
    load(() => engineClient().status.get()),
    load(() => engineClient().health.ready()),
  ]);
  const updated = status.data?.updated_at;
  const date = updated && !Number.isNaN(Date.parse(updated)) ? new Date(updated).toISOString() : updated;
  return <>
    <p className="eyebrow">Service evidence</p>
    <h1>QuorumScope status</h1>
    <p className="lede">The status endpoint reports indexer progress. Readiness is queried separately. These checks do not measure historical uptime.</p>
    {status.data ? <section className="panel" aria-labelledby="indexer-title">
      <div className="panel-header"><h2 id="indexer-title">Indexer report</h2></div>
      <dl className="facts">
        <Fact label="Stream">{status.data.stream}</Fact>
        <Fact label="Last complete ledger">{status.data.last_complete_ledger}</Fact>
        <Fact label="Updated at">{date ?? 'Not reported'}</Fact>
        <Fact label="Network ID"><span className="mono">{status.data.network_id}</span></Fact>
      </dl>
    </section> : <DataError title="Indexer status unavailable" message={errorMessage(status.error)} />}
    {ready.data ? <section className="panel" aria-labelledby="ready-title">
      <div className="panel-header"><h2 id="ready-title">Readiness</h2></div>
      <p>{ready.data.status}</p>
    </section> : <DataError title="Readiness check failed" message={errorMessage(ready.error)} />}
  </>;
}

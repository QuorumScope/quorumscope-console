import type { Metadata } from 'next';
import Link from 'next/link';
import { DataError } from '../../components/feedback/data-error';
import { engineClient, errorMessage, load } from '../../lib/api';
import { parsePage } from '../../lib/page';

export const metadata: Metadata = { title: 'Active bypasses' };
export const dynamic = 'force-dynamic';

export default async function BypassesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = parsePage((await searchParams).page);
  const result = await load(() => engineClient().bypasses.list({ page, pageSize: 25 }));
  return <>
    <p className="eyebrow">Engine index</p>
    <h1>Active bypasses</h1>
    <p className="lede">A bypass applies to a transaction content hash under engine-reported state. It is not a key unfreeze. This API response lists the hash and ledger evidence.</p>
    {result.data ? <section className="panel" aria-labelledby="bypasses-title">
      <div className="panel-header"><h2 id="bypasses-title">Reported bypasses</h2><span className="muted">Page {result.data.page}</span></div>
      {result.data.items.length ? <ul className="record-list">
        {result.data.items.map(bypass => <li key={bypass.tx_hash} className="record">
          <strong className="record-title mono">{bypass.tx_hash}</strong>
          <dl className="record-facts">
            <div><dt>Active since ledger</dt><dd>{bypass.active_since}</dd></div>
            <div><dt>Last changed ledger</dt><dd>{bypass.last_changed}</dd></div>
            <div><dt>Evidence reference</dt><dd className="mono">{bypass.evidence_ref ?? 'Not reported'}</dd></div>
          </dl>
        </li>)}
      </ul> : <p>No active bypasses were returned for this page. The current response does not establish freshness.</p>}
      <nav className="pagination" aria-label="Bypass pages">
        {page > 1 ? <Link href={`/bypasses?page=${page - 1}`}>Previous page</Link> : <span />}
        {result.data.items.length === result.data.page_size ? <Link href={`/bypasses?page=${page + 1}`}>Next page</Link> : null}
      </nav>
    </section> : <DataError title="Bypass evidence unavailable" message={errorMessage(result.error)} />}
  </>;
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { DataError } from '../../components/feedback/data-error';
import { engineClient, errorMessage, load } from '../../lib/api';
import { parsePage } from '../../lib/page';

export const metadata: Metadata = { title: 'Frozen keys' };
export const dynamic = 'force-dynamic';

export default async function KeysPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = parsePage((await searchParams).page);
  const result = await load(() => engineClient().frozenKeys.list({ page, pageSize: 25 }));
  return <>
    <p className="eyebrow">Engine index</p>
    <h1>Frozen keys</h1>
    <p className="lede">The current API lists frozen key hashes and ledger evidence. It does not supply decoded key kind, canonical XDR, or historical state in this response.</p>
    {result.data ? <section className="panel" aria-labelledby="keys-title">
      <div className="panel-header"><h2 id="keys-title">Reported keys</h2><span className="muted">Page {result.data.page}</span></div>
      {result.data.items.length ? <ul className="record-list">
        {result.data.items.map(key => <li key={key.id} className="record">
          <Link className="record-title mono" href={`/keys/${encodeURIComponent(key.id)}`}>{key.id}</Link>
          <dl className="record-facts"><div><dt>Active since ledger</dt><dd>{key.active_since}</dd></div><div><dt>Last changed ledger</dt><dd>{key.last_changed}</dd></div><div><dt>Evidence reference</dt><dd className="mono">{key.evidence_ref ?? 'Not reported'}</dd></div></dl>
        </li>)}
      </ul> : <p>No frozen keys were returned for this page. This response does not establish a freshness classification.</p>}
      <nav className="pagination" aria-label="Frozen key pages">
        {page > 1 ? <Link href={`/keys?page=${page - 1}`}>Previous page</Link> : <span />}
        {result.data.items.length === result.data.page_size ? <Link href={`/keys?page=${page + 1}`}>Next page</Link> : null}
      </nav>
    </section> : <DataError title="Frozen keys unavailable" message={errorMessage(result.error)} />}
  </>;
}

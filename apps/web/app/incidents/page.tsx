import type { Metadata } from 'next';
import Link from 'next/link';
import { DataError } from '../../components/feedback/data-error';
import { engineClient, errorMessage, load } from '../../lib/api';
import { parsePage } from '../../lib/page';

export const metadata: Metadata = { title: 'Freeze episodes' };
export const dynamic = 'force-dynamic';

export default async function IncidentsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = parsePage((await searchParams).page);
  const result = await load(() => engineClient().incidents.list({ page, pageSize: 25 }));
  return <>
    <p className="eyebrow">Derived chronology</p>
    <h1>Freeze episodes</h1>
    <p className="lede">The engine derives these episodes from indexed freeze evidence. An episode does not, by itself, identify a cause or an emergency.</p>
    {result.data ? <section className="panel" aria-labelledby="episodes-title">
      <div className="panel-header"><h2 id="episodes-title">Indexed episodes</h2><span className="muted">Page {result.data.page}</span></div>
      {result.data.items.length ? <ul className="record-list">
        {result.data.items.map(episode => <li key={episode.id} className="record">
          <Link className="record-title mono" href={`/incidents/${encodeURIComponent(episode.id)}`}>{episode.id}</Link>
          <dl className="record-facts">
            <div><dt>Status</dt><dd>{episode.status}</dd></div>
            <div><dt>Basis</dt><dd>{episode.basis}</dd></div>
            <div><dt>Opened ledger</dt><dd>{episode.opened_ledger}</dd></div>
            <div><dt>Closed ledger</dt><dd>{episode.closed_ledger ?? 'Open or not reported'}</dd></div>
          </dl>
        </li>)}
      </ul> : <p>No freeze episodes were returned for this page.</p>}
      <nav className="pagination" aria-label="Freeze episode pages">
        {page > 1 ? <Link href={`/incidents?page=${page - 1}`}>Previous page</Link> : <span />}
        {result.data.items.length === result.data.page_size ? <Link href={`/incidents?page=${page + 1}`}>Next page</Link> : null}
      </nav>
    </section> : <DataError title="Freeze episodes unavailable" message={errorMessage(result.error)} />}
  </>;
}

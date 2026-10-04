import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { QuorumScopeApiError } from '@quorumscope/sdk';
import { Fact } from '../../../components/data/fact';
import { DataError } from '../../../components/feedback/data-error';
import { engineClient, errorMessage, load } from '../../../lib/api';
import { parsePage } from '../../../lib/page';

export const metadata: Metadata = { title: 'Freeze episode' };
export const dynamic = 'force-dynamic';

export default async function IncidentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string }> }) {
  const { id } = await params;
  const page = parsePage((await searchParams).page);
  const [episode, timeline] = await Promise.all([
    load(() => engineClient().incidents.get(id)),
    load(() => engineClient().incidents.timeline(id, { page, pageSize: 25 })),
  ]);
  if (episode.error instanceof QuorumScopeApiError && episode.error.status === 404) notFound();
  return <>
    <p className="eyebrow">Freeze episode</p>
    <h1>Episode timeline</h1>
    <p className="lede mono">{id}</p>
    {episode.data ? <section className="panel" aria-labelledby="summary-title">
      <div className="panel-header"><h2 id="summary-title">Summary</h2></div>
      <dl className="facts">
        <Fact label="Status">{episode.data.status}</Fact>
        <Fact label="Basis">{episode.data.basis}</Fact>
        <Fact label="Opened ledger">{episode.data.opened_ledger}</Fact>
        <Fact label="Closed ledger">{episode.data.closed_ledger ?? 'Open or not reported'}</Fact>
        <Fact label="Opened time">{episode.data.opened_close_time ?? 'Not reported'}</Fact>
        <Fact label="Closed time">{episode.data.closed_close_time ?? 'Not reported'}</Fact>
      </dl>
    </section> : <DataError title="Episode summary unavailable" message={errorMessage(episode.error)} />}
    {timeline.data ? <section className="panel" aria-labelledby="timeline-title">
      <div className="panel-header"><h2 id="timeline-title">Evidence timeline</h2><span className="muted">Page {timeline.data.page}</span></div>
      {timeline.data.items.length ? <ol className="record-list">
        {timeline.data.items.map(event => <li key={event.id} className="record">
          <strong>{event.kind}</strong>
          <dl className="record-facts">
            <div><dt>Ledger</dt><dd>{event.ledger_sequence}</dd></div>
            <div><dt>Indexed at</dt><dd>{event.created_at}</dd></div>
            <div><dt>Evidence reference</dt><dd className="mono">{event.evidence_ref}</dd></div>
          </dl>
        </li>)}
      </ol> : <p>No timeline events were returned for this page.</p>}
      <nav className="pagination" aria-label="Timeline pages">
        {page > 1 ? <Link href={`/incidents/${encodeURIComponent(id)}?page=${page - 1}`}>Previous page</Link> : <span />}
        {timeline.data.items.length === timeline.data.page_size ? <Link href={`/incidents/${encodeURIComponent(id)}?page=${page + 1}`}>Next page</Link> : null}
      </nav>
    </section> : <DataError title="Timeline unavailable" message={errorMessage(timeline.error)} />}
  </>;
}

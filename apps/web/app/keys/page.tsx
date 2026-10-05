import type { Metadata } from 'next';
import Link from 'next/link';
import { DataError } from '../../components/feedback/data-error';
import { FreshnessSection } from '../../components/status/freshness-panel';
import { engineClient, errorMessage, load } from '../../lib/api';
import { formatLedger } from '../../lib/format';
import { parsePage } from '../../lib/page';

export const metadata: Metadata = { title: 'Frozen keys' };
export const dynamic = 'force-dynamic';

const kinds = ['account', 'trustline', 'contract_data', 'contract_code'] as const;
const kindLabel: Record<(typeof kinds)[number], string> = {
  account: 'Account',
  trustline: 'Trustline',
  contract_data: 'Contract data',
  contract_code: 'Contract code',
};

type Search = { page?: string; kind?: string; history?: string };

function href(params: { page?: number; kind?: string; history?: boolean }): string {
  const query = new URLSearchParams();
  if (params.kind) query.set('kind', params.kind);
  if (params.history) query.set('history', '1');
  if (params.page && params.page > 1) query.set('page', String(params.page));
  const text = query.toString();
  return text ? `/keys?${text}` : '/keys';
}

export default async function KeysPage({ searchParams }: { searchParams: Promise<Search> }) {
  const search = await searchParams;
  const page = parsePage(search.page);
  const kind = kinds.find(k => k === search.kind);
  const history = search.history === '1';
  const [result, fresh] = await Promise.all([
    load(() => engineClient().frozenKeys.list({ page, pageSize: 25, kind, active: !history })),
    load(() => engineClient().freezeState.get()),
  ]);
  return <>
    <p className="eyebrow">Engine index</p>
    <h1>Frozen keys</h1>
    <p className="lede">Ledger keys in the freeze set that the engine reports. Each key links to its canonical XDR, decoded fields, and recorded history.</p>
    <FreshnessSection result={fresh} />
    <form className="filters" method="get" action="/keys">
      <label>Key kind
        <select name="kind" defaultValue={kind ?? ''}>
          <option value="">All kinds</option>
          {kinds.map(k => <option key={k} value={k}>{kindLabel[k]}</option>)}
        </select>
      </label>
      <label className="check"><input type="checkbox" name="history" value="1" defaultChecked={history} /> Include keys no longer frozen</label>
      <button className="button secondary" type="submit">Apply filters</button>
    </form>
    {result.data ? <section className="panel" aria-labelledby="keys-title">
      <div className="panel-header"><h2 id="keys-title">{history ? 'Known keys' : 'Active frozen keys'}</h2><span className="muted">Page {result.data.page}</span></div>
      {result.data.items.length ? <ul className="record-list">
        {result.data.items.map(key => <li key={key.id} className="record">
          <Link className="record-title mono" href={`/keys/${encodeURIComponent(key.id)}`}>{key.id}</Link>
          <dl className="record-facts">
            <div><dt>State</dt><dd>{key.active ? 'Frozen' : 'No longer frozen'}</dd></div>
            <div><dt>Kind</dt><dd>{key.kind ? kindLabel[key.kind as (typeof kinds)[number]] ?? key.kind : 'Not stored'}</dd></div>
            <div><dt>First frozen ledger</dt><dd>{formatLedger(key.first_frozen_ledger)}</dd></div>
            <div><dt>Latest change ledger</dt><dd>{formatLedger(key.last_changed)}</dd></div>
            <div><dt>Evidence</dt><dd className="mono">{key.evidence_ref ?? 'Not reported'}</dd></div>
          </dl>
        </li>)}
      </ul> : page > 1 ? <p>This page has no keys. Go back to the previous page.</p>
        : fresh.data?.freshness.status === 'current'
        ? <p>No {history ? 'known' : 'active frozen'} keys{kind ? ` of kind ${kindLabel[kind].toLowerCase()}` : ''} were reported at source ledger {formatLedger(fresh.data.freshness.source_ledger)}.</p>
        : <p>No keys were returned, but the state is not current. This is not a confirmation that nothing is frozen.</p>}
      <nav className="pagination" aria-label="Frozen key pages">
        {page > 1 ? <Link href={href({ page: page - 1, kind, history })}>Previous page</Link> : <span />}
        {result.data.items.length === result.data.page_size ? <Link href={href({ page: page + 1, kind, history })}>Next page</Link> : null}
      </nav>
    </section> : <DataError title="Frozen keys unavailable" message={errorMessage(result.error)} />}
  </>;
}

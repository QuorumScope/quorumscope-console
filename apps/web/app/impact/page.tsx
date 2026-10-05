import type { Metadata } from 'next';
import Link from 'next/link';
import { DataError } from '../../components/feedback/data-error';
import { FreezeMapLoader } from '../../components/impact/freeze-map-loader';
import { FreshnessSection } from '../../components/status/freshness-panel';
import { engineClient, errorMessage, load } from '../../lib/api';
import { formatLedger } from '../../lib/format';
import { parsePage } from '../../lib/page';
import {
  evidenceClasses,
  evidenceExplanation,
  evidenceLabel,
  evidenceMark,
  isEvidenceClass,
  keyKindLabel,
  keyKinds,
} from '../../lib/impact';

export const metadata: Metadata = { title: 'Impact' };
export const dynamic = 'force-dynamic';

type Search = { page?: string; class?: string; kind?: string };

function href(params: { page?: number; evidenceClass?: string; kind?: string }): string {
  const query = new URLSearchParams();
  if (params.evidenceClass) query.set('class', params.evidenceClass);
  if (params.kind) query.set('kind', params.kind);
  if (params.page && params.page > 1) query.set('page', String(params.page));
  const text = query.toString();
  return text ? `/impact?${text}` : '/impact';
}

export default async function ImpactPage({ searchParams }: { searchParams: Promise<Search> }) {
  const search = await searchParams;
  const page = parsePage(search.page);
  const evidenceClass = search.class && isEvidenceClass(search.class) ? search.class : undefined;
  const kind = keyKinds.find(k => k === search.kind);
  const [result, fresh] = await Promise.all([
    load(() => engineClient().impact.get({ page, pageSize: 50, evidenceClass, keyKind: kind })),
    load(() => engineClient().freezeState.get()),
  ]);
  const data = result.data;
  return <>
    <p className="eyebrow">Evidence-backed impact</p>
    <h1>Impact of the freeze set</h1>
    <p className="lede">What the engine can show about active frozen keys, with the class of evidence behind each record. A record here is not a claim about which applications depend on a key.</p>
    <FreshnessSection result={fresh} />
    <form className="filters" method="get" action="/impact">
      <label>Evidence class
        <select name="class" defaultValue={evidenceClass ?? ''}>
          <option value="">All classes</option>
          {evidenceClasses.map(c => <option key={c} value={c}>{evidenceLabel[c]}</option>)}
        </select>
      </label>
      <label>Key kind
        <select name="kind" defaultValue={kind ?? ''}>
          <option value="">All kinds</option>
          {keyKinds.map(k => <option key={k} value={k}>{keyKindLabel[k]}</option>)}
        </select>
      </label>
      <button className="button secondary" type="submit">Apply filters</button>
    </form>
    {data ? <>
      {data.uncollected_evidence_classes.length ? <section className="panel" aria-labelledby="coverage-title">
        <div className="panel-header"><h2 id="coverage-title">Evidence coverage</h2></div>
        <p>The engine stores {data.collected_evidence_classes.map(c => isEvidenceClass(c) ? evidenceLabel[c] : c).join(' and ')} evidence. It does not store {data.uncollected_evidence_classes.map(c => isEvidenceClass(c) ? evidenceLabel[c] : c).join(', ')} evidence because transaction history is not indexed. An empty result for those classes means none was collected, not that none exists.</p>
        <p className="muted">Records come from polling current state. Ledgers between polls were not read, so every observation window below is incomplete.</p>
      </section> : null}
      <section className="panel" aria-labelledby="map-title">
        <div className="panel-header"><h2 id="map-title">Freeze Map</h2><span className="muted">Direct evidence by key kind</span></div>
        <FreezeMapLoader records={data.items} />
        <p className="map-fallback muted">The Freeze Map is hidden on narrow screens. Use the table below.</p>
      </section>
      <section className="panel" aria-labelledby="records-title">
        <div className="panel-header"><h2 id="records-title">Evidence records</h2><span className="muted">Page {data.page}</span></div>
        {data.items.length ? <div className="table-scroll"><table className="table">
          <caption>Impact records with evidence class, source, and observed ledger range</caption>
          <thead><tr><th scope="col">Evidence</th><th scope="col">Key</th><th scope="col">Kind</th><th scope="col">Observed ledgers</th><th scope="col">Source</th><th scope="col">Reference</th></tr></thead>
          <tbody>{data.items.map((record, index) => {
            const known = isEvidenceClass(record.evidence_class) ? record.evidence_class : undefined;
            return <tr key={`${record.evidence_class}-${record.key_id ?? 'summary'}-${index}`}>
              <td>
                <span className={`evidence evidence-${record.evidence_class}`}><span aria-hidden="true">{known ? evidenceMark[known] : '?'}</span> {known ? evidenceLabel[known] : record.evidence_class}</span>
                <p className="muted small">{known ? evidenceExplanation[known] : ''}</p>
                <p className="small">{record.description}</p>
              </td>
              <td className="mono">{record.key_id ? <Link href={`/keys/${record.key_id}`}>{record.key_id}</Link> : 'All keys'}</td>
              <td>{record.key_kind ?? 'Not applicable'}</td>
              <td>{formatLedger(record.observation_window.first_ledger)} to {formatLedger(record.observation_window.last_ledger)}{record.observation_window.is_complete_for_range ? '' : ' (incomplete)'}</td>
              <td className="mono">{record.observation_window.provider}</td>
              <td className="mono">{record.evidence_ref ?? 'Not reported'}</td>
            </tr>;
          })}</tbody>
        </table></div> : fresh.data?.freshness.status === 'current'
          ? <p>No impact records matched at source ledger {formatLedger(fresh.data.freshness.source_ledger)}. {evidenceClass && !data.collected_evidence_classes.includes(evidenceClass) ? `${evidenceLabel[evidenceClass]} evidence is not collected by the engine.` : ''}</p>
          : <p>No records were returned, but the state is not current. This is not a confirmation that nothing is frozen.</p>}
        <nav className="pagination" aria-label="Impact record pages">
          {page > 1 ? <Link href={href({ page: page - 1, evidenceClass, kind })}>Previous page</Link> : <span />}
          {data.items.length === data.page_size ? <Link href={href({ page: page + 1, evidenceClass, kind })}>Next page</Link> : null}
        </nav>
      </section>
    </> : <DataError title="Impact unavailable" message={errorMessage(result.error)} />}
  </>;
}

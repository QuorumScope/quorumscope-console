import type { Metadata } from 'next';
import { PreflightForm } from '../../components/preflight/preflight-form';
import { FreshnessSection } from '../../components/status/freshness-panel';
import { engineClient, load } from '../../lib/api';

export const metadata: Metadata = { title: 'Preflight' };
export const dynamic = 'force-dynamic';

export default async function PreflightPage() {
  const fresh = await load(() => engineClient().freezeState.get());
  return <>
    <p className="eyebrow">Before submission</p>
    <h1>Transaction preflight</h1>
    <p className="lede">Paste a transaction envelope to compare the ledger keys it names with the active freeze set. QuorumScope does not submit or sign transactions.</p>
    <FreshnessSection result={fresh} />
    <PreflightForm />
  </>;
}

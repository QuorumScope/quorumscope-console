import Link from 'next/link';
import { Fact } from '../components/data/fact';
import { DataError } from '../components/feedback/data-error';
import { FreshnessPanel } from '../components/status/freshness-panel';
import { engineClient, errorMessage } from '../lib/api';
import { formatLedger } from '../lib/format';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const state = await Promise.allSettled([
    Promise.resolve().then(() => engineClient().network.get()),
    Promise.resolve().then(() => engineClient().freezeState.get()),
  ]);
  const network = state[0]?.status === 'fulfilled' ? state[0].value : undefined;
  const freeze = state[1]?.status === 'fulfilled' ? state[1].value : undefined;
  const failure = state[0]?.status === 'rejected' ? state[0].reason : state[1]?.status === 'rejected' ? state[1].reason : new Error('QuorumScope engine API URL is not configured.');
  const current = freeze?.freshness.status === 'current';
  const none = freeze?.frozen_key_count === 0;

  return <>
    <p className="eyebrow">Stellar Quorum Freeze inspection</p>
    <h1>Engine-reported freeze state, with its source in view.</h1>
    <p className="lede">QuorumScope reads Stellar Quorum Freeze state and explains how it affects ledger keys and transactions. Check the data freshness before relying on a result.</p>
    <div className="actions"><Link className="button" href="/network">Inspect network</Link><Link className="button secondary" href="/status">Service status</Link></div>
    {network && freeze ? <>
      <FreshnessPanel freshness={freeze.freshness} />
      <section className="panel" aria-labelledby="state-title">
        <div className="panel-header"><h2 id="state-title">Reported state</h2><span className="muted">{network.name}</span></div>
        {none && current ? <p><strong>No active frozen keys</strong> were reported at source ledger {formatLedger(freeze.freshness.source_ledger)}.</p> : null}
        {none && !current ? <p><strong>The count below is not a confirmation that nothing is frozen.</strong> The state is not current, so check the data freshness above.</p> : null}
        <dl className="facts">
          <Fact label="Frozen keys">{freeze.frozen_key_count}</Fact>
          <Fact label="Active bypasses">{freeze.bypass_count}</Fact>
          <Fact label="Active freeze episodes">{freeze.active_incident_count}</Fact>
          <Fact label="Latest ledger in state">{formatLedger(freeze.latest_ledger)}</Fact>
        </dl>
        {freeze.frozen_key_count > 0 ? <p><Link href="/keys">Inspect frozen keys</Link>{freeze.active_incident_count > 0 ? <> or <Link href="/incidents">the active freeze episode</Link></> : null}.</p> : null}
      </section>
    </> : <DataError title="Current state unavailable" message={errorMessage(failure)} />}
  </>;
}

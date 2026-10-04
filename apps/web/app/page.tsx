import Link from 'next/link';
import { Fact } from '../components/data/fact';
import { DataError } from '../components/feedback/data-error';
import { engineClient, errorMessage } from '../lib/api';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const state = await Promise.allSettled([
    Promise.resolve().then(() => engineClient().network.get()),
    Promise.resolve().then(() => engineClient().freezeState.get()),
  ]);
  const network = state[0]?.status === 'fulfilled' ? state[0].value : undefined;
  const freeze = state[1]?.status === 'fulfilled' ? state[1].value : undefined;
  const failure = state[0]?.status === 'rejected' ? state[0].reason : state[1]?.status === 'rejected' ? state[1].reason : new Error('QuorumScope engine API URL is not configured.');

  return <>
    <p className="eyebrow">Stellar Quorum Freeze inspection</p>
    <h1>Engine-reported freeze state, with its source in view.</h1>
    <p className="lede">QuorumScope reads engine-reported frozen keys, bypasses, and freeze episodes. Inspect the network state before relying on a result.</p>
    <div className="actions"><Link className="button" href="/network">Inspect network</Link><Link className="button secondary" href="/status">Service status</Link></div>
    {network && freeze ? <section className="panel" aria-labelledby="state-title">
      <div className="panel-header"><h2 id="state-title">Reported state</h2><span className="muted">{network.name}</span></div>
      <dl className="facts">
        <Fact label="Frozen keys">{freeze.frozen_key_count}</Fact>
        <Fact label="Active bypasses">{freeze.bypass_count}</Fact>
        <Fact label="Active freeze episodes">{freeze.active_incident_count}</Fact>
        <Fact label="Latest ledger in state">{freeze.latest_ledger ?? 'Not reported'}</Fact>
      </dl>
      <p className="muted">The engine API does not yet report a freshness classification or protocol compatibility for this response.</p>
    </section> : <DataError title="Current state unavailable" message={errorMessage(failure)} />}
  </>;
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { Fact } from '../../components/data/fact';
import { DataError } from '../../components/feedback/data-error';
import { FreshnessPanel } from '../../components/status/freshness-panel';
import { engineClient, errorMessage, load } from '../../lib/api';
import { formatLedger } from '../../lib/format';

export const metadata: Metadata = { title: 'Network' };
export const dynamic = 'force-dynamic';

export default async function NetworkPage() {
  const [network, freeze] = await Promise.all([
    load(() => engineClient().network.get()),
    load(() => engineClient().freezeState.get()),
  ]);
  return <>
    <p className="eyebrow">Network evidence</p>
    <h1>Network state</h1>
    <p className="lede">These values come from the configured QuorumScope engine. The freshness panel says how current they are and whether the network protocol is newer than the engine has verified.</p>
    {freeze.data ? <FreshnessPanel freshness={freeze.data.freshness} /> : null}
    {network.data ? <section className="panel" aria-labelledby="network-title">
      <div className="panel-header"><h2 id="network-title">Network identity</h2></div>
      <dl className="facts">
        <Fact label="Name">{network.data.name}</Fact>
        <Fact label="Network ID"><span className="mono">{network.data.id}</span></Fact>
        <Fact label="Passphrase"><span className="mono">{network.data.passphrase}</span></Fact>
      </dl>
    </section> : <DataError title="Network identity unavailable" message={errorMessage(network.error)} />}
    {freeze.data ? <section className="panel" aria-labelledby="freeze-title">
      <div className="panel-header"><h2 id="freeze-title">Freeze state</h2></div>
      <dl className="facts">
        <Fact label="Frozen keys">{freeze.data.frozen_key_count}</Fact>
        <Fact label="Active bypasses">{freeze.data.bypass_count}</Fact>
        <Fact label="Active freeze episodes">{freeze.data.active_incident_count}</Fact>
        <Fact label="Latest reported ledger">{formatLedger(freeze.data.latest_ledger)}</Fact>
      </dl>
      <p className="muted">The engine does not store ledger close times, so none are shown.</p>
      <p><Link href="/bypasses">Inspect active bypass evidence</Link></p>
    </section> : <DataError title="Freeze state unavailable" message={errorMessage(freeze.error)} />}
  </>;
}

import type { Metadata } from 'next';
import { Fact } from '../../components/data/fact';
import { DataError } from '../../components/feedback/data-error';
import { engineClient, errorMessage, load } from '../../lib/api';

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
    <p className="lede">These values come from the configured QuorumScope engine. A ledger number identifies the latest ledger reported in freeze state, but the current API does not classify its freshness.</p>
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
        <Fact label="Latest reported ledger">{freeze.data.latest_ledger ?? 'Not reported'}</Fact>
      </dl>
      <p className="muted">Protocol version, verified compatibility, and source close time are not present in this engine response.</p>
    </section> : <DataError title="Freeze state unavailable" message={errorMessage(freeze.error)} />}
  </>;
}

'use client';

import { useState, type KeyboardEvent } from 'react';
import type { ImpactRecord } from '@quorumscope/sdk';
import { LANE_WIDTH, NODE_HEIGHT, evidenceLabel, evidenceMark, isEvidenceClass, keyKindLabel, layoutMap } from '../../lib/impact';

/** Direct freeze nodes by key kind. It draws no edges: the engine has stored no relationship evidence. */
export function FreezeMap({ records }: { records: ImpactRecord[] }) {
  const layout = layoutMap(records);
  const [selected, setSelected] = useState<string>();
  const chosen = layout.nodes.find(n => n.id === selected);

  function onKey(event: KeyboardEvent, id: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelected(id);
    }
  }

  return <div className="freeze-map">
    <svg viewBox={`0 0 ${layout.width} ${layout.height}`} role="group" aria-label="Freeze Map: frozen keys grouped by key kind" className="map-svg">
      {layout.lanes.map(lane => <g key={lane.kind}>
        <text x={lane.x + 12} y={22} className="map-lane">{keyKindLabel[lane.kind]} ({lane.total})</text>
        {lane.hidden > 0 ? <text x={lane.x + 12} y={layout.height - 10} className="map-more">{`+${lane.hidden} more in the table`}</text> : null}
      </g>)}
      {layout.nodes.map(node => <g
        key={node.id}
        role="button"
        tabIndex={0}
        aria-pressed={selected === node.id}
        aria-label={`${keyKindLabel[node.kind]} key ${node.id}, direct evidence`}
        className={`map-node${selected === node.id ? ' selected' : ''}`}
        onClick={() => setSelected(node.id)}
        onKeyDown={event => onKey(event, node.id)}
      >
        <rect x={node.x} y={node.y} width={LANE_WIDTH - 24} height={NODE_HEIGHT} />
        <text x={node.x + 8} y={node.y + 18} className="mono">{evidenceMark.direct} {node.label}</text>
      </g>)}
    </svg>
    <div className="map-detail" aria-live="polite">
      {chosen ? <>
        <h3>Selected key</h3>
        <p className="mono">{chosen.id}</p>
        <p>{keyKindLabel[chosen.kind]}. {isEvidenceClass(chosen.record.evidence_class) ? evidenceLabel[chosen.record.evidence_class] : chosen.record.evidence_class} evidence. {chosen.record.description}</p>
        <p className="muted">Observed ledgers {chosen.record.observation_window.first_ledger} to {chosen.record.observation_window.last_ledger}. The map shows direct freeze evidence only. No relationships between keys are shown because none are stored.</p>
      </> : <p className="muted">Select a key to see its evidence. The table below lists the same records.</p>}
    </div>
  </div>;
}

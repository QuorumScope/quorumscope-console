import type { ImpactRecord } from '@quorumscope/sdk';

export const evidenceClasses = ['direct', 'protocol_derived', 'recently_observed', 'dependency_observed', 'inferred'] as const;
export type EvidenceClass = (typeof evidenceClasses)[number];

export const evidenceLabel: Record<EvidenceClass, string> = {
  direct: 'Direct',
  protocol_derived: 'Protocol-derived',
  recently_observed: 'Recently observed',
  dependency_observed: 'Dependency observed',
  inferred: 'Inferred',
};

export const evidenceExplanation: Record<EvidenceClass, string> = {
  direct: 'The key is in the freeze set that QuorumScope read from the network.',
  protocol_derived: 'Derived from the stored freeze set by counting, not observed on the network.',
  recently_observed: 'Seen in recent ledger history.',
  dependency_observed: 'A dependency was observed between entries.',
  inferred: 'Inferred from past behavior. Historical behavior may not predict future access.',
};

/** Marks differ in shape so evidence strength is not carried by color alone. */
export const evidenceMark: Record<EvidenceClass, string> = {
  direct: '■',
  protocol_derived: '◆',
  recently_observed: '●',
  dependency_observed: '▲',
  inferred: '○',
};

export function isEvidenceClass(value: string): value is EvidenceClass {
  return (evidenceClasses as readonly string[]).includes(value);
}

export const keyKinds = ['account', 'trustline', 'contract_data', 'contract_code'] as const;
export type KeyKind = (typeof keyKinds)[number];

export const keyKindLabel: Record<KeyKind, string> = {
  account: 'ACCOUNT',
  trustline: 'TRUSTLINE',
  contract_data: 'CONTRACT DATA',
  contract_code: 'CONTRACT CODE',
};

export interface MapNode {
  id: string;
  kind: KeyKind;
  x: number;
  y: number;
  label: string;
  record: ImpactRecord;
}

export interface MapLane {
  kind: KeyKind;
  x: number;
  total: number;
  hidden: number;
}

export interface MapLayout {
  width: number;
  height: number;
  lanes: MapLane[];
  nodes: MapNode[];
}

export const LANE_WIDTH = 180;
export const NODE_HEIGHT = 28;
export const NODE_GAP = 10;
export const MAX_NODES_PER_LANE = 12;

export function shortId(id: string): string {
  return id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;
}

/**
 * Deterministic lane layout for direct freeze records. Each key kind has a fixed lane, nodes keep
 * the order the engine returned, and each lane shows at most MAX_NODES_PER_LANE nodes.
 * Records without a key or a known kind are not placed on the map. They stay in the table.
 */
export function layoutMap(records: readonly ImpactRecord[], cap = MAX_NODES_PER_LANE): MapLayout {
  const lanes: MapLane[] = [];
  const nodes: MapNode[] = [];
  let tallest = 0;
  keyKinds.forEach((kind, laneIndex) => {
    const items = records.filter(r => r.evidence_class === 'direct' && r.key_id && r.key_kind === kind);
    const shown = items.slice(0, cap);
    const x = laneIndex * LANE_WIDTH;
    shown.forEach((record, index) => {
      nodes.push({
        id: record.key_id as string,
        kind,
        x: x + 12,
        y: 44 + index * (NODE_HEIGHT + NODE_GAP),
        label: shortId(record.key_id as string),
        record,
      });
    });
    lanes.push({ kind, x, total: items.length, hidden: items.length - shown.length });
    tallest = Math.max(tallest, shown.length);
  });
  return {
    width: keyKinds.length * LANE_WIDTH,
    height: 44 + Math.max(tallest, 1) * (NODE_HEIGHT + NODE_GAP) + 30,
    lanes,
    nodes,
  };
}

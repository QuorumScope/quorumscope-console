'use client';

import dynamic from 'next/dynamic';
import type { ImpactRecord } from '@quorumscope/sdk';

const FreezeMap = dynamic(() => import('./freeze-map').then(m => m.FreezeMap), {
  ssr: false,
  loading: () => <p className="muted">Loading the Freeze Map. The table below has the same records.</p>,
});

export function FreezeMapLoader({ records }: { records: ImpactRecord[] }) {
  return <FreezeMap records={records} />;
}

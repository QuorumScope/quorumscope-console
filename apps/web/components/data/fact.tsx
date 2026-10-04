import type { ReactNode } from 'react';

export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return <div className="fact"><dt>{label}</dt><dd>{children}</dd></div>;
}

import Link from 'next/link';
import { Mark } from '../brand/mark';

const links = [
  ['/', 'Overview'],
  ['/network', 'Network'],
  ['/keys', 'Frozen keys'],
  ['/incidents', 'Freeze episodes'],
  ['/status', 'Status'],
] as const;

export function Navigation() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="QuorumScope overview"><Mark /><span>QuorumScope</span></Link>
        <nav aria-label="Main navigation" className="nav-links">
          {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
      </div>
    </header>
  );
}

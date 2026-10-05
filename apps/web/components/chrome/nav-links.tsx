'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  ['/', 'Overview'],
  ['/network', 'Network'],
  ['/keys', 'Frozen keys'],
  ['/preflight', 'Preflight'],
  ['/incidents', 'Freeze episodes'],
  ['/status', 'Status'],
  ['/developers', 'Developers'],
] as const;

function current(pathname: string, href: string): boolean {
  if (pathname === '/bypasses' && href === '/network') return true;
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

function Links({ pathname }: { pathname: string }) {
  return links.map(([href, label]) => <Link key={href} href={href} aria-current={current(pathname, href) ? 'page' : undefined}>{label}</Link>);
}

export function NavLinks() {
  const pathname = usePathname();
  return <>
    <nav aria-label="Main navigation" className="nav-links desktop-nav"><Links pathname={pathname} /></nav>
    <details className="mobile-nav" key={pathname}>
      <summary>Menu</summary>
      <nav aria-label="Mobile navigation" className="mobile-nav-links"><Links pathname={pathname} /></nav>
    </details>
  </>;
}

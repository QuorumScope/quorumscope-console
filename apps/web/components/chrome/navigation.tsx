import Link from 'next/link';
import { Mark } from '../brand/mark';
import { NavLinks } from './nav-links';
import { ThemeSwitcher } from './theme-switcher';

export function Navigation() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="QuorumScope overview"><Mark /><span>QuorumScope</span></Link>
        <NavLinks />
        <ThemeSwitcher />
      </div>
    </header>
  );
}

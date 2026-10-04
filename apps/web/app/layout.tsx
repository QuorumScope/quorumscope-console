import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Navigation } from '../components/chrome/navigation';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'QuorumScope', template: '%s | QuorumScope' },
  description: 'Inspect the current QuorumScope engine view of Stellar Quorum Freeze state.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <Navigation />
        <main id="main" className="main">{children}</main>
        <footer className="footer"><div className="container">QuorumScope reads engine-reported state. Ledger and service details are shown only when the API provides them.</div></footer>
      </body>
    </html>
  );
}

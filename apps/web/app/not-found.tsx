import Link from 'next/link';

export default function NotFound() {
  return <div><p className="eyebrow">Not found</p><h1>No record at this address</h1><p className="lede">Check the identifier or return to the frozen-key list.</p><Link className="button" href="/keys">Browse frozen keys</Link></div>;
}

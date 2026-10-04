'use client';

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <html lang="en"><body style={{ fontFamily: 'Arial, sans-serif', padding: '2rem', maxWidth: '48rem', margin: 'auto' }}>
    <h1>QuorumScope could not load</h1>
    <p>The application encountered an unexpected error. Try loading it again.</p>
    {error.digest ? <p>Reference: {error.digest}</p> : null}
    <button type="button" onClick={retry} style={{ padding: '.75rem 1rem', cursor: 'pointer' }}>Try again</button>
  </body></html>;
}

'use client';

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section className="data-error" role="alert">
    <h1>Page could not be loaded</h1>
    <p>An unexpected application error interrupted this page. Retry the request.</p>
    {error.digest ? <p className="mono">Reference: {error.digest}</p> : null}
    <button className="button" type="button" onClick={retry}>Try again</button>
  </section>;
}

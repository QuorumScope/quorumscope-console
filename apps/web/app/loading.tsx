export default function Loading() {
  return <div role="status" aria-live="polite">
    <p className="eyebrow">Loading</p>
    <h1>Reading engine state</h1>
    <p className="lede">Waiting for the configured QuorumScope engine response.</p>
  </div>;
}

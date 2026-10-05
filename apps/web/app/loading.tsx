// Shown while the engine answers. It holds no data, so it cannot suggest a result. The page
// reserves its scrollbar gutter (see globals.css), so replacing this with the page does not move
// the layout sideways.
export default function Loading() {
  return <div role="status" aria-live="polite" aria-busy="true">
    <p className="eyebrow">Loading</p>
    <h1>Reading engine state</h1>
    <p className="lede">Waiting for the configured QuorumScope engine response. No result is shown until it arrives.</p>
  </div>;
}

/** Formats an ISO timestamp as UTC. Returns the original text if it cannot be parsed. */
export function formatUtc(value: string | null | undefined): string {
  if (!value) return 'Not reported';
  const time = Date.parse(value);
  if (Number.isNaN(time)) return value;
  const text = new Date(time).toISOString();
  return `${text.slice(0, 10)} ${text.slice(11, 19)} UTC`;
}

export function formatLedger(value: number | null | undefined): string {
  return value === null || value === undefined ? 'Not reported' : value.toLocaleString('en-US');
}

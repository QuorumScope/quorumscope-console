export function parsePage(raw: string | undefined): number {
  const value = Number(raw ?? '1');
  return Number.isSafeInteger(value) && value > 0 && value <= 100000 ? value : 1;
}

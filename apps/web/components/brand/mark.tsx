export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M3 11V3h8M21 3h8v8M29 21v8h-8M11 29H3v-8" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <circle cx="16" cy="16" r="3" fill="currentColor" />
    </svg>
  );
}

import type { PreflightConfidence, PreflightResult, PreflightStatus } from '@quorumscope/sdk';

/** Presentation labels. The API enum values are never changed. */
export const statusLabel: Record<PreflightStatus, string> = {
  clear: 'No active freeze conflict detected',
  blocked_validation: 'Blocked by active freeze',
  allowed_by_bypass: 'Allowed by active bypass',
  apply_time_risk: 'Apply-time freeze check required',
  dex_conditional: 'DEX behavior depends on matching state',
  invalid_input: 'Invalid transaction input',
  unsupported_analysis: 'Analysis not supported for this case',
  state_unavailable: 'Current freeze state unavailable',
};

export const statusExplanation: Record<PreflightStatus, string> = {
  clear: 'The transaction names no ledger key in the freeze set that QuorumScope read. This reflects the state at the source ledger shown below.',
  blocked_validation: 'The transaction names a key in the active freeze set, so the protocol rejects it at validation. The findings say which key and where.',
  allowed_by_bypass: 'The transaction content hash is in the active bypass set, so it passes the validation check for the frozen keys it names. A bypass is not an unfreeze.',
  apply_time_risk: 'The transaction contains an operation that names balances or pools by identifier. A frozen trustline or account is detected only when the transaction is applied, and a bypass does not cover that.',
  dex_conditional: 'The transaction contains an offer or path payment. The protocol removes any matched offer that touches a frozen entry and keeps matching. The transaction does not fail for that reason.',
  invalid_input: 'The transaction could not be decoded. Check the XDR and try again.',
  unsupported_analysis: 'QuorumScope did not analyze part of this transaction. The findings say which part.',
  state_unavailable: 'QuorumScope could not verify the current freeze state, so it did not return a clear result.',
};

export const confidenceLabel: Record<PreflightConfidence, string> = {
  deterministic: 'Deterministic',
  conditional: 'Conditional',
  insufficient_information: 'Insufficient information',
};

export const confidenceExplanation: Record<PreflightConfidence, string> = {
  deterministic: 'The result follows directly from the transaction and the stored freeze state.',
  conditional: 'The result depends on ledger state that is known only when the transaction is applied.',
  insufficient_information: 'QuorumScope did not have enough information to decide.',
};

export type Tone = 'calm' | 'blocked' | 'attention' | 'neutral';

/** Calm styling is reserved for a `clear` result from current state. */
export function toneFor(result: Pick<PreflightResult, 'status' | 'freshness'>): Tone {
  switch (result.status) {
    case 'clear':
      return result.freshness.status === 'current' ? 'calm' : 'neutral';
    case 'blocked_validation':
      return 'blocked';
    case 'allowed_by_bypass':
    case 'apply_time_risk':
    case 'dex_conditional':
    case 'unsupported_analysis':
    case 'state_unavailable':
      return 'attention';
    case 'invalid_input':
      return 'neutral';
  }
}

export const toneMark: Record<Tone, string> = {
  calm: '✓',
  blocked: '✕',
  attention: '!',
  neutral: '•',
};

/** Largest input the form accepts. The engine rejects request bodies over 256 KiB. */
export const MAX_XDR_CHARS = 250_000;

export function validateXdr(input: string): string | undefined {
  if (input.trim() === '') return 'Enter a transaction envelope in base64 XDR.';
  if (input.length > MAX_XDR_CHARS) return 'This input is larger than the engine accepts.';
  if (!/^[A-Za-z0-9+/=\s]+$/u.test(input)) {
    return 'Base64 XDR contains only letters, digits, plus, slash, equals signs, and line breaks.';
  }
  return undefined;
}

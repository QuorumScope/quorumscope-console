import { QuorumScopeClient } from '@quorumscope/sdk';

export function engineClient(): QuorumScopeClient {
  const baseUrl = process.env.NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL;
  if (!baseUrl) throw new Error('QuorumScope engine API URL is not configured.');
  return new QuorumScopeClient({ baseUrl });
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message === 'QuorumScope engine API URL is not configured.') {
    return error.message;
  }
  return 'Current engine state could not be retrieved. Try again when the API is available.';
}

export async function load<T>(get: () => Promise<T>): Promise<{ data: T; error?: never } | { data?: never; error: unknown }> {
  try {
    return { data: await get() };
  } catch (error) {
    return { error };
  }
}

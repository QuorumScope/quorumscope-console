// These snippets mirror apps/web/app/developers/page.tsx. They are type-checked so the
// examples shown to developers keep compiling against the SDK.
import { QuorumScopeApiError, QuorumScopeClient } from '../src/index.ts';

declare const transactionXdr: string;
const baseUrl = 'https://engine.example.test';
const client = new QuorumScopeClient({ baseUrl });

export async function overview(): Promise<void> {
  const freeze = await client.freezeState.get();
  console.log(freeze.frozen_key_count, freeze.freshness.status, freeze.freshness.compatibility);
  const keys = await client.frozenKeys.list({ kind: 'account', pageSize: 25 });
  const detail = keys.items[0] ? await client.frozenKeys.get(keys.items[0].id) : undefined;
  console.log(detail?.history);
}

export async function preflight(): Promise<void> {
  const result = await client.preflight.analyze({ transactionXdr });
  for (const finding of result.findings) {
    console.log(finding.status, finding.confidence, finding.protocol_path);
  }
}

export async function errors(): Promise<void> {
  try {
    await client.network.get();
  } catch (error) {
    if (error instanceof QuorumScopeApiError) {
      console.error(error.status, error.code, error.requestId);
    }
  }
}

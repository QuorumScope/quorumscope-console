'use client';

import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { QuorumScopeApiError, QuorumScopeClient, type PreflightResult } from '@quorumscope/sdk';
import { MAX_XDR_CHARS, validateXdr } from '../../lib/preflight';
import { PreflightResultView } from './preflight-result';

type State =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'done'; result: PreflightResult }
  | { phase: 'failed'; message: string; requestId?: string };

const baseUrl = process.env.NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL;

/** The transaction stays in this component's memory. It is not stored, put in the URL, or sent anywhere except the configured engine API. */
export function PreflightForm() {
  const [xdr, setXdr] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [state, setState] = useState<State>({ phase: 'idle' });
  const controller = useRef<AbortController>(null);
  const loading = state.phase === 'loading';

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (loading) return;
    const problem = validateXdr(xdr);
    setFieldError(problem);
    if (problem) return;
    if (!baseUrl) {
      setState({ phase: 'failed', message: 'The engine API URL is not configured for this deployment.' });
      return;
    }
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setState({ phase: 'loading' });
    try {
      const client = new QuorumScopeClient({ baseUrl });
      const result = await client.preflight.analyze({ transactionXdr: xdr }, { signal: current.signal });
      if (!current.signal.aborted) setState({ phase: 'done', result });
    } catch (error) {
      if (current.signal.aborted) return;
      if (error instanceof QuorumScopeApiError) {
        setState({ phase: 'failed', message: `${error.message} (${error.code})`, requestId: error.requestId });
      } else {
        setState({ phase: 'failed', message: 'The engine could not be reached. Your input is still here. Try again when the API is available.' });
      }
    }
  }

  function clear() {
    controller.current?.abort();
    setXdr('');
    setFieldError(undefined);
    setState({ phase: 'idle' });
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) void submit();
  }

  return <>
    <form className="panel preflight-form" onSubmit={submit} noValidate>
      <label htmlFor="xdr">Transaction envelope (base64 XDR)</label>
      <p id="xdr-help" className="muted">Paste the envelope as it appears before submission. Results depend on the freeze state shown above. Press Ctrl+Enter or Command+Enter to analyze. Nothing you paste is stored.</p>
      <textarea
        id="xdr"
        name="xdr"
        className="xdr-input mono"
        rows={9}
        value={xdr}
        maxLength={MAX_XDR_CHARS}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        aria-describedby={fieldError ? 'xdr-help xdr-error' : 'xdr-help'}
        aria-invalid={fieldError ? true : undefined}
        onChange={event => setXdr(event.target.value)}
        onKeyDown={onKeyDown}
      />
      {fieldError ? <p id="xdr-error" className="field-error" role="alert">{fieldError}</p> : null}
      <div className="actions tight">
        <button className="button" type="submit" disabled={loading} aria-busy={loading}>{loading ? 'Analyzing' : 'Analyze transaction'}</button>
        <button className="button secondary" type="button" onClick={clear}>Clear</button>
      </div>
    </form>
    <div aria-live="polite" className="result-region">
      {state.phase === 'loading' ? <p className="muted">Checking the transaction against the freeze state.</p> : null}
      {state.phase === 'failed' ? <section className="data-error" role="alert">
        <h2>Preflight could not complete</h2>
        <p>{state.message}</p>
        {state.requestId ? <p className="muted">Request ID <span className="mono">{state.requestId}</span></p> : null}
      </section> : null}
      {state.phase === 'done' ? <PreflightResultView result={state.result} /> : null}
    </div>
  </>;
}

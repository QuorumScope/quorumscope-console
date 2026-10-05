import { QuorumScopeApiError } from './error.ts';

export interface RequestOptions {
  signal?: AbortSignal;
}

/** A JSON body sent with POST. POST requests are never retried. */
export interface RequestBody {
  json: unknown;
}

export interface ClientOptions {
  baseUrl: string;
  fetch?: typeof fetch;
  headers?: Record<string, string>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeError(value: unknown): {
  code: string;
  message: string;
  requestId?: string;
  details?: Record<string, unknown>;
} {
  if (!isRecord(value)) return { code: 'unknown_error', message: 'The API request failed.' };
  const body = isRecord(value.error) ? value.error : {};
  return {
    code: typeof body.code === 'string' ? body.code : 'unknown_error',
    message: typeof body.message === 'string' ? body.message : 'The API request failed.',
    requestId:
      typeof body.request_id === 'string'
        ? body.request_id
        : typeof value.request_id === 'string'
          ? value.request_id
          : undefined,
    details: isRecord(body.details) ? body.details : undefined,
  };
}

export function createRequester(options: ClientOptions) {
  const baseUrl = options.baseUrl.trim().replace(/\/+$/, '');
  if (!/^https?:\/\/[^/]+/u.test(baseUrl)) {
    throw new TypeError('baseUrl must be an absolute HTTP or HTTPS URL.');
  }
  const fetcher = options.fetch ?? fetch;
  const headers = options.headers ?? {};

  return async function request<T>(
    path: string,
    query: Record<string, string | number | boolean | undefined> = {},
    requestOptions: RequestOptions = {},
    body?: RequestBody,
  ): Promise<T> {
    const url = new URL(`${baseUrl}${path}`);
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    const response = await fetcher(url, {
      method: body ? 'POST' : 'GET',
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body.json) : undefined,
      signal: requestOptions.signal,
      cache: 'no-store',
    });
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      payload = undefined;
    }
    if (!response.ok) {
      const error = safeError(payload);
      throw new QuorumScopeApiError({
        status: response.status,
        ...error,
        response: {
          url: response.url,
          statusText: response.statusText,
          headers: new Headers(response.headers),
        },
      });
    }
    if (!isRecord(payload)) {
      throw new QuorumScopeApiError({
        status: response.status,
        code: 'invalid_response',
        message: 'The API returned an invalid response.',
        response: {
          url: response.url,
          statusText: response.statusText,
          headers: new Headers(response.headers),
        },
      });
    }
    return payload as T;
  };
}

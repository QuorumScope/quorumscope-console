export interface QuorumScopeResponseMetadata {
  url: string;
  statusText: string;
  headers: Headers;
}

export class QuorumScopeApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly details?: Record<string, unknown>;
  readonly response: QuorumScopeResponseMetadata;

  constructor(options: {
    status: number;
    code: string;
    message: string;
    requestId?: string;
    details?: Record<string, unknown>;
    response: QuorumScopeResponseMetadata;
  }) {
    super(options.message);
    this.name = 'QuorumScopeApiError';
    this.status = options.status;
    this.code = options.code;
    this.requestId = options.requestId;
    this.details = options.details;
    this.response = options.response;
  }
}

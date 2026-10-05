import type { components } from './generated/openapi.ts';
import { createRequester, type ClientOptions, type RequestOptions } from './request.ts';

type Schema = components['schemas'];
export type Network = Schema['NetworkResponse'];
export type FreezeState = Schema['FreezeStateResponse'];
export type FrozenKey = Schema['FrozenKeyResponse'];
export type FrozenKeyDetail = Schema['FrozenKeyDetailResponse'];
export type KeyChange = Schema['KeyChangeResponse'];
export type FrozenKeys = Schema['FrozenKeysResponse'];
export type Bypass = Schema['BypassResponse'];
export type Bypasses = Schema['BypassesResponse'];
export type Incident = Schema['IncidentResponse'];
export type Incidents = Schema['IncidentsResponse'];
export type Timeline = Schema['TimelineResponse'];
export type Status = Schema['StatusResponse'];
export type Health = Schema['HealthResponse'];
export type StateFreshness = Schema['StateFreshness'];
export type PreflightResult = Schema['PreflightResponse'];
export type PreflightFinding = Schema['FindingResponse'];
export type PreflightStatus = Schema['PreflightStatusResponse'];
export type PreflightConfidence = Schema['PreflightConfidenceResponse'];
export type Impact = Schema['ImpactResponse'];
export type ImpactRecord = Schema['ImpactRecordResponse'];

export interface NetworkQuery { networkId?: string }
export interface PageQuery extends NetworkQuery { page?: number; pageSize?: number }
export interface FrozenKeysQuery extends PageQuery {
  /** `account`, `trustline`, `contract_data`, or `contract_code`. */
  kind?: string;
  /** Defaults to true on the engine. False also lists keys that are no longer frozen. */
  active?: boolean;
}
export interface ImpactQuery extends PageQuery {
  evidenceClass?: string;
  keyKind?: string;
  keyId?: string;
}
export interface PreflightInput {
  /** Base64 transaction envelope XDR. */
  transactionXdr: string;
  networkId?: string;
}

function pageParams(query: PageQuery): Record<string, string | number | undefined> {
  return { network_id: query.networkId, page: query.page, page_size: query.pageSize };
}

export class QuorumScopeClient {
  readonly network;
  readonly freezeState;
  readonly frozenKeys;
  readonly bypasses;
  readonly incidents;
  readonly impact;
  readonly preflight;
  readonly status;
  readonly health;

  constructor(options: ClientOptions) {
    const request = createRequester(options);
    this.network = {
      get: (query: NetworkQuery = {}, options?: RequestOptions) =>
        request<Network>('/api/v1/network', { network_id: query.networkId }, options),
    };
    this.freezeState = {
      get: (query: NetworkQuery = {}, options?: RequestOptions) =>
        request<FreezeState>('/api/v1/freeze-state', { network_id: query.networkId }, options),
    };
    this.frozenKeys = {
      list: (query: FrozenKeysQuery = {}, options?: RequestOptions) =>
        request<FrozenKeys>(
          '/api/v1/frozen-keys',
          { ...pageParams(query), kind: query.kind, active: query.active },
          options,
        ),
      get: (id: string, query: NetworkQuery = {}, options?: RequestOptions) =>
        request<FrozenKeyDetail>(`/api/v1/frozen-keys/${encodeURIComponent(id)}`, { network_id: query.networkId }, options),
    };
    this.bypasses = {
      list: (query: PageQuery = {}, options?: RequestOptions) =>
        request<Bypasses>('/api/v1/bypasses', pageParams(query), options),
    };
    this.incidents = {
      list: (query: PageQuery = {}, options?: RequestOptions) =>
        request<Incidents>('/api/v1/incidents', pageParams(query), options),
      get: (id: string, query: NetworkQuery = {}, options?: RequestOptions) =>
        request<Incident>(`/api/v1/incidents/${encodeURIComponent(id)}`, { network_id: query.networkId }, options),
      timeline: (id: string, query: PageQuery = {}, options?: RequestOptions) =>
        request<Timeline>(`/api/v1/incidents/${encodeURIComponent(id)}/timeline`, pageParams(query), options),
    };
    this.impact = {
      get: (query: ImpactQuery = {}, options?: RequestOptions) =>
        request<Impact>(
          '/api/v1/impact',
          {
            ...pageParams(query),
            evidence_class: query.evidenceClass,
            key_kind: query.keyKind,
            key_id: query.keyId,
          },
          options,
        ),
    };
    this.preflight = {
      /** Sends one POST. The SDK does not retry it. */
      analyze: (input: PreflightInput, options?: RequestOptions) =>
        request<PreflightResult>('/api/v1/preflight', {}, options, {
          json: { transaction_xdr: input.transactionXdr, network_id: input.networkId },
        }),
    };
    this.status = {
      get: (query: NetworkQuery = {}, options?: RequestOptions) =>
        request<Status>('/api/v1/status', { network_id: query.networkId }, options),
    };
    this.health = {
      live: (options?: RequestOptions) => request<Health>('/health/live', {}, options),
      ready: (options?: RequestOptions) => request<Health>('/health/ready', {}, options),
    };
  }
}

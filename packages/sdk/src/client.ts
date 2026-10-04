import type { components } from './generated/openapi.ts';
import { createRequester, type ClientOptions, type RequestOptions } from './request.ts';

type Schema = components['schemas'];
export type Network = Schema['NetworkResponse'];
export type FreezeState = Schema['FreezeStateResponse'];
export type FrozenKey = Schema['FrozenKeyResponse'];
export type FrozenKeys = Schema['FrozenKeysResponse'];
export type Bypass = Schema['BypassResponse'];
export type Bypasses = Schema['BypassesResponse'];
export type Incident = Schema['IncidentResponse'];
export type Incidents = Schema['IncidentsResponse'];
export type Timeline = Schema['TimelineResponse'];
export type Status = Schema['StatusResponse'];
export type Health = Schema['HealthResponse'];

export interface NetworkQuery { networkId?: string }
export interface PageQuery extends NetworkQuery { page?: number; pageSize?: number }

function pageParams(query: PageQuery): Record<string, string | number | undefined> {
  return { network_id: query.networkId, page: query.page, page_size: query.pageSize };
}

export class QuorumScopeClient {
  readonly network;
  readonly freezeState;
  readonly frozenKeys;
  readonly bypasses;
  readonly incidents;
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
      list: (query: PageQuery = {}, options?: RequestOptions) =>
        request<FrozenKeys>('/api/v1/frozen-keys', pageParams(query), options),
      get: (id: string, query: NetworkQuery = {}, options?: RequestOptions) =>
        request<FrozenKey>(`/api/v1/frozen-keys/${encodeURIComponent(id)}`, { network_id: query.networkId }, options),
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

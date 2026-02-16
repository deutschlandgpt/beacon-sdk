import type { BeaconClient } from '../client';
import type { Changelog, ChangelogListParams } from '../types';

export class Changelogs {
  constructor(private readonly client: BeaconClient) {}

  async list(params?: ChangelogListParams): Promise<Changelog[]> {
    const query: Record<string, string | undefined> = {};

    if (params) {
      if (params.tag !== undefined) query.tag = params.tag;
      if (params.since !== undefined) query.since = params.since;
      if (params.breaking !== undefined) query.breaking = String(params.breaking);
      if (params.limit !== undefined) query.limit = String(params.limit);
      if (params.offset !== undefined) query.offset = String(params.offset);
    }

    return this.client.request<Changelog[]>('GET', '/api/v1/changelogs', { query });
  }

  async get(id: string): Promise<Changelog> {
    return this.client.request<Changelog>('GET', `/api/v1/changelogs/${encodeURIComponent(id)}`);
  }
}

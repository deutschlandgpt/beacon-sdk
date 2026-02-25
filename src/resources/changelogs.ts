import type { BeaconClient } from '../client';
import type {
  Changelog,
  ChangelogGetParams,
  ChangelogListParams,
  ChangelogTag,
  Locale,
} from '../types';

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
      if (params.locale !== undefined) query.locale = params.locale;
    }

    return this.client.request<Changelog[]>('GET', '/api/v1/changelogs', { query });
  }

  async get(id: string, params?: ChangelogGetParams): Promise<Changelog> {
    const query: Record<string, string | undefined> = {};

    if (params?.locale !== undefined) query.locale = params.locale;

    return this.client.request<Changelog>('GET', `/api/v1/changelogs/${encodeURIComponent(id)}`, {
      query,
    });
  }

  async tags(): Promise<ChangelogTag[]> {
    return this.client.request<ChangelogTag[]>('GET', '/api/v1/changelog-tags');
  }

  rssUrl(locale?: Locale): string {
    const base = this.client.buildUrl('/api/v1/changelogs/rss');
    if (locale !== undefined) return `${base}?locale=${locale}`;
    return base;
  }
}

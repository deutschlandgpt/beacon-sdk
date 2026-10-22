import type { BeaconClient } from '../client';
import type { InAppIncident, InAppIncidentsParams, Incident } from '../types';

export class Incidents {
  constructor(private readonly client: BeaconClient) {}

  async list(): Promise<Incident[]> {
    return this.client.request<Incident[]>('GET', '/api/v1/incidents');
  }

  async active(): Promise<Incident[]> {
    return this.client.request<Incident[]>('GET', '/api/v1/incidents/active', { auth: true });
  }

  /**
   * Incidents for display inside the host app, including internal and audience-targeted ones.
   * Server-to-server only: the result carries audiences (enterprise ids, user emails).
   */
  async inApp(params?: InAppIncidentsParams): Promise<InAppIncident[]> {
    return this.client.request<InAppIncident[]>('GET', '/api/v1/incidents/in-app', {
      auth: true,
      query: { locale: params?.locale },
    });
  }

  rssUrl(): string {
    return this.client.buildUrl('/api/v1/incidents/rss');
  }
}

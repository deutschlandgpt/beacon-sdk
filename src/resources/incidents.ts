import type { BeaconClient } from '../client';
import type { Incident } from '../types';

export class Incidents {
  constructor(private readonly client: BeaconClient) {}

  async list(): Promise<Incident[]> {
    return this.client.request<Incident[]>('GET', '/api/v1/incidents');
  }

  async active(): Promise<Incident[]> {
    return this.client.request<Incident[]>('GET', '/api/v1/incidents/active', { auth: true });
  }
}

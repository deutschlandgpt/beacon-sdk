import type { BeaconClient } from '../client';
import type { MonitorStatusEntry } from '../types';

export class Monitors {
  constructor(private readonly client: BeaconClient) {}

  async status(): Promise<MonitorStatusEntry[]> {
    return this.client.request<MonitorStatusEntry[]>('GET', '/api/v1/monitors/status');
  }
}

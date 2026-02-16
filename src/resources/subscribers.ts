import type { BeaconClient } from '../client';
import type { SubscribeParams, SubscribeResponse } from '../types';

export class Subscribers {
  constructor(private readonly client: BeaconClient) {}

  async subscribe(params: SubscribeParams): Promise<SubscribeResponse> {
    return this.client.request<SubscribeResponse>('POST', '/api/v1/subscribers', {
      body: params,
    });
  }
}

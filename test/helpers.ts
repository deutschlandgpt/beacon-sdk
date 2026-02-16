import { BeaconClient } from '../src/client';
import type { BeaconClientConfig } from '../src/types';

export const BASE_URL = 'https://status.example.com';

export function mockFetch(
  handler: (url: string, init?: RequestInit) => Promise<Response> | Response,
): typeof globalThis.fetch {
  return handler as typeof globalThis.fetch;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export function createClient(
  fetchFn: typeof globalThis.fetch,
  config?: Partial<BeaconClientConfig>,
): BeaconClient {
  return new BeaconClient({
    baseUrl: BASE_URL,
    fetch: fetchFn,
    ...config,
  });
}

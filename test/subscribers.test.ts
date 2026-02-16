import { describe, expect, it } from 'vitest';

import { BASE_URL, createClient, jsonResponse, mockFetch } from './helpers';

describe('Subscribers', () => {
  it('subscribe() sends POST to /api/v1/subscribers with JSON body', async () => {
    let capturedUrl = '';
    let capturedMethod = '';
    let capturedBody = '';
    let capturedHeaders: Record<string, string> = {};

    const fetch = mockFetch(async (url, init) => {
      capturedUrl = url;
      capturedMethod = init?.method ?? '';
      capturedHeaders = init?.headers as Record<string, string>;
      capturedBody = init?.body as string;
      return jsonResponse({ success: true }, 201);
    });

    const client = createClient(fetch);
    const result = await client.subscribers.subscribe({
      email: 'user@example.com',
      subscribeTo: ['changelogs', 'status_updates'],
    });

    expect(capturedUrl).toBe(`${BASE_URL}/api/v1/subscribers`);
    expect(capturedMethod).toBe('POST');
    expect(capturedHeaders['content-type']).toBe('application/json');
    expect(JSON.parse(capturedBody)).toEqual({
      email: 'user@example.com',
      subscribeTo: ['changelogs', 'status_updates'],
    });
    expect(result).toEqual({ success: true });
  });

  it('subscribe() does not send auth header', async () => {
    let capturedHeaders: Record<string, string> = {};
    const fetch = mockFetch(async (_url, init) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return jsonResponse({ success: true }, 201);
    });

    const client = createClient(fetch);
    await client.subscribers.subscribe({
      email: 'user@example.com',
      subscribeTo: ['changelogs'],
    });

    expect(capturedHeaders['x-api-key']).toBeUndefined();
  });
});

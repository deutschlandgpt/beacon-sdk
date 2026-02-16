import { describe, expect, it } from 'vitest';

import {
  BeaconAuthError,
  BeaconError,
  BeaconNotFoundError,
  BeaconValidationError,
} from '../src/errors';
import { BASE_URL, createClient, jsonResponse, mockFetch } from './helpers';

describe('BeaconClient', () => {
  it('strips trailing slashes from baseUrl', async () => {
    let capturedUrl = '';
    const fetch = mockFetch(async (url) => {
      capturedUrl = url;
      return jsonResponse([]);
    });

    const client = createClient(fetch, { baseUrl: BASE_URL + '///' });
    await client.changelogs.list();

    expect(capturedUrl).toBe(`${BASE_URL}/api/v1/changelogs`);
  });

  it('sends x-api-key header for authenticated requests', async () => {
    let capturedHeaders: Record<string, string> = {};
    const fetch = mockFetch(async (_url, init) => {
      const h = init?.headers as Record<string, string>;
      capturedHeaders = h;
      return jsonResponse([]);
    });

    const client = createClient(fetch, { apiKey: 'bk_test123' });
    await client.incidents.active();

    expect(capturedHeaders['x-api-key']).toBe('bk_test123');
  });

  it('throws BeaconAuthError when no apiKey for auth endpoint', async () => {
    const fetch = mockFetch(async () => jsonResponse([]));
    const client = createClient(fetch);

    await expect(client.incidents.active()).rejects.toThrow(BeaconAuthError);
  });

  it('maps 400 to BeaconValidationError with details', async () => {
    const body = { error: 'Invalid request body', details: [{ message: 'bad' }] };
    const fetch = mockFetch(async () => jsonResponse(body, 400));
    const client = createClient(fetch);

    try {
      await client.changelogs.list();
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BeaconValidationError);
      expect((err as BeaconValidationError).details).toEqual([{ message: 'bad' }]);
    }
  });

  it('maps 401 to BeaconAuthError', async () => {
    const fetch = mockFetch(async () => jsonResponse({ error: 'Unauthorized' }, 401));
    const client = createClient(fetch, { apiKey: 'bk_invalid' });

    await expect(client.incidents.active()).rejects.toThrow(BeaconAuthError);
  });

  it('maps 404 to BeaconNotFoundError', async () => {
    const fetch = mockFetch(async () => jsonResponse({ error: 'Changelog not found' }, 404));
    const client = createClient(fetch);

    await expect(client.changelogs.get('nonexistent')).rejects.toThrow(BeaconNotFoundError);
  });

  it('maps other errors to BeaconError', async () => {
    const fetch = mockFetch(async () => jsonResponse({ error: 'Server error' }, 500));
    const client = createClient(fetch);

    try {
      await client.changelogs.list();
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BeaconError);
      expect((err as BeaconError).status).toBe(500);
    }
  });

  it('does not set content-type for FormData requests', async () => {
    let capturedHeaders: Record<string, string> = {};
    const fetch = mockFetch(async (_url, init) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return jsonResponse({ feedback: {}, similar: [] }, 201);
    });

    const client = createClient(fetch, { apiKey: 'bk_test' });
    await client.feedback.submit({
      type: 'bug_report',
      title: 'Test',
      description: 'Desc',
    });

    expect(capturedHeaders['content-type']).toBeUndefined();
  });
});

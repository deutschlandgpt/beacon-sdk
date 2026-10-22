import { describe, expect, it } from 'vitest';

import { BeaconAuthError } from '../src/errors';
import type { InAppIncident, Incident } from '../src/types';
import { BASE_URL, createClient, jsonResponse, mockFetch } from './helpers';

const sampleIncident: Incident = {
  id: 'i-1',
  title: 'API outage',
  description: 'API is down',
  status: 'investigating',
  severity: 'major',
  published: true,
  resolvedAt: null,
  affectedMonitorIds: ['m-1'],
  sentryIssueId: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('Incidents', () => {
  it('list() sends GET to /api/v1/incidents', async () => {
    let capturedUrl = '';
    const fetch = mockFetch(async (url) => {
      capturedUrl = url;
      return jsonResponse([sampleIncident]);
    });

    const client = createClient(fetch);
    const result = await client.incidents.list();

    expect(capturedUrl).toBe(`${BASE_URL}/api/v1/incidents`);
    expect(result).toEqual([sampleIncident]);
  });

  it('list() does not send auth header', async () => {
    let capturedHeaders: Record<string, string> = {};
    const fetch = mockFetch(async (_url, init) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return jsonResponse([]);
    });

    const client = createClient(fetch);
    await client.incidents.list();

    expect(capturedHeaders['x-api-key']).toBeUndefined();
  });

  it('active() sends GET to /api/v1/incidents/active with auth', async () => {
    let capturedUrl = '';
    let capturedHeaders: Record<string, string> = {};
    const fetch = mockFetch(async (url, init) => {
      capturedUrl = url;
      capturedHeaders = init?.headers as Record<string, string>;
      return jsonResponse([sampleIncident]);
    });

    const client = createClient(fetch, { apiKey: 'bk_test' });
    const result = await client.incidents.active();

    expect(capturedUrl).toBe(`${BASE_URL}/api/v1/incidents/active`);
    expect(capturedHeaders['x-api-key']).toBe('bk_test');
    expect(result).toEqual([sampleIncident]);
  });

  it('active() throws without apiKey', async () => {
    const fetch = mockFetch(async () => jsonResponse([]));
    const client = createClient(fetch);

    await expect(client.incidents.active()).rejects.toThrow(BeaconAuthError);
  });

  it('inApp() sends GET to /api/v1/incidents/in-app with auth and locale', async () => {
    const inAppIncident: InAppIncident = {
      id: 'i-2',
      title: 'Desktop down',
      description: 'The desktop app cannot connect',
      status: 'identified',
      severity: 'critical',
      visibility: 'internal',
      audience: { enterprises: [{ id: 'e-1', name: 'Acme' }], userEmails: [] },
      affects: { surfaces: ['desktop'], os: ['windows'] },
      showOn: { surfaces: ['web'] },
      inAppMessages: { web: 'Please use the web app for now.' },
      latestUpdate: {
        id: 'u-1',
        status: 'identified',
        message: 'Cause found',
        createdAt: '2025-01-01T01:00:00Z',
      },
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T01:00:00Z',
      resolvedAt: null,
    };
    let capturedUrl = '';
    let capturedHeaders: Record<string, string> = {};
    const fetch = mockFetch(async (url, init) => {
      capturedUrl = url;
      capturedHeaders = init?.headers as Record<string, string>;
      return jsonResponse([inAppIncident]);
    });

    const client = createClient(fetch, { apiKey: 'bk_test' });
    const result = await client.incidents.inApp({ locale: 'pl' });

    expect(capturedUrl).toBe(`${BASE_URL}/api/v1/incidents/in-app?locale=pl`);
    expect(capturedHeaders['x-api-key']).toBe('bk_test');
    expect(result).toEqual([inAppIncident]);
  });

  it('inApp() omits the locale when none is given', async () => {
    let capturedUrl = '';
    const fetch = mockFetch(async (url) => {
      capturedUrl = url;
      return jsonResponse([]);
    });

    const client = createClient(fetch, { apiKey: 'bk_test' });
    await client.incidents.inApp();

    expect(capturedUrl).toBe(`${BASE_URL}/api/v1/incidents/in-app`);
  });

  it('inApp() throws without apiKey', async () => {
    const fetch = mockFetch(async () => jsonResponse([]));
    const client = createClient(fetch);

    await expect(client.incidents.inApp()).rejects.toThrow(BeaconAuthError);
  });

  it('rssUrl() returns the incidents RSS URL', () => {
    const fetch = mockFetch(async () => jsonResponse([]));
    const client = createClient(fetch);

    expect(client.incidents.rssUrl()).toBe(`${BASE_URL}/api/v1/incidents/rss`);
  });
});

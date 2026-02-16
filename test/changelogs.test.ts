import { describe, expect, it } from 'vitest';

import type { Changelog } from '../src/types';
import { BASE_URL, createClient, jsonResponse, mockFetch } from './helpers';

const sampleChangelog: Changelog = {
  id: '123',
  title: 'New feature',
  content: 'Details here',
  version: '1.2.0',
  status: 'published',
  versionType: 'minor',
  tags: ['api'],
  isBreakingChange: false,
  publishedAt: '2025-01-01T00:00:00Z',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('Changelogs', () => {
  it('list() sends GET to /api/v1/changelogs', async () => {
    let capturedUrl = '';
    const fetch = mockFetch(async (url) => {
      capturedUrl = url;
      return jsonResponse([sampleChangelog]);
    });

    const client = createClient(fetch);
    const result = await client.changelogs.list();

    expect(capturedUrl).toBe(`${BASE_URL}/api/v1/changelogs`);
    expect(result).toEqual([sampleChangelog]);
  });

  it('list() passes query params', async () => {
    let capturedUrl = '';
    const fetch = mockFetch(async (url) => {
      capturedUrl = url;
      return jsonResponse([]);
    });

    const client = createClient(fetch);
    await client.changelogs.list({
      tag: 'api',
      limit: 10,
      offset: 5,
      breaking: true,
      since: '1.0.0',
    });

    const url = new URL(capturedUrl);
    expect(url.searchParams.get('tag')).toBe('api');
    expect(url.searchParams.get('limit')).toBe('10');
    expect(url.searchParams.get('offset')).toBe('5');
    expect(url.searchParams.get('breaking')).toBe('true');
    expect(url.searchParams.get('since')).toBe('1.0.0');
  });

  it('list() omits undefined params', async () => {
    let capturedUrl = '';
    const fetch = mockFetch(async (url) => {
      capturedUrl = url;
      return jsonResponse([]);
    });

    const client = createClient(fetch);
    await client.changelogs.list({ tag: 'api' });

    const url = new URL(capturedUrl);
    expect(url.searchParams.get('tag')).toBe('api');
    expect(url.searchParams.has('limit')).toBe(false);
  });

  it('get() sends GET to /api/v1/changelogs/:id', async () => {
    let capturedUrl = '';
    const fetch = mockFetch(async (url) => {
      capturedUrl = url;
      return jsonResponse(sampleChangelog);
    });

    const client = createClient(fetch);
    const result = await client.changelogs.get('123');

    expect(capturedUrl).toBe(`${BASE_URL}/api/v1/changelogs/123`);
    expect(result).toEqual(sampleChangelog);
  });

  it('get() encodes id with special characters', async () => {
    let capturedUrl = '';
    const fetch = mockFetch(async (url) => {
      capturedUrl = url;
      return jsonResponse(sampleChangelog);
    });

    const client = createClient(fetch);
    await client.changelogs.get('has spaces/slashes');

    expect(capturedUrl).toBe(`${BASE_URL}/api/v1/changelogs/has%20spaces%2Fslashes`);
  });
});

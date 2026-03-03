import { describe, expect, it } from 'vitest';

import type { Changelog, ChangelogTag } from '../src/types';
import { BASE_URL, createClient, jsonResponse, mockFetch } from './helpers';

const sampleTag: ChangelogTag = {
  id: 'tag-1',
  name: 'api',
  color: '#3B82F6',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const sampleChangelog: Changelog = {
  id: '123',
  title: 'New feature',
  content: 'Details here',
  headerImage: null,
  version: '1.2.0',
  status: 'published',
  versionType: 'minor',
  tags: [sampleTag],
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

  it('list() passes locale query param', async () => {
    let capturedUrl = '';
    const fetch = mockFetch(async (url) => {
      capturedUrl = url;
      return jsonResponse([]);
    });

    const client = createClient(fetch);
    await client.changelogs.list({ locale: 'de' });

    const url = new URL(capturedUrl);
    expect(url.searchParams.get('locale')).toBe('de');
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

  it('get() passes locale query param', async () => {
    let capturedUrl = '';
    const fetch = mockFetch(async (url) => {
      capturedUrl = url;
      return jsonResponse(sampleChangelog);
    });

    const client = createClient(fetch);
    await client.changelogs.get('123', { locale: 'de' });

    const url = new URL(capturedUrl);
    expect(url.pathname).toBe('/api/v1/changelogs/123');
    expect(url.searchParams.get('locale')).toBe('de');
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

  it('tags() sends GET to /api/v1/changelog-tags', async () => {
    let capturedUrl = '';
    const fetch = mockFetch(async (url) => {
      capturedUrl = url;
      return jsonResponse([sampleTag]);
    });

    const client = createClient(fetch);
    const result = await client.changelogs.tags();

    expect(capturedUrl).toBe(`${BASE_URL}/api/v1/changelog-tags`);
    expect(result).toEqual([sampleTag]);
  });

  it('rssUrl() returns the changelogs RSS URL', () => {
    const fetch = mockFetch(async () => jsonResponse([]));
    const client = createClient(fetch);

    expect(client.changelogs.rssUrl()).toBe(`${BASE_URL}/api/v1/changelogs/rss`);
  });

  it('rssUrl() appends locale to URL', () => {
    const fetch = mockFetch(async () => jsonResponse([]));
    const client = createClient(fetch);

    expect(client.changelogs.rssUrl('de')).toBe(`${BASE_URL}/api/v1/changelogs/rss?locale=de`);
  });
});

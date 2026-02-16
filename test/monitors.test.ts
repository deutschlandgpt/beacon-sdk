import { describe, expect, it } from 'vitest';

import type { MonitorStatusEntry } from '../src/types';
import { BASE_URL, createClient, jsonResponse, mockFetch } from './helpers';

const sampleMonitor: MonitorStatusEntry = {
  id: 'm-1',
  name: 'API Server',
  description: 'Main API',
  url: 'https://api.example.com',
  group: 'Backend',
  currentStatus: 'operational',
  responseTime: 42,
  statusCode: 200,
  lastChecked: '2025-01-01T00:00:00Z',
  history: [{ status: 'operational', checkedAt: '2025-01-01T00:00:00Z', responseTime: 42 }],
};

describe('Monitors', () => {
  it('status() sends GET to /api/v1/monitors/status', async () => {
    let capturedUrl = '';
    const fetch = mockFetch(async (url) => {
      capturedUrl = url;
      return jsonResponse([sampleMonitor]);
    });

    const client = createClient(fetch);
    const result = await client.monitors.status();

    expect(capturedUrl).toBe(`${BASE_URL}/api/v1/monitors/status`);
    expect(result).toEqual([sampleMonitor]);
  });

  it('status() returns empty array', async () => {
    const fetch = mockFetch(async () => jsonResponse([]));
    const client = createClient(fetch);
    const result = await client.monitors.status();

    expect(result).toEqual([]);
  });
});

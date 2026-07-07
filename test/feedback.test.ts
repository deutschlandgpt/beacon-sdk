import { describe, expect, it } from 'vitest';

import { BeaconAuthError } from '../src/errors';
import { BASE_URL, createClient, jsonResponse, mockFetch } from './helpers';

describe('Feedback', () => {
  it('submit() sends POST to /api/v1/feedback with FormData and auth', async () => {
    let capturedUrl = '';
    let capturedMethod = '';
    let capturedHeaders: Record<string, string> = {};
    let capturedBody: FormData | undefined;

    const fetch = mockFetch(async (url, init) => {
      capturedUrl = url;
      capturedMethod = init?.method ?? '';
      capturedHeaders = init?.headers as Record<string, string>;
      capturedBody = init?.body as FormData;
      return jsonResponse({ feedback: { id: 'f-1' }, similar: [] }, 201);
    });

    const client = createClient(fetch, { apiKey: 'bk_test' });
    const result = await client.feedback.submit({
      type: 'bug_report',
      title: 'Broken page',
      description: 'Dashboard is blank',
      userEmail: 'user@example.com',
    });

    expect(capturedUrl).toBe(`${BASE_URL}/api/v1/feedback`);
    expect(capturedMethod).toBe('POST');
    expect(capturedHeaders['x-api-key']).toBe('bk_test');
    expect(capturedHeaders['content-type']).toBeUndefined();
    expect(capturedBody).toBeInstanceOf(FormData);
    expect(capturedBody?.get('type')).toBe('bug_report');
    expect(capturedBody?.get('title')).toBe('Broken page');
    expect(capturedBody?.get('description')).toBe('Dashboard is blank');
    expect(capturedBody?.get('userEmail')).toBe('user@example.com');
    expect(result).toEqual({ feedback: { id: 'f-1' }, similar: [] });
  });

  it('submit() omits undefined optional fields from FormData', async () => {
    let capturedBody: FormData | undefined;

    const fetch = mockFetch(async (_url, init) => {
      capturedBody = init?.body as FormData;
      return jsonResponse({ feedback: { id: 'f-1' }, similar: [] }, 201);
    });

    const client = createClient(fetch, { apiKey: 'bk_test' });
    await client.feedback.submit({
      type: 'feature_request',
      title: 'Add dark mode',
      description: 'Please add dark mode',
    });

    expect(capturedBody?.has('userEmail')).toBe(false);
    expect(capturedBody?.has('userName')).toBe(false);
    expect(capturedBody?.has('featureOrService')).toBe(false);
    expect(capturedBody?.has('planTier')).toBe(false);
    expect(capturedBody?.has('browserInfo')).toBe(false);
    expect(capturedBody?.has('deviceInfo')).toBe(false);
    expect(capturedBody?.has('pageUrl')).toBe(false);
    expect(capturedBody?.has('consentToNotify')).toBe(false);
  });

  it('submit() includes pageUrl in FormData when provided', async () => {
    let capturedBody: FormData | undefined;

    const fetch = mockFetch(async (_url, init) => {
      capturedBody = init?.body as FormData;
      return jsonResponse({ feedback: { id: 'f-1' }, similar: [] }, 201);
    });

    const client = createClient(fetch, { apiKey: 'bk_test' });
    await client.feedback.submit({
      type: 'bug_report',
      title: 'Bug',
      description: 'Desc',
      pageUrl: 'https://app.example.com/dashboard',
    });

    expect(capturedBody?.get('pageUrl')).toBe('https://app.example.com/dashboard');
  });

  it('submit() includes consentToNotify as string in FormData when provided', async () => {
    let capturedBody: FormData | undefined;

    const fetch = mockFetch(async (_url, init) => {
      capturedBody = init?.body as FormData;
      return jsonResponse({ feedback: { id: 'f-1' }, similar: [] }, 201);
    });

    const client = createClient(fetch, { apiKey: 'bk_test' });
    await client.feedback.submit({
      type: 'support',
      title: 'Need help',
      description: 'Cannot access my account',
      consentToNotify: true,
    });

    expect(capturedBody?.get('type')).toBe('support');
    expect(capturedBody?.get('consentToNotify')).toBe('true');
  });

  it('submit() appends file attachments', async () => {
    let capturedBody: FormData | undefined;

    const fetch = mockFetch(async (_url, init) => {
      capturedBody = init?.body as FormData;
      return jsonResponse({ feedback: { id: 'f-1' }, similar: [] }, 201);
    });

    const file = new File(['screenshot data'], 'screenshot.png', { type: 'image/png' });
    const client = createClient(fetch, { apiKey: 'bk_test' });
    await client.feedback.submit({
      type: 'bug_report',
      title: 'Bug',
      description: 'Desc',
      attachments: [file],
    });

    const attachments = capturedBody?.getAll('attachments');
    expect(attachments).toHaveLength(1);
    expect(attachments?.[0]).toBeInstanceOf(File);
    expect((attachments?.[0] as File).name).toBe('screenshot.png');
  });

  it('submit() throws without apiKey', async () => {
    const fetch = mockFetch(async () => jsonResponse({ feedback: {}, similar: [] }, 201));
    const client = createClient(fetch);

    await expect(
      client.feedback.submit({ type: 'bug_report', title: 'Bug', description: 'Desc' }),
    ).rejects.toThrow(BeaconAuthError);
  });

  it('submit() serializes tags as a JSON string in FormData', async () => {
    let capturedBody: FormData | undefined;

    const fetch = mockFetch(async (_url, init) => {
      capturedBody = init?.body as FormData;
      return jsonResponse({ feedback: { id: 'f-1' }, similar: [] }, 201);
    });

    const client = createClient(fetch, { apiKey: 'bk_test' });
    await client.feedback.submit({
      type: 'bug_report',
      title: 'Bug',
      description: 'Desc',
      tags: { plan: 'pro', region: 'eu' },
    });

    expect(capturedBody?.get('tags')).toBe(JSON.stringify({ plan: 'pro', region: 'eu' }));
  });

  it('submitPublic() sends POST to /api/v1/public-feedback without auth', async () => {
    let capturedUrl = '';
    let capturedMethod = '';
    let capturedHeaders: Record<string, string> = {};
    let capturedBody: FormData | undefined;

    const fetch = mockFetch(async (url, init) => {
      capturedUrl = url;
      capturedMethod = init?.method ?? '';
      capturedHeaders = init?.headers as Record<string, string>;
      capturedBody = init?.body as FormData;
      return jsonResponse({ success: true }, 201);
    });

    const client = createClient(fetch);
    const result = await client.feedback.submitPublic({
      type: 'feature_request',
      title: 'Add dark mode',
      description: 'Please add dark mode',
      userEmail: 'user@example.com',
    });

    expect(capturedUrl).toBe(`${BASE_URL}/api/v1/public-feedback`);
    expect(capturedMethod).toBe('POST');
    expect(capturedHeaders['x-api-key']).toBeUndefined();
    expect(capturedBody).toBeInstanceOf(FormData);
    expect(capturedBody?.get('type')).toBe('feature_request');
    expect(capturedBody?.get('userEmail')).toBe('user@example.com');
    expect(result).toEqual({ success: true });
  });

  it('messages() sends GET to /api/v1/public-feedback/messages with token query', async () => {
    let capturedUrl = '';

    const message = {
      id: 'msg-1',
      feedbackId: 'f-1',
      sender: 'admin',
      authorUserId: 'u-1',
      authorName: 'Support',
      authorEmail: 'support@example.com',
      body: 'Thanks for the report',
      createdAt: '2025-01-01T00:00:00Z',
    };

    const fetch = mockFetch(async (url) => {
      capturedUrl = url;
      return jsonResponse([message]);
    });

    const client = createClient(fetch);
    const result = await client.feedback.messages('public-token-123');

    expect(capturedUrl).toBe(`${BASE_URL}/api/v1/public-feedback/messages?token=public-token-123`);
    expect(result).toEqual([message]);
  });

  it('sendMessage() sends POST JSON to /api/v1/public-feedback/messages', async () => {
    let capturedUrl = '';
    let capturedMethod = '';
    let capturedHeaders: Record<string, string> = {};
    let capturedBody = '';

    const message = {
      id: 'msg-2',
      feedbackId: 'f-1',
      sender: 'user',
      authorUserId: null,
      authorName: 'Jane',
      authorEmail: 'jane@example.com',
      body: 'Any update?',
      createdAt: '2025-01-01T00:00:00Z',
    };

    const fetch = mockFetch(async (url, init) => {
      capturedUrl = url;
      capturedMethod = init?.method ?? '';
      capturedHeaders = init?.headers as Record<string, string>;
      capturedBody = init?.body as string;
      return jsonResponse(message, 201);
    });

    const client = createClient(fetch);
    const result = await client.feedback.sendMessage({
      token: 'public-token-123',
      body: 'Any update?',
    });

    expect(capturedUrl).toBe(`${BASE_URL}/api/v1/public-feedback/messages`);
    expect(capturedMethod).toBe('POST');
    expect(capturedHeaders['content-type']).toBe('application/json');
    expect(JSON.parse(capturedBody)).toEqual({ token: 'public-token-123', body: 'Any update?' });
    expect(result).toEqual(message);
  });
});

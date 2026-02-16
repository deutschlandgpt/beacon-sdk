import { BeaconAuthError, BeaconError, BeaconNotFoundError, BeaconValidationError } from './errors';
import { Changelogs } from './resources/changelogs';
import { Feedback } from './resources/feedback';
import { Incidents } from './resources/incidents';
import { Monitors } from './resources/monitors';
import { Subscribers } from './resources/subscribers';
import type { BeaconClientConfig } from './types';

export class BeaconClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly _fetch: typeof globalThis.fetch;

  public readonly changelogs: Changelogs;
  public readonly monitors: Monitors;
  public readonly incidents: Incidents;
  public readonly subscribers: Subscribers;
  public readonly feedback: Feedback;

  constructor(config: BeaconClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.apiKey = config.apiKey;
    this._fetch = config.fetch ?? globalThis.fetch;

    this.changelogs = new Changelogs(this);
    this.monitors = new Monitors(this);
    this.incidents = new Incidents(this);
    this.subscribers = new Subscribers(this);
    this.feedback = new Feedback(this);
  }

  async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      formData?: FormData;
      query?: Record<string, string | undefined>;
      auth?: boolean;
    },
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (options?.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined) {
          url.searchParams.set(key, value);
        }
      }
    }

    const headers: Record<string, string> = {};

    if (options?.auth) {
      if (!this.apiKey) {
        throw new BeaconAuthError('API key is required for this endpoint');
      }
      headers['x-api-key'] = this.apiKey;
    }

    let reqBody: BodyInit | undefined;

    if (options?.formData) {
      reqBody = options.formData;
    } else if (options?.body !== undefined) {
      headers['content-type'] = 'application/json';
      reqBody = JSON.stringify(options.body);
    }

    const response = await this._fetch(url.toString(), {
      method,
      headers,
      body: reqBody,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => undefined);
      const message =
        (body as { error?: string } | undefined)?.error ??
        `Request failed with status ${response.status}`;

      switch (response.status) {
        case 400:
          throw new BeaconValidationError(
            message,
            body,
            (body as { details?: unknown } | undefined)?.details,
          );
        case 401:
          throw new BeaconAuthError(message, body);
        case 404:
          throw new BeaconNotFoundError(message, body);
        default:
          throw new BeaconError(message, response.status, body);
      }
    }

    return response.json() as Promise<T>;
  }
}

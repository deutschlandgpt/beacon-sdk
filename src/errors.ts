export class BeaconError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'BeaconError';
    this.status = status;
    this.body = body;
  }
}

export class BeaconValidationError extends BeaconError {
  public readonly details: unknown;

  constructor(message: string, body?: unknown, details?: unknown) {
    super(message, 400, body);
    this.name = 'BeaconValidationError';
    this.details = details;
  }
}

export class BeaconAuthError extends BeaconError {
  constructor(message: string = 'Unauthorized', body?: unknown) {
    super(message, 401, body);
    this.name = 'BeaconAuthError';
  }
}

export class BeaconNotFoundError extends BeaconError {
  constructor(message: string = 'Not found', body?: unknown) {
    super(message, 404, body);
    this.name = 'BeaconNotFoundError';
  }
}

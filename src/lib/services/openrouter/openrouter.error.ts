import { ZodError } from 'zod';

export class OpenRouterError extends Error {
  public readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'OpenRouterError';
    this.cause = cause;
  }
}

export class ConfigurationError extends OpenRouterError {
  constructor(message = 'Missing OPENROUTER_API_KEY in environment variables') {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class ApiConnectionError extends OpenRouterError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'ApiConnectionError';
  }
}

export class ApiStatusError extends OpenRouterError {
  public readonly status: number;

  constructor(status: number, statusText: string) {
    super(`OpenRouter API responded with status ${status}: ${statusText}`);
    this.name = 'ApiStatusError';
    this.status = status;
  }
}

export class ResponseParsingError extends OpenRouterError {
  constructor(message = 'Unable to parse response as JSON', cause?: unknown) {
    super(message, cause);
    this.name = 'ResponseParsingError';
  }
}

export class SchemaValidationError extends OpenRouterError {
  public readonly zodError?: ZodError;

  constructor(
    message = 'Response does not match the expected schema',
    cause?: unknown
  ) {
    super(message, cause);
    this.name = 'SchemaValidationError';
    if (cause instanceof ZodError) {
      this.zodError = cause;
    }
  }
}

export class RateLimitError extends OpenRouterError {
  public readonly retryAfter?: number;

  constructor(retryAfter?: number) {
    super('Rate limited by OpenRouter API');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

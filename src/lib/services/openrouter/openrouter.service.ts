import { z, type ZodType } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type ChatMessage, type GenerateChatParams } from './openrouter.model';
import {
  ApiConnectionError,
  ApiStatusError,
  ConfigurationError,
  OpenRouterError,
  RateLimitError,
  ResponseParsingError,
  SchemaValidationError,
} from './openrouter.error';

interface RequestPayload {
  model: string;
  messages: ChatMessage[];
  response_format: {
    type: 'json_schema';
    json_schema: {
      name: string;
      strict: true;
      schema: unknown;
    };
  };
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;

export class OpenRouterService {
  private static instance: OpenRouterService | null = null;

  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://openrouter.ai/api/v1';

  private constructor() {
    const key = import.meta.env.OPENROUTER_API_KEY;
    if (!key) {
      throw new ConfigurationError();
    }
    this.apiKey = key;
  }

  public static getInstance(): OpenRouterService {
    if (!OpenRouterService.instance) {
      OpenRouterService.instance = new OpenRouterService();
    }
    return OpenRouterService.instance;
  }

  public async generateChatCompletion<T extends ZodType>(
    params: GenerateChatParams<T>
  ): Promise<z.infer<T>> {
    const payload = this.buildPayload(params);
    const responseText = await this.sendRequest(JSON.stringify(payload));
    return this.parseAndValidateResponse(responseText, params.responseSchema);
  }

  private buildPayload<T extends ZodType>(
    params: GenerateChatParams<T>
  ): RequestPayload {
    const jsonSchema = zodToJsonSchema(params.responseSchema, {
      name: params.schemaName,
      $refStrategy: 'none',
      errorMessages: true,
    });

    const payload: RequestPayload = {
      model: params.model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: params.schemaName,
          strict: true as const,
          schema: jsonSchema.definitions?.[params.schemaName] ?? jsonSchema,
        },
      },
    };

    if (params.modelParams) {
      Object.assign(payload, params.modelParams);
    }

    return payload;
  }

  private async sendRequest(body: string, attempt = 0): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body,
        signal: controller.signal,
      });

      if (res.status === 429) {
        const retryAfterHeader = res.headers.get('Retry-After');
        const retryAfter = retryAfterHeader
          ? Number(retryAfterHeader)
          : undefined;
        if (attempt < MAX_RETRIES) {
          await this.delay(this.backoff(attempt, retryAfter));
          return this.sendRequest(body, attempt + 1);
        }
        throw new RateLimitError(retryAfter);
      }

      if (!res.ok) {
        throw new ApiStatusError(res.status, res.statusText);
      }

      const json = await res.json();
      const content: unknown = json?.choices?.[0]?.message?.content;
      if (typeof content !== 'string') {
        throw new ResponseParsingError('Unexpected response shape');
      }
      return content;
    } catch (err) {
      if (err instanceof OpenRouterError) throw err;

      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new ApiConnectionError('Request timed out', err);
      }
      if (attempt < MAX_RETRIES) {
        await this.delay(this.backoff(attempt));
        return this.sendRequest(body, attempt + 1);
      }
      throw new ApiConnectionError(
        'Failed to communicate with OpenRouter API',
        err
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private parseAndValidateResponse<T extends ZodType>(
    rawContent: string,
    schema: T
  ): z.infer<T> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch (err) {
      throw new ResponseParsingError(
        'Invalid JSON returned by OpenRouter',
        err
      );
    }

    const validation = schema.safeParse(parsed);
    if (!validation.success) {
      throw new SchemaValidationError(
        validation.error.message,
        validation.error
      );
    }
    return validation.data;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private backoff(attempt: number, retryAfter?: number): number {
    if (retryAfter && !Number.isNaN(retryAfter)) {
      return retryAfter * 1000;
    }
    const base = 500;
    return base * Math.pow(2, attempt);
  }
}

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import { z } from 'zod';
import { OpenRouterService } from './openrouter.service';
import { ApiStatusError, SchemaValidationError } from './openrouter.error';

describe('open-router-service', () => {
  const service = OpenRouterService.getInstance();
  const schema = z.object({ hello: z.string() });

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return parsed and validated data on success', async () => {
    const mockResponseContent = JSON.stringify({ hello: 'world' });
    const mockFetch = global.fetch as unknown as Mock;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: mockResponseContent,
            },
          },
        ],
      }),
    });

    const result = await service.generateChatCompletion({
      model: 'test-model',
      systemPrompt: 'You are system',
      userPrompt: 'Say hello',
      schemaName: 'TestSchema',
      responseSchema: schema,
    });
    expect(result).toEqual({ hello: 'world' });
  });

  it('should throw ApiStatusError on non-ok response', async () => {
    const mockFetch = global.fetch as unknown as Mock;
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'error',
    });

    await expect(
      service.generateChatCompletion({
        model: 'test',
        systemPrompt: 'sys',
        userPrompt: 'usr',
        schemaName: 'Test',
        responseSchema: schema,
      })
    ).rejects.toBeInstanceOf(ApiStatusError);
  });

  it('should throw SchemaValidationError when output does not match schema', async () => {
    const wrongContent = JSON.stringify({ wrong: 'shape' });
    const mockFetch = global.fetch as unknown as Mock;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: wrongContent } }],
      }),
    });

    await expect(
      OpenRouterService.getInstance().generateChatCompletion({
        model: 'test',
        systemPrompt: 'sys',
        userPrompt: 'usr',
        schemaName: 'Test',
        responseSchema: schema,
      })
    ).rejects.toBeInstanceOf(SchemaValidationError);
  });
});

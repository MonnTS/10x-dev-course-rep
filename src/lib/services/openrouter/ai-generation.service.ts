import type { SupabaseClient } from '@/db/supabase.client';
import type { GenerateFlashcardsResponse } from '../../../types';
import { generateFlashcardsSchema } from '../../validators/generation.validator';
import { createHash } from 'crypto';
import { OpenRouterService } from './openrouter.service';
import { z } from 'zod';
import type { ErrorLogService } from '../error/error-log.service';

const DEFAULT_MODEL = 'openai/gpt-4.1';
const MIN_FLASHCARDS = 10;
const MAX_FLASHCARDS = 20;

const flashcardsResponseSchema = z.object({
  flashcards: z
    .array(
      z.object({
        front: z.string(),
        back: z.string(),
      })
    )
    .min(MIN_FLASHCARDS)
    .max(MAX_FLASHCARDS),
});

export class AIGenerationService {
  private readonly supabase: SupabaseClient;
  private readonly errorLogService: ErrorLogService;
  private readonly openRouterService: OpenRouterService;

  constructor(
    supabase: SupabaseClient,
    errorLogService: ErrorLogService,
    openRouterService: OpenRouterService = OpenRouterService.getInstance()
  ) {
    this.supabase = supabase;
    this.errorLogService = errorLogService;
    this.openRouterService = openRouterService;
  }

  private generateTextHash(text: string): string {
    return createHash('sha256').update(text).digest('hex');
  }

  private buildPrompts(sourceText: string) {
    const systemPrompt =
      'You are a helpful AI that generates flashcards for studying.';
    const userPrompt = `Generate between ${MIN_FLASHCARDS} and ${MAX_FLASHCARDS} educational flashcards from this source text:\n"""\n${sourceText}\n"""\n• The output must be a JSON object matching the provided schema.\n• Only include the flashcards, no additional keys.\n• Each flashcard requires: \n  – front: a concise question or concept (max 200 chars)\n  – back: a clear answer/explanation (max 500 chars)`;
    return { systemPrompt, userPrompt };
  }

  async generateFlashcards(params: {
    sourceText: string;
    userId: string;
    model?: string;
  }): Promise<GenerateFlashcardsResponse> {
    try {
      const { sourceText, model } = generateFlashcardsSchema.parse(params);
      const resolvedModel = model ?? DEFAULT_MODEL;
      const { systemPrompt, userPrompt } = this.buildPrompts(sourceText);

      const startTime = performance.now();

      const llmResponse = await this.openRouterService.generateChatCompletion({
        model: resolvedModel,
        systemPrompt,
        userPrompt,
        schemaName: 'flashcardsResponseSchema',
        responseSchema: flashcardsResponseSchema,
      });

      const flashcards = llmResponse.flashcards;

      const endTime = performance.now();
      const generationTime = `${(endTime - startTime).toFixed(2)} ms`;

      const { data, error } = await this.supabase
        .from('generations')
        .insert({
          user_id: params.userId,
          source_text_hash: this.generateTextHash(sourceText),
          source_text_lenght: sourceText.length,
          generated_count: flashcards.length,
          model_used: resolvedModel,
          generation_time: generationTime,
        })
        .select('id')
        .single();

      if (error || !data) {
        throw new Error(`Database error: ${error?.message ?? 'Unknown'}`);
      }

      return {
        generationId: data.id,
        flashcards,
        metadata: {
          model: resolvedModel,
          generation_time: generationTime,
        },
      };
    } catch (error) {
      const e = error instanceof Error ? error : new Error(String(error));
      this.errorLogService.logError(e, params.userId);
      throw e;
    }
  }
}

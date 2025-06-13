import type { APIRoute } from 'astro';
import { AIGenerationService } from '../../../../lib/services/openrouter/ai-generation.service';
import { ErrorLogService } from '../../../../lib/services/error/error-log.service';
import { createErrorResponse } from '../../../../lib/utils/api-response.util';
import type { GenerateFlashcardsCommand } from '../../../../types';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  const errorLogService = new ErrorLogService(locals.supabase);
  const user = await locals.supabase.auth.getUser();
  const userId = user.data.user?.id;

  try {
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const openRouterApiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return createErrorResponse(
        new Error('AI service is not configured.'),
        errorLogService,
        userId
      );
    }

    const input = (await request.json()) as GenerateFlashcardsCommand;

    const aiService = new AIGenerationService(locals.supabase, errorLogService);

    const response = await aiService.generateFlashcards({
      ...input,
      userId: userId,
    });

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return createErrorResponse(error, errorLogService, userId);
  }
};

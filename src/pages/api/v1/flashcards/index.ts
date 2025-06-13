import type { APIRoute } from 'astro';
import { FlashcardService } from '../../../../lib/services/flashcard/flashcard.service';
import { ErrorLogService } from '../../../../lib/services/error/error-log.service';
import { createErrorResponse } from '../../../../lib/utils/api-response.util';
import {
  listFlashcardsSchema,
  createFlashcardSchema,
} from '../../../../lib/validators/flashcard.validator';
import { z } from 'zod';

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  const errorLogService = new ErrorLogService(locals.supabase);
  const { searchParams } = url;
  const user = (await locals.supabase.auth.getUser()).data.user;
  const userId = user?.id;
  try {
    if (!userId) {
      return new Response(null, { status: 401 });
    }

    const getParam = (key: string) => {
      const value = searchParams.get(key);
      return value === null || value === '' ? undefined : value;
    };

    const queryParams = listFlashcardsSchema.parse({
      page: getParam('page'),
      pageSize: getParam('pageSize'),
      search: getParam('search'),
      sortBy: getParam('sortBy'),
      order: getParam('order'),
      source: getParam('source'),
    });

    const flashcardService = new FlashcardService(
      locals.supabase,
      errorLogService
    );
    const response = await flashcardService.listFlashcards({
      ...queryParams,
      userId,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return createErrorResponse(error, errorLogService, userId);
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase;
    const user = locals.user;

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const validatedData = createFlashcardSchema.parse(body);

    const { data: flashcard, error } = await supabase
      .from('flashcards')
      .insert({
        ...validatedData,
        source: validatedData.source ?? 'manual',
        user_id: user.id,
      })
      .select('id')
      .single();

    if (error) {
      return new Response(
        JSON.stringify({
          error: 'Failed to create flashcard',
          details: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(flashcard), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid flashcard data',
          details: error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

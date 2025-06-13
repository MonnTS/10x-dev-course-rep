import type { APIRoute } from 'astro';
import { FlashcardService } from '../../../../lib/services/flashcard/flashcard.service';
import { ErrorLogService } from '../../../../lib/services/error/error-log.service';
import { createErrorResponse } from '../../../../lib/utils/api-response.util';
import { listFlashcardsSchema } from '../../../../lib/validators/flashcard.validator';

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  const errorLogService = new ErrorLogService(locals.supabase);
  const { searchParams } = url;
  const session = await locals.supabase.auth.getSession();
  const userId = session.data.session?.user.id;
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

export const POST: APIRoute = async ({ locals, request }) => {
  const errorLogService = new ErrorLogService(locals.supabase);
  const session = await locals.supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  try {
    if (!userId) {
      return new Response(null, { status: 401 });
    }

    const input = await request.json();

    const flashcardService = new FlashcardService(
      locals.supabase,
      errorLogService
    );
    const flashcard = await flashcardService.createFlashcard(input, userId);

    return new Response(JSON.stringify(flashcard), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return createErrorResponse(error, errorLogService, userId);
  }
};

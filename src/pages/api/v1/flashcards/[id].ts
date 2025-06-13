import type { APIRoute } from 'astro';
import { FlashcardService } from '../../../../lib/services/flashcard/flashcard.service';
import { ErrorLogService } from '../../../../lib/services/error/error-log.service';
import { createErrorResponse } from '../../../../lib/utils/api-response.util';

export const prerender = false;

const getId = (id: string | undefined): number => {
  const numId = Number(id);
  if (!id || !Number.isInteger(numId) || numId <= 0) {
    throw new Error('A valid flashcard ID is required.');
  }
  return numId;
};

export const GET: APIRoute = async ({ locals, params }) => {
  const errorLogService = new ErrorLogService(locals.supabase);
  const user = (await locals.supabase.auth.getUser()).data.user;
  const userId = user?.id;
  try {
    if (!userId) {
      return new Response(null, { status: 401 });
    }

    const id = getId(params.id);
    const flashcardService = new FlashcardService(
      locals.supabase,
      errorLogService
    );
    const flashcard = await flashcardService.getFlashcard(id, userId);

    if (!flashcard) {
      return new Response(null, { status: 404 });
    }

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return createErrorResponse(error, errorLogService, userId);
  }
};

export const PUT: APIRoute = async ({ locals, params, request }) => {
  const errorLogService = new ErrorLogService(locals.supabase);
  const user = (await locals.supabase.auth.getUser()).data.user;
  const userId = user?.id;
  try {
    if (!userId) {
      return new Response(null, { status: 401 });
    }

    const id = getId(params.id);
    const input = await request.json();

    const flashcardService = new FlashcardService(
      locals.supabase,
      errorLogService
    );
    const flashcard = await flashcardService.updateFlashcard(id, input, userId);

    if (!flashcard) {
      return new Response(null, { status: 404 });
    }

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return createErrorResponse(error, errorLogService, userId);
  }
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  const errorLogService = new ErrorLogService(locals.supabase);
  const user = (await locals.supabase.auth.getUser()).data.user;
  const userId = user?.id;
  if (!userId) {
    return new Response(null, { status: 401 });
  }
  try {
    const id = getId(params.id);
    const flashcardService = new FlashcardService(
      locals.supabase,
      errorLogService
    );
    const wasDeleted = await flashcardService.deleteFlashcard(id, userId);

    if (!wasDeleted) {
      return new Response(null, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error, errorLogService, userId);
  }
};

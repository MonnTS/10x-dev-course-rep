import type { APIRoute } from 'astro';
import { FlashcardService } from '../../../../lib/services/flashcard/flashcard.service';
import { ErrorLogService } from '../../../../lib/services/error/error-log.service';
import { createErrorResponse } from '../../../../lib/utils/api-response.util';
import type { FlashcardProposal } from '../../../../types';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  const errorLogService = new ErrorLogService(locals.supabase);
  const user = locals.user;
  const userId = user?.id;
  try {
    if (!userId) {
      return new Response(null, { status: 401 });
    }

    const {
      generationId,
      flashcards: flashcardsData,
    }: { generationId?: string; flashcards?: FlashcardProposal[] } =
      await request.json();

    if (!generationId) {
      return new Response(
        JSON.stringify({ error: 'Generation ID is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify generation belongs to user
    const { data: generationRow, error: genError } = await locals.supabase
      .from('generations')
      .select('id, user_id')
      .eq('id', generationId)
      .single();

    if (genError) {
      return createErrorResponse(genError, errorLogService, userId);
    }

    if (!generationRow || generationRow.user_id !== userId) {
      return new Response(null, { status: 403 });
    }

    const flashcardService = new FlashcardService(
      locals.supabase,
      errorLogService
    );
    const preparedFlashcards = (flashcardsData ?? []).map(
      (
        flashcard: FlashcardProposal & {
          source?: 'manual' | 'ai-full' | 'ai-edited';
        }
      ) => ({
        ...flashcard,
        generation_id: generationId,
      })
    );

    const flashcards = await flashcardService.createFlashcards(
      preparedFlashcards,
      userId
    );

    // Update generation accepted counts
    const acceptedUnedited = preparedFlashcards.filter(
      (f) => (f.source ?? 'manual') === 'ai-full'
    ).length;
    const acceptedEdited = preparedFlashcards.filter(
      (f) => f.source === 'ai-edited'
    ).length;

    await locals.supabase
      .from('generations')
      .update({
        accepted_unedited_count: acceptedUnedited,
        accepted_edited_count: acceptedEdited,
      })
      .eq('id', generationId)
      .eq('user_id', userId);

    return new Response(JSON.stringify(flashcards), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return createErrorResponse(error, errorLogService, userId);
  }
};

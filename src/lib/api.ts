import type { FlashcardsListResponse } from '@/types';

export async function getFlashcards(
  params: URLSearchParams = new URLSearchParams()
): Promise<FlashcardsListResponse> {
  const response = await fetch(`/api/v1/flashcards?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch flashcards');
  }

  return response.json();
}

export async function deleteFlashcard(id: string): Promise<void> {
  const response = await fetch(`/api/v1/flashcards/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete the flashcard');
  }
}

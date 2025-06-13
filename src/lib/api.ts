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

export async function registerUser(payload: {
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<void> {
  const response = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => undefined);
    throw new Error(data?.error ?? 'Registration failed');
  }
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<void> {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => undefined);
    throw new Error(data?.error ?? 'Login failed');
  }
}

export async function requestPasswordReset(payload: {
  email: string;
}): Promise<void> {
  const response = await fetch('/api/v1/auth/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => undefined);
    throw new Error(data?.error ?? 'Request failed');
  }
}

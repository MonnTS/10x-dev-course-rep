import { describe, it, expect } from 'vitest';
import {
  createFlashcardSchema,
  createFlashcardsSchema,
  updateFlashcardSchema,
} from '@/lib/validators/flashcard.validator';

describe('Flashcard Validators', () => {
  it('accepts valid single flashcard', () => {
    expect(
      createFlashcardSchema.safeParse({
        front: 'What is AI?',
        back: 'Artificial Intelligence',
        source: 'manual',
      }).success
    ).toBe(true);
  });

  it('rejects empty front/back', () => {
    const res = createFlashcardSchema.safeParse({ front: '', back: '' });
    expect(res.success).toBe(false);
  });

  it('accepts array via createFlashcardsSchema', () => {
    const res = createFlashcardsSchema.safeParse([
      {
        front: 'Q1',
        back: 'A1',
      },
      {
        front: 'Q2',
        back: 'A2',
      },
    ]);
    expect(res.success).toBe(true);
  });

  it('updateFlashcardSchema allows partial fields', () => {
    expect(updateFlashcardSchema.safeParse({ front: 'New' }).success).toBe(
      true
    );
    expect(updateFlashcardSchema.safeParse({ back: 'New' }).success).toBe(true);
  });
});

import { z } from 'zod';

export const FLASHCARD_FRONT_MAX_LENGTH = 200;
export const FLASHCARD_BACK_MAX_LENGTH = 500;

export const createFlashcardSchema = z.object({
  front: z.string().min(1, 'Front is required').max(FLASHCARD_FRONT_MAX_LENGTH),
  back: z.string().min(1, 'Back is required').max(FLASHCARD_BACK_MAX_LENGTH),
  source: z.enum(['manual', 'ai-full', 'ai-edited']).optional(),
  generation_id: z.string().uuid().nullable().optional(),
});

export const createFlashcardsSchema = z.array(createFlashcardSchema);

export const updateFlashcardSchema = z.object({
  front: z
    .string()
    .min(1, 'Front is required')
    .max(FLASHCARD_FRONT_MAX_LENGTH)
    .optional(),
  back: z
    .string()
    .min(1, 'Back is required')
    .max(FLASHCARD_BACK_MAX_LENGTH)
    .optional(),
});

export const listFlashcardsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .min(10)
    .max(100)
    .optional()
    .default(20),
  search: z.string().optional(),
  sortBy: z
    .enum(['created_at', 'updated_at', 'source'])
    .optional()
    .default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  source: z.enum(['manual', 'ai-full', 'ai-edited']).optional(),
});

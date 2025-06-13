import { z } from 'zod';

export const createFlashcardSchema = z.object({
  front: z.string().min(1, 'Front is required').max(200),
  back: z.string().min(1, 'Back is required').max(500),
  source: z.enum(['manual', 'ai-full', 'ai-edited']).optional(),
  generation_id: z.string().uuid().optional(),
});

export const createFlashcardsSchema = z.array(createFlashcardSchema);

export const updateFlashcardSchema = z.object({
  front: z.string().min(1, 'Front is required').max(200).optional(),
  back: z.string().min(1, 'Back is required').max(500).optional(),
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

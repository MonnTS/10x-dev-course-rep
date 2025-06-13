import { z } from 'zod';

export const generateFlashcardsSchema = z.object({
  sourceText: z
    .string()
    .min(1000, 'Source text must be at least 1000 characters')
    .max(10_000, 'Source text must be less than 10,000 characters'),
  model: z.string().optional(),
});

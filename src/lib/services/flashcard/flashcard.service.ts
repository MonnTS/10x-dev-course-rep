import type { SupabaseClient } from '@/db/supabase.client';
import type { FlashcardRow } from '@/db/database.types';
import type {
  Flashcard,
  FlashcardsListResponse,
  PaginationMetadata,
  UpdateFlashcard,
  SourceType,
} from '../../../types';
import {
  listFlashcardsSchema,
  createFlashcardSchema,
  createFlashcardsSchema,
  updateFlashcardSchema,
} from '../../validators/flashcard.validator';
import type { z } from 'zod';
import type { ErrorLogService } from '../error/error-log.service';

export class FlashcardService {
  private readonly supabase: SupabaseClient;
  private readonly errorLogService: ErrorLogService;

  constructor(supabase: SupabaseClient, errorLogService: ErrorLogService) {
    this.supabase = supabase;
    this.errorLogService = errorLogService;
  }

  private mapRowToFlashcard(row: FlashcardRow): Flashcard {
    return {
      ...row,
      id: row.id.toString(),
      source: row.source as SourceType,
    };
  }

  async listFlashcards(
    params: z.infer<typeof listFlashcardsSchema> & { userId: string }
  ): Promise<FlashcardsListResponse> {
    try {
      const { page, pageSize, search, sortBy, order } =
        listFlashcardsSchema.parse(params);

      const offset = (page - 1) * pageSize;

      let query = this.supabase
        .from('flashcards')
        .select('*', { count: 'exact' })
        .eq('user_id', params.userId)
        .order(sortBy, { ascending: order === 'asc' })
        .range(offset, offset + pageSize - 1);

      if (search) {
        query = query.textSearch('front', `'${search}'`);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      const total = count ?? 0;
      const pages = Math.ceil(total / pageSize);

      const pagination: PaginationMetadata = {
        total,
        pages,
        page,
        limit: pageSize,
      };

      const flashcards = data.map(this.mapRowToFlashcard);

      return {
        data: flashcards,
        pagination,
      };
    } catch (error) {
      this.errorLogService.logError(
        error instanceof Error ? error : new Error(String(error)),
        params.userId
      );
      throw error;
    }
  }

  async getFlashcard(id: number, userId: string): Promise<Flashcard | null> {
    try {
      const { data, error } = await this.supabase
        .from('flashcards')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data ? this.mapRowToFlashcard(data) : null;
    } catch (error) {
      this.errorLogService.logError(
        error instanceof Error ? error : new Error(String(error)),
        userId
      );
      throw error;
    }
  }

  async createFlashcard(
    input: { front: string; back: string },
    userId: string
  ): Promise<Flashcard> {
    try {
      const { front, back } = createFlashcardSchema.parse(input);

      const { data, error } = await this.supabase
        .from('flashcards')
        .insert({
          front,
          back,
          user_id: userId,
          source: 'manual',
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapRowToFlashcard(data);
    } catch (error) {
      this.errorLogService.logError(
        error instanceof Error ? error : new Error(String(error)),
        userId
      );
      throw error;
    }
  }

  async createFlashcards(
    inputs: {
      front: string;
      back: string;
      source?: SourceType;
      generation_id?: string;
    }[],
    userId: string
  ): Promise<Flashcard[]> {
    try {
      const flashcardsData = createFlashcardsSchema.parse(inputs);

      const preparedFlashcards = flashcardsData.map((flashcard) => ({
        ...flashcard,
        user_id: userId,
        source: flashcard.source ?? 'manual',
      }));

      const { data, error } = await this.supabase
        .from('flashcards')
        .insert(preparedFlashcards)
        .select();

      if (error) throw error;
      return data.map(this.mapRowToFlashcard);
    } catch (error) {
      this.errorLogService.logError(
        error instanceof Error ? error : new Error(String(error)),
        userId
      );
      throw error;
    }
  }

  async updateFlashcard(
    id: number,
    input: UpdateFlashcard,
    userId: string
  ): Promise<Flashcard | null> {
    try {
      const flashcardData = updateFlashcardSchema.parse(input);
      if (Object.keys(flashcardData).length === 0) {
        throw new Error('At least one field to update must be provided.');
      }

      const { data, error } = await this.supabase
        .from('flashcards')
        .update(flashcardData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data ? this.mapRowToFlashcard(data) : null;
    } catch (error) {
      this.errorLogService.logError(
        error instanceof Error ? error : new Error(String(error)),
        userId
      );
      throw error;
    }
  }

  async deleteFlashcard(id: number, userId: string): Promise<boolean> {
    try {
      const { error, count } = await this.supabase
        .from('flashcards')
        .delete({ count: 'exact' })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return count !== null && count > 0;
    } catch (error) {
      this.errorLogService.logError(
        error instanceof Error ? error : new Error(String(error)),
        userId
      );
      throw error;
    }
  }
}

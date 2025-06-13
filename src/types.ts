export type SourceType = 'manual' | 'ai-full' | 'ai-edited';

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserRegister {
  email: string;
  password: string;
}

export interface Login {
  email: string;
  password: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  source: SourceType;
  created_at: string;
  updated_at: string;
  user_id: string;
  generation_id: string | null;
}

export interface FlashcardProposal {
  front: string;
  back: string;
  source?: SourceType;
}

export interface AcceptGenerationFlashcardsRequest {
  flashcards: {
    front: string;
    back: string;
    edited?: boolean;
  }[];
}

export interface CreateFlashcardsBulkRequest {
  generationId: string;
  flashcards: FlashcardProposal[];
}

export type CreateFlashcard = Omit<
  Flashcard,
  'id' | 'created_at' | 'updated_at' | 'user_id'
>;

export type UpdateFlashcard = Partial<
  Omit<CreateFlashcard, 'generation_id' | 'source'>
>;

export interface Generation {
  id: string;
  user_id: string;
  model_used: string;
  generated_count: number;
  accepted_unedited_count: number | null;
  accepted_edited_count: number | null;
  source_text_hash: string;
  source_text_length: number;
  generation_time: string;
  created_at: string;
}

export interface GenerateFlashcardsCommand {
  sourceText: string;
  model?: string;
}

export interface GenerateFlashcardsResponse {
  generationId: string;
  flashcards: FlashcardProposal[];
  metadata: {
    model: string;
    generation_time: string;
  };
}

export interface ErrorLog {
  id: string;
  user_id: string;
  error_message: string;
  error_time: string;
}

export interface PaginationMetadata {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export interface FlashcardsListResponse {
  data: Flashcard[];
  pagination: PaginationMetadata;
}

export interface GenerationsListResponse {
  data: Generation[];
  pagination: PaginationMetadata;
}

export interface ErrorResponse {
  error: string;
  details?: unknown;
}

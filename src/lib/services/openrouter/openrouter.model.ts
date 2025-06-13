import { ZodType } from 'zod';

export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ModelParams {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
}

export interface GenerateChatParams<T extends ZodType> {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  responseSchema: T;
  schemaName: string;
  modelParams?: ModelParams;
}

import { toast } from 'sonner';
import { useRef, useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { MutationStatus } from '@tanstack/react-query';
import type {
  GenerateFlashcardsCommand,
  GenerateFlashcardsResponse,
  CreateFlashcardsBulkRequest,
  FlashcardProposal,
} from '@/types';

type GenerationState = 'idle' | 'loading' | 'success' | 'error';

export const useGeneration = () => {
  const [proposals, setProposals] = useState<FlashcardProposal[] | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const generateMutation = useMutation({
    mutationFn: async (cmd: GenerateFlashcardsCommand) => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/v1/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cmd),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Wystąpił błąd serwera.');
      }

      return response.json() as Promise<GenerateFlashcardsResponse>;
    },
    onSuccess: (data) => {
      setProposals(data.flashcards);
      setGenerationId(data.generationId);
      toast.success('Flashcards generated successfully!');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(message);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (cmd: CreateFlashcardsBulkRequest) => {
      const response = await fetch('/api/v1/flashcards/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cmd),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'An error occurred while saving the flashcards.'
        );
      }
    },
    onSuccess: () => {
      toast.success('Flashcards saved successfully!');
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'Error while saving flashcards';
      setError(message);
      toast.error(message);
    },
  });

  const mapStatusToState = (status: MutationStatus): GenerationState => {
    switch (status) {
      case 'pending':
        return 'loading';
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'idle';
    }
  };

  const generationState: GenerationState = mapStatusToState(
    generateMutation.status
  );
  const saveState: GenerationState = mapStatusToState(saveMutation.status);

  const cancelGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    generateMutation.reset();
  }, [generateMutation]);

  return {
    generationState,
    saveState,
    proposals,
    generationId,
    error,
    generate: generateMutation.mutate,
    save: async (cmd: CreateFlashcardsBulkRequest) => {
      try {
        await saveMutation.mutateAsync(cmd);
        return { success: true, error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: message };
      }
    },
    cancelGeneration,
  };
};

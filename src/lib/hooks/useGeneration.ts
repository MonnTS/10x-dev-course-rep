import { toast } from 'sonner';
import { useState, useRef, useCallback } from 'react';
import type {
  GenerateFlashcardsCommand,
  GenerateFlashcardsResponse,
  CreateFlashcardsBulkRequest,
  FlashcardProposal,
} from '@/types';

type GenerationState = 'idle' | 'loading' | 'success' | 'error';
type SaveState = 'idle' | 'loading' | 'success' | 'error';

export const useGeneration = () => {
  const [generationState, setGenerationState] =
    useState<GenerationState>('idle');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [proposals, setProposals] = useState<FlashcardProposal[] | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (cmd: GenerateFlashcardsCommand) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setGenerationState('loading');
    setError(null);
    setProposals(null);

    try {
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

      const data: GenerateFlashcardsResponse = await response.json();
      setProposals(data.flashcards);
      setGenerationId(data.generationId);
      setGenerationState('success');
      toast.success('Flashcards generated successfully!');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Generation was cancelled, set state to idle and do nothing.
        setGenerationState('idle');
        return;
      }
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      setGenerationState('error');
      toast.error(errorMessage);
    }
  }, []);

  const save = useCallback(async (cmd: CreateFlashcardsBulkRequest) => {
    setSaveState('loading');
    setError(null);

    try {
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

      setSaveState('success');
      toast.success('Flashcards saved successfully!');
      return { success: true, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An unknown error occurred while saving.';
      setError(errorMessage);
      setSaveState('error');
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const cancelGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    generationState,
    saveState,
    proposals,
    generationId,
    error,
    generate,
    save,
    cancelGeneration,
  };
};

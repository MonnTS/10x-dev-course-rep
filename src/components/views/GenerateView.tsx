import { useEffect } from 'react';
import { toast } from 'sonner';
import { useGeneration } from '@/lib/hooks/useGeneration';
import SourceTextForm from '@/components/generate/SourceTextForm';
import GenerationProgress from '@/components/generate/GenerationProgress';
import FlashcardProposalList from '@/components/generate/FlashcardProposalList';
import type { FlashcardProposal } from '@/types';
import { useProposals } from '@/lib/hooks/useProposals';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

const GenerateViewContent = () => {
  const {
    proposals: proposalsState,
    initialize: initializeProposals,
    updateText: updateProposalText,
    toggleSelect,
    toggleSelectAll,
    toggleEdit,
    reset: resetProposals,
  } = useProposals();
  const {
    generationState,
    saveState,
    proposals: apiProposals,
    generationId,
    error,
    generate,
    save,
    cancelGeneration,
  } = useGeneration();

  useEffect(() => {
    if (apiProposals) {
      initializeProposals(apiProposals);
    }
  }, [apiProposals, initializeProposals]);

  const handleGenerate = (sourceText: string) => {
    generate({ sourceText });
  };

  const handleRetry = () => {
    resetProposals();
    cancelGeneration();
  };

  const handleCancel = () => {
    resetProposals();
    cancelGeneration();
  };

  const handleUpdateProposal = updateProposalText;
  const handleToggleSelectProposal = toggleSelect;
  const handleToggleSelectAll = toggleSelectAll;
  const handleToggleEdit = toggleEdit;

  const handleSave = async () => {
    const flashcardsToSave: FlashcardProposal[] = proposalsState
      .filter((p) => p.isSelected && p.isValid)
      .map((p) => {
        const source: FlashcardProposal['source'] =
          p.original.front === p.current.front &&
          p.original.back === p.current.back
            ? 'ai-full'
            : 'ai-edited';
        return {
          ...p.current,
          source: source,
        };
      });

    if (flashcardsToSave.length > 0) {
      if (!generationId) {
        toast.error('Brak identyfikatora generacji. Spróbuj ponownie.');
        return;
      }

      const result = await save({
        generationId,
        flashcards: flashcardsToSave,
      });
      if (result.success) {
        toast.success('Fiszki zostały pomyślnie zapisane!');
        window.location.href = '/flashcards';
      } else {
        toast.error('Wystąpił błąd podczas zapisu fiszek.', {
          description: result.error,
        });
      }
    }
  };

  const handleSaveAll = async () => {
    const flashcardsToSave: FlashcardProposal[] = proposalsState
      .filter((p) => p.isValid)
      .map((p) => {
        const source: FlashcardProposal['source'] =
          p.original.front === p.current.front &&
          p.original.back === p.current.back
            ? 'ai-full'
            : 'ai-edited';
        return {
          ...p.current,
          source,
        };
      });

    if (flashcardsToSave.length === 0) {
      toast.error('Brak poprawnych fiszek do zapisania.');
      return;
    }

    if (!generationId) {
      toast.error('Brak identyfikatora generacji. Spróbuj ponownie.');
      return;
    }

    const result = await save({
      generationId,
      flashcards: flashcardsToSave,
    });

    if (result.success) {
      toast.success('Fiszki zostały pomyślnie zapisane!');
      window.location.href = '/flashcards';
    } else {
      toast.error('Wystąpił błąd podczas zapisu fiszek.', {
        description: result.error,
      });
    }
  };

  const isGenerating = generationState === 'loading';
  const hasError = generationState === 'error';
  const showProposals =
    generationState === 'success' && proposalsState.length > 0;
  const showForm = !isGenerating && !hasError && !showProposals;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center">
        Generator Fiszke&nbsp;AI
      </h1>

      {showForm && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Wklej swój tekst źródłowy</CardTitle>
            <CardDescription>
              Podaj fragment treści (od 1000 do 10&nbsp;000 znaków), z którego
              wygenerujemy zestaw fiszek.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SourceTextForm
              onGenerate={handleGenerate}
              isLoading={isGenerating}
            />
          </CardContent>
        </Card>
      )}

      {(isGenerating || hasError) && (
        <Card className="max-w-4xl mx-auto">
          <CardContent>
            <GenerationProgress
              status={generationState}
              error={error}
              onCancel={handleCancel}
              onRetry={handleRetry}
            />
          </CardContent>
        </Card>
      )}

      {showProposals && (
        <div className="space-y-6 max-w-6xl mx-auto">
          <FlashcardProposalList
            proposals={proposalsState}
            onUpdateProposal={handleUpdateProposal}
            onToggleSelectProposal={handleToggleSelectProposal}
            onToggleSelectAll={handleToggleSelectAll}
            onToggleEdit={handleToggleEdit}
            onSave={handleSave}
            onSaveAll={handleSaveAll}
            isSaving={saveState === 'loading'}
          />
        </div>
      )}
    </div>
  );
};

const GenerateView = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <GenerateViewContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default GenerateView;

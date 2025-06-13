import { useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useGeneration } from '@/lib/hooks/useGeneration';
import SourceTextForm from '@/components/generate/SourceTextForm';
import GenerationProgress from '@/components/generate/GenerationProgress';
import FlashcardProposalList from '@/components/generate/FlashcardProposalList';
import type { FlashcardProposal } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

const FRONT_MAX_LENGTH = 200;
const BACK_MAX_LENGTH = 500;

export interface ProposalState {
  id: string;
  original: FlashcardProposal;
  current: FlashcardProposal;
  isSelected: boolean;
  isEditing: boolean;
  isValid: boolean;
}

type ProposalsAction =
  | { type: 'INITIALIZE'; payload: FlashcardProposal[] }
  | {
      type: 'UPDATE_TEXT';
      payload: { id: string; newFront: string; newBack: string };
    }
  | { type: 'TOGGLE_SELECT'; payload: { id: string; isSelected: boolean } }
  | { type: 'TOGGLE_SELECT_ALL'; payload: { isSelected: boolean } }
  | { type: 'TOGGLE_EDIT'; payload: { id: string; isEditing: boolean } }
  | { type: 'RESET' };

const validateProposal = (proposal: FlashcardProposal): boolean => {
  return (
    proposal.front.length > 0 &&
    proposal.front.length <= FRONT_MAX_LENGTH &&
    proposal.back.length > 0 &&
    proposal.back.length <= BACK_MAX_LENGTH
  );
};

const proposalsReducer = (
  state: ProposalState[],
  action: ProposalsAction
): ProposalState[] => {
  switch (action.type) {
    case 'INITIALIZE':
      return action.payload.map((p) => ({
        id: uuidv4(),
        original: p,
        current: p,
        isSelected: false,
        isEditing: false,
        isValid: validateProposal(p),
      }));
    case 'UPDATE_TEXT':
      return state.map((p) =>
        p.id === action.payload.id
          ? {
              ...p,
              current: {
                front: action.payload.newFront,
                back: action.payload.newBack,
              },
              isValid: validateProposal({
                front: action.payload.newFront,
                back: action.payload.newBack,
              }),
            }
          : p
      );
    case 'TOGGLE_SELECT':
      return state.map((p) =>
        p.id === action.payload.id
          ? { ...p, isSelected: action.payload.isSelected }
          : p
      );
    case 'TOGGLE_SELECT_ALL':
      return state.map((p) => ({
        ...p,
        isSelected: action.payload.isSelected,
      }));
    case 'TOGGLE_EDIT':
      return state.map((p) =>
        p.id === action.payload.id
          ? { ...p, isEditing: action.payload.isEditing }
          : p
      );
    case 'RESET':
      return [];
    default:
      return state;
  }
};

const GenerateView = () => {
  const [proposalsState, dispatch] = useReducer(proposalsReducer, []);
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
      dispatch({ type: 'INITIALIZE', payload: apiProposals });
    }
  }, [apiProposals]);

  const handleGenerate = (sourceText: string) => {
    generate({ sourceText });
  };

  const handleRetry = () => {
    // Tutaj można by przechować sourceText, aby umożliwić ponowienie
    // Na razie uproszczenie: resetujemy stan
    dispatch({ type: 'RESET' });
    cancelGeneration();
  };

  const handleCancel = () => {
    dispatch({ type: 'RESET' });
    cancelGeneration();
  };

  const handleUpdateProposal = useCallback(
    (id: string, newFront: string, newBack: string) => {
      dispatch({ type: 'UPDATE_TEXT', payload: { id, newFront, newBack } });
    },
    []
  );

  const handleToggleSelectProposal = useCallback(
    (id: string, isSelected: boolean) => {
      dispatch({ type: 'TOGGLE_SELECT', payload: { id, isSelected } });
    },
    []
  );

  const handleToggleSelectAll = useCallback((isSelected: boolean) => {
    dispatch({ type: 'TOGGLE_SELECT_ALL', payload: { isSelected } });
  }, []);

  const handleToggleEdit = useCallback((id: string, isEditing: boolean) => {
    dispatch({ type: 'TOGGLE_EDIT', payload: { id, isEditing } });
  }, []);

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

  const mapProposalToFlashcard = (p: ProposalState): FlashcardProposal => {
    const source: FlashcardProposal['source'] =
      p.original.front === p.current.front && p.original.back === p.current.back
        ? 'ai-full'
        : 'ai-edited';
    return {
      ...p.current,
      source,
    };
  };

  const handleSaveAll = async () => {
    const flashcardsToSave: FlashcardProposal[] = proposalsState
      .filter((p) => p.isValid)
      .map(mapProposalToFlashcard);

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

export default GenerateView;

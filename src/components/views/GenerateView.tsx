import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useGeneration } from '@/lib/hooks/useGeneration';
import { useProposals } from '@/lib/hooks/useProposals';
import FlashcardProposalList from '@/components/generate/FlashcardProposalList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

const queryClient = new QueryClient();

const GenerateViewContent = () => {
  const {
    proposals: apiProposals,
    generationState,
    generationId,
    generate,
    save,
    cancelGeneration,
  } = useGeneration();

  const {
    proposals: proposalsState,
    initialize: initializeProposals,
    updateText: updateProposalText,
    toggleSelect,
    toggleSelectAll,
    toggleEdit,
    reset: resetProposals,
  } = useProposals();

  const [text, setText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const MIN_CHARS = 1000;
  const MAX_CHARS = 10000;

  useEffect(() => {
    if (apiProposals) {
      initializeProposals(apiProposals);
    }
  }, [apiProposals, initializeProposals]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setCharCount(newText.length);
  };

  const handleGenerate = () => {
    if (text.length < MIN_CHARS || text.length > MAX_CHARS) {
      toast.error('Text must be between 1,000 and 10,000 characters');
      return;
    }
    generate({ sourceText: text });
  };

  const handleSave = async () => {
    if (!generationId) {
      toast.error('Missing generation ID. Please try again.');
      return;
    }

    const flashcardsToSave = proposalsState
      .filter((p) => p.isSelected && p.isValid)
      .map((p) => ({
        front: p.current.front,
        back: p.current.back,
        source:
          p.current.front === p.original.front &&
          p.current.back === p.original.back
            ? ('ai-full' as const)
            : ('ai-edited' as const),
      }));

    if (flashcardsToSave.length === 0) {
      toast.error('No valid flashcards to save.');
      return;
    }

    const result = await save({
      generationId,
      flashcards: flashcardsToSave,
    });

    if (result.success) {
      toast.success('Flashcards saved successfully!');
      window.location.href = '/flashcards';
    } else {
      toast.error('Error saving flashcards.', {
        description: result.error,
      });
    }
  };

  const isLoading = generationState === 'loading';
  const showForm =
    generationState === 'success' &&
    proposalsState &&
    proposalsState.length > 0;
  const selectedCount = proposalsState?.filter((p) => p.isSelected).length ?? 0;

  const getTextLengthMessage = () => {
    if (charCount < MIN_CHARS) {
      const remaining = MIN_CHARS - charCount;
      return `Need ${remaining} more characters minimum`;
    }
    if (charCount > MAX_CHARS) {
      const excess = charCount - MAX_CHARS;
      return `${excess} characters over limit`;
    }
    return 'Text length is good';
  };

  const getGenerateButtonText = () => {
    if (isLoading) {
      return (
        <>
          <span className="loading loading-spinner loading-sm mr-2"></span>
          Generating...
        </>
      );
    }
    return 'Generate Flashcards';
  };

  const getSaveButtonText = () => (isLoading ? 'Saving...' : 'Save Selected');

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            AI Flashcard Generator
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Paste your text (1,000 to 10,000 characters) to generate a set of
            flashcards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Paste your text here to generate flashcards..."
              className="min-h-[300px] resize-none font-medium"
              value={text}
              onChange={handleTextChange}
            />
            <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
              {charCount} / {MAX_CHARS}
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={(charCount / MAX_CHARS) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              {getTextLengthMessage()}
            </p>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={
              charCount < MIN_CHARS || charCount > MAX_CHARS || isLoading
            }
            onClick={handleGenerate}
          >
            {getGenerateButtonText()}
          </Button>
        </CardContent>
      </Card>

      {showForm && proposalsState && (
        <div className="mt-8">
          <FlashcardProposalList
            proposals={proposalsState}
            selectedCount={selectedCount}
            onToggleSelectAll={toggleSelectAll}
            onToggleSelect={toggleSelect}
            onToggleEdit={toggleEdit}
            onUpdate={updateProposalText}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetProposals();
                cancelGeneration();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isLoading ||
                proposalsState.filter((p) => p.isSelected && p.isValid)
                  .length === 0
              }
            >
              {getSaveButtonText()}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function GenerateView() {
  return (
    <QueryClientProvider client={queryClient}>
      <GenerateViewContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

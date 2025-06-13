import { useState, useEffect } from 'react';
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getFlashcards } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from '@/lib/hooks/useNavigate';
import type { Flashcard } from '@/types';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/utils';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

function FlashcardContent({
  front,
  back,
  isFlipped,
}: {
  front: string;
  back: string;
  isFlipped: boolean;
}) {
  return (
    <div className="relative w-full h-full min-h-[250px]">
      {/* Front of card */}
      <div
        className={cn(
          'absolute inset-0 w-full h-full flex items-center justify-center p-6 transition-all duration-500',
          isFlipped ? 'opacity-0 rotate-y-180' : 'opacity-100 rotate-y-0'
        )}
      >
        <div className="text-xl">{front}</div>
      </div>
      {/* Back of card */}
      <div
        className={cn(
          'absolute inset-0 w-full h-full flex items-center justify-center p-6 transition-all duration-500',
          isFlipped ? 'opacity-100 rotate-y-0' : 'opacity-0 rotate-y-180'
        )}
      >
        <div className="text-xl">{back}</div>
      </div>
    </div>
  );
}

function ReviewFlashcardsContent() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewFlashcards, setReviewFlashcards] = useState<Flashcard[]>([]);

  // Get all flashcards with a large pageSize to ensure we get them all
  const {
    data: flashcardsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['flashcards'],
    queryFn: () => {
      const params = new URLSearchParams({
        pageSize: '100', // Get a large number of flashcards
        sortBy: 'created_at',
        order: 'desc',
      });
      return getFlashcards(params);
    },
  });

  useEffect(() => {
    if (flashcardsResponse?.data) {
      const shuffled = [...flashcardsResponse.data]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 11) + 10); // Random number between 10-20
      setReviewFlashcards(shuffled);
    }
  }, [flashcardsResponse]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-semibold mb-4">
          Error Loading Flashcards
        </h2>
        <p className="text-gray-600 mb-6">
          {error instanceof Error ? error.message : 'Failed to load flashcards'}
        </p>
        <Button onClick={() => navigate('/flashcards')}>
          Return to Flashcards
        </Button>
      </div>
    );
  }

  if (!flashcardsResponse?.data?.length) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">No Flashcards Available</h2>
        <p className="text-gray-600 mb-6">
          You need to create some flashcards before you can start reviewing.
        </p>
        <Button onClick={() => navigate('/flashcards/create')}>
          Create Flashcards
        </Button>
      </div>
    );
  }

  if (!reviewFlashcards.length) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">No Flashcards Selected</h2>
        <p className="text-gray-600 mb-6">
          There was an error selecting flashcards for review.
        </p>
        <Button onClick={() => navigate('/flashcards')}>
          Return to Flashcards
        </Button>
      </div>
    );
  }

  const handleNext = () => {
    if (currentIndex < reviewFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      toast.success('Review session completed!');
      navigate('/flashcards');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const currentFlashcard = reviewFlashcards[currentIndex];
  const isLastCard = currentIndex === reviewFlashcards.length - 1;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 text-sm text-gray-600">
        Card {currentIndex + 1} of {reviewFlashcards.length}
      </div>

      <Card
        className="min-h-[300px] cursor-pointer transition-all duration-300 hover:shadow-lg"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <FlashcardContent
          front={currentFlashcard.front}
          back={currentFlashcard.back}
          isFlipped={isFlipped}
        />
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        <Button onClick={handleNext}>{isLastCard ? 'Finish' : 'Next'}</Button>
      </div>
    </div>
  );
}

export function ReviewFlashcards() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReviewFlashcardsContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

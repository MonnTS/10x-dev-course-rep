import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function CreateFlashcardFAB() {
  return (
    <Button
      asChild
      size="lg"
      className="fixed bottom-8 right-8 rounded-full shadow-lg"
    >
      <a href="/flashcards/new">
        <Plus className="h-6 w-6" />
        <span className="ml-2">Create Flashcard</span>
      </a>
    </Button>
  );
}

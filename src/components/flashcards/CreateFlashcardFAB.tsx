import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function CreateFlashcardFAB() {
  return (
    <Button
      asChild
      className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
    >
      <a href="/generate">
        <Plus className="h-8 w-8" />
        <span className="sr-only">Create new flashcard</span>
      </a>
    </Button>
  );
}

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, PenLine } from 'lucide-react';

export function CreateFlashcardChoice() {
  return (
    <div className="w-full max-w-5xl">
      <div className="grid gap-8 md:grid-cols-2 place-items-center">
        <Card className="group relative w-full overflow-hidden border-2 border-transparent bg-card transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardHeader className="space-y-2 relative">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary/20 transition-colors">
                <Sparkles className="h-6 w-6" />
              </div>
              AI Generation
            </CardTitle>
            <CardDescription className="text-base">
              Let AI help you create flashcards from your text content
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <p className="text-sm text-muted-foreground">
              Perfect for quickly converting your study materials into
              flashcards. Just paste your text and let AI do the work.
            </p>
            <Button
              asChild
              className="w-full text-lg py-6 bg-primary/90 hover:bg-primary transition-colors shadow-lg hover:shadow-xl"
            >
              <a
                href="/generate"
                className="flex items-center justify-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Generate with AI
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="group relative w-full overflow-hidden border-2 border-transparent bg-card transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardHeader className="space-y-2 relative">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary/20 transition-colors">
                <PenLine className="h-6 w-6" />
              </div>
              Manual Creation
            </CardTitle>
            <CardDescription className="text-base">
              Create your flashcards manually with full control
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <p className="text-sm text-muted-foreground">
              Create flashcards exactly the way you want them. Perfect for
              specific concepts or custom content.
            </p>
            <Button
              asChild
              variant="outline"
              className="w-full text-lg py-6 hover:bg-primary/5 hover:text-primary transition-colors border-2"
            >
              <a
                href="/flashcards/create"
                className="flex items-center justify-center gap-2"
              >
                <PenLine className="h-5 w-5" />
                Create Manually
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

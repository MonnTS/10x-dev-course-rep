import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { PenLine } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import type { CreateFlashcard } from '@/types';
import {
  createFlashcardSchema,
  FLASHCARD_FRONT_MAX_LENGTH,
  FLASHCARD_BACK_MAX_LENGTH,
} from '@/lib/validators/flashcard.validator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

type CreateFlashcardFormData = z.infer<typeof createFlashcardSchema>;

async function createFlashcard(
  data: CreateFlashcardFormData
): Promise<{ id: string }> {
  const response = await fetch('/api/v1/flashcards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      source: 'manual' as const,
      generation_id: null,
    } satisfies CreateFlashcard),
  });

  const responseData = await response.json();

  if (!response.ok) {
    if (
      responseData.error === 'Invalid flashcard data' &&
      Array.isArray(responseData.details)
    ) {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      // @ts-expect-error - Adding custom property for validation errors
      error.validationErrors = responseData.details;
      throw error;
    }
    throw new Error(responseData.error || 'Failed to create flashcard');
  }

  return responseData;
}

function CreateFlashcardFormContent() {
  const [shouldNavigate, setShouldNavigate] = useState(false);

  const form = useForm<CreateFlashcardFormData>({
    resolver: zodResolver(createFlashcardSchema),
    defaultValues: {
      front: '',
      back: '',
    },
  });

  useEffect(() => {
    if (shouldNavigate) {
      window.location.href = '/flashcards';
    }
  }, [shouldNavigate]);

  const navigateToList = useCallback(() => {
    setShouldNavigate(true);
  }, []);

  const createFlashcardMutation = useMutation({
    mutationFn: createFlashcard,
    onSuccess: () => {
      toast.success('Flashcard created successfully', {
        description: 'Redirecting to flashcards list...',
      });
      // Short delay to show the success message before redirecting
      setTimeout(navigateToList, 1000);
    },
    onError: (error) => {
      // Handle validation errors from the server
      if (error instanceof Error && error.name === 'ValidationError') {
        // @ts-expect-error - Accessing custom property
        const validationErrors = error.validationErrors;

        // Set form errors from server validation
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach((err) => {
            if (err.path?.[0]) {
              form.setError(err.path[0] as 'front' | 'back', {
                type: 'server',
                message: err.message,
              });
            }
          });

          // Show a toast with the first validation error
          const firstError = validationErrors[0];
          toast.error('Validation Error', {
            description:
              firstError?.message || 'Please check the form for errors',
          });
        }
      } else {
        toast.error('Failed to create flashcard', {
          description:
            error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    },
  });

  const onSubmit = (data: CreateFlashcardFormData) => {
    // Clear any existing errors before submitting
    form.clearErrors();
    createFlashcardMutation.mutate(data);
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <Card className="group relative w-full max-w-2xl overflow-hidden border-2 border-transparent bg-card transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <CardHeader className="space-y-2 relative">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary/20 transition-colors">
              <PenLine className="h-6 w-6" />
            </div>
            Create New Flashcard
          </CardTitle>
          <CardDescription className="text-base">
            Fill in both sides of your flashcard below. Front side is limited to{' '}
            {FLASHCARD_FRONT_MAX_LENGTH} characters, back side to{' '}
            {FLASHCARD_BACK_MAX_LENGTH} characters.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="front"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Front Side
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the question or concept"
                        className="resize-none min-h-[100px] bg-background/50 focus:bg-background transition-colors"
                        maxLength={FLASHCARD_FRONT_MAX_LENGTH}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center mt-1">
                      <FormMessage />
                      <span className="text-sm text-muted-foreground">
                        {field.value.length} / {FLASHCARD_FRONT_MAX_LENGTH}
                      </span>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="back"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Back Side
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the answer or explanation"
                        className="resize-none min-h-[150px] bg-background/50 focus:bg-background transition-colors"
                        maxLength={FLASHCARD_BACK_MAX_LENGTH}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center mt-1">
                      <FormMessage />
                      <span className="text-sm text-muted-foreground">
                        {field.value.length} / {FLASHCARD_BACK_MAX_LENGTH}
                      </span>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 text-lg py-6 bg-primary/90 hover:bg-primary transition-colors shadow-lg hover:shadow-xl"
                  disabled={createFlashcardMutation.isPending}
                >
                  <div className="flex items-center justify-center gap-2">
                    <PenLine className="h-5 w-5" />
                    {createFlashcardMutation.isPending
                      ? 'Creating...'
                      : 'Create Flashcard'}
                  </div>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="text-lg py-6 transition-colors border-2"
                  onClick={navigateToList}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export function CreateFlashcardForm() {
  return (
    <QueryClientProvider client={queryClient}>
      <CreateFlashcardFormContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

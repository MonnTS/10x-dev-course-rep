import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateFlashcardSchema } from '@/lib/validators/flashcard.validator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface Props {
  flashcardId: string;
}

type FormValues = z.infer<typeof updateFlashcardSchema> & {
  source?: string;
} & {
  front: string;
  back: string;
};

export function EditFlashcardForm({ flashcardId }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const form = useForm<FormValues>({
    resolver: zodResolver(
      updateFlashcardSchema.extend({
        front: z.string().min(1),
        back: z.string().min(1),
      })
    ),
    defaultValues: {
      front: '',
      back: '',
    },
  });

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/v1/flashcards/${flashcardId}`);
      if (res.ok) {
        const data = await res.json();

        form.reset({ front: data.front, back: data.back });
      }
      setIsLoading(false);
    }
    fetchData();
  }, [flashcardId]);

  async function onSubmit(values: FormValues) {
    const res = await fetch(`/api/v1/flashcards/${flashcardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      // eslint-disable-next-line react-compiler/react-compiler
      window.location.href = '/flashcards';
    } else {
      // handle error (simple)
      alert('Failed to update');
    }
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Edit Flashcard</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="front"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Front</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="back"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Back</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

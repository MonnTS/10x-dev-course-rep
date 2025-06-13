import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { generateFlashcardsSchema } from '@/lib/validators/generation.validator';

const MAX_LENGTH = 10_000;

interface SourceTextFormProps {
  // eslint-disable-next-line no-unused-vars
  onGenerate: (sourceText: string) => void;
  isLoading: boolean;
}

const SourceTextForm = ({ onGenerate, isLoading }: SourceTextFormProps) => {
  const form = useForm<z.infer<typeof generateFlashcardsSchema>>({
    resolver: zodResolver(generateFlashcardsSchema),
    defaultValues: {
      sourceText: '',
    },
    mode: 'onChange',
  });

  const textLength = form.watch('sourceText').length;

  const handleSubmit = form.handleSubmit(({ sourceText }) => {
    if (!isLoading) {
      onGenerate(sourceText);
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid w-full gap-1.5">
        <Label htmlFor="source-text" className="sr-only">
          Wklej tekst źródłowy
        </Label>
        <Textarea
          id="source-text"
          placeholder="Wklej tutaj tekst (od 1000 do 10000 znaków), z którego wygenerujemy fiszki..."
          {...form.register('sourceText')}
          rows={15}
          disabled={isLoading}
          className="min-h-[250px]"
        />
        <p
          className={`text-sm text-right ${
            form.formState.errors.sourceText
              ? 'text-red-500'
              : 'text-muted-foreground'
          }`}
        >
          {textLength} / {MAX_LENGTH}
        </p>
        {form.formState.errors.sourceText && (
          <p className="text-destructive text-sm">
            {form.formState.errors.sourceText.message as string}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!form.formState.isValid || isLoading}
        className="w-full"
      >
        {isLoading ? 'Generowanie...' : 'Generuj fiszki'}
      </Button>
    </form>
  );
};

export default SourceTextForm;

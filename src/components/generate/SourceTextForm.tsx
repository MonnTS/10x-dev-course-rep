import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const MIN_LENGTH = 1000;
const MAX_LENGTH = 10000;

interface SourceTextFormProps {
  // eslint-disable-next-line no-unused-vars
  onGenerate: (sourceText: string) => void;
  isLoading: boolean;
}

const SourceTextForm = ({ onGenerate, isLoading }: SourceTextFormProps) => {
  const [sourceText, setSourceText] = useState('');
  const textLength = sourceText.length;
  const isValid = textLength >= MIN_LENGTH && textLength <= MAX_LENGTH;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isValid && !isLoading) {
      onGenerate(sourceText);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid w-full gap-1.5">
        <Label htmlFor="source-text">Wklej tekst źródłowy</Label>
        <Textarea
          id="source-text"
          placeholder="Wklej tutaj tekst (od 1000 do 10000 znaków), z którego wygenerujemy fiszki..."
          value={sourceText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setSourceText(e.target.value)
          }
          rows={15}
          disabled={isLoading}
          className="min-h-[250px]"
        />
        <p
          className={`text-sm text-right ${
            textLength > 0 && !isValid
              ? 'text-red-500'
              : 'text-muted-foreground'
          }`}
        >
          {textLength} / {MAX_LENGTH}
        </p>
      </div>
      <Button type="submit" disabled={!isValid || isLoading} className="w-full">
        {isLoading ? 'Generowanie...' : 'Generuj fiszki'}
      </Button>
    </form>
  );
};

export default SourceTextForm;

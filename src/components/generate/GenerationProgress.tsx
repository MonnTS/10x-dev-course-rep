import { Button } from '@/components/ui/button';

interface GenerationProgressProps {
  status: 'loading' | 'error';
  error: string | null;
  onCancel: () => void;
  onRetry: () => void;
}

const GenerationProgress = ({
  status,
  error,
  onCancel,
  onRetry,
}: GenerationProgressProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-center space-y-4 p-8">
      {status === 'loading' && (
        <>
          <p className="text-lg">Analizowanie tekstu i generowanie fiszek...</p>
          <div className="flex justify-center py-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            To może potrwać kilkadziesiąt sekund.
          </p>
          <Button variant="destructive" onClick={onCancel}>
            Anuluj
          </Button>
        </>
      )}
      {status === 'error' && (
        <>
          <p className="text-lg text-destructive">Wystąpił błąd</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex gap-4 pt-2">
            <Button variant="outline" onClick={onRetry}>
              Spróbuj ponownie
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              Anuluj
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default GenerationProgress;

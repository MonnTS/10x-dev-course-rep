import { Button } from '@/components/ui/button';

interface FlashcardsToolbarProps {
  selectedCount: number;
  onDeleteSelected: () => void;
  isDeleting: boolean;
}

export function FlashcardsToolbar({
  selectedCount,
  onDeleteSelected,
  isDeleting,
}: FlashcardsToolbarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1">{/* TODO: Add filtering options here */}</div>
      <div className="flex items-center space-x-2">
        {hasSelection && (
          <Button
            variant="destructive"
            onClick={onDeleteSelected}
            disabled={!hasSelection || isDeleting}
          >
            {isDeleting ? 'Deleting...' : `Delete (${selectedCount}) Selected`}
          </Button>
        )}
      </div>
    </div>
  );
}

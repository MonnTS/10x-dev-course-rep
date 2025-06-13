import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, PlayCircle } from 'lucide-react';
import type { SortField, SortOrder } from '@/lib/hooks/useFlashcards';
import { useNavigate } from '@/lib/hooks/useNavigate';

interface FlashcardsToolbarProps {
  selectedCount: number;
  onDeleteSelected: () => void;
  isDeleting: boolean;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
  onSortOrderChange: (order: SortOrder) => void;
  sourceFilter: string;
  onSourceFilterChange: (source: string) => void;
  availableSources: string[];
  totalFlashcards: number;
}

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'source', label: 'Source' },
  { value: 'front', label: 'Front Side' },
  { value: 'back', label: 'Back Side' },
];

export function FlashcardsToolbar({
  selectedCount,
  onDeleteSelected,
  isDeleting,
  sortBy,
  sortOrder,
  onSortChange,
  onSortOrderChange,
  sourceFilter,
  onSourceFilterChange,
  availableSources,
  totalFlashcards,
}: FlashcardsToolbarProps) {
  const hasSelection = selectedCount > 0;
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-4 gap-4">
      <div className="flex items-center gap-2">
        <Select
          value={sourceFilter === '' ? 'all' : sourceFilter}
          onValueChange={(value) =>
            onSourceFilterChange(value === 'all' ? '' : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {availableSources.map((source) => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')
          }
          className="px-2"
        >
          <ArrowUpDown
            className={`h-4 w-4 ${
              sortOrder === 'desc' ? 'rotate-180' : ''
            } transition-transform`}
          />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {hasSelection ? (
          <Button
            variant="destructive"
            onClick={onDeleteSelected}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : `Delete Selected (${selectedCount})`}
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={() => navigate('/review')}
            disabled={totalFlashcards === 0}
            className="flex items-center gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            Start Review
          </Button>
        )}
      </div>
    </div>
  );
}

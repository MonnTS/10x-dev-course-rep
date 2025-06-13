import type { Flashcard } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionMenu } from './ActionMenu';

interface FlashcardsTableProps {
  flashcards: Flashcard[];
  selectedIds: Set<string>;
  onToggleSelectAll: (isSelected: boolean) => void;
  onToggleSelectRow: (id: string) => void;
  onDeleteSingle: (id: string) => void;
}

export function FlashcardsTable({
  flashcards,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectRow,
  onDeleteSingle,
}: FlashcardsTableProps) {
  const allVisibleSelected =
    flashcards.length > 0 && flashcards.every((f) => selectedIds.has(f.id));
  const isIndeterminate =
    !allVisibleSelected &&
    selectedIds.size > 0 &&
    flashcards.some((f) => selectedIds.has(f.id));

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={allVisibleSelected}
                // @ts-expect-error - Radix Checkbox supports indeterminate state
                indeterminate={isIndeterminate}
                onCheckedChange={(checked) => onToggleSelectAll(!!checked)}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Front</TableHead>
            <TableHead>Back</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flashcards.length > 0 ? (
            flashcards.map((flashcard) => (
              <TableRow
                key={flashcard.id}
                data-state={selectedIds.has(flashcard.id) && 'selected'}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(flashcard.id)}
                    onCheckedChange={() => onToggleSelectRow(flashcard.id)}
                    aria-label={`Select row ${flashcard.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium whitespace-normal break-words max-w-[300px]">
                  {flashcard.front}
                </TableCell>
                <TableCell className="whitespace-normal break-words">
                  {flashcard.back}
                </TableCell>
                <TableCell>{flashcard.source}</TableCell>
                <TableCell>
                  {new Date(flashcard.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <ActionMenu
                    flashcardId={flashcard.id}
                    onDelete={() => onDeleteSingle(flashcard.id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

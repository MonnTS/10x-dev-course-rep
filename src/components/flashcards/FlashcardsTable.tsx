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
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FlashcardsTableProps {
  flashcards: Flashcard[];
  selectedIds: Set<string>;
  onToggleSelectAll: (isSelected: boolean) => void;
  onToggleSelectRow: (id: string) => void;
  onDeleteRow: (id: string) => void;
}

export function FlashcardsTable({
  flashcards,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectRow,
  onDeleteRow,
}: FlashcardsTableProps) {
  const allVisibleSelected =
    flashcards.length > 0 && flashcards.every((f) => selectedIds.has(f.id));
  const someSelected =
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
                data-state={
                  someSelected
                    ? 'indeterminate'
                    : allVisibleSelected
                      ? 'checked'
                      : 'unchecked'
                }
                onCheckedChange={onToggleSelectAll}
                aria-label="Select all"
                disabled={flashcards.length === 0}
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
                    onDelete={() => onDeleteRow(flashcard.id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-lg text-muted-foreground">
                    It is so empty... Let&apos;s create new flashcards
                  </p>
                  <Button asChild variant="outline">
                    <a
                      href="/flashcards/new"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Flashcard
                    </a>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

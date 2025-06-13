import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useFlashcards } from '@/lib/hooks/useFlashcards';
import { FlashcardsTable } from '@/components/flashcards/FlashcardsTable';
import { FlashcardsToolbar } from '@/components/flashcards/FlashcardsToolbar';
import { DeleteConfirmationDialog } from '@/components/flashcards/DeleteConfirmationDialog';
import { PaginationControls } from '@/components/flashcards/PaginationControls';
import { CreateFlashcardFAB } from '@/components/flashcards/CreateFlashcardFAB';

const queryClient = new QueryClient();

type DialogState =
  | { type: 'closed' }
  | { type: 'delete-single'; id: string }
  | { type: 'delete-bulk'; ids: string[] };

function FlashcardsViewContent() {
  const {
    data,
    isLoading,
    isError,
    error,
    singleDeleteMutation,
    bulkDeleteMutation,
    page,
    setPage,
  } = useFlashcards();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogState, setDialogState] = useState<DialogState>({
    type: 'closed',
  });

  const flashcards = data?.data ?? [];

  const handleToggleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedIds(new Set(flashcards.map((f) => f.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const newSelectedIds = new Set(prev);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }
      return newSelectedIds;
    });
  };

  const handleDeleteConfirm = () => {
    if (dialogState.type === 'delete-single') {
      singleDeleteMutation.mutate(dialogState.id, {
        onSuccess: () => setDialogState({ type: 'closed' }),
      });
    } else if (dialogState.type === 'delete-bulk') {
      bulkDeleteMutation.mutate(dialogState.ids, {
        onSuccess: () => {
          setDialogState({ type: 'closed' });
          setSelectedIds(new Set());
        },
      });
    }
  };

  const isDeleting =
    singleDeleteMutation.isPending || bulkDeleteMutation.isPending;

  if (isLoading) {
    return <div>Loading...</div>; // TODO: Replace with Skeleton Loader
  }

  if (isError) {
    // TODO: Improve error display
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Flashcards</h1>
      <FlashcardsToolbar
        selectedCount={selectedIds.size}
        onDeleteSelected={() =>
          setDialogState({ type: 'delete-bulk', ids: Array.from(selectedIds) })
        }
        isDeleting={bulkDeleteMutation.isPending}
      />
      <FlashcardsTable
        flashcards={flashcards}
        selectedIds={selectedIds}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSelectRow={handleToggleSelectRow}
        onDeleteSingle={(id: string) =>
          setDialogState({ type: 'delete-single', id })
        }
      />
      <PaginationControls
        currentPage={page}
        totalPages={data?.pagination?.pages ?? 1}
        onPageChange={setPage}
      />
      <DeleteConfirmationDialog
        isOpen={dialogState.type !== 'closed'}
        onOpenChange={(isOpen) => !isOpen && setDialogState({ type: 'closed' })}
        onConfirm={handleDeleteConfirm}
        isPending={isDeleting}
        itemCount={
          dialogState.type === 'delete-single'
            ? 1
            : dialogState.type === 'delete-bulk'
              ? dialogState.ids.length
              : 0
        }
      />
      <CreateFlashcardFAB />
    </div>
  );
}

export default function FlashcardsView() {
  return (
    <QueryClientProvider client={queryClient}>
      <FlashcardsViewContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

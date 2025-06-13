import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useFlashcards } from '@/lib/hooks/useFlashcards';
import { FlashcardsTable } from '@/components/flashcards/FlashcardsTable';
import { FlashcardsToolbar } from '@/components/flashcards/FlashcardsToolbar';
import { DeleteConfirmationDialog } from '@/components/flashcards/DeleteConfirmationDialog';
import { PaginationControls } from '@/components/flashcards/PaginationControls';
import { CreateFlashcardFAB } from '@/components/flashcards/CreateFlashcardFAB';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

type DialogState =
  | { type: 'closed' }
  | { type: 'delete-single'; id: string }
  | { type: 'delete-bulk'; ids: string[] };

function FlashcardsViewContent() {
  const {
    data,
    isLoading,
    isError,
    singleDeleteMutation,
    bulkDeleteMutation,
    page,
    setPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    sourceFilter,
    setSourceFilter,
  } = useFlashcards();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogState, setDialogState] = useState<DialogState>({
    type: 'closed',
  });

  const flashcards = data?.data ?? [];
  const totalFlashcards = data?.pagination?.total ?? 0;
  const availableSources = Array.from(
    new Set(flashcards.map((f) => f.source))
  ).filter(Boolean);

  const filteredFlashcards = flashcards;

  const handleToggleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedIds(new Set(filteredFlashcards.map((f) => f.id)));
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
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 h-10 animate-pulse bg-muted rounded-md w-[180px]" />
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              Loading flashcards...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {'Error Loading Flashcards'}
          </CardTitle>
          <CardDescription>{'Something went wrong'}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FlashcardsToolbar
        selectedCount={selectedIds.size}
        onDeleteSelected={() =>
          setDialogState({
            type: 'delete-bulk',
            ids: Array.from(selectedIds),
          })
        }
        isDeleting={isDeleting}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={setSortBy}
        onSortOrderChange={setSortOrder}
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
        availableSources={availableSources}
        totalFlashcards={totalFlashcards}
      />

      <FlashcardsTable
        flashcards={filteredFlashcards}
        selectedIds={selectedIds}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSelectRow={handleToggleSelectRow}
        onDeleteRow={(id) => setDialogState({ type: 'delete-single', id })}
      />

      {data?.pagination && (
        <PaginationControls
          currentPage={page}
          totalPages={data.pagination.pages}
          onPageChange={setPage}
        />
      )}

      <CreateFlashcardFAB />

      <DeleteConfirmationDialog
        isOpen={dialogState.type !== 'closed'}
        onClose={() => setDialogState({ type: 'closed' })}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
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

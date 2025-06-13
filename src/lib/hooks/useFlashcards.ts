import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFlashcards, deleteFlashcard } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';
import type { FlashcardsListResponse } from '@/types';

export function useFlashcards() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default page size

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'front' | 'back'>(
    'created_at'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const query = useQuery({
    queryKey: ['flashcards', page, pageSize, searchTerm, sortBy, sortOrder],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search: searchTerm,
        sortBy,
        sortOrder,
      });
      return getFlashcards(params);
    },
    placeholderData: (previousData) => previousData,
  });

  const singleDeleteMutation = useMutation({
    mutationFn: (id: string) => deleteFlashcard(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['flashcards'] });

      const previous = queryClient.getQueryData<FlashcardsListResponse>([
        'flashcards',
        page,
        pageSize,
        searchTerm,
        sortBy,
        sortOrder,
      ]);

      if (previous) {
        queryClient.setQueryData(
          ['flashcards', page, pageSize, searchTerm, sortBy, sortOrder],
          {
            ...previous,
            data: previous.data.filter((f) => f.id !== id),
          }
        );
      }

      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ['flashcards', page, pageSize, searchTerm, sortBy, sortOrder],
          context.previous
        );
      }
      toast.error('Failed to delete flashcard.');
    },
    onSuccess: () => {
      toast.success('Flashcard deleted');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) => deleteFlashcard(id))
      );
      const failedDeletes = results.filter(
        (result) => result.status === 'rejected'
      );
      if (failedDeletes.length > 0) {
        toast.warning(`${failedDeletes.length} flashcards failed to delete`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      toast.success('Selected flashcards deleted');
    },
    onError: () => {
      toast.error('Failed to delete selected flashcards');
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });

  return {
    ...query,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    singleDeleteMutation,
    bulkDeleteMutation,
  };
}

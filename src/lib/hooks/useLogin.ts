import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { loginUser } from '@/lib/api';

export function useLogin() {
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      toast.success('Zalogowano pomyślnie');
      // eslint-disable-next-line react-compiler/react-compiler
      window.location.href = '/flashcards';
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    },
  });

  return mutation;
}

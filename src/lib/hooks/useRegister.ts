import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { registerUser } from '@/lib/api';

export function useRegister() {
  // Astro's default client-side router is the browser history API; we can use window.location for simplicity
  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Rejestracja zakończona sukcesem! Sprawdź email.');
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Registration failed'
      );
    },
  });

  return mutation;
}

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestPasswordReset } from '@/lib/api';

export function useForgotPassword() {
  return useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      toast.success('Jeśli konto istnieje, wysłaliśmy link resetujący.');
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Reset password failed'
      );
    },
  });
}

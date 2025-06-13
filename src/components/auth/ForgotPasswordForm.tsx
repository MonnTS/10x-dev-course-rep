import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useForgotPassword } from '@/lib/hooks/useForgotPassword';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ForgotPasswordSchema } from '@/lib/validators/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/utils';

function ForgotPasswordFormInner({ className }: { className?: string }) {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const forgotPasswordMutation = useForgotPassword();

  async function onSubmit(values: z.infer<typeof ForgotPasswordSchema>) {
    setIsSuccess(false);
    form.clearErrors();
    forgotPasswordMutation.mutate(values, {
      onSuccess: () => setIsSuccess(true),
      onError: (error) => {
        form.setError('root', {
          type: 'manual',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to send reset link. Please try again.',
        });
      },
    });
  }

  const isSubmitting = forgotPasswordMutation.isPending;

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="text-center">
        <CardTitle>Resetuj hasło</CardTitle>
        <CardDescription>
          Podaj swój email, aby otrzymać link do zresetowania hasła.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      {...field}
                      disabled={isSubmitting || isSuccess}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <FormMessage>{form.formState.errors.root.message}</FormMessage>
            )}

            {isSuccess ? (
              <p className="text-green-600 text-center">
                Jeśli konto istnieje, wysłaliśmy wiadomość z linkiem do
                resetowania hasła.
              </p>
            ) : (
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Wysyłanie…' : 'Wyślij link resetujący'}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-sm text-center block">
        <a href="/login" className="text-blue-600 hover:underline">
          Wróć do logowania
        </a>
      </CardFooter>
    </Card>
  );
}

export function ForgotPasswordForm({ className }: { className?: string }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ForgotPasswordFormInner className={className} />
    </QueryClientProvider>
  );
}

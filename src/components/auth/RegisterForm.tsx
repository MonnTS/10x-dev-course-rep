import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { RegisterSchema } from '@/lib/validators/auth';
import { useRegister } from '@/lib/hooks/useRegister';
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function RegisterFormInner({ className }: { className?: string }) {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const registerMutation = useRegister();

  async function onSubmit(values: z.infer<typeof RegisterSchema>) {
    setIsSuccess(false);
    form.clearErrors();
    registerMutation.mutate(values, {
      onSuccess: () => {
        setIsSuccess(true);
      },
      onError: (error) => {
        form.setError('root', {
          type: 'manual',
          message:
            error instanceof Error
              ? error.message
              : 'Registration failed. Please try again.',
        });
      },
    });
  }

  const isSubmitting = registerMutation.isPending;

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="text-center">
        <CardTitle>Stwórz konto</CardTitle>
        <CardDescription>
          Podaj swój email i hasło, aby kontynuować
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
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hasło</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potwierdź hasło</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isSubmitting}
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
                Registration successful! Please check your email for a
                confirmation link.
              </p>
            ) : (
              <>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Rejestracja...' : 'Zarejestruj się'}
                </Button>
              </>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-sm text-center block">
        Masz już konto?{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Zaloguj się
        </a>
      </CardFooter>
    </Card>
  );
}

export function RegisterForm({ className }: { className?: string }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <RegisterFormInner className={className} />
    </QueryClientProvider>
  );
}

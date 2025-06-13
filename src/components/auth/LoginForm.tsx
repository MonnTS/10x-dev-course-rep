import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

import { LoginSchema } from '@/lib/validators/auth';
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

export function LoginForm({ className }: { className?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    setIsSubmitting(true);
    form.clearErrors();

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        window.location.href = '/flashcards';
      } else {
        form.setError('root', {
          type: 'manual',
          message: 'Nieprawidłowy email lub hasło.',
        });
      }
    } catch {
      form.setError('root', {
        type: 'manual',
        message: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="text-center">
        <CardTitle>Zaloguj się</CardTitle>
        <CardDescription>
          Podaj swój email i hasło, aby uzyskać dostęp do panelu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {form.formState.errors.root && (
              <FormMessage>{form.formState.errors.root.message}</FormMessage>
            )}
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-sm text-center block space-y-2">
        <p>
          Nie masz konta?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Zarejestruj się
          </a>
        </p>
        <p>
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Nie pamiętasz hasła?
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}

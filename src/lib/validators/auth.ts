import { z } from 'zod';

export const RegisterSchema = z
  .object({
    email: z.string().email({ message: 'Niepoprawny format adresu email' }),
    password: z
      .string()
      .min(8, { message: 'Hasło musi mieć co najmniej 8 znaków' })
      .regex(/[A-Z]/, {
        message: 'Hasło musi zawierać co najmniej jedną wielką literę',
      })
      .regex(/[0-9]/, {
        message: 'Hasło musi zawierać co najmniej jedną cyfrę',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła muszą być takie same',
    path: ['confirmPassword'],
  });

export const LoginSchema = z.object({
  email: z
    .string()
    .nonempty({ message: 'Email jest wymagany' })
    .email({ message: 'Niepoprawny format adresu email' }),
  password: z.string().nonempty({ message: 'Hasło jest wymagane' }),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Niepoprawny format adresu email' }),
});

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Hasło musi mieć co najmniej 8 znaków' })
      .regex(/[A-Z]/, {
        message: 'Hasło musi zawierać co najmniej jedną wielką literę',
      })
      .regex(/[0-9]/, {
        message: 'Hasło musi zawierać co najmniej jedną cyfrę',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła muszą być takie same',
    path: ['confirmPassword'],
  });

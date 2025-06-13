import { describe, it, expect } from 'vitest';
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
} from '@/lib/validators/auth';

describe('Auth Validators', () => {
  describe('RegisterSchema', () => {
    it('passes with valid data', () => {
      const result = RegisterSchema.safeParse({
        email: 'user@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
      });
      expect(result.success).toBe(true);
    });

    it('fails when passwords do not match', () => {
      const result = RegisterSchema.safeParse({
        email: 'user@example.com',
        password: 'Password1',
        confirmPassword: 'Different1',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.flatten().fieldErrors.confirmPassword
        ).toBeDefined();
      }
    });

    it('fails when password lacks uppercase letter', () => {
      const result = RegisterSchema.safeParse({
        email: 'user@example.com',
        password: 'password1',
        confirmPassword: 'password1',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('LoginSchema', () => {
    it('passes with valid credentials', () => {
      expect(
        LoginSchema.safeParse({ email: 'a@b.com', password: 'secret' }).success
      ).toBe(true);
    });

    it('fails with empty password', () => {
      expect(
        LoginSchema.safeParse({ email: 'a@b.com', password: '' }).success
      ).toBe(false);
    });
  });

  describe('ForgotPasswordSchema', () => {
    it('valid email passes', () => {
      expect(ForgotPasswordSchema.safeParse({ email: 'a@b.com' }).success).toBe(
        true
      );
    });

    it('invalid email fails', () => {
      expect(
        ForgotPasswordSchema.safeParse({ email: 'not-an-email' }).success
      ).toBe(false);
    });
  });
});

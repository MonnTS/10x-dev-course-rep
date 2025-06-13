import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RegisterForm } from '@/components/auth/RegisterForm';

describe('<RegisterForm />', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows validation error when confirm password mismatch', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'new@user.com' },
    });
    fireEvent.change(screen.getByLabelText(/^hasło$/i), {
      target: { value: 'Password1' },
    });
    fireEvent.change(screen.getByLabelText(/potwierdź hasło/i), {
      target: { value: 'Different1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /zarejestruj się/i }));

    const error = await screen.findByText(/hasła muszą być takie same/i);
    expect(error).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('calls register endpoint with correct payload on success', async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({ ok: true });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'new@user.com' },
    });
    fireEvent.change(screen.getByLabelText(/^hasło$/i), {
      target: { value: 'Password1' },
    });
    fireEvent.change(screen.getByLabelText(/potwierdź hasło/i), {
      target: { value: 'Password1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /zarejestruj się/i }));

    await screen.findByText(
      /Registration successful! Please check your email for a confirmation link./i
    );
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/auth/register',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'new@user.com',
          password: 'Password1',
          confirmPassword: 'Password1',
        }),
      })
    );
  });
});

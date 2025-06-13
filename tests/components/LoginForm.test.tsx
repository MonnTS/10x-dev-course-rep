import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';

vi.mock('next/router', () => ({}));

describe('<LoginForm />', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls login endpoint with correct payload', async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({ ok: true });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/hasło/i), {
      target: { value: 'Secret123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /zaloguj się/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: JSON.stringify({
            email: 'user@example.com',
            password: 'Secret123',
          }),
        })
      );
    });
  });

  it('shows error when credentials invalid', async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({ ok: false });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/hasło/i), {
      target: { value: 'Secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /zaloguj się/i }));

    const error = await screen.findByText(/nieprawidłowy email lub hasło/i);
    expect(error).toBeInTheDocument();
  });
});

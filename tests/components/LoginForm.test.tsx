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
  let locationHref = '';

  beforeEach(() => {
    global.fetch = vi.fn();
    locationHref = '';
    Object.defineProperty(window, 'location', {
      value: {
        get href() {
          return locationHref;
        },
        set href(value: string) {
          locationHref = value;
        },
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls login endpoint with correct payload', async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Secret123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

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

    await waitFor(() => {
      expect(locationHref).toBe('/flashcards');
    });
  });

  it('shows error when credentials invalid', async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({ ok: false });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    const error = await screen.findByText(/invalid email or password/i);
    expect(error).toBeInTheDocument();
  });
});

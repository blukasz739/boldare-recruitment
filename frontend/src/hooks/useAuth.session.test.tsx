import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from './useAuth';
import { useAuth } from './authContext';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../types/auth';

vi.mock('../api/auth', () => ({
  login: vi.fn().mockResolvedValue({ token: 't1', user: { id: 1, username: 'a' } }),
  register: vi.fn(),
}));

function Harness() {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <span>{isAuthenticated ? 'authed' : 'guest'}</span>
      <button onClick={() => void login({ username: 'a', password: 'secret123' })}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

function renderHarness() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Harness />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  localStorage.clear();
});

describe('AuthProvider session', () => {
  it('persists the session on login and clears it on logout', async () => {
    renderHarness();
    expect(screen.getByText('guest')).toBeInTheDocument();

    await userEvent.click(screen.getByText('login'));
    expect(await screen.findByText('authed')).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('t1');

    await act(async () => {
      await userEvent.click(screen.getByText('logout'));
    });
    expect(screen.getByText('guest')).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
  });
});

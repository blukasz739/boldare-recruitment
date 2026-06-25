import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AuthProvider } from './useAuth';
import { useAuth } from './authContext';
import { UNAUTHORIZED_EVENT } from '../api/client';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../types/auth';

function AuthProbe() {
  const { isAuthenticated } = useAuth();
  return <div>{isAuthenticated ? 'authed' : 'guest'}</div>;
}

function renderWithAuth() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  localStorage.clear();
});

describe('AuthProvider', () => {
  it('treats a corrupted stored user as logged out', () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'token');
    localStorage.setItem(USER_STORAGE_KEY, '{"unexpected":true}');

    renderWithAuth();

    expect(screen.getByText('guest')).toBeInTheDocument();
  });

  it('logs out when an unauthorized event is dispatched', () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'token');
    localStorage.setItem(USER_STORAGE_KEY, '{"id":1,"username":"a"}');

    renderWithAuth();
    expect(screen.getByText('authed')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    });

    expect(screen.getByText('guest')).toBeInTheDocument();
  });
});

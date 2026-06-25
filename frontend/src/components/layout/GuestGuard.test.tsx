import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { GuestGuard } from './AuthGuard';
import { renderWithProviders } from '../../test/renderWithProviders';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../../types/auth';

afterEach(() => {
  localStorage.clear();
});

describe('GuestGuard', () => {
  it('redirects an authenticated user to the dashboard', () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'token');
    localStorage.setItem(USER_STORAGE_KEY, '{"id":1,"username":"a"}');

    renderWithProviders(
      <Routes>
        <Route element={<GuestGuard />}>
          <Route path="/login" element={<div>Login page</div>} />
        </Route>
        <Route path="/dashboard" element={<div>Dashboard page</div>} />
      </Routes>,
      { route: '/login' },
    );

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });

  it('lets a guest see the login page', () => {
    renderWithProviders(
      <Routes>
        <Route element={<GuestGuard />}>
          <Route path="/login" element={<div>Login page</div>} />
        </Route>
        <Route path="/dashboard" element={<div>Dashboard page</div>} />
      </Routes>,
      { route: '/login' },
    );

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
});

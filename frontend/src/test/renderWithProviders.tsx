import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';
import i18n from '../i18n';

export function renderWithProviders(
  ui: ReactNode,
  { route = '/' }: { route?: string } = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <I18nextProvider i18n={i18n}>
            <MantineProvider>{ui}</MantineProvider>
          </I18nextProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

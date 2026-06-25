import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { CategoryBadge } from './CategoryBadge';

function renderBadge(category: 'entertainment' | 'music' | 'work_tools' | 'other') {
  return render(
    <MantineProvider>
      <I18nextProvider i18n={i18n}>
        <CategoryBadge category={category} />
      </I18nextProvider>
    </MantineProvider>,
  );
}

describe('CategoryBadge', () => {
  it('renders translated entertainment label in English', async () => {
    await i18n.changeLanguage('en');
    renderBadge('entertainment');
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
  });

  it('renders translated music label in Polish', async () => {
    await i18n.changeLanguage('pl');
    renderBadge('music');
    expect(screen.getByText('Muzyka i audio')).toBeInTheDocument();
  });
});

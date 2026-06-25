import { SegmentedControl } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <SegmentedControl
      size="xs"
      value={i18n.language.startsWith('pl') ? 'pl' : 'en'}
      onChange={(value) => void i18n.changeLanguage(value)}
      data={[
        { label: 'EN', value: 'en' },
        { label: 'PL', value: 'pl' },
      ]}
    />
  );
}

import { SegmentedControl, useMantineColorScheme } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { colorScheme } = useMantineColorScheme();

  return (
    <SegmentedControl
      size="xs"
      value={i18n.language.startsWith('pl') ? 'pl' : 'en'}
      onChange={(value) => void i18n.changeLanguage(value)}
      data={[
        { label: 'EN', value: 'en' },
        { label: 'PL', value: 'pl' },
      ]}
      color={colorScheme === 'dark' ? 'neutral.7' : 'neutral.2'}
      styles={{
        root: {
          backgroundColor:
            colorScheme === 'dark'
              ? 'var(--mantine-color-neutral-8)'
              : 'var(--mantine-color-neutral-1)',
        },
        label: {
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: '0.04em',
        },
      }}
    />
  );
}

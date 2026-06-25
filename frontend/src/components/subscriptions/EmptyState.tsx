import { Button, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  onAdd: () => void;
  onImport: () => void;
}

export function EmptyState({ onAdd, onImport }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <Stack align="center" gap="md" py="xl">
      <Title order={3}>{t('dashboard.emptyTitle')}</Title>
      <Text c="dimmed" ta="center" maw={420}>
        {t('dashboard.emptyDescription')}
      </Text>
      <Stack gap="sm">
        <Button onClick={onAdd}>{t('dashboard.add')}</Button>
        <Button variant="light" onClick={onImport}>
          {t('dashboard.import')}
        </Button>
      </Stack>
    </Stack>
  );
}

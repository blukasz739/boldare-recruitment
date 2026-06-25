import { Paper, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export function FilteredEmptyState() {
  const { t } = useTranslation();

  return (
    <Paper className="surface" p="xl" withBorder style={{ borderStyle: 'dashed' }}>
      <Stack align="center" gap="sm" py="lg">
        <Title order={4} ta="center">
          {t('dashboard.filterNoResults')}
        </Title>
        <Text c="dimmed" ta="center" size="sm" maw={400}>
          {t('dashboard.filterNoResultsHint')}
        </Text>
      </Stack>
    </Paper>
  );
}

import { Box, Button, Paper, Stack, Text, Title } from '@mantine/core';
import { IconFileImport, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  onAdd: () => void;
  onImport: () => void;
}

export function EmptyState({ onAdd, onImport }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <Paper className="surface" p="xl" withBorder style={{ borderStyle: 'dashed' }}>
      <Stack align="center" gap="lg" py="xl">
        <Box
          w={64}
          h={64}
          style={{
            borderRadius: 16,
            background: 'var(--mantine-color-accent-5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconPlus size={28} color="#18181b" stroke={2} />
        </Box>

        <Stack align="center" gap="xs" maw={400}>
          <Title order={3} ta="center">
            {t('dashboard.emptyTitle')}
          </Title>
          <Text c="dimmed" ta="center" size="sm" lh={1.6}>
            {t('dashboard.emptyDescription')}
          </Text>
        </Stack>

        <Stack gap="sm" w="100%" maw={320}>
          <Button
            onClick={onAdd}
            color="accent"
            c="dark.9"
            fw={700}
            leftSection={<IconPlus size={18} />}
            fullWidth
          >
            {t('dashboard.add')}
          </Button>
          <Button
            onClick={onImport}
            variant="outline"
            color="gray"
            leftSection={<IconFileImport size={18} />}
            fullWidth
          >
            {t('dashboard.import')}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

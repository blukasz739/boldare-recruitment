import { Button, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconFileImport, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../types/subscription';
import type { SubscriptionSortMode } from '../../utils/subscriptionFilters';
import { formatCurrency } from '../../utils/formatCurrency';
import { CategoryFilterChips } from './CategoryFilterChips';
import { SubscriptionSortControl } from './SubscriptionSortControl';

interface DashboardStatsProps {
  monthlyTotal: number | string;
  count: number;
  onAdd: () => void;
  onImport: () => void;
  showFilters?: boolean;
  activeCategories: Set<Category>;
  onToggleCategory: (category: Category) => void;
  sortMode: SubscriptionSortMode;
  onSortChange: (mode: SubscriptionSortMode) => void;
}

export function DashboardStats({
  monthlyTotal,
  count,
  onAdd,
  onImport,
  showFilters = false,
  activeCategories,
  onToggleCategory,
  sortMode,
  onSortChange,
}: DashboardStatsProps) {
  const { t } = useTranslation();

  return (
    <Paper className="stat-card-accent surface" p="xl" withBorder>
      <Stack gap="lg">
        <Group justify="space-between" align="center" wrap="wrap" gap="lg">
          <Stack gap="xs" style={{ flex: 1, minWidth: 200 }}>
            <Text size="sm" c="dimmed" tt="uppercase" fw={600} lts={1}>
              {t('dashboard.title')}
            </Text>
            <Group gap="sm" align="baseline" wrap="wrap">
              <Title
                order={1}
                style={{
                  fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                {formatCurrency(monthlyTotal)}
              </Title>
              <Text size="lg" c="dimmed" fw={500}>
                {t('dashboard.perMonth')}
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              {t('dashboard.active', { count })}
            </Text>
          </Stack>

          <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
            <Button
              onClick={onAdd}
              color="accent"
              c="dark.9"
              fw={700}
              leftSection={<IconPlus size={18} />}
              h={48}
            >
              {t('dashboard.add')}
            </Button>
            <Button
              onClick={onImport}
              variant="outline"
              color="gray"
              leftSection={<IconFileImport size={18} />}
              h={48}
            >
              {t('dashboard.import')}
            </Button>
          </Group>
        </Group>

        {showFilters && (
          <>
            <Divider color="var(--mantine-color-default-border)" />
            <Group justify="space-between" align="center" wrap="wrap" gap="md">
              <CategoryFilterChips
                activeCategories={activeCategories}
                onToggle={onToggleCategory}
              />
              <SubscriptionSortControl value={sortMode} onChange={onSortChange} />
            </Group>
          </>
        )}
      </Stack>
    </Paper>
  );
}

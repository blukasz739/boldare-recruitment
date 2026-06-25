import { Group, SegmentedControl, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { SubscriptionSortMode } from '../../utils/subscriptionFilters';

interface SubscriptionSortControlProps {
  value: SubscriptionSortMode;
  onChange: (value: SubscriptionSortMode) => void;
}

export function SubscriptionSortControl({
  value,
  onChange,
}: SubscriptionSortControlProps) {
  const { t } = useTranslation();

  const data = [
    { label: t('dashboard.sortCostDesc'), value: 'cost_desc' },
    { label: t('dashboard.sortCostAsc'), value: 'cost_asc' },
    { label: t('dashboard.sortNameAsc'), value: 'name_asc' },
  ];

  return (
    <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={1} visibleFrom="sm">
        {t('dashboard.sortLabel')}
      </Text>
      <SegmentedControl
        size="xs"
        value={value}
        onChange={(next) => onChange(next as SubscriptionSortMode)}
        data={data}
        color="accent"
        styles={{
          root: {
            background: 'light-dark(rgba(0,0,0,0.04), rgba(255,255,255,0.06))',
          },
          label: {
            fontWeight: 600,
            fontSize: 12,
            padding: '0 10px',
          },
        }}
      />
    </Group>
  );
}

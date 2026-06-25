import { Group, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatCurrency';

interface MonthlyTotalProps {
  monthlyTotal: number | string;
  count: number;
}

export function MonthlyTotal({ monthlyTotal, count }: MonthlyTotalProps) {
  const { t } = useTranslation();

  return (
    <Group gap="xs" align="baseline">
      <Title order={2}>
        {formatCurrency(monthlyTotal)} {t('dashboard.perMonth')}
      </Title>
      <Text c="dimmed" size="lg">
        · {t('dashboard.active', { count })}
      </Text>
    </Group>
  );
}

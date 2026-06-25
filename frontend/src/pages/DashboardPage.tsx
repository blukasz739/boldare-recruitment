import { Button, Container, Group, Loader, Stack, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { AppShellLayout } from '../components/layout/AppHeader';
import { EmptyState } from '../components/subscriptions/EmptyState';
import { MonthlyTotal } from '../components/subscriptions/MonthlyTotal';
import { SubscriptionGrid } from '../components/subscriptions/SubscriptionGrid';
import {
  useSubscriptionSummary,
  useSubscriptions,
} from '../hooks/useSubscriptions';
import type { SubscriptionWithShare } from '../utils/subscriptionShare';

export function DashboardPage() {
  const { t } = useTranslation();
  const { data: subscriptions, isLoading } = useSubscriptions();
  const { data: summary } = useSubscriptionSummary();

  const monthlyTotal = summary?.monthly_total ?? 0;
  const count = summary?.count ?? 0;
  const items = subscriptions ?? [];

  const handleEdit = (_subscription: SubscriptionWithShare) => {};
  const handleDelete = (_subscription: SubscriptionWithShare) => {};

  return (
    <AppShellLayout variant="dashboard">
      <Container size="lg">
        <Stack gap="lg">
          <Stack gap="xs">
            <Title order={1}>{t('dashboard.title')}</Title>
            <MonthlyTotal monthlyTotal={monthlyTotal} count={count} />
            <Group>
              <Button>{t('dashboard.add')}</Button>
              <Button variant="light">{t('dashboard.import')}</Button>
            </Group>
          </Stack>

          {isLoading ? (
            <Group justify="center" py="xl">
              <Loader />
            </Group>
          ) : items.length === 0 ? (
            <EmptyState onAdd={() => {}} onImport={() => {}} />
          ) : (
            <SubscriptionGrid
              subscriptions={items}
              totalMonthly={monthlyTotal}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </Stack>
      </Container>
    </AppShellLayout>
  );
}

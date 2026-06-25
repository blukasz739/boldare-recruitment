import { Button, Container, Group, Loader, Stack, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppShellLayout } from '../components/layout/AppHeader';
import { AddSubscriptionModal } from '../components/modals/AddSubscriptionModal';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';
import { EditSubscriptionModal } from '../components/modals/EditSubscriptionModal';
import { ImportModal } from '../components/modals/ImportModal';
import { EmptyState } from '../components/subscriptions/EmptyState';
import { MonthlyTotal } from '../components/subscriptions/MonthlyTotal';
import { SubscriptionGrid } from '../components/subscriptions/SubscriptionGrid';
import {
  useSubscriptionSummary,
  useSubscriptions,
} from '../hooks/useSubscriptions';
import type { Subscription } from '../types/subscription';
import type { SubscriptionWithShare } from '../utils/subscriptionShare';

export function DashboardPage() {
  const { t } = useTranslation();
  const { data: subscriptions, isLoading } = useSubscriptions();
  const { data: summary } = useSubscriptionSummary();

  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [importOpened, { open: openImport, close: closeImport }] =
    useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);

  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

  const monthlyTotal = summary?.monthly_total ?? 0;
  const count = summary?.count ?? 0;
  const items = subscriptions ?? [];

  const handleEdit = (subscription: SubscriptionWithShare) => {
    setSelectedSubscription(subscription);
    openEdit();
  };

  const handleDelete = (subscription: SubscriptionWithShare) => {
    setSelectedSubscription(subscription);
    openDelete();
  };

  return (
    <AppShellLayout variant="dashboard">
      <Container size="lg">
        <Stack gap="lg">
          <Stack gap="xs">
            <Title order={1}>{t('dashboard.title')}</Title>
            <MonthlyTotal monthlyTotal={monthlyTotal} count={count} />
            <Group>
              <Button onClick={openAdd}>{t('dashboard.add')}</Button>
              <Button variant="light" onClick={openImport}>
                {t('dashboard.import')}
              </Button>
            </Group>
          </Stack>

          {isLoading ? (
            <Group justify="center" py="xl">
              <Loader />
            </Group>
          ) : items.length === 0 ? (
            <EmptyState onAdd={openAdd} onImport={openImport} />
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

      <AddSubscriptionModal opened={addOpened} onClose={closeAdd} />
      <EditSubscriptionModal
        opened={editOpened}
        onClose={closeEdit}
        subscription={selectedSubscription}
      />
      <DeleteConfirmModal
        opened={deleteOpened}
        onClose={closeDelete}
        subscription={selectedSubscription}
      />
      <ImportModal opened={importOpened} onClose={closeImport} />
    </AppShellLayout>
  );
}

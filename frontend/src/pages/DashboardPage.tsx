import { Box, Container, Loader, Stack } from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';

import { useMemo, useState } from 'react';

import { AppShellLayout } from '../components/layout/AppHeader';

import { AddSubscriptionModal } from '../components/modals/AddSubscriptionModal';

import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';

import { EditSubscriptionModal } from '../components/modals/EditSubscriptionModal';

import { ImportModal } from '../components/modals/ImportModal';

import { DashboardStats } from '../components/subscriptions/DashboardStats';

import { EmptyState } from '../components/subscriptions/EmptyState';

import { FilteredEmptyState } from '../components/subscriptions/FilteredEmptyState';

import { SubscriptionGrid } from '../components/subscriptions/SubscriptionGrid';

import {

  useSubscriptionSummary,

  useSubscriptions,

} from '../hooks/useSubscriptions';

import { CATEGORIES, type Category, type Subscription } from '../types/subscription';

import {

  processSubscriptions,

  type SubscriptionSortMode,

} from '../utils/subscriptionFilters';

import type { SubscriptionWithShare } from '../utils/subscriptionShare';

const EMPTY_SUBSCRIPTIONS: Subscription[] = [];

export function DashboardPage() {

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

  const [sortMode, setSortMode] = useState<SubscriptionSortMode>('cost_desc');

  const [activeCategories, setActiveCategories] = useState<Set<Category>>(

    () => new Set(CATEGORIES),

  );



  const monthlyTotal = summary?.monthly_total ?? 0;

  const count = summary?.count ?? 0;

  const items = subscriptions ?? EMPTY_SUBSCRIPTIONS;



  const filteredItems = useMemo(

    () => processSubscriptions(items, activeCategories, sortMode),

    [items, activeCategories, sortMode],

  );



  const handleToggleCategory = (category: Category) => {

    setActiveCategories((current) => {

      const next = new Set(current);



      if (next.has(category)) {

        if (next.size > 1) {

          next.delete(category);

        }

      } else {

        next.add(category);

      }



      return next;

    });

  };



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

      <Container size="lg" py="md">

        <Stack gap="xl">

          <DashboardStats

            monthlyTotal={monthlyTotal}

            count={count}

            onAdd={openAdd}

            onImport={openImport}

            showFilters={items.length > 0}

            activeCategories={activeCategories}

            onToggleCategory={handleToggleCategory}

            sortMode={sortMode}

            onSortChange={setSortMode}

          />



          {isLoading ? (

            <Box py={80} ta="center">

              <Loader color="accent" size="lg" type="dots" />

            </Box>

          ) : items.length === 0 ? (

            <EmptyState onAdd={openAdd} onImport={openImport} />

          ) : filteredItems.length === 0 ? (

            <FilteredEmptyState />

          ) : (

            <SubscriptionGrid

              subscriptions={filteredItems}

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


import { ActionIcon, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  getDesktopGridSpan,
  getMobileTileHeight,
  type SubscriptionWithShare,
} from '../../utils/subscriptionShare';
import { CategoryBadge } from './CategoryBadge';

interface SubscriptionTileProps {
  subscription: SubscriptionWithShare;
  onEdit: (subscription: SubscriptionWithShare) => void;
  onDelete: (subscription: SubscriptionWithShare) => void;
}

export function SubscriptionTile({
  subscription,
  onEdit,
  onDelete,
}: SubscriptionTileProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const billingLabel =
    subscription.billing_cycle === 'monthly'
      ? t('subscription.perMonth')
      : t('subscription.perYear');

  const percent = Math.round(subscription.share * 100);

  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      style={{
        gridColumn: isMobile ? '1 / -1' : `span ${getDesktopGridSpan(subscription.share)}`,
        minHeight: isMobile
          ? getMobileTileHeight(subscription.share)
          : 140,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Title order={3} lineClamp={2}>
            {subscription.name}
          </Title>
          <Group gap={4} wrap="nowrap">
            <ActionIcon
              variant="subtle"
              aria-label={t('subscription.editTitle')}
              onClick={() => onEdit(subscription)}
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              aria-label={t('subscription.deleteTitle')}
              onClick={() => onDelete(subscription)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>

        <Text fw={600} size="lg">
          {formatCurrency(subscription.amount)} {billingLabel}
        </Text>

        <Text size="sm" c="dimmed">
          {t('dashboard.share', { percent })}
        </Text>

        <CategoryBadge category={subscription.category} />
      </Stack>
    </Paper>
  );
}

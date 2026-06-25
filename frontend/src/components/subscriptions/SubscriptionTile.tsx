import { ActionIcon, Box, Group, Stack, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { CATEGORY_TILE_STYLES } from '../../theme/categoryColors';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  getDesktopGridRowSpan,
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
  const tileStyle = CATEGORY_TILE_STYLES[subscription.category];

  return (
    <Box
      className="bento-tile"
      p="lg"
      style={{
        gridColumn: isMobile ? '1 / -1' : `span ${getDesktopGridSpan(subscription.share)}`,
        gridRow: isMobile ? 'auto' : `span ${getDesktopGridRowSpan(subscription.share)}`,
        minHeight: isMobile ? getMobileTileHeight(subscription.share) : 140,
        background: tileStyle.bg,
        color: tileStyle.text,
        borderRadius: 'var(--mantine-radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Stack gap="sm" style={{ flex: 1 }}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Title
            order={3}
            lineClamp={2}
            style={{
              color: tileStyle.text,
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              letterSpacing: '-0.02em',
            }}
          >
            {subscription.name}
          </Title>
          <Group gap={6} wrap="nowrap">
            <ActionIcon
              className="tile-action"
              size="md"
              radius="md"
              aria-label={t('subscription.editTitle')}
              onClick={() => onEdit(subscription)}
            >
              <IconPencil size={15} />
            </ActionIcon>
            <ActionIcon
              className="tile-action tile-action--danger"
              size="md"
              radius="md"
              aria-label={t('subscription.deleteTitle')}
              onClick={() => onDelete(subscription)}
            >
              <IconTrash size={15} />
            </ActionIcon>
          </Group>
        </Group>

        <Box mt="auto">
          <Text
            fw={700}
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              color: tileStyle.text,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            {formatCurrency(subscription.amount)}
          </Text>
          <Text size="sm" opacity={0.75} mt={2}>
            {billingLabel}
          </Text>
        </Box>
      </Stack>

      <Group justify="space-between" align="center" mt="md">
        <CategoryBadge category={subscription.category} variant="onColor" />
        <Text size="sm" fw={600} opacity={0.85}>
          {t('dashboard.share', { percent })}
        </Text>
      </Group>
    </Box>
  );
}

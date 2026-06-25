import { Button, Group, Modal, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useSubscriptionMutations } from '../../hooks/useSubscriptions';
import type { Subscription } from '../../types/subscription';

interface DeleteConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  subscription: Subscription | null;
}

export function DeleteConfirmModal({
  opened,
  onClose,
  subscription,
}: DeleteConfirmModalProps) {
  const { t } = useTranslation();
  const { deleteMutation } = useSubscriptionMutations();

  const handleDelete = async () => {
    if (!subscription) {
      return;
    }

    await deleteMutation.mutateAsync(subscription.id);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('subscription.deleteTitle')}
      centered
    >
      <Text mb="lg">
        {t('subscription.deleteConfirm', { name: subscription?.name ?? '' })}
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          {t('subscription.cancel')}
        </Button>
        <Button
          color="red"
          loading={deleteMutation.isPending}
          onClick={() => void handleDelete()}
        >
          {t('subscription.delete')}
        </Button>
      </Group>
    </Modal>
  );
}

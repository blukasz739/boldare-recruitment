import { useTranslation } from 'react-i18next';
import { useSubscriptionMutations } from '../../hooks/useSubscriptions';
import type { SubscriptionFormValues } from '../../schemas/subscription';
import { SubscriptionFormModal } from './SubscriptionFormModal';

interface AddSubscriptionModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AddSubscriptionModal({ opened, onClose }: AddSubscriptionModalProps) {
  const { t } = useTranslation();
  const { createMutation } = useSubscriptionMutations();

  const handleSubmit = async (values: SubscriptionFormValues) => {
    await createMutation.mutateAsync(values);
  };

  return (
    <SubscriptionFormModal
      opened={opened}
      onClose={onClose}
      title={t('subscription.addTitle')}
      submitLabel={t('subscription.add')}
      loading={createMutation.isPending}
      onSubmit={handleSubmit}
    />
  );
}

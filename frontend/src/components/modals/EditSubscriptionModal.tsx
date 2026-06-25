import { useTranslation } from 'react-i18next';
import { useSubscriptionMutations } from '../../hooks/useSubscriptions';
import type { SubscriptionFormValues } from '../../schemas/subscription';
import type { Subscription } from '../../types/subscription';
import { SubscriptionFormModal } from './SubscriptionFormModal';

interface EditSubscriptionModalProps {
  opened: boolean;
  onClose: () => void;
  subscription: Subscription | null;
}

export function EditSubscriptionModal({
  opened,
  onClose,
  subscription,
}: EditSubscriptionModalProps) {
  const { t } = useTranslation();
  const { updateMutation } = useSubscriptionMutations();

  const handleSubmit = async (values: SubscriptionFormValues) => {
    if (!subscription) {
      return;
    }

    await updateMutation.mutateAsync({ id: subscription.id, input: values });
  };

  const initialValues: SubscriptionFormValues | undefined = subscription
    ? {
        name: subscription.name,
        amount: subscription.amount,
        billing_cycle: subscription.billing_cycle,
        category: subscription.category,
      }
    : undefined;

  return (
    <SubscriptionFormModal
      opened={opened}
      onClose={onClose}
      title={t('subscription.editTitle')}
      submitLabel={t('subscription.save')}
      initialValues={initialValues}
      loading={updateMutation.isPending}
      onSubmit={handleSubmit}
    />
  );
}

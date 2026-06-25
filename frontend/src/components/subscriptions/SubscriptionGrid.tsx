import type { Subscription } from '../../types/subscription';
import { enrichSubscriptions } from '../../utils/subscriptionShare';
import { SubscriptionTile } from './SubscriptionTile';
import type { SubscriptionWithShare } from '../../utils/subscriptionShare';

interface SubscriptionGridProps {
  subscriptions: Subscription[];
  totalMonthly: number;
  onEdit: (subscription: SubscriptionWithShare) => void;
  onDelete: (subscription: SubscriptionWithShare) => void;
}

export function SubscriptionGrid({
  subscriptions,
  totalMonthly,
  onEdit,
  onDelete,
}: SubscriptionGridProps) {
  const enriched = enrichSubscriptions(subscriptions, totalMonthly);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 'var(--mantine-spacing-md)',
        alignItems: 'stretch',
      }}
    >
      {enriched.map((subscription) => (
        <SubscriptionTile
          key={subscription.id}
          subscription={subscription}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

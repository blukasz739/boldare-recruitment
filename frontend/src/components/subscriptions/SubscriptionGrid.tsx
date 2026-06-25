import { SubscriptionTile } from './SubscriptionTile';
import type { SubscriptionWithShare } from '../../utils/subscriptionShare';

interface SubscriptionGridProps {
  subscriptions: SubscriptionWithShare[];
  onEdit: (subscription: SubscriptionWithShare) => void;
  onDelete: (subscription: SubscriptionWithShare) => void;
}

export function SubscriptionGrid({
  subscriptions,
  onEdit,
  onDelete,
}: SubscriptionGridProps) {
  return (
    <div className="bento-grid">
      {subscriptions.map((subscription) => (
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

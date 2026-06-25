import type { Category, Subscription } from '../types/subscription';
import {
  getMonthlyEquivalent,
  getShare,
  type SubscriptionWithShare,
} from './subscriptionShare';

export type SubscriptionSortMode = 'cost_desc' | 'cost_asc' | 'name_asc';

export function filterByCategories(
  subscriptions: Subscription[],
  activeCategories: Set<Category>,
): Subscription[] {
  return subscriptions.filter((subscription) =>
    activeCategories.has(subscription.category),
  );
}

export function addShareToSubscriptions(
  subscriptions: Subscription[],
  totalMonthly: number | string,
): SubscriptionWithShare[] {
  return subscriptions.map((subscription) => {
    const monthlyEquivalent = getMonthlyEquivalent(
      subscription.amount,
      subscription.billing_cycle,
    );

    return {
      ...subscription,
      monthlyEquivalent,
      share: getShare(monthlyEquivalent, totalMonthly),
    };
  });
}

export function sortSubscriptions(
  subscriptions: SubscriptionWithShare[],
  sortMode: SubscriptionSortMode,
): SubscriptionWithShare[] {
  const sorted = [...subscriptions];

  switch (sortMode) {
    case 'cost_asc':
      return sorted.sort((a, b) => a.monthlyEquivalent - b.monthlyEquivalent);
    case 'name_asc':
      return sorted.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
      );
    case 'cost_desc':
    default:
      return sorted.sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent);
  }
}

function getFilteredMonthlyTotal(subscriptions: Subscription[]): number {
  return subscriptions.reduce(
    (total, subscription) =>
      total +
      getMonthlyEquivalent(subscription.amount, subscription.billing_cycle),
    0,
  );
}

export function processSubscriptions(
  subscriptions: Subscription[],
  activeCategories: Set<Category>,
  sortMode: SubscriptionSortMode,
): SubscriptionWithShare[] {
  const filtered = filterByCategories(subscriptions, activeCategories);
  const filteredTotal = getFilteredMonthlyTotal(filtered);
  const withShare = addShareToSubscriptions(filtered, filteredTotal);

  return sortSubscriptions(withShare, sortMode);
}

import type { BillingCycle, Subscription } from '../types/subscription';

export function getMonthlyEquivalent(
  amount: number,
  billingCycle: BillingCycle,
): number {
  return billingCycle === 'monthly' ? amount : amount / 12;
}

export function getShare(monthlyEquivalent: number, totalMonthly: number): number {
  if (totalMonthly <= 0) {
    return 0;
  }

  return monthlyEquivalent / totalMonthly;
}

export interface SubscriptionWithShare extends Subscription {
  monthlyEquivalent: number;
  share: number;
}

export function enrichSubscriptions(
  subscriptions: Subscription[],
  totalMonthly: number,
): SubscriptionWithShare[] {
  return subscriptions
    .map((subscription) => {
      const monthlyEquivalent = getMonthlyEquivalent(
        subscription.amount,
        subscription.billing_cycle,
      );

      return {
        ...subscription,
        monthlyEquivalent,
        share: getShare(monthlyEquivalent, totalMonthly),
      };
    })
    .sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent);
}

export function getDesktopGridSpan(share: number): number {
  return Math.max(2, Math.min(12, Math.round(share * 12)));
}

export function getMobileTileHeight(share: number): number {
  return Math.max(120, Math.round(share * 500));
}

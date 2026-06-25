import type { BillingCycle, Subscription } from '../types/subscription';
import { toAmount } from './formatCurrency';

export function getMonthlyEquivalent(
  amount: number | string,
  billingCycle: BillingCycle,
): number {
  const numericAmount = toAmount(amount);

  return billingCycle === 'monthly' ? numericAmount : numericAmount / 12;
}

export function getShare(monthlyEquivalent: number, totalMonthly: number | string): number {
  const numericTotal = toAmount(totalMonthly);

  if (numericTotal <= 0) {
    return 0;
  }

  return monthlyEquivalent / numericTotal;
}

export interface SubscriptionWithShare extends Subscription {
  monthlyEquivalent: number;
  share: number;
}

export function enrichSubscriptions(
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

export function getDesktopGridSpan(share: number): number {
  return Math.max(2, Math.min(6, Math.round(share * 6)));
}

export function getDesktopGridRowSpan(share: number): number {
  if (share >= 0.3) return 2;
  if (share >= 0.15) return 2;
  return 1;
}

export function getMobileTileHeight(share: number): number {
  return Math.max(120, Math.round(share * 500));
}

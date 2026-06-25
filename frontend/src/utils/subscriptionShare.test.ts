import { describe, expect, it } from 'vitest';
import { addShareToSubscriptions } from './subscriptionFilters';
import {
  getDesktopGridSpan,
  getMobileTileHeight,
  getMonthlyEquivalent,
  getShare,
} from './subscriptionShare';
import type { Subscription } from '../types/subscription';

const baseSubscription: Subscription = {
  id: 1,
  name: 'Netflix',
  amount: 60,
  billing_cycle: 'monthly',
  category: 'entertainment',
  created_at: '2026-01-01T00:00:00+00:00',
};

describe('subscriptionShare', () => {
  it('calculates monthly equivalent for monthly and yearly cycles', () => {
    expect(getMonthlyEquivalent(60, 'monthly')).toBe(60);
    expect(getMonthlyEquivalent(120, 'yearly')).toBe(10);
  });

  it('calculates share against total monthly cost', () => {
    expect(getShare(60, 100)).toBe(0.6);
    expect(getShare(0, 0)).toBe(0);
  });

  it('enriches subscriptions with monthly equivalent and share', () => {
    const subscriptions: Subscription[] = [
      { ...baseSubscription, id: 1, amount: 12, billing_cycle: 'yearly' },
      { ...baseSubscription, id: 2, amount: 60, billing_cycle: 'monthly' },
    ];

    const enriched = addShareToSubscriptions(subscriptions, 61);

    expect(enriched).toHaveLength(2);
    expect(enriched.find((s) => s.id === 2)?.monthlyEquivalent).toBe(60);
    expect(enriched.find((s) => s.id === 1)?.monthlyEquivalent).toBe(1);
  });

  it('returns sensible grid span and mobile height', () => {
    expect(getDesktopGridSpan(0.5)).toBe(3);
    expect(getDesktopGridSpan(0.01)).toBeGreaterThanOrEqual(2);
    expect(getMobileTileHeight(0.4)).toBeGreaterThanOrEqual(120);
  });
});

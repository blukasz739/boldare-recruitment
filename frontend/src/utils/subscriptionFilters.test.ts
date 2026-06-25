import { describe, expect, it } from 'vitest';
import type { Subscription } from '../types/subscription';
import {
  addShareToSubscriptions,
  filterByCategories,
  processSubscriptions,
  sortSubscriptions,
} from './subscriptionFilters';

const baseSubscription: Subscription = {
  id: 1,
  name: 'Netflix',
  amount: 60,
  billing_cycle: 'monthly',
  category: 'entertainment',
  created_at: '2026-01-01T00:00:00+00:00',
};

describe('subscriptionFilters', () => {
  const subscriptions: Subscription[] = [
    { ...baseSubscription, id: 1, name: 'Spotify', amount: 10, category: 'music' },
    { ...baseSubscription, id: 2, name: 'Netflix', amount: 60, category: 'entertainment' },
    { ...baseSubscription, id: 3, name: 'Adobe', amount: 24, category: 'work_tools' },
  ];

  it('filters subscriptions by active categories', () => {
    const filtered = filterByCategories(
      subscriptions,
      new Set(['entertainment', 'music']),
    );

    expect(filtered).toHaveLength(2);
    expect(filtered.map((s) => s.id)).toEqual([1, 2]);
  });

  it('sorts subscriptions by cost ascending and descending', () => {
    const withShare = addShareToSubscriptions(subscriptions, 94);

    expect(sortSubscriptions(withShare, 'cost_desc').map((s) => s.id)).toEqual([
      2, 3, 1,
    ]);
    expect(sortSubscriptions(withShare, 'cost_asc').map((s) => s.id)).toEqual([
      1, 3, 2,
    ]);
  });

  it('sorts subscriptions alphabetically', () => {
    const withShare = addShareToSubscriptions(subscriptions, 94);
    const sorted = sortSubscriptions(withShare, 'name_asc');

    expect(sorted.map((s) => s.name)).toEqual(['Adobe', 'Netflix', 'Spotify']);
  });

  it('processes filter and sort together with recalculated share', () => {
    const result = processSubscriptions(
      subscriptions,
      new Set(['entertainment', 'music']),
      'cost_asc',
    );

    expect(result).toHaveLength(2);
    expect(result[0]?.name).toBe('Spotify');
    expect(result[1]?.name).toBe('Netflix');
    expect(result[1]?.share).toBeCloseTo(60 / 70);
  });
});

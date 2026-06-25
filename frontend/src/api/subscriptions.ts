import type {
  Subscription,
  SubscriptionInput,
  SubscriptionSummary,
} from '../types/subscription';
import { apiClient } from './client';

export async function fetchSubscriptions(): Promise<Subscription[]> {
  return apiClient<Subscription[]>('/api/subscriptions');
}

export async function fetchSubscriptionSummary(): Promise<SubscriptionSummary> {
  return apiClient<SubscriptionSummary>('/api/subscriptions/summary');
}

export async function createSubscription(
  input: SubscriptionInput,
): Promise<Subscription> {
  return apiClient<Subscription>('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateSubscription(
  id: number,
  input: SubscriptionInput,
): Promise<Subscription> {
  return apiClient<Subscription>(`/api/subscriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function deleteSubscription(id: number): Promise<void> {
  return apiClient<void>(`/api/subscriptions/${id}`, {
    method: 'DELETE',
  });
}

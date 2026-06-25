import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as subscriptionsApi from '../api/subscriptions';
import type { SubscriptionInput } from '../types/subscription';

const subscriptionsQueryKey = ['subscriptions'] as const;
const summaryQueryKey = ['subscriptions', 'summary'] as const;

export function useSubscriptions() {
  return useQuery({
    queryKey: subscriptionsQueryKey,
    queryFn: subscriptionsApi.fetchSubscriptions,
  });
}

export function useSubscriptionSummary() {
  return useQuery({
    queryKey: summaryQueryKey,
    queryFn: subscriptionsApi.fetchSubscriptionSummary,
  });
}

export function useSubscriptionMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey });
    void queryClient.invalidateQueries({ queryKey: summaryQueryKey });
  };

  const createMutation = useMutation({
    mutationFn: subscriptionsApi.createSubscription,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: SubscriptionInput }) =>
      subscriptionsApi.updateSubscription(id, input),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: subscriptionsApi.deleteSubscription,
    onSuccess: invalidate,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    invalidate,
  };
}

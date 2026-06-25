export type BillingCycle = 'monthly' | 'yearly';

export type Category = 'entertainment' | 'music' | 'work_tools' | 'other';

export interface Subscription {
  id: number;
  name: string;
  amount: number | string;
  billing_cycle: BillingCycle;
  category: Category;
  created_at: string;
}

export interface SubscriptionSummary {
  monthly_total: number | string;
  count: number;
}

export interface SubscriptionInput {
  name: string;
  amount: number;
  billing_cycle: BillingCycle;
  category: Category;
}

export interface ImportProposal extends SubscriptionInput {
  selected: boolean;
}

export interface ImportAnalyzeResponse {
  proposals: ImportProposal[];
}

export interface ImportConfirmResponse {
  created: Subscription[];
  count: number;
}

export const MAX_SUBSCRIPTION_AMOUNT = 99_999_999.99;

export const BILLING_CYCLES: BillingCycle[] = ['monthly', 'yearly'];

export const CATEGORIES: Category[] = [
  'entertainment',
  'music',
  'work_tools',
  'other',
];

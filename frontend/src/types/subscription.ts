export type BillingCycle = 'monthly' | 'yearly';

export type Category = 'entertainment' | 'music' | 'work_tools' | 'other';

export interface Subscription {
  id: number;
  name: string;
  amount: number;
  billing_cycle: BillingCycle;
  category: Category;
  created_at: string;
}

export interface SubscriptionSummary {
  monthly_total: number;
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

export const BILLING_CYCLES: BillingCycle[] = ['monthly', 'yearly'];

export const CATEGORIES: Category[] = [
  'entertainment',
  'music',
  'work_tools',
  'other',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  entertainment: 'pink',
  music: 'grape',
  work_tools: 'blue',
  other: 'gray',
};

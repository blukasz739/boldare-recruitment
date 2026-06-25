import type { TFunction } from 'i18next';
import { z } from 'zod';
import {
  BILLING_CYCLES,
  CATEGORIES,
  MAX_SUBSCRIPTION_AMOUNT,
} from '../types/subscription';

export function createSubscriptionSchema(t: TFunction) {
  return z.object({
    name: z
      .string()
      .min(1, t('validation.required'))
      .min(2, t('validation.nameMin')),
    amount: z
      .number({ error: t('validation.required') })
      .positive(t('validation.amountPositive'))
      .max(MAX_SUBSCRIPTION_AMOUNT, t('validation.amountTooLarge')),
    billing_cycle: z.enum(BILLING_CYCLES, {
      error: t('validation.required'),
    }),
    category: z.enum(CATEGORIES, {
      error: t('validation.required'),
    }),
  });
}

export type SubscriptionFormValues = z.infer<
  ReturnType<typeof createSubscriptionSchema>
>;

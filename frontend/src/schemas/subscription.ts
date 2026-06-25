import type { FormValidateInput } from '@mantine/form';
import type { TFunction } from 'i18next';
import { z } from 'zod';
import {
  BILLING_CYCLES,
  CATEGORIES,
  MAX_SUBSCRIPTION_AMOUNT,
  type BillingCycle,
  type Category,
} from '../types/subscription';
import { createZodFieldsValidate } from '../utils/zodFormValidate';

export function createSubscriptionSchema(t: TFunction) {
  return z.object({
    name: z
      .string()
      .min(1, t('validation.required'))
      .min(2, t('validation.nameMin')),
    amount: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z
        .number({ error: t('validation.required') })
        .positive(t('validation.amountPositive'))
        .max(MAX_SUBSCRIPTION_AMOUNT, t('validation.amountTooLarge')),
    ),
    billing_cycle: z.enum(BILLING_CYCLES, {
      error: t('validation.required'),
    }),
    category: z.enum(CATEGORIES, {
      error: t('validation.required'),
    }),
  });
}

export function createSubscriptionValidators(
  t: TFunction,
): FormValidateInput<SubscriptionFormInputValues> {
  return createZodFieldsValidate(
    createSubscriptionSchema(t),
  ) as FormValidateInput<SubscriptionFormInputValues>;
}

export type SubscriptionFormValues = {
  name: string;
  amount: number;
  billing_cycle: BillingCycle;
  category: Category;
};

export type SubscriptionFormInputValues = {
  name: string;
  amount: number | '';
  billing_cycle: BillingCycle;
  category: Category;
};

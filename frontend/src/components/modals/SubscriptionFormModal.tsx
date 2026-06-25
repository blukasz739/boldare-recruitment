import {
  Button,
  Group,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  createSubscriptionSchema,
  type SubscriptionFormValues,
} from '../../schemas/subscription';
import { BILLING_CYCLES, CATEGORIES } from '../../types/subscription';

interface SubscriptionFormModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  initialValues?: SubscriptionFormValues;
  loading?: boolean;
  onSubmit: (values: SubscriptionFormValues) => Promise<void>;
}

const defaultValues: SubscriptionFormValues = {
  name: '',
  amount: 0,
  billing_cycle: 'monthly',
  category: 'entertainment',
};

export function SubscriptionFormModal({
  opened,
  onClose,
  title,
  submitLabel,
  initialValues,
  loading,
  onSubmit,
}: SubscriptionFormModalProps) {
  const { t } = useTranslation();
  const schema = createSubscriptionSchema(t);

  const form = useForm<SubscriptionFormValues>({
    initialValues: initialValues ?? defaultValues,
    validate: zodResolver(schema),
  });

  useEffect(() => {
    if (opened) {
      form.setValues(initialValues ?? defaultValues);
      form.clearErrors();
    }
  }, [opened, initialValues]);

  const handleSubmit = form.onSubmit(async (values) => {
    await onSubmit(values);
    onClose();
  });

  const billingData = BILLING_CYCLES.map((cycle) => ({
    label:
      cycle === 'monthly'
        ? t('subscription.billingMonthly')
        : t('subscription.billingYearly'),
    value: cycle,
  }));

  const categoryData = CATEGORIES.map((category) => ({
    label: t(`categories.${category}`),
    value: category,
  }));

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label={t('subscription.name')}
            {...form.getInputProps('name')}
          />
          <NumberInput
            label={t('subscription.amount')}
            decimalScale={2}
            fixedDecimalScale
            min={0}
            {...form.getInputProps('amount')}
          />
          <SegmentedControl
            fullWidth
            data={billingData}
            {...form.getInputProps('billing_cycle')}
          />
          <Select
            label={t('subscription.category')}
            data={categoryData}
            {...form.getInputProps('category')}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              {t('subscription.cancel')}
            </Button>
            <Button type="submit" loading={loading}>
              {submitLabel}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

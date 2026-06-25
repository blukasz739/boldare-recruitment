import {
  Alert,
  Button,
  Checkbox,
  Group,
  Loader,
  Modal,
  PasswordInput,
  Stack,
  Stepper,
  Text,
  Title,
} from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { IconUpload } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as importApi from '../../api/import';
import { ApiError } from '../../api/client';
import { useSubscriptionMutations } from '../../hooks/useSubscriptions';
import { createImportUploadSchema } from '../../schemas/import';
import type { ImportProposal } from '../../types/subscription';
import { formatCurrency } from '../../utils/formatCurrency';
import { CategoryBadge } from '../subscriptions/CategoryBadge';

interface ImportModalProps {
  opened: boolean;
  onClose: () => void;
}

export function ImportModal({ opened, onClose }: ImportModalProps) {
  const { t } = useTranslation();
  const { invalidate } = useSubscriptionMutations();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [proposals, setProposals] = useState<ImportProposal[]>([]);

  const uploadSchema = createImportUploadSchema(t);

  const form = useForm({
    initialValues: {
      api_key: '',
      file: null as File | null,
    },
    validate: zodResolver(uploadSchema),
  });

  const analyzeMutation = useMutation({
    mutationFn: ({ file, apiKey }: { file: File; apiKey: string }) =>
      importApi.analyzeImport(file, apiKey),
  });

  const confirmMutation = useMutation({
    mutationFn: (items: ImportProposal[]) => importApi.confirmImport(items),
  });

  const resetState = () => {
    setActiveStep(0);
    setError(null);
    setProposals([]);
    form.reset();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleAnalyze = form.onSubmit(async (values) => {
    if (!values.file) {
      return;
    }

    setError(null);
    setActiveStep(1);

    try {
      const response = await analyzeMutation.mutateAsync({
        file: values.file,
        apiKey: values.api_key,
      });

      if (response.proposals.length === 0) {
        setError(t('import.noProposals'));
        setActiveStep(0);
        return;
      }

      setProposals(response.proposals);
      setActiveStep(2);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t('errors.generic');
      setError(message);
      setActiveStep(0);
    }
  });

  const handleConfirm = async () => {
    const selectedCount = proposals.filter((p) => p.selected).length;

    if (selectedCount === 0) {
      return;
    }

    try {
      await confirmMutation.mutateAsync(proposals);
      setActiveStep(3);
      invalidate();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t('errors.generic');
      setError(message);
      setActiveStep(2);
    }
  };

  const toggleProposal = (index: number) => {
    setProposals((current) =>
      current.map((proposal, i) =>
        i === index ? { ...proposal, selected: !proposal.selected } : proposal,
      ),
    );
  };

  const selectedCount = proposals.filter((p) => p.selected).length;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('import.title')}
      size="lg"
      centered
    >
      <Stepper active={activeStep} mb="lg">
        <Stepper.Step label={t('import.stepUpload')} />
        <Stepper.Step label={t('import.stepAnalyze')} />
        <Stepper.Step label={t('import.stepReview')} />
        <Stepper.Step label={t('import.stepDone')} />
      </Stepper>

      {error && activeStep !== 3 && (
        <Alert color="red" mb="md" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      {activeStep === 0 && (
        <form onSubmit={handleAnalyze}>
          <Stack gap="md">
            <Alert color="blue">{t('import.apiKeyInfo')}</Alert>
            <PasswordInput
              label={t('import.apiKey')}
              {...form.getInputProps('api_key')}
            />
            <Dropzone
              accept={[MIME_TYPES.csv]}
              maxFiles={1}
              onDrop={(files) => form.setFieldValue('file', files[0] ?? null)}
            >
              <Group justify="center" gap="sm" mih={120}>
                <IconUpload size={24} />
                <div>
                  <Text size="sm">{t('import.dropzoneTitle')}</Text>
                  <Text size="xs" c="dimmed">
                    {t('import.dropzoneHint')}
                  </Text>
                  {form.values.file && (
                    <Text size="sm" mt="xs" fw={500}>
                      {form.values.file.name}
                    </Text>
                  )}
                </div>
              </Group>
            </Dropzone>
            {form.errors.file && (
              <Text size="sm" c="red">
                {form.errors.file}
              </Text>
            )}
            <Button
              type="submit"
              disabled={!form.values.api_key || !form.values.file}
            >
              {t('import.analyze')}
            </Button>
          </Stack>
        </form>
      )}

      {activeStep === 1 && (
        <Stack align="center" gap="md" py="xl">
          <Loader />
          <Text>{t('import.analyzing')}</Text>
        </Stack>
      )}

      {activeStep === 2 && (
        <Stack gap="md">
          {proposals.map((proposal, index) => {
            const cycleLabel =
              proposal.billing_cycle === 'monthly'
                ? t('subscription.perMonth')
                : t('subscription.perYear');

            return (
              <Group key={`${proposal.name}-${index}`} wrap="nowrap" align="flex-start">
                <Checkbox
                  checked={proposal.selected}
                  onChange={() => toggleProposal(index)}
                  mt={4}
                />
                <Stack gap={4} style={{ flex: 1 }}>
                  <Text fw={600}>{proposal.name}</Text>
                  <Text size="sm">
                    {formatCurrency(proposal.amount)} {cycleLabel}
                  </Text>
                  <CategoryBadge category={proposal.category} />
                </Stack>
              </Group>
            );
          })}
          <Group justify="flex-end">
            <Button variant="default" onClick={handleClose}>
              {t('subscription.cancel')}
            </Button>
            <Button
              loading={confirmMutation.isPending}
              disabled={selectedCount === 0}
              onClick={() => void handleConfirm()}
            >
              {t('import.confirmSelected', { count: selectedCount })}
            </Button>
          </Group>
        </Stack>
      )}

      {activeStep === 3 && (
        <Stack align="center" gap="md" py="md">
          <Title order={4}>{t('import.successTitle')}</Title>
          <Text ta="center">
            {t('import.successMessage', {
              count: confirmMutation.data?.count ?? selectedCount,
            })}
          </Text>
          <Button onClick={handleClose}>{t('import.close')}</Button>
        </Stack>
      )}
    </Modal>
  );
}

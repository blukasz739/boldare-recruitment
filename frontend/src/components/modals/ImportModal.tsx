import {
  Alert,
  Box,
  Button,
  Checkbox,
  Group,
  Loader,
  Modal,
  PasswordInput,
  Paper,
  Stack,
  Stepper,
  Text,
  Title,
} from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { IconUpload } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as importApi from '../../api/import';
import { ApiError } from '../../api/client';
import { useSubscriptionMutations } from '../../hooks/useSubscriptions';
import { createImportUploadSchema } from '../../schemas/import';
import type { ImportProposal } from '../../types/subscription';
import { CATEGORY_TILE_STYLES } from '../../theme/categoryColors';
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
    validate: zod4Resolver(uploadSchema),
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

  const modalStyles = {
    content: { background: 'light-dark(#ffffff, #18181b)' },
    header: { background: 'light-dark(#ffffff, #18181b)' },
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('import.title')}
      size="lg"
      centered
      styles={modalStyles}
    >
      <Stepper active={activeStep} mb="xl" color="accent" className="import-stepper">
        <Stepper.Step label={t('import.stepUpload')} />
        <Stepper.Step label={t('import.stepAnalyze')} />
        <Stepper.Step label={t('import.stepReview')} />
        <Stepper.Step label={t('import.stepDone')} />
      </Stepper>

      {error && activeStep !== 3 && (
        <Alert color="red" mb="md" variant="light" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      {activeStep === 0 && (
        <form onSubmit={handleAnalyze}>
          <Stack gap="md">
            <Alert color="blue" variant="light">
              {t('import.apiKeyInfo')}
            </Alert>
            <PasswordInput
              label={t('import.apiKey')}
              {...form.getInputProps('api_key')}
            />
            <Dropzone
              accept={[MIME_TYPES.csv]}
              maxFiles={1}
              onDrop={(files) => form.setFieldValue('file', files[0] ?? null)}
              styles={{
                root: {
                  borderColor: 'var(--mantine-color-default-border)',
                  background: 'var(--mantine-color-neutral-8)',
                  borderStyle: 'dashed',
                },
              }}
            >
              <Group justify="center" gap="sm" mih={120}>
                <IconUpload size={24} stroke={1.5} />
                <div>
                  <Text size="sm" fw={500}>
                    {t('import.dropzoneTitle')}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t('import.dropzoneHint')}
                  </Text>
                  {form.values.file && (
                    <Text size="sm" mt="xs" fw={600} c="accent.5">
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
              color="accent"
              c="dark.9"
              fw={700}
            >
              {t('import.analyze')}
            </Button>
          </Stack>
        </form>
      )}

      {activeStep === 1 && (
        <Stack align="center" gap="md" py="xl">
          <Loader color="accent" type="dots" />
          <Text c="dimmed">{t('import.analyzing')}</Text>
        </Stack>
      )}

      {activeStep === 2 && (
        <Stack gap="md">
          {proposals.map((proposal, index) => {
            const cycleLabel =
              proposal.billing_cycle === 'monthly'
                ? t('subscription.perMonth')
                : t('subscription.perYear');
            const tileStyle = CATEGORY_TILE_STYLES[proposal.category];

            return (
              <Paper
                key={`${proposal.name}-${index}`}
                p="md"
                withBorder
                style={{
                  borderColor: proposal.selected
                    ? tileStyle.bg
                    : 'var(--mantine-color-default-border)',
                  background: proposal.selected
                    ? tileStyle.bgMuted
                    : 'transparent',
                  transition: 'border-color 0.15s ease, background 0.15s ease',
                }}
              >
                <Group wrap="nowrap" align="flex-start">
                  <Checkbox
                    checked={proposal.selected}
                    onChange={() => toggleProposal(index)}
                    mt={4}
                    color="accent"
                  />
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Text fw={600}>{proposal.name}</Text>
                    <Text size="sm" c="dimmed">
                      {formatCurrency(proposal.amount)} {cycleLabel}
                    </Text>
                    <CategoryBadge category={proposal.category} />
                  </Stack>
                </Group>
              </Paper>
            );
          })}
          <Group justify="flex-end" mt="sm">
            <Button variant="subtle" color="gray" onClick={handleClose}>
              {t('subscription.cancel')}
            </Button>
            <Button
              loading={confirmMutation.isPending}
              disabled={selectedCount === 0}
              onClick={() => void handleConfirm()}
              color="accent"
              c="dark.9"
              fw={700}
            >
              {t('import.confirmSelected', { count: selectedCount })}
            </Button>
          </Group>
        </Stack>
      )}

      {activeStep === 3 && (
        <Stack align="center" gap="md" py="md">
          <Box
            w={56}
            h={56}
            style={{
              borderRadius: 14,
              background: 'var(--mantine-color-accent-5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text fw={800} size="xl" c="dark.9">
              ✓
            </Text>
          </Box>
          <Title order={4}>{t('import.successTitle')}</Title>
          <Text ta="center" c="dimmed">
            {t('import.successMessage', {
              count: confirmMutation.data?.count ?? selectedCount,
            })}
          </Text>
          <Button onClick={handleClose} color="accent" c="dark.9" fw={700} mt="sm">
            {t('import.close')}
          </Button>
        </Stack>
      )}
    </Modal>
  );
}

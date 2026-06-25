import type { TFunction } from 'i18next';
import { z } from 'zod';

export function createImportUploadSchema(t: TFunction) {
  return z.object({
    api_key: z.string().min(1, t('validation.apiKeyRequired')),
    file: z
      .custom<File | null>((value) => value instanceof File, {
        message: t('validation.fileRequired'),
      })
      .refine((file) => file !== null, t('validation.fileRequired')),
  });
}

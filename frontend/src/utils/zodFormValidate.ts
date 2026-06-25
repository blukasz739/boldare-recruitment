import type { FormValidateInput } from '@mantine/form';
import { z } from 'zod';

function getFirstIssueMessage(error: z.ZodError): string | null {
  return error.issues[0]?.message ?? null;
}

export function createZodFieldsValidate<T extends z.ZodObject<Record<string, z.ZodTypeAny>>>(
  schema: T,
): FormValidateInput<z.infer<T>> {
  const shape = schema.shape;
  const validators: Record<string, (value: unknown) => string | null> = {};

  for (const key of Object.keys(shape)) {
    const fieldSchema = shape[key];
    validators[key] = (value: unknown) => {
      const result = fieldSchema.safeParse(value);
      return result.success ? null : getFirstIssueMessage(result.error);
    };
  }

  return validators as unknown as FormValidateInput<z.infer<T>>;
}

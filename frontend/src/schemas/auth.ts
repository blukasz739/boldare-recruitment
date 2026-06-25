import type { TFunction } from 'i18next';
import { z } from 'zod';

export function createLoginSchema(t: TFunction) {
  return z.object({
    username: z
      .string()
      .min(1, t('validation.required'))
      .min(3, t('validation.usernameMin')),
    password: z.string().min(1, t('validation.required')),
  });
}

export function createRegisterSchema(t: TFunction) {
  return z
    .object({
      username: z
        .string()
        .min(1, t('validation.required'))
        .min(3, t('validation.usernameMin')),
      password: z
        .string()
        .min(1, t('validation.required'))
        .min(8, t('validation.passwordMin')),
      confirmPassword: z.string().min(1, t('validation.required')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordMatch'),
      path: ['confirmPassword'],
    });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;

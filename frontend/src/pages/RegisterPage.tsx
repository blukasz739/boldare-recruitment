import {
  Alert,
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/client';
import { AppShellLayout, AuthFooterLink } from '../components/layout/AppHeader';
import { useAuth } from '../hooks/useAuth';
import { createRegisterSchema } from '../schemas/auth';

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const schema = createRegisterSchema(t);

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
    validate: zodResolver(schema),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setError(null);

    try {
      await register({
        username: values.username,
        password: values.password,
      });
      void navigate('/dashboard');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t('errors.generic');
      setError(message);
    }
  });

  return (
    <AppShellLayout variant="auth">
      <Container size={420} py="xl">
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Title order={2} mb="lg" ta="center">
            {t('auth.registerTitle')}
          </Title>

          {error && (
            <Alert color="red" mb="md">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label={t('auth.username')}
                {...form.getInputProps('username')}
              />
              <PasswordInput
                label={t('auth.password')}
                {...form.getInputProps('password')}
              />
              <PasswordInput
                label={t('auth.confirmPassword')}
                {...form.getInputProps('confirmPassword')}
              />
              <Button type="submit" fullWidth>
                {t('auth.submitRegister')}
              </Button>
            </Stack>
          </form>

          <AuthFooterLink
            messageKey="auth.hasAccount"
            linkKey="nav.login"
            to="/login"
          />
        </Paper>
      </Container>
    </AppShellLayout>
  );
}

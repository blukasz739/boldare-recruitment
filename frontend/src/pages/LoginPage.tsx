import { Alert, Button, Container, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/client';
import { AppShellLayout, AuthFooterLink } from '../components/layout/AppHeader';
import { useAuth } from '../hooks/useAuth';
import { createLoginSchema } from '../schemas/auth';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const schema = createLoginSchema(t);

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: zod4Resolver(schema),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setError(null);

    try {
      await login(values);
      void navigate('/dashboard');
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 401
          ? t('auth.invalidCredentials')
          : err instanceof ApiError
            ? err.message
            : t('errors.generic');
      setError(message);
    }
  });

  return (
    <AppShellLayout variant="auth">
      <Container size={420} py="xl">
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Title order={2} mb="lg" ta="center">
            {t('auth.loginTitle')}
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
              <Button type="submit" fullWidth>
                {t('auth.submitLogin')}
              </Button>
            </Stack>
          </form>

          <AuthFooterLink
            messageKey="auth.noAccount"
            linkKey="nav.register"
            to="/register"
          />
        </Paper>
      </Container>
    </AppShellLayout>
  );
}

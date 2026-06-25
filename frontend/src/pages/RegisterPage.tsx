import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/client';
import { AppShellLayout, AuthFooterLink } from '../components/layout/AppHeader';
import { useAuth } from '../hooks/authContext';
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
    validate: zod4Resolver(schema),
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
      <Container size={420} py={{ base: 40, sm: 80 }}>
        <Paper className="auth-card surface" p="xl" withBorder>
          <Stack gap={4} mb="xl" ta="center">
            <Title order={2} fw={700}>
              {t('auth.registerTitle')}
            </Title>
            <Text size="sm" c="dimmed">
              {t('app.name')}
            </Text>
          </Stack>

          {error && (
            <Alert color="red" mb="md" variant="light" radius="md">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label={t('auth.username')}
                placeholder={t('auth.username')}
                {...form.getInputProps('username')}
              />
              <PasswordInput
                label={t('auth.password')}
                placeholder={t('auth.password')}
                {...form.getInputProps('password')}
              />
              <PasswordInput
                label={t('auth.confirmPassword')}
                placeholder={t('auth.confirmPassword')}
                {...form.getInputProps('confirmPassword')}
              />
              <Box mt="xs">
                <Button type="submit" fullWidth size="md" color="accent" c="dark.9" fw={700}>
                  {t('auth.submitRegister')}
                </Button>
              </Box>
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

import { Container, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { AppShellLayout } from '../components/layout/AppHeader';

export function LoginPage() {
  const { t } = useTranslation();

  return (
    <AppShellLayout variant="auth">
      <Container size={420} py="xl">
        <Title order={2} ta="center">
          {t('auth.loginTitle')}
        </Title>
        <Text ta="center" c="dimmed" mt="md">
          {t('auth.loginTitle')}
        </Text>
      </Container>
    </AppShellLayout>
  );
}

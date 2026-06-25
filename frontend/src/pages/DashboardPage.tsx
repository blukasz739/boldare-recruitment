import { Container, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { AppShellLayout } from '../components/layout/AppHeader';

export function DashboardPage() {
  const { t } = useTranslation();

  return (
    <AppShellLayout variant="dashboard">
      <Container size="lg">
        <Title order={1}>{t('dashboard.title')}</Title>
      </Container>
    </AppShellLayout>
  );
}

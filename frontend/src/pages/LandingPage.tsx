import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppShellLayout } from '../components/layout/AppHeader';

export function LandingPage() {
  const { t } = useTranslation();

  return (
    <AppShellLayout variant="landing">
      <Container size="sm" py="xl">
        <Stack align="center" gap="lg" mt={80}>
          <Title order={1} ta="center">
            {t('landing.title')}
          </Title>
          <Text size="lg" c="dimmed" ta="center">
            {t('landing.subtitle')}
          </Text>
          <Group>
            <Button component={Link} to="/register" size="md">
              {t('landing.ctaPrimary')}
            </Button>
            <Button component={Link} to="/login" variant="light" size="md">
              {t('landing.ctaSecondary')}
            </Button>
          </Group>
        </Stack>
      </Container>
    </AppShellLayout>
  );
}

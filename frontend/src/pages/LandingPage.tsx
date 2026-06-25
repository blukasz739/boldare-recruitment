import { Box, Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppShellLayout } from '../components/layout/AppHeader';

export function LandingPage() {
  const { t } = useTranslation();

  return (
    <AppShellLayout variant="landing" fullWidth>
      <Box className="landing-hero">
        <Container size="sm">
          <Stack align="center" gap="xl">
            <Stack align="center" gap="md" maw={560}>
              <Box
                px="md"
                py={6}
                className="surface"
                style={{ borderRadius: 999, border: '1px solid' }}
              >
                <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={1.5}>
                  Subscription tracker
                </Text>
              </Box>

              <Title
                order={1}
                ta="center"
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                }}
              >
                {t('landing.title')}
              </Title>

              <Text size="xl" c="dimmed" ta="center" lh={1.6}>
                {t('landing.subtitle')}
              </Text>
            </Stack>

            <Group gap="sm">
              <Button
                component={Link}
                to="/register"
                size="lg"
                color="accent"
                c="dark.9"
                fw={700}
                px="xl"
              >
                {t('landing.ctaPrimary')}
              </Button>
              <Button
                component={Link}
                to="/login"
                size="lg"
                variant="outline"
                color="gray"
                px="xl"
              >
                {t('landing.ctaSecondary')}
              </Button>
            </Group>

            <Group gap="lg" mt="xl" opacity={0.5}>
              {['Netflix', 'Spotify', 'GitHub', 'Adobe'].map((name) => (
                <Text key={name} size="sm" fw={600} c="dimmed" tt="uppercase" lts={1}>
                  {name}
                </Text>
              ))}
            </Group>
          </Stack>
        </Container>
      </Box>
    </AppShellLayout>
  );
}

import {
  Anchor,
  AppShell,
  Box,
  Button,
  Divider,
  Group,
  Text,
} from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

type HeaderVariant = 'landing' | 'auth' | 'dashboard';

interface AppHeaderProps {
  variant: HeaderVariant;
}

export function AppHeader({ variant }: AppHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    void navigate('/login');
  };

  return (
    <AppShell.Header
      style={{
        borderBottom: '1px solid var(--mantine-color-default-border)',
        backgroundColor: 'var(--mantine-color-body)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Group h="100%" px="lg" justify="space-between" wrap="nowrap">
        <Anchor component={Link} to="/" underline="never" c="inherit">
          <Group gap={8} wrap="nowrap">
            <Box
              w={28}
              h={28}
              style={{
                borderRadius: 8,
                background: 'var(--mantine-color-accent-5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text fw={800} size="xs" c="dark.9">
                S
              </Text>
            </Box>
            <Text fw={700} size="lg" lh={1}>
              {t('app.name')}
            </Text>
          </Group>
        </Anchor>

        <Group gap="xs" wrap="nowrap">
          <LanguageSwitcher />
          <ThemeToggle />

          {variant === 'landing' && (
            <>
              <Divider orientation="vertical" visibleFrom="sm" />
              <Button
                component={Link}
                to="/login"
                variant="subtle"
                color="gray"
                visibleFrom="sm"
              >
                {t('nav.login')}
              </Button>
              <Button component={Link} to="/register" color="accent" c="dark.9">
                {t('nav.register')}
              </Button>
            </>
          )}

          {variant === 'dashboard' && (
            <Button variant="subtle" color="gray" onClick={handleLogout}>
              {t('nav.logout')}
            </Button>
          )}
        </Group>
      </Group>
    </AppShell.Header>
  );
}

export function AppShellLayout({
  variant,
  children,
  fullWidth = false,
}: {
  variant: HeaderVariant;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <AppShell
      header={{ height: 64 }}
      padding={fullWidth ? 0 : 'lg'}
      styles={{
        main: {
          backgroundColor: 'var(--mantine-color-body)',
        },
      }}
    >
      <AppHeader variant={variant} />
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

export function AuthFooterLink({
  messageKey,
  linkKey,
  to,
}: {
  messageKey: string;
  linkKey: string;
  to: string;
}) {
  const { t } = useTranslation();

  return (
    <Text ta="center" size="sm" c="dimmed" mt="xl">
      {t(messageKey)}{' '}
      <Anchor component={Link} to={to} fw={600} c="accent.5">
        {t(linkKey)}
      </Anchor>
    </Text>
  );
}

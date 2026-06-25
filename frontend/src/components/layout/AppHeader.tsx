import {
  Anchor,
  AppShell,
  Button,
  Group,
  Text,
  Title,
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
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between">
        <Anchor component={Link} to="/" underline="never" c="inherit">
          <Title order={3}>{t('app.name')}</Title>
        </Anchor>

        <Group gap="sm">
          <LanguageSwitcher />
          <ThemeToggle />

          {variant === 'landing' && (
            <>
              <Button component={Link} to="/login" variant="subtle">
                {t('nav.login')}
              </Button>
              <Button component={Link} to="/register">
                {t('nav.register')}
              </Button>
            </>
          )}

          {variant === 'dashboard' && (
            <Button variant="subtle" onClick={handleLogout}>
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
}: {
  variant: HeaderVariant;
  children: React.ReactNode;
}) {
  return (
    <AppShell header={{ height: 60 }} padding="md">
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
    <Text ta="center" size="sm" mt="md">
      {t(messageKey)}{' '}
      <Anchor component={Link} to={to}>
        {t(linkKey)}
      </Anchor>
    </Text>
  );
}

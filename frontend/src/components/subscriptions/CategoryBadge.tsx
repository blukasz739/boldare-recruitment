import { Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../types/subscription';

interface CategoryBadgeProps {
  category: Category;
  variant?: 'default' | 'onColor';
}

export function CategoryBadge({ category, variant = 'default' }: CategoryBadgeProps) {
  const { t } = useTranslation();

  if (variant === 'onColor') {
    return (
      <Badge
        size="sm"
        radius="sm"
        variant="white"
        color="gray"
        styles={{
          root: {
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: '0.01em',
          },
        }}
      >
        {t(`categories.${category}`)}
      </Badge>
    );
  }

  return (
    <Badge
      size="sm"
      radius="sm"
      variant="outline"
      color="gray"
      styles={{
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      }}
    >
      {t(`categories.${category}`)}
    </Badge>
  );
}

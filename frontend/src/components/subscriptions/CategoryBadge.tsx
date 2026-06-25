import { Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../types/subscription';
import { CATEGORY_COLORS } from '../../types/subscription';

interface CategoryBadgeProps {
  category: Category;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const { t } = useTranslation();

  return (
    <Badge color={CATEGORY_COLORS[category]} variant="light">
      {t(`categories.${category}`)}
    </Badge>
  );
}

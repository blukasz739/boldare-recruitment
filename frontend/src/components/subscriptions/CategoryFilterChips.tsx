import { Group, Text, UnstyledButton } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CATEGORY_TILE_STYLES } from '../../theme/categoryColors';
import { CATEGORIES, type Category } from '../../types/subscription';

interface CategoryFilterChipsProps {
  activeCategories: Set<Category>;
  onToggle: (category: Category) => void;
}

export function CategoryFilterChips({
  activeCategories,
  onToggle,
}: CategoryFilterChipsProps) {
  const { t } = useTranslation();

  return (
    <Group gap={8} wrap="wrap">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={1} mr={4}>
        {t('dashboard.filterCategories')}
      </Text>
      {CATEGORIES.map((category) => {
        const isActive = activeCategories.has(category);
        const style = CATEGORY_TILE_STYLES[category];

        return (
          <UnstyledButton
            key={category}
            onClick={() => onToggle(category)}
            aria-pressed={isActive}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              lineHeight: 1.2,
              transition: 'all 0.15s ease',
              background: isActive ? style.bg : 'transparent',
              color: isActive ? style.text : 'var(--mantine-color-dimmed)',
              border: isActive
                ? `1.5px solid ${style.bg}`
                : '1.5px solid var(--mantine-color-default-border)',
              opacity: isActive ? 1 : 0.7,
            }}
          >
            {t(`categories.${category}`)}
          </UnstyledButton>
        );
      })}
    </Group>
  );
}

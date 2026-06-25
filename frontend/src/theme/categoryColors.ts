import type { Category } from '../types/subscription';

export interface CategoryTileStyle {
  bg: string;
  bgMuted: string;
  text: string;
}

export const CATEGORY_TILE_STYLES: Record<Category, CategoryTileStyle> = {
  entertainment: {
    bg: '#f43f8a',
    bgMuted: 'rgba(244, 63, 138, 0.15)',
    text: '#ffffff',
  },
  music: {
    bg: '#8b5cf6',
    bgMuted: 'rgba(139, 92, 246, 0.15)',
    text: '#ffffff',
  },
  work_tools: {
    bg: '#3b82f6',
    bgMuted: 'rgba(59, 130, 246, 0.15)',
    text: '#ffffff',
  },
  other: {
    bg: '#71717a',
    bgMuted: 'rgba(113, 113, 122, 0.15)',
    text: '#ffffff',
  },
};

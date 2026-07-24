// src/lib/theme.ts
//
// Design-token bridge for non-CSS consumers (three.js scene, HTML markers,
// canvas, charts). The same values are mirrored as CSS variables in
// src/index.css (--status-available etc.); keep the two in sync.

import type { Status } from '../types/campus';

/** UMD red — the single accent color across both themes. */
export const UMD_RED = '#E21833';

export const STATUS_COLORS: Record<'light' | 'dark', Record<Status, string>> = {
  light: {
    available: '#2E8B57', // muted green
    'opening-soon': '#C98A1B', // amber
    unavailable: '#A85751', // muted brick red
    unknown: '#8C867A', // warm gray
  },
  dark: {
    available: '#55B981',
    'opening-soon': '#E3A93F',
    unavailable: '#C4746B',
    unknown: '#6E695F',
  },
};

/** Status color palette for the active theme. */
export function getStatusColors(darkMode: boolean): Record<Status, string> {
  return darkMode ? STATUS_COLORS.dark : STATUS_COLORS.light;
}

/** Warm neutral surfaces, mirrored from index.css (for theme-color meta etc.). */
export const THEME_COLORS = {
  light: { background: '#FAF8F5', foreground: '#231F1A' },
  dark: { background: '#161412', foreground: '#EFECE7' },
} as const;

// src/lib/useDarkModeSync.ts
//
// Keeps <html> in sync with the store's darkMode flag: toggles the `dark`
// class (Tailwind class strategy), sets color-scheme, and updates the
// theme-color meta. Mount once near the app root (Stage 3 wiring).

import { useEffect } from 'react';
import { useCampusStore } from './store';
import { THEME_COLORS } from './theme';

export function useDarkModeSync(): void {
  const darkMode = useCampusStore((s) => s.darkMode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', darkMode);
    root.style.colorScheme = darkMode ? 'dark' : 'light';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute(
        'content',
        darkMode ? THEME_COLORS.dark.background : THEME_COLORS.light.background
      );
    }
  }, [darkMode]);
}

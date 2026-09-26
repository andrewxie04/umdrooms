// useMediaQuery — reactive CSS media-query hook used by AppShell to switch
// between the desktop floating panel and the mobile bottom sheet.

import { useCallback, useMemo, useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  const mql = useMemo(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query)
      : null,
  [query]);
  const subscribe = useCallback((onChange: () => void) => {
    if (!mql) return () => {};
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    // Legacy Safari fallback.
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [mql]);
  const getSnapshot = useCallback(() => mql?.matches ?? false, [mql]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

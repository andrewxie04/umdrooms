let started = false;

/**
 * Warm the Iribe walk-through while its building panel is open: the interior
 * chunk (~360 KB gzipped) and the photographed sky (~1.4 MB) otherwise start
 * downloading only after "Enter building". Runs once, during idle time, at low
 * priority; failures are ignored because entering fetches both again.
 */
export function prefetchIribeInterior(): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  const run = () => {
    void import('./IribeInterior').catch(() => undefined);
    void fetch(`${import.meta.env.BASE_URL}interior/iribe/daylight-sky-1k.hdr`, { priority: 'low' } as RequestInit)
      .then((response) => (response.ok ? response.arrayBuffer() : undefined))
      .catch(() => undefined);
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 3000 });
  else setTimeout(run, 1000);
}

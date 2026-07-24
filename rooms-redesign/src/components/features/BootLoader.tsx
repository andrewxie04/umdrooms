// src/components/features/BootLoader.tsx
//
// Full-screen warm boot screen shown while the store's initial data pipeline
// runs (loading.status === 'loading') and a retry-able error state when it
// fails. Progress is driven by loading.progress (0..1); when progress stalls
// (chunked download reporting pauses), the bar switches to an indeterminate
// shimmer so the app never looks frozen.

import { useEffect, useRef, useState } from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import { useCampusStore } from '@/lib/store';
import { PrimaryButton } from './ui-bits';

const STALL_MS = 1400;
const TICK_MS = 300;

const TAGLINES = [
  'Find a room. Grab a meal. Park easy.',
  'Every open space on campus, live.',
  'Classrooms, study rooms, dining, parking.',
];

export function BootLoader() {
  const loading = useCampusStore((s) => s.loading);
  const init = useCampusStore((s) => s.init);

  const [stalled, setStalled] = useState(false);
  const lastProgressRef = useRef(loading.progress);
  const lastChangeAtRef = useRef(Date.now());

  // Watch for progress stalls -> indeterminate shimmer.
  useEffect(() => {
    if (loading.status !== 'loading') return;
    if (loading.progress !== lastProgressRef.current) {
      lastProgressRef.current = loading.progress;
      lastChangeAtRef.current = Date.now();
      setStalled(false);
    }
    const timer = window.setInterval(() => {
      if (Date.now() - lastChangeAtRef.current > STALL_MS) setStalled(true);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [loading.status, loading.progress]);

  if (loading.status !== 'loading' && loading.status !== 'error') return null;

  const percent = Math.round(Math.min(1, Math.max(0, loading.progress)) * 100);
  const tagline = TAGLINES[0];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background px-6">
      <style>{`
        @keyframes rooms-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>

      {/* Wordmark */}
      <div className="flex items-baseline gap-1 select-none">
        <span className="text-4xl font-bold tracking-tight text-foreground">Rooms</span>
        <span className="h-2.5 w-2.5 rounded-full bg-umd-red" aria-hidden />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{tagline}</p>

      {loading.status === 'loading' ? (
        <>
          <div
            className="relative mt-8 h-1.5 w-56 overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label="Loading campus data"
          >
            <div
              className="h-full rounded-full bg-umd-red transition-[width] duration-300 ease-out"
              style={{ width: `${Math.max(4, percent)}%` }}
            />
            {stalled ? (
              <div
                className="absolute inset-y-0 w-2/5 rounded-full bg-umd-red/40"
                style={{ animation: 'rooms-shimmer 1.4s ease-in-out infinite' }}
              />
            ) : null}
          </div>
          <p className="mt-3 text-xs tabular-nums text-muted-foreground">
            {stalled && percent === 0 ? 'Warming up campus data…' : `Loading campus data… ${percent}%`}
          </p>
        </>
      ) : (
        <div className="mt-8 flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
          <CloudOff className="h-6 w-6 text-status-unavailable" />
          <div>
            <p className="text-sm font-semibold text-foreground">Couldn&rsquo;t load campus data</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {loading.error || 'Something went wrong while loading room availability.'}
            </p>
          </div>
          <PrimaryButton onClick={() => void init()} className="w-full">
            <RefreshCw className="h-4 w-4" />
            Retry
          </PrimaryButton>
        </div>
      )}

      <p className="absolute bottom-6 text-[11px] text-muted-foreground/70">
        University of Maryland · not an official UMD service
      </p>
    </div>
  );
}

export default BootLoader;

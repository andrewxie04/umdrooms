// browse/AppHeader.tsx — 'Rooms' wordmark + subtitle, dark-mode toggle,
// legend button, and map overlay toggle chips.

import { BookOpen, Car, Clock, GraduationCap, Info, Moon, Star, Sun, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCampusStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { OverlayKind } from '@/types/campus';

const OVERLAY_CHIPS: { key: OverlayKind; label: string; icon: typeof GraduationCap }[] = [
  { key: 'classrooms', label: 'Classrooms', icon: GraduationCap },
  { key: 'library', label: 'Library', icon: BookOpen },
  { key: 'dining', label: 'Dining', icon: UtensilsCrossed },
  { key: 'parking', label: 'Parking', icon: Car },
];

export function AppHeader() {
  const darkMode = useCampusStore((s) => s.darkMode);
  const darkModeAuto = useCampusStore((s) => s.darkModeAuto);
  const setTimePreference = useCampusStore((s) => s.setTimePreference);
  const setLegendOpen = useCampusStore((s) => s.setLegendOpen);
  const setFavoritesOpen = useCampusStore((s) => s.setFavoritesOpen);
  const activeOverlays = useCampusStore((s) => s.activeOverlays);
  const toggleOverlay = useCampusStore((s) => s.toggleOverlay);

  // 3-state time control: Realtime (follows the sun) -> Day -> Night ->
  // Realtime. Manual Day/Night never sticks forever — one more click always
  // brings realtime back without a refresh.
  const timeState: 'auto' | 'day' | 'night' = darkModeAuto
    ? 'auto'
    : darkMode
      ? 'night'
      : 'day';
  const cycleTimePreference = () => {
    setTimePreference(timeState === 'auto' ? 'day' : timeState === 'day' ? 'night' : 'auto');
  };
  const timeLabel =
    timeState === 'auto'
      ? 'Realtime (follows the sun) — switch to Day'
      : timeState === 'day'
        ? 'Day (manual) — switch to Night'
        : 'Night (manual) — switch back to Realtime';
  const TimeIcon = timeState === 'auto' ? Clock : timeState === 'day' ? Sun : Moon;

  return (
    <header className="shrink-0 border-b border-border/60 px-4 pb-3 pt-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Rooms
            <span className="ml-1.5 inline-block size-2 rounded-full bg-umd-red align-middle" />
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">UMD campus availability</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setFavoritesOpen(true)}
            aria-label="Open favorites"
            title="Favorites"
          >
            <Star className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setLegendOpen(true)}
            aria-label="Open map legend"
            title="Map legend"
          >
            <Info className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={cycleTimePreference}
            aria-label={timeLabel}
            title={timeLabel}
            data-time-state={timeState}
            className="relative"
          >
            <TimeIcon className="size-4" />
            {timeState === 'auto' && (
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-emerald-500"
                title="Realtime sync on"
              />
            )}
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {OVERLAY_CHIPS.map(({ key, label, icon: Icon }) => {
          const active = activeOverlays.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleOverlay(key)}
              aria-pressed={active}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                active
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          );
        })}
      </div>
    </header>
  );
}

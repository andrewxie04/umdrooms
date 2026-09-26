// browse/AppHeader.tsx — 'Rooms' wordmark + subtitle, dark-mode toggle,
// legend button, and map overlay toggle chips.

import { BookOpen, Car, Clock, GraduationCap, Info, Moon, Star, Sun, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCampusStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { OverlayKind } from '@/types/campus';
import { useMediaQuery } from '@/components/shell/useMediaQuery';
import { LANDSCAPE_SIDE_QUERY, SIDE_PANEL_QUERY } from '@/components/shell/layout';

const OVERLAY_CHIPS: { key: OverlayKind; label: string; icon: typeof GraduationCap }[] = [
  { key: 'classrooms', label: 'Classrooms', icon: GraduationCap },
  { key: 'library', label: 'Library', icon: BookOpen },
  { key: 'dining', label: 'Dining', icon: UtensilsCrossed },
  { key: 'parking', label: 'Parking', icon: Car },
];

export function AppHeader() {
  const isLandscapeSidePanel = useMediaQuery(LANDSCAPE_SIDE_QUERY);
  const hasSidePanel = useMediaQuery(SIDE_PANEL_QUERY);
  const compactPointerControls = hasSidePanel && !isLandscapeSidePanel;
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
    <header className={cn(
      'shrink-0 border-b border-border/70 px-3 pb-3 pt-4 min-[360px]:px-5 min-[360px]:pb-4 min-[360px]:pt-5 sm:px-6',
      !hasSidePanel && '!pb-2 !pt-2',
      isLandscapeSidePanel && '!px-3 !pb-1 !pt-1',
    )}>
      <div className="flex items-start justify-between gap-2 min-[360px]:gap-3">
        <div className="flex min-w-0 items-start gap-2 min-[360px]:gap-3.5">
          <span aria-hidden className={cn('mt-0.5 flex h-9 w-1.5 shrink-0 overflow-hidden rounded-sm bg-primary min-[360px]:h-10 min-[360px]:w-2', isLandscapeSidePanel && '!mt-0 !h-8')}>
            <span className="mt-auto h-1/4 w-full bg-[#f3c948]" />
          </span>
          <div className="min-w-0">
            <p className={cn('hidden text-[10px] font-bold uppercase tracking-[0.17em] text-accent-foreground min-[360px]:block', isLandscapeSidePanel && '!hidden')}>University of Maryland</p>
            <h1 className={cn('mt-1 whitespace-nowrap text-[20px] font-semibold leading-none tracking-[-0.045em] text-foreground min-[360px]:mt-0.5 min-[360px]:text-[25px]', isLandscapeSidePanel && '!mt-1 !text-[20px]')}>
              Campus Rooms
            </h1>
            <p className={cn('mt-1.5 hidden text-xs leading-snug text-muted-foreground min-[360px]:block', !hasSidePanel && '!hidden', isLandscapeSidePanel && '!hidden')}>Find your place on campus</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setFavoritesOpen(true)}
            aria-label="Open favorites"
            title="Favorites"
            className={cn('rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground', compactPointerControls ? 'size-8' : 'size-11')}
          >
            <Star className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setLegendOpen(true)}
            aria-label="Open map legend"
            title="Map legend"
            className={cn('rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground', compactPointerControls ? 'size-8' : 'size-11')}
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
            className={cn('relative rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground', compactPointerControls ? 'size-8' : 'size-11')}
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

      <div className={cn('mt-3 flex flex-wrap gap-1 min-[360px]:mt-5 sm:gap-1.5 min-[900px]:max-[1023px]:grid min-[900px]:max-[1023px]:grid-cols-4 min-[900px]:max-[1023px]:gap-1', !hasSidePanel && '!mt-2', isLandscapeSidePanel && '!mt-1 !gap-1')} role="group" aria-label="Map layers">
        {OVERLAY_CHIPS.map(({ key, label, icon: Icon }) => {
          const active = activeOverlays.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleOverlay(key)}
              aria-pressed={active}
              className={cn(
                'inline-flex items-center gap-0.5 rounded-md border px-1.5 py-1 text-[10px] font-semibold transition-colors min-[360px]:gap-1 min-[360px]:px-2 min-[360px]:text-[11px] sm:gap-1.5 sm:px-2.5 min-[900px]:max-[1023px]:gap-0.5 min-[900px]:max-[1023px]:px-1.5 min-[900px]:max-[1023px]:text-[10px]',
                compactPointerControls ? 'min-h-10' : 'min-h-11',
                isLandscapeSidePanel && '!gap-0.5 !px-1.5 !text-[10px]',
                active
                  ? 'border-primary/25 bg-primary/10 text-accent-foreground shadow-sm'
                  : 'border-border/80 bg-card text-muted-foreground hover:border-foreground/25 hover:bg-muted hover:text-foreground'
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

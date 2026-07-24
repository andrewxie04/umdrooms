// browse/ModeTabs.tsx — Now / Schedule / All Rooms segmented control, plus a
// compact date+time picker in Schedule mode (with inline per-day fetch
// progress) and the minimum-duration filter chips in Now mode.

import { CalendarDays, Loader2, RefreshCw } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Progress } from '@/components/ui/progress';
import { useCampusStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { ViewMode } from '@/types/campus';

const MODE_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'now', label: 'Now' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'all', label: 'All Rooms' },
];

const DURATION_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'Any' },
  { value: 60, label: '1h+' },
  { value: 120, label: '2h+' },
  { value: 180, label: '3h+' },
];

// Minimum-seat filter (legacy CAPACITY_FILTER_OPTIONS, sidebarUtils.js).
const CAPACITY_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'All' },
  { value: 20, label: '20+' },
  { value: 50, label: '50+' },
  { value: 100, label: '100+' },
  { value: 150, label: '150+' },
];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toDateInputValue(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toTimeInputValue(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function ModeTabs() {
  const viewMode = useCampusStore((s) => s.viewMode);
  const setViewMode = useCampusStore((s) => s.setViewMode);
  const scheduleDate = useCampusStore((s) => s.scheduleDate);
  const setScheduleDate = useCampusStore((s) => s.setScheduleDate);
  const minDurationMin = useCampusStore((s) => s.minDurationMin);
  const setMinDuration = useCampusStore((s) => s.setMinDuration);
  const minCapacity = useCampusStore((s) => s.minCapacity);
  const setMinCapacity = useCampusStore((s) => s.setMinCapacity);
  const dayFetch = useCampusStore((s) => s.dayFetch);

  function onDateChange(value: string) {
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return;
    const next = new Date(scheduleDate);
    next.setFullYear(y, m - 1, d);
    if (!isNaN(next.getTime())) setScheduleDate(next);
  }

  function onTimeChange(value: string) {
    const [h, min] = value.split(':').map(Number);
    if (isNaN(h) || isNaN(min)) return;
    const next = new Date(scheduleDate);
    next.setHours(h, min, 0, 0);
    if (!isNaN(next.getTime())) setScheduleDate(next);
  }

  // The store only refetches when the day key changes, so retry nudges the
  // schedule date one day out and immediately back to retrigger the fetch.
  function retryDayFetch() {
    const current = scheduleDate;
    const nudged = new Date(current);
    nudged.setDate(nudged.getDate() + 1);
    setScheduleDate(nudged);
    setScheduleDate(new Date(current));
  }

  const showDayFetch = dayFetch.status === 'loading' || dayFetch.status === 'error';

  return (
    <div className="shrink-0 space-y-2.5 px-4 pt-3">
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(value) => {
          if (value) setViewMode(value as ViewMode);
        }}
        aria-label="Availability view mode"
        spacing={1}
        className="w-full rounded-xl bg-muted/70 p-1"
      >
        {MODE_OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className={cn(
              'h-8 flex-1 rounded-lg text-xs font-medium text-muted-foreground transition-colors',
              'data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-xs',
              'hover:text-foreground'
            )}
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {viewMode === 'schedule' && (
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="date"
            value={toDateInputValue(scheduleDate)}
            onChange={(e) => onDateChange(e.target.value)}
            aria-label="Schedule date"
            className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background/80 px-2.5 text-sm text-foreground shadow-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          <input
            type="time"
            value={toTimeInputValue(scheduleDate)}
            onChange={(e) => onTimeChange(e.target.value)}
            aria-label="Schedule start time"
            className="h-9 w-[7.5rem] shrink-0 rounded-lg border border-input bg-background/80 px-2.5 text-sm text-foreground shadow-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
      )}

      {showDayFetch && (
        <div
          role={dayFetch.status === 'error' ? 'alert' : 'status'}
          className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2"
        >
          {dayFetch.status === 'loading' ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                <span>
                  Loading {dayFetch.dateKey ?? 'day'}
                  {dayFetch.totalRooms > 0
                    ? ` — ${dayFetch.completedRooms}/${dayFetch.totalRooms} rooms`
                    : '…'}
                </span>
              </div>
              {dayFetch.indeterminate ? (
                <div className="h-1.5 w-full animate-pulse rounded-full bg-muted" />
              ) : (
                <Progress value={Math.round(dayFetch.progress * 100)} className="h-1.5" />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                {dayFetch.error ?? 'Failed to load that day.'}
              </p>
              <button
                type="button"
                onClick={retryDayFetch}
                className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <RefreshCw className="size-3" />
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {viewMode === 'now' && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="mr-0.5 text-xs text-muted-foreground">Free for</span>
            {DURATION_OPTIONS.map((option) => {
              const active = minDurationMin === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMinDuration(option.value)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5" role="group" aria-label="Minimum seats filter">
            <span className="mr-0.5 text-xs text-muted-foreground">Seats</span>
            {CAPACITY_OPTIONS.map((option) => {
              const active = minCapacity === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMinCapacity(option.value)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

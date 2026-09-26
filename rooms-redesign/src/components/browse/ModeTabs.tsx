// browse/ModeTabs.tsx — Now / Schedule / All Rooms segmented control, plus a
// compact date+time picker in Schedule mode (with inline per-day fetch
// progress) and the minimum-duration filter chips in Now mode.

import { useState } from 'react';
import { CalendarDays, Loader2, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Progress } from '@/components/ui/progress';
import { useCampusStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { ViewMode } from '@/types/campus';
import { useMediaQuery } from '@/components/shell/useMediaQuery';
import { LANDSCAPE_SIDE_QUERY, SIDE_PANEL_QUERY } from '@/components/shell/layout';

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
  const isLandscapeSidePanel = useMediaQuery(LANDSCAPE_SIDE_QUERY);
  const hasSidePanel = useMediaQuery(SIDE_PANEL_QUERY);
  const compactPointerControls = hasSidePanel && !isLandscapeSidePanel;
  const useCompactFilters = !hasSidePanel || isLandscapeSidePanel;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const viewMode = useCampusStore((s) => s.viewMode);
  const setViewMode = useCampusStore((s) => s.setViewMode);
  const scheduleDate = useCampusStore((s) => s.scheduleDate);
  const setScheduleDate = useCampusStore((s) => s.setScheduleDate);
  const minDurationMin = useCampusStore((s) => s.minDurationMin);
  const setMinDuration = useCampusStore((s) => s.setMinDuration);
  const minCapacity = useCampusStore((s) => s.minCapacity);
  const setMinCapacity = useCampusStore((s) => s.setMinCapacity);
  const dayFetch = useCampusStore((s) => s.dayFetch);
  const buildings = useCampusStore((s) => s.buildings);
  const retryDayData = useCampusStore((s) => s.retryDayData);
  const refreshDayData = useCampusStore((s) => s.refreshDayData);

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

  const showDayFetch = dayFetch.status === 'loading' || dayFetch.status === 'error';
  const failedClassroomNames = dayFetch.status === 'error'
    ? buildings.filter((building) => building.dataIssue === 'error' &&
      (building.dataIssueSource === 'classrooms' || building.dataIssueSource === 'both'))
      .map((building) => building.name)
    : [];
  const fetchErrorLabel = failedClassroomNames.length === 1
    ? `${failedClassroomNames[0]} availability could not load.`
    : dayFetch.error ?? 'Classroom availability could not load for this day.';
  const showFreshness = viewMode === 'now' && dayFetch.status === 'ready' &&
    typeof dayFetch.updatedAt === 'number';
  const checkedTime = showFreshness
    ? new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit',
    }).format(dayFetch.updatedAt)
    : '';

  return (
    <div className={cn(
      'shrink-0 space-y-3 border-b border-border/70 px-5 pb-4 pt-4 sm:px-6',
      !hasSidePanel && '!space-y-2 !pb-3 !pt-3',
      isLandscapeSidePanel && '!space-y-1.5 !px-3 !pb-2 !pt-2',
    )}>
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(value) => {
          if (value) setViewMode(value as ViewMode);
        }}
        aria-label="Availability view mode"
        spacing={1}
        className="w-full rounded-lg border border-border/60 bg-muted/60 p-1"
      >
        {MODE_OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className={cn(
              'flex-1 rounded-md text-xs font-semibold text-muted-foreground transition-colors',
              compactPointerControls ? 'h-9' : 'h-11',
              'data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm',
              'hover:text-foreground'
            )}
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {viewMode === 'schedule' && (
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0 text-primary" />
          <input
            type="date"
            value={toDateInputValue(scheduleDate)}
            onChange={(e) => onDateChange(e.target.value)}
            aria-label="Schedule date"
            className={cn('min-w-0 flex-1 rounded-md border border-input bg-background px-2.5 text-sm text-foreground shadow-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20', compactPointerControls ? 'h-10' : 'h-11')}
          />
          <input
            type="time"
            value={toTimeInputValue(scheduleDate)}
            onChange={(e) => onTimeChange(e.target.value)}
            aria-label="Schedule start time"
            className={cn('w-[7.5rem] shrink-0 rounded-md border border-input bg-background px-2.5 text-sm text-foreground shadow-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20', compactPointerControls ? 'h-10' : 'h-11')}
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
              <p className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground">
                {fetchErrorLabel}
              </p>
              <button
                type="button"
                onClick={retryDayData}
                className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <RefreshCw className="size-3" />
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {viewMode === 'now' && (useCompactFilters || showFreshness) && (
        <div className="flex min-h-9 items-center justify-between gap-2">
          {useCompactFilters && (
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="availability-filters"
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground',
                compactPointerControls ? 'min-h-10' : 'min-h-11',
                isLandscapeSidePanel && 'text-[11px]',
              )}
            >
              <SlidersHorizontal className="size-3.5" aria-hidden />
              Filters{minDurationMin > 0 || minCapacity > 0 ? ' · active' : ''}
            </button>
          )}
          {showFreshness && (
            <div className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>Checked <time dateTime={new Date(dayFetch.updatedAt!).toISOString()}>{checkedTime}</time></span>
              <button
                type="button"
                onClick={refreshDayData}
                aria-label="Refresh classroom availability"
                title="Refresh classroom availability"
                className={cn('inline-flex items-center justify-center gap-1 rounded-md text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary', compactPointerControls ? 'min-h-9 min-w-9' : 'min-h-11 min-w-11')}
              >
                <RefreshCw className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          )}
        </div>
      )}

      {viewMode === 'now' && (!useCompactFilters || filtersOpen) && (
        <div id="availability-filters" className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 min-w-12 text-[11px] font-semibold text-muted-foreground">Free for</span>
            {DURATION_OPTIONS.map((option) => {
              const active = minDurationMin === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMinDuration(option.value)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors',
                    compactPointerControls ? 'min-h-10' : 'min-h-11',
                    active
                      ? 'border-primary/25 bg-primary/10 text-accent-foreground'
                      : 'border-border/80 bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Minimum seats filter">
            <span className="mr-1 min-w-12 text-[11px] font-semibold text-muted-foreground">Seats</span>
            {CAPACITY_OPTIONS.map((option) => {
              const active = minCapacity === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMinCapacity(option.value)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors',
                    compactPointerControls ? 'min-h-10' : 'min-h-11',
                    active
                      ? 'border-primary/25 bg-primary/10 text-accent-foreground'
                      : 'border-border/80 bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground'
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

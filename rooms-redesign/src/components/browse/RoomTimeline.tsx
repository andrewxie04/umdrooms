// browse/RoomTimeline.tsx — horizontal 6:00–24:00 availability bar for one
// room. Classroom rooms: green free-track with muted busy blocks from
// room.events. LibCal rooms: muted track with green bookable blocks from
// raw.libcal.available_blocks. A "now" indicator line renders in Now mode and
// a scheduled-time indicator in Schedule mode.

import { useEffect, useMemo, useState } from 'react';
import { useCampusStore } from '@/lib/store';
import type { RoomEntry } from '@/types/campus';
import { cn } from '@/lib/utils';
import { formatDecimalHourLabel, formatHourTick, getCampusDecimalHour } from './utils';

const DAY_START = 6;
const DAY_END = 24;
const DAY_SPAN = DAY_END - DAY_START;
const TICKS = [6, 9, 12, 15, 18, 21, 24];

interface HourBlock {
  start: number;
  end: number;
  label: string | null;
}

function clampToDay(hour: number): number {
  return Math.min(DAY_END, Math.max(DAY_START, hour));
}

function toPct(hour: number): number {
  return ((hour - DAY_START) / DAY_SPAN) * 100;
}

function useBusyBlocks(room: RoomEntry, activeDateKey: string): HourBlock[] {
  return useMemo(() => {
    const events = Array.isArray(room.events) ? room.events : [];
    const blocks: HourBlock[] = [];
    for (const ev of events) {
      const eventDatePart = String(ev?.date || '').split('T')[0];
      if (eventDatePart !== activeDateKey || ev?.status !== 1) continue;
      const start = parseFloat(ev?.time_start);
      const end = parseFloat(ev?.time_end);
      if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
      const clampedStart = clampToDay(start);
      const clampedEnd = clampToDay(end);
      if (clampedEnd <= clampedStart) continue;
      blocks.push({
        start: clampedStart,
        end: clampedEnd,
        label: typeof ev?.event_name === 'string' && ev.event_name ? ev.event_name : null,
      });
    }
    blocks.sort((a, b) => a.start - b.start);
    return blocks;
  }, [room.events, activeDateKey]);
}

function useLibCalAvailableBlocks(room: RoomEntry, activeDateKey: string): HourBlock[] {
  return useMemo(() => {
    const rawBlocks = room.raw?.libcal?.available_blocks;
    if (!Array.isArray(rawBlocks)) return [];
    const blocks: HourBlock[] = [];
    for (const block of rawBlocks) {
      const blockDatePart = String(block?.date || '').split('T')[0];
      if (blockDatePart !== activeDateKey) continue;
      const start = Number(block?.time_start);
      const end = Number(block?.time_end);
      if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
      const clampedStart = clampToDay(start);
      const clampedEnd = clampToDay(end <= start ? end + 24 : end);
      if (clampedEnd <= clampedStart) continue;
      blocks.push({ start: clampedStart, end: clampedEnd, label: null });
    }
    blocks.sort((a, b) => a.start - b.start);
    return blocks;
  }, [room.raw, activeDateKey]);
}

/** Campus-time decimal hour, re-ticked every minute while `live`. */
function useCampusNowHour(live: boolean): number {
  const [nowHour, setNowHour] = useState(() => getCampusDecimalHour(new Date()));
  useEffect(() => {
    if (!live) return;
    const update = () => setNowHour(getCampusDecimalHour(new Date()));
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [live]);
  return nowHour;
}

export function RoomTimeline({ room }: { room: RoomEntry }) {
  const activeDateKey = useCampusStore((s) => s.activeDateKey);
  const viewMode = useCampusStore((s) => s.viewMode);
  const scheduleDate = useCampusStore((s) => s.scheduleDate);

  const isLibCal = room.raw?.source === 'libcal';
  const busyBlocks = useBusyBlocks(room, activeDateKey);
  const libcalBlocks = useLibCalAvailableBlocks(room, activeDateKey);
  const nowHour = useCampusNowHour(viewMode === 'now');

  const showNowLine = viewMode === 'now' && nowHour >= DAY_START && nowHour <= DAY_END;
  const scheduleHour = getCampusDecimalHour(scheduleDate);
  const showScheduleLine =
    viewMode === 'schedule' && scheduleHour >= DAY_START && scheduleHour <= DAY_END;

  return (
    <div className="select-none">
      <div
        className={cn(
          'relative h-6 overflow-hidden rounded-md',
          isLibCal ? 'bg-muted/70' : 'bg-status-available/20 dark:bg-status-available/15'
        )}
        role="img"
        aria-label={
          isLibCal
            ? `${room.name} bookable blocks between 6 AM and midnight`
            : `${room.name} bookings between 6 AM and midnight`
        }
      >
        {isLibCal
          ? libcalBlocks.map((block, i) => (
              <div
                key={i}
                className="absolute inset-y-0 rounded-[3px] bg-status-available/60"
                style={{ left: `${toPct(block.start)}%`, width: `${toPct(block.end) - toPct(block.start)}%` }}
                title={`Bookable ${formatDecimalHourLabel(block.start)} – ${formatDecimalHourLabel(block.end)}`}
              />
            ))
          : busyBlocks.map((block, i) => (
              <div
                key={i}
                className="absolute inset-y-0 rounded-[3px] bg-muted-foreground/30 dark:bg-muted-foreground/40"
                style={{ left: `${toPct(block.start)}%`, width: `${toPct(block.end) - toPct(block.start)}%` }}
                title={`${block.label ? `${block.label} · ` : ''}Busy ${formatDecimalHourLabel(block.start)} – ${formatDecimalHourLabel(block.end)}`}
              />
            ))}

        {showScheduleLine && (
          <div
            className="absolute inset-y-0 w-px border-l border-dashed border-foreground/50"
            style={{ left: `${toPct(scheduleHour)}%` }}
            title={`Selected time ${formatDecimalHourLabel(scheduleHour)}`}
          />
        )}
        {showNowLine && (
          <div
            className="absolute inset-y-0 w-0.5 rounded-full bg-primary"
            style={{ left: `calc(${toPct(nowHour)}% - 1px)` }}
            title={`Now ${formatDecimalHourLabel(nowHour)}`}
          />
        )}
      </div>

      <div className="mt-1 flex items-center justify-between text-[10px] leading-none text-muted-foreground">
        {TICKS.map((tick) => (
          <span key={tick} className="w-7 text-center first:text-left last:text-right">
            {formatHourTick(tick)}
          </span>
        ))}
      </div>

      <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
        {isLibCal ? (
          <>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-[2px] bg-status-available/60" /> Bookable
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-[2px] bg-muted-foreground/30" /> Unavailable
            </span>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-[2px] bg-status-available/60" /> Free
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-[2px] bg-muted-foreground/30" /> Busy
            </span>
            {busyBlocks.length === 0 && <span className="italic">No bookings this day</span>}
          </>
        )}
      </div>
    </div>
  );
}

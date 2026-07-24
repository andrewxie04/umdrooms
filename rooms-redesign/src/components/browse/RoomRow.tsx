// browse/RoomRow.tsx — one expandable room row inside BuildingDetail. Shows
// status (with an 'until h:mm a' pill for available rooms in Now mode),
// capacity, a favorite star, a 'Book' badge for LibCal-sourced rooms (emits
// the room selection for the features agent's booking flow), and expands to
// reveal the RoomTimeline plus the live-site parity detail card: share action,
// type/floor/capacity grid, feature chips, and the day's event list with
// per-event expand/collapse.

import { useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ExternalLink, Share2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCampusStore } from '@/lib/store';
import {
  playErrorHaptic,
  playSelectionHaptic,
  playSuccessHaptic,
} from '@/lib/haptics.js';
import type { RoomEntry } from '@/types/campus';
import { getDateKey } from '@/lib/availabilityData.js';
import {
  STATUS_DOT_CLASS,
  STATUS_LABEL,
  copyTextToClipboard,
  formatDecimalHourLabel,
  getCampusDecimalHour,
  getRoomFeatureTags,
  getRoomFloor,
  getRoomNoteLines,
  getSupplementalHoursLines,
  parseEventNames,
} from './utils';
import { RoomTimeline } from './RoomTimeline';

export function RoomRow({
  room,
  buildingCode,
  buildingName,
  expanded,
  selected,
  isFavorite,
  onToggleExpand,
  onToggleFavorite,
  onBook,
}: {
  room: RoomEntry;
  buildingCode: string;
  buildingName: string;
  expanded: boolean;
  selected: boolean;
  isFavorite: boolean;
  onToggleExpand: () => void;
  onToggleFavorite: () => void;
  onBook: () => void;
}) {
  const viewMode = useCampusStore((s) => s.viewMode);
  const scheduleDate = useCampusStore((s) => s.scheduleDate);

  const isLibCal = room.raw?.source === 'libcal';
  const capacity = Number(room.raw?.capacity);
  // The availability engine's display status is richer than the 4-value
  // contract Status: surface 'Closed' (after hours/weekend/holiday) and
  // 'Bookable Later' (LibCal room free later today) verbatim, matching the
  // legacy label semantics. The contract status still drives map markers.
  const engineStatus =
    room.displayStatus === 'Closed' || room.displayStatus === 'Bookable Later'
      ? room.displayStatus
      : null;
  const metaParts = [
    room.status === 'available' && room.availableUntil
      ? `Available until ${room.availableUntil}`
      : (engineStatus ?? STATUS_LABEL[room.status]),
  ];
  if (Number.isFinite(capacity) && capacity > 0) {
    metaParts.push(`${capacity} seat${capacity === 1 ? '' : 's'}`);
  }
  // Legacy colors: closed = neutral gray, bookable-later = accent blue.
  const statusDotClass =
    engineStatus === 'Closed'
      ? STATUS_DOT_CLASS.unknown
      : engineStatus === 'Bookable Later'
        ? 'bg-sky-500'
        : STATUS_DOT_CLASS[room.status];

  // Ported from legacy handleShareRoom: navigator.share with clipboard
  // fallback; URL carries ?building=&room= (+ start= in schedule mode).
  const handleShare = async () => {
    playSelectionHaptic();
    const base = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams();
    params.set('building', buildingCode);
    params.set('room', room.name);
    if (viewMode === 'schedule') {
      params.set('start', scheduleDate.toISOString());
    }
    const url = `${base}?${params.toString()}`;

    const lines = [`📍 ${buildingName} — ${room.name}`];
    if (viewMode === 'schedule') {
      lines.push(
        `📅 ${scheduleDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })}`
      );
      lines.push(
        `🕐 ${scheduleDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
      );
    }
    lines.push('');
    lines.push(url);
    const text = lines.join('\n');

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: `${buildingName} — ${room.name}`, text });
        playSuccessHaptic();
      } catch {
        playErrorHaptic();
      }
    } else {
      try {
        await copyTextToClipboard(text);
        playSuccessHaptic();
      } catch {
        playErrorHaptic();
      }
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border transition-colors',
        selected
          ? 'border-primary/40 bg-primary/5'
          : 'border-transparent hover:bg-accent/60',
        expanded && !selected && 'bg-accent/40'
      )}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand();
          }
        }}
        className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-xl"
      >
        <span
          className={cn('size-2.5 shrink-0 rounded-full', statusDotClass)}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">{room.name}</span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {metaParts.join(' · ')}
          </span>
        </span>

        {isLibCal && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBook();
            }}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
          >
            <BookOpen className="size-3" />
            Book
          </button>
        )}

        <button
          type="button"
          aria-label={isFavorite ? `Remove ${room.name} from favorites` : `Add ${room.name} to favorites`}
          aria-pressed={isFavorite}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={cn(
            'shrink-0 rounded-md p-1.5 transition-colors hover:bg-muted',
            isFavorite ? 'text-status-opening-soon' : 'text-muted-foreground/50 hover:text-muted-foreground'
          )}
        >
          <Star className={cn('size-4', isFavorite && 'fill-current')} />
        </button>

        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-0.5">
          <RoomTimeline room={room} />
          <RoomDetailGrid room={room} isLibCal={isLibCal} capacity={capacity} />
          <RoomEventList room={room} isLibCal={isLibCal} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Share2 className="size-3.5" />
              {viewMode === 'schedule' ? 'Share Room & Time' : 'Share Room'}
            </button>
            {/* Supplemental source links (legacy Sidebar.js:3115-3130). */}
            {!isLibCal && typeof room.raw?.source_url === 'string' && room.raw.source_url && (
              <a
                href={room.raw.source_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                <ExternalLink className="size-3.5" />
                {room.raw?.source_label || 'Official Source'}
              </a>
            )}
            {!isLibCal &&
              typeof room.raw?.source_secondary_url === 'string' &&
              room.raw.source_secondary_url && (
                <a
                  href={room.raw.source_secondary_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <ExternalLink className="size-3.5" />
                  {room.raw?.source_secondary_label || 'More Info'}
                </a>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Detail grid: TYPE / FLOOR / CAPACITY / FEATURES (live-site parity) ----

function DetailItem({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('min-w-0', wide && 'col-span-2')}>
      <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function RoomDetailGrid({
  room,
  isLibCal,
  capacity,
}: {
  room: RoomEntry;
  isLibCal: boolean;
  capacity: number;
}) {
  const type = isLibCal ? 'Study Room' : room.raw?.type || 'Classroom';
  const featureTags = isLibCal
    ? [
        ...(Number.isFinite(capacity) && capacity > 0 ? [`Capacity ${capacity}`] : []),
        'Reservable',
        'LibCal',
      ]
    : getRoomFeatureTags(room);
  // Supplemental parity: posted-hours summary (computer labs, The Loft, One
  // Button Studio) and access/details notes (legacy Sidebar.js:1654, :1672-1709).
  const hoursLines = getSupplementalHoursLines(room);
  const noteLines = getRoomNoteLines(room);

  return (
    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 rounded-lg border border-border/50 bg-muted/30 p-3">
      <DetailItem label="Type">
        <span className="text-xs font-medium text-foreground">{type}</span>
      </DetailItem>
      <DetailItem label="Floor">
        <span className="text-xs font-medium text-foreground">{getRoomFloor(room)}</span>
      </DetailItem>
      {Number.isFinite(capacity) && capacity > 0 && !isLibCal && (
        <DetailItem label="Capacity">
          <span className="text-xs font-medium text-foreground">{capacity} people</span>
        </DetailItem>
      )}
      <DetailItem label={isLibCal ? 'Details' : 'Features'} wide>
        {featureTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {featureTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/60 bg-background px-2 py-0.5 text-[11px] font-medium text-foreground/80"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">None listed</span>
        )}
      </DetailItem>
      {hoursLines.length > 0 && (
        <DetailItem label="Hours" wide>
          <div className="space-y-0.5">
            {hoursLines.map((line) => (
              <span key={line} className="block text-xs font-medium text-foreground">
                {line}
              </span>
            ))}
          </div>
        </DetailItem>
      )}
      {noteLines.length > 0 && (
        <DetailItem label="Notes" wide>
          <div className="space-y-0.5">
            {noteLines.map((line) => (
              <span key={line} className="block text-xs text-foreground/90">
                {line}
              </span>
            ))}
          </div>
        </DetailItem>
      )}
    </div>
  );
}

// --- Event list: today's events with course names + expand/collapse --------

interface EventRowData {
  key: string;
  startLabel: string;
  endLabel: string;
  names: string[];
  isActive: boolean;
}

function RoomEventList({ room, isLibCal }: { room: RoomEntry; isLibCal: boolean }) {
  const activeDateKey = useCampusStore((s) => s.activeDateKey);
  const viewMode = useCampusStore((s) => s.viewMode);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const rows = useMemo<EventRowData[]>(() => {
    const nowHour = getCampusDecimalHour(new Date());
    const isToday = activeDateKey === getDateKey(new Date());
    const out: EventRowData[] = [];

    if (isLibCal) {
      const blocks = Array.isArray(room.raw?.libcal?.available_blocks)
        ? room.raw.libcal.available_blocks
        : [];
      blocks.forEach((block: any, idx: number) => {
        const datePart = String(block?.date || '').split('T')[0];
        if (datePart !== activeDateKey) return;
        const start = Number(block?.time_start);
        const rawEnd = Number(block?.time_end);
        if (!Number.isFinite(start) || !Number.isFinite(rawEnd)) return;
        const end = rawEnd <= start ? rawEnd + 24 : rawEnd;
        out.push({
          key: `libcal-${idx}`,
          startLabel: formatDecimalHourLabel(start),
          endLabel: formatDecimalHourLabel(end),
          names: ['Available to reserve'],
          isActive: isToday && nowHour >= start && nowHour < end,
        });
      });
    } else {
      const events = Array.isArray(room.events) ? room.events : [];
      events.forEach((ev: any, idx: number) => {
        const datePart = String(ev?.date || '').split('T')[0];
        if (datePart !== activeDateKey || ev?.status !== 1) return;
        const start = parseFloat(ev?.time_start);
        const end = parseFloat(ev?.time_end);
        if (!Number.isFinite(start) || !Number.isFinite(end)) return;
        out.push({
          key: `ev-${idx}`,
          startLabel: formatDecimalHourLabel(start),
          endLabel: formatDecimalHourLabel(end),
          names: parseEventNames(ev?.event_name),
          isActive: isToday && nowHour >= start && nowHour < end,
        });
      });
    }

    return out;
  }, [room, isLibCal, activeDateKey]);

  const toggle = (key: string) =>
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="mt-3">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {isLibCal ? 'Available Blocks' : viewMode === 'now' ? "Today's Events" : 'Events'}
      </span>
      {rows.length === 0 ? (
        <p className="mt-1 text-xs italic text-muted-foreground">
          {isLibCal ? 'No bookable times on this date' : 'No events scheduled'}
        </p>
      ) : (
        <div className="mt-1.5 space-y-1">
          {rows.map((row) => {
            const isExpanded = expandedKeys.has(row.key);
            const visibleNames = isExpanded ? row.names : row.names.slice(0, 3);
            const overflow = Math.max(0, row.names.length - visibleNames.length);
            const canToggle = row.names.length > 3;

            return (
              <div
                key={row.key}
                className={cn(
                  'flex items-baseline gap-2.5 rounded-md px-2 py-1.5 text-xs',
                  row.isActive ? 'bg-status-available/10' : 'bg-muted/40'
                )}
              >
                <span className="shrink-0 tabular-nums font-medium text-foreground/90">
                  {row.startLabel} – {row.endLabel}
                </span>
                <span className="min-w-0 flex-1 text-muted-foreground">
                  {visibleNames.join(', ') || 'Busy'}
                  {canToggle && (
                    <button
                      type="button"
                      onClick={() => toggle(row.key)}
                      className="ml-1 font-medium text-primary hover:underline"
                    >
                      {isExpanded ? 'Show less' : `+${overflow} more`}
                    </button>
                  )}
                </span>
                {row.isActive && (
                  <span className="shrink-0 rounded-full bg-status-available/15 px-1.5 py-0.5 text-[10px] font-medium text-status-available">
                    Now
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// src/components/features/LegendSheet.tsx
//
// Map legend sheet, shown while the store's `legendOpen` flag is set.
// Explains the status colors, each marker overlay, and credits the data
// sources. Closes via setLegendOpen(false). Designed to sit inside the
// desktop panel / mobile bottom sheet (owns its own scrolling).

import { useCampusStore } from '@/lib/store';
import type { OverlayKind, Status } from '@/types/campus';
import { CloseButton, SectionHeader, StatusDot } from './ui-bits';
import { cn } from '@/lib/utils';

const STATUS_ROWS: { status: Status; label: string; description: string }[] = [
  {
    status: 'available',
    label: 'Available',
    description: 'Open right now for the selected time window.',
  },
  {
    status: 'opening-soon',
    label: 'Opening Soon',
    description: 'Opens shortly — or a paid/visitor caution for parking garages.',
  },
  {
    status: 'unavailable',
    label: 'Unavailable',
    description: 'Closed, fully booked, or permit-required right now.',
  },
  {
    status: 'unknown',
    label: 'Unknown',
    description: 'No data for the selected time yet.',
  },
];

const OVERLAY_ROWS: { kind: OverlayKind; label: string; description: string }[] = [
  {
    kind: 'classrooms',
    label: 'Classrooms',
    description: 'General-purpose classroom buildings with live room availability.',
  },
  {
    kind: 'library',
    label: 'Study Rooms',
    description: 'Bookable library study rooms; many can be reserved in-app.',
  },
  {
    kind: 'dining',
    label: 'Dining',
    description: 'Dining halls, markets, and campus shops with hours and menus.',
  },
  {
    kind: 'parking',
    label: 'Parking',
    description: 'Lots and garages with time-aware free / restricted status.',
  },
];

const CREDITS: { source: string; detail: string }[] = [
  { source: 'UMD 25Live', detail: 'Classroom schedules and availability' },
  { source: 'LibCal (UMD Libraries)', detail: 'Study-room inventory and booking' },
  { source: 'UMD Dining Services', detail: 'Dining halls, menus, and shop hours' },
  { source: 'UMD Transportation (DOTS)', detail: 'Parking rules and restrictions' },
];

export function LegendSheet() {
  const legendOpen = useCampusStore((s) => s.legendOpen);
  const activeOverlays = useCampusStore((s) => s.activeOverlays);
  const setLegendOpen = useCampusStore((s) => s.setLegendOpen);

  if (!legendOpen) return null;

  return (
    <div className="flex h-full w-full max-w-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Reference
          </div>
          <h2 className="text-base font-semibold text-foreground">Map Legend</h2>
        </div>
        <CloseButton onClose={() => setLegendOpen(false)} label="Close legend" />
      </div>

      <div className="rooms-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        <SectionHeader className="mt-0">Status Colors</SectionHeader>
        <div className="space-y-2">
          {STATUS_ROWS.map((row) => (
            <div key={row.status} className="flex items-start gap-3">
              <StatusDot status={row.status} className="mt-1.5" />
              <div>
                <div className="text-sm font-medium text-foreground">{row.label}</div>
                <div className="text-xs leading-relaxed text-muted-foreground">
                  {row.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <SectionHeader>Map Layers</SectionHeader>
        <div className="space-y-2">
          {OVERLAY_ROWS.map((row) => {
            const active = activeOverlays.includes(row.kind);
            return (
              <div
                key={row.kind}
                className={cn(
                  'rounded-xl border border-border bg-card px-3 py-2.5',
                  !active && 'opacity-55'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-foreground">{row.label}</div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      active
                        ? 'bg-status-available/10 text-status-available'
                        : 'bg-secondary text-muted-foreground'
                    )}
                  >
                    {active ? 'On' : 'Off'}
                  </span>
                </div>
                <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {row.description}
                </div>
              </div>
            );
          })}
        </div>

        <SectionHeader>Data Sources</SectionHeader>
        <div className="space-y-1.5">
          {CREDITS.map((credit) => (
            <div key={credit.source} className="text-xs leading-relaxed">
              <span className="font-medium text-foreground">{credit.source}</span>
              <span className="text-muted-foreground"> — {credit.detail}</span>
            </div>
          ))}
        </div>

        <p className="mt-5 rounded-xl border border-border bg-secondary/50 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
          Rooms is an independent student-built project and is not an official University of
          Maryland service. Double-check time-sensitive details with the official source.
        </p>
      </div>
    </div>
  );
}

export default LegendSheet;

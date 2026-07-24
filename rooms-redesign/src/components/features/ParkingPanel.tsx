// src/components/features/ParkingPanel.tsx
//
// Parking lot detail panel, shown when the store selection is
// { kind: 'parking' }. Ports the legacy Sidebar.js parking card behavior:
//   - time-aware status badge (Free / Visitor-paid / Permit-required) driven
//     by the store's derived ParkingLot (status + statusText)
//   - LOCATION / RULES info card (same visual language as the room detail
//     grid: rounded muted card with mini uppercase labels)
//   - "as of" note in schedule mode so the time-awareness stays honest
//   - walking directions + back, campus-wide fine print as a footnote

import { format } from 'date-fns';
import { Info } from 'lucide-react';
import { useCampusStore } from '@/lib/store';
import { playSelectionHaptic } from '@/lib/haptics.js';
import type { Status } from '@/types/campus';
import {
  GhostButton,
  PanelFrame,
  PrimaryButton,
  StatusBadge,
  openWalkingDirections,
} from './ui-bits';

const RAW_STATUS_META: Record<string, { status: Status; label: string }> = {
  Free: { status: 'available', label: 'Free Now' },
  Visitor: { status: 'opening-soon', label: 'Visitor / Paid' },
  Restricted: { status: 'unavailable', label: 'Permit Required' },
};

export function ParkingPanel() {
  const selected = useCampusStore((s) => s.selected);
  const parking = useCampusStore((s) => s.parking);
  const viewMode = useCampusStore((s) => s.viewMode);
  const scheduleDate = useCampusStore((s) => s.scheduleDate);
  const clearSelection = useCampusStore((s) => s.clearSelection);

  if (selected?.kind !== 'parking') return null;

  const lot = parking.find((l) => String(l.id) === String(selected.id));
  const raw: any = lot?.raw ?? {};
  const meta = RAW_STATUS_META[String(raw.status ?? '')] ?? {
    status: lot?.status ?? 'unknown',
    label: 'Unknown',
  };
  const description = raw.description || '';

  return (
    <PanelFrame eyebrow="Parking" title={lot?.name ?? 'Parking'} onBack={clearSelection}>
      {!lot ? (
        <p className="text-sm text-muted-foreground">Loading parking details…</p>
      ) : (
        <>
          {/* Time-aware status */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={meta.status} label={meta.label} />
            {viewMode === 'schedule' ? (
              <span className="text-xs text-muted-foreground">
                as of {format(scheduleDate, 'EEE, MMM d h:mm a')}
              </span>
            ) : null}
          </div>

          {/* Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <PrimaryButton
              onClick={() => {
                playSelectionHaptic();
                openWalkingDirections(lot.lat, lot.lng);
              }}
            >
              Navigate to Lot
            </PrimaryButton>
            <GhostButton
              onClick={() => {
                playSelectionHaptic();
                window.open(
                  'https://transportation.umd.edu/parking',
                  '_blank',
                  'noopener,noreferrer'
                );
              }}
            >
              UMD Parking Rules
            </GhostButton>
          </div>

          {/* Info card — same visual language as the room detail grid */}
          {description || lot.statusText ? (
            <div className="mt-4 space-y-3 rounded-lg border border-border/50 bg-muted/30 p-3">
              {description ? (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Location
                  </div>
                  <div className="mt-0.5 text-sm leading-relaxed text-foreground/90">
                    {description}
                  </div>
                </div>
              ) : null}
              {lot.statusText ? (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Rules
                  </div>
                  <div className="mt-0.5 text-sm leading-relaxed text-foreground/90">
                    {lot.statusText}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Campus-wide fine print */}
          <div className="mt-3 flex gap-2 rounded-lg bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <p>
              Unrestricted lots are generally free weekdays 4 PM–7 AM and all day on weekends
              (Friday 4 PM–Monday 7 AM). Visitor garages are paid 24/7. Always confirm with
              posted signage — event days can change restrictions.
            </p>
          </div>
        </>
      )}
    </PanelFrame>
  );
}

export default ParkingPanel;

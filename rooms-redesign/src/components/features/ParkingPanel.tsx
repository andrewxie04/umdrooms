// src/components/features/ParkingPanel.tsx
//
// Parking lot detail panel, shown when the store selection is
// { kind: 'parking' }. Ports the legacy Sidebar.js parking card behavior:
//   - time-aware status badge (Free / Visitor-paid / Permit-required) driven
//     by the store's derived ParkingLot (status + statusText)
//   - rule summary as the badge subtitle (statusText) + location description
//     from the lot's raw feature properties (parkingData.js)
//   - "as of" note in schedule mode so the time-awareness stays honest
//   - walking directions + back

import { format } from 'date-fns';
import { useCampusStore } from '@/lib/store';
import { playSelectionHaptic } from '@/lib/haptics.js';
import type { Status } from '@/types/campus';
import {
  DetailBlock,
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
          </div>
          {lot.statusText ? (
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">{lot.statusText}</p>
          ) : null}
          {viewMode === 'schedule' ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Status as of {format(scheduleDate, 'EEE, MMM d h:mm a')}
            </p>
          ) : null}

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

          {description ? <DetailBlock label="Location">{description}</DetailBlock> : null}

          <DetailBlock label="Good to Know">
            <p className="text-muted-foreground">
              Unrestricted lots are generally free weekdays 4 PM–7 AM and all day on weekends
              (Friday 4 PM–Monday 7 AM). Visitor garages are paid 24/7. Always confirm with
              posted signage — event days can change restrictions.
            </p>
          </DetailBlock>
        </>
      )}
    </PanelFrame>
  );
}

export default ParkingPanel;

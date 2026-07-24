// src/components/map3d/MapLegendChip3D.tsx
//
// Tiny collapsible status legend pinned to the bottom-right of the 3D map.
// Ported from map/MapLegendChip.tsx; hidden while the full legend sheet
// (store.legendOpen, owned by the features agent) is open so the two never
// compete.

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCampusStore } from '@/lib/store';

const ITEMS = [
  { key: 'available', label: 'Available', dot: 'bg-status-available' },
  { key: 'opening-soon', label: 'Opening soon', dot: 'bg-status-opening-soon' },
  { key: 'unavailable', label: 'Unavailable', dot: 'bg-status-unavailable' },
] as const;

export default function MapLegendChip3D() {
  const legendOpen = useCampusStore((s) => s.legendOpen);
  const [collapsed, setCollapsed] = useState(false);

  if (legendOpen) return null;

  return (
    // On mobile, lift the chip above the bottom sheet's 15% peek (AppShell
    // SNAP_PEEK = 0.15 -> 15dvh) so it isn't covered; bottom-3 on desktop.
    <div
      data-map-legend
      className="absolute bottom-3 right-2.5 z-10 select-none max-lg:bottom-[calc(15dvh+12px)]"
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card/90 shadow-md backdrop-blur">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-accent/60"
          aria-expanded={!collapsed}
        >
          Legend
          {collapsed ? (
            <ChevronUp className="h-3 w-3 text-muted-foreground" aria-hidden />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden />
          )}
        </button>
        {!collapsed && (
          <div className="space-y-1 px-2.5 pb-2">
            {ITEMS.map((item) => (
              <div key={item.key} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 shrink-0 rounded-full ${item.dot}`} />
                <span className="text-[10.5px] leading-none text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

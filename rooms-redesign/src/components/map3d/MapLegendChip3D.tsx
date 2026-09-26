// src/components/map3d/MapLegendChip3D.tsx
//
// Tiny collapsible status legend. Full data credits live in the info sheet.

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCampusStore } from '@/lib/store';
import { useMediaQuery } from '@/components/shell/useMediaQuery';
import { SIDE_PANEL_QUERY } from '@/components/shell/layout';

const ITEMS = [
  { key: 'available', label: 'Available', dot: 'bg-status-available' },
  { key: 'opening-soon', label: 'Opening soon', dot: 'bg-status-opening-soon' },
  { key: 'unavailable', label: 'Unavailable', dot: 'bg-status-unavailable' },
] as const;

export default function MapLegendChip3D() {
  const legendOpen = useCampusStore((s) => s.legendOpen);
  const hasSidePanel = useMediaQuery(SIDE_PANEL_QUERY);
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div
      data-map-legend
      className={`absolute z-10 flex flex-col items-start gap-1.5 select-none ${hasSidePanel ? 'bottom-3 right-3 items-end' : 'left-3 top-3'}`}
    >
      {!legendOpen && <div className="overflow-hidden rounded-lg border border-border/80 bg-card/95 shadow-lg shadow-black/10 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex min-h-10 w-full items-center justify-between gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-accent/60 focus-visible:outline-2 focus-visible:outline-primary max-[379px]:h-11 max-[379px]:w-[58px] max-[379px]:justify-center max-[379px]:gap-0 max-[379px]:px-0 max-[379px]:py-0 max-[379px]:tracking-[0.08em]"
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Show map legend' : 'Hide map legend'}
        >
          <span>Legend</span>
          {collapsed ? (
            <ChevronUp className="h-3 w-3 text-muted-foreground max-[379px]:hidden" aria-hidden />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground max-[379px]:hidden" aria-hidden />
          )}
        </button>
        {!collapsed && (
          <div className="space-y-1.5 border-t border-border/60 px-3 pb-2.5 pt-2 max-[379px]:mt-4">
            {ITEMS.map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${item.dot}`} />
                <span className="text-[11px] leading-none text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>}
    </div>
  );
}

import { ExternalLink, MapPin, Navigation } from 'lucide-react';
import { useCampusStore } from '@/lib/store';
import { RESIDENCE_HALLS, residenceHallDetailsUrl } from '@/lib/residenceHalls';
import { playSelectionHaptic } from '@/lib/haptics.js';
import { useFocusPlaceOnMap } from '@/components/common/useFocusPlaceOnMap';
import { PanelFrame, openWalkingDirections } from './ui-bits';

export function ResidencePanel() {
  const selected = useCampusStore((state) => state.selected);
  const clearSelection = useCampusStore((state) => state.clearSelection);
  const focusPlaceOnMap = useFocusPlaceOnMap();
  if (selected?.kind !== 'residence') return null;
  const hall = RESIDENCE_HALLS.find((place) => place.id === selected.id);
  if (!hall) return null;

  return (
    <PanelFrame eyebrow="Residence hall" title={hall.name} onBack={clearSelection}>
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <MapPin className="size-4 text-primary" aria-hidden />
          {hall.community} Community
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => focusPlaceOnMap(hall.lat, hall.lng)}
          aria-label={`View ${hall.name} on the 3D map`}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <MapPin className="size-4" aria-hidden />
          <span className="sm:hidden">3D map</span>
          <span className="hidden sm:inline">View on 3D map</span>
        </button>
        <button
          type="button"
          onClick={() => {
            playSelectionHaptic();
            openWalkingDirections(hall.lat, hall.lng);
          }}
          aria-label={`Walking directions to ${hall.name}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Navigation className="size-4" aria-hidden />
          <span className="sm:hidden">Directions</span>
          <span className="hidden sm:inline">Walking directions</span>
        </button>
        <a
          href={residenceHallDetailsUrl(hall)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          UMD hall details <ExternalLink className="size-4" aria-hidden />
        </a>
      </div>
    </PanelFrame>
  );
}

import { Building2, MapPin, Navigation } from 'lucide-react';
import { useCampusStore } from '@/lib/store';
import { getMapBuilding } from '@/lib/mapPlaces';
import { playSelectionHaptic } from '@/lib/haptics.js';
import { useFocusPlaceOnMap } from '@/components/common/useFocusPlaceOnMap';
import { PanelFrame, openWalkingDirections } from './ui-bits';

export function MapBuildingPanel() {
  const selected = useCampusStore((state) => state.selected);
  const clearSelection = useCampusStore((state) => state.clearSelection);
  const focusPlaceOnMap = useFocusPlaceOnMap();
  if (selected?.kind !== 'map-building') return null;
  const place = getMapBuilding(selected.id);
  if (!place) return null;
  const isStadium = selected.id === 'way/980371045';

  return (
    <PanelFrame eyebrow="On the 3D map" title={place.name} onBack={clearSelection}>
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Building2 className="size-4 text-primary" aria-hidden />
          {isStadium ? 'Athletics venue' : place.code ? `Campus building · ${place.code}` : 'Campus building'}
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          No room availability listed.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => focusPlaceOnMap(place.lat, place.lng, isStadium ? 16.9 : 18.45, isStadium ? 60 : 31)}
          aria-label={`View ${place.name} on the 3D map`}
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
            openWalkingDirections(place.lat, place.lng);
          }}
          aria-label={`Walking directions to ${place.name}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Navigation className="size-4" aria-hidden />
          <span className="sm:hidden">Directions</span>
          <span className="hidden sm:inline">Walking directions</span>
        </button>
      </div>
    </PanelFrame>
  );
}

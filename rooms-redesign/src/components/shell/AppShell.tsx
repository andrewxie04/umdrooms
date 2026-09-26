// shell/AppShell.tsx — responsive application shell around the browse column.
//
//   Wide tablets and desktops: floating left panel (up to 420px, top-left offset, max-height
//             calc(100vh-2rem), rounded-2xl, warm translucent surface, elegant
//             shadow) — the map shows through around it.
//   Short landscape phones: compact scrollable side panel so search and map
//             are usable together.
//   Other portrait screens: map-first vaul bottom sheet with viewport-aware peek /
//             detail / expanded snap points; auto-raises for selections.
//
// Mounted by the integration stage next to <CampusMap/>; reads the campus
// store directly and never calls init() itself. Panel content is provided by
// the integration stage as `children` (the PanelRouter).

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { ChevronDown, ChevronUp, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useCampusStore } from '@/lib/store';
import { resolveBuildingSelection } from '@/components/browse/utils';
import { getMapBuilding } from '@/lib/mapPlaces';
import { RESIDENCE_HALLS } from '@/lib/residenceHalls';
import { useMediaQuery } from './useMediaQuery';
import { MobileSheetContext } from './MobileSheetContext';
import { LANDSCAPE_SIDE_QUERY, WIDE_SIDE_QUERY, mobileMapPeek, mobileSheetSnapPoints } from './layout';

const MAP_STOP = 0;
const BROWSE_STOP = 1;
const DETAIL_STOP = 2;
const EXPANDED_STOP = 3;
// A full browse sheet leaves too little map visible on short phones. Start
// with the map and let the large bottom cue open search and building results.
const SHORT_PHONE_HEIGHT = 720;

function subscribeViewportHeight(onChange: () => void): () => void {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

function getViewportHeight(): number {
  return window.innerHeight;
}

export default function AppShell({ children }: { children: ReactNode }) {
  const isWideSidePanel = useMediaQuery(WIDE_SIDE_QUERY);
  const isLandscapeSidePanel = useMediaQuery(LANDSCAPE_SIDE_QUERY);
  const selected = useCampusStore((s) => s.selected);
  const buildings = useCampusStore((s) => s.buildings);
  const dining = useCampusStore((s) => s.dining);
  const parking = useCampusStore((s) => s.parking);
  const browsePanelHidden = useCampusStore((s) => s.browsePanelHidden);
  const setBrowsePanelHidden = useCampusStore((s) => s.setBrowsePanelHidden);
  const legendOpen = useCampusStore((s) => s.legendOpen);
  const favoritesOpen = useCampusStore((s) => s.favoritesOpen);
  // Read the current height during the breakpoint render. A delayed resize
  // effect could mount Vaul with desktop snap points on a newly narrow screen.
  const viewportHeight = useSyncExternalStore(subscribeViewportHeight, getViewportHeight, () => 800);
  const compactDetail = selected != null;
  const briefKind = selected?.kind === 'map-building' ? 'map'
    : selected?.kind === 'residence' ? 'residence' : null;
  const selectedBuilding = selected?.kind === 'building' || selected?.kind === 'room'
    ? resolveBuildingSelection(buildings, selected) : null;
  let selectedName: string | undefined;
  switch (selected?.kind) {
    case 'room':
      selectedName = selectedBuilding?.room?.name ?? selectedBuilding?.building.name;
      break;
    case 'building':
      selectedName = selectedBuilding?.building.name;
      break;
    case 'dining':
      selectedName = dining.find((place) => place.id === selected.id)?.name;
      break;
    case 'parking':
      selectedName = parking.find((place) => place.id === selected.id)?.name;
      break;
    case 'residence':
      selectedName = RESIDENCE_HALLS.find((place) => place.id === selected.id)?.name;
      break;
    case 'map-building':
      selectedName = getMapBuilding(selected.id)?.name;
      break;
  }
  const landscapeBriefKind = !legendOpen && !favoritesOpen ? briefKind : null;
  const snapPoints = useMemo(() => [
    mobileMapPeek(viewportHeight),
    ...mobileSheetSnapPoints(viewportHeight, compactDetail, briefKind),
  ], [viewportHeight, compactDetail, briefKind]);
  const [snapIndex, setSnapIndexState] = useState(() =>
    selected ? BROWSE_STOP
      : legendOpen || favoritesOpen ? DETAIL_STOP
        : viewportHeight < SHORT_PHONE_HEIGHT ? MAP_STOP : BROWSE_STOP,
  );
  const snapIndexRef = useRef(snapIndex);
  const returnSnapIndexRef = useRef(BROWSE_STOP);
  const setSnapIndex = (next: number) => {
    snapIndexRef.current = next;
    setSnapIndexState(next);
  };
  const setActiveSnapPoint: Dispatch<SetStateAction<number | string | null>> = (next) => {
    const value = typeof next === 'function' ? next(snapPoints[snapIndex]) : next;
    const index = snapPoints.indexOf(Number(value));
    if (index >= 0) setSnapIndex(index);
  };

  // Give details and secondary panels room, then return to the browse height
  // the user had chosen (peek, middle, or expanded) when they close.
  useEffect(() => useCampusStore.subscribe((state, previous) => {
    const wasPanelOpen = Boolean(previous.selected || previous.legendOpen || previous.favoritesOpen);
    const isPanelOpen = Boolean(state.selected || state.legendOpen || state.favoritesOpen);
    if (!wasPanelOpen && isPanelOpen) {
      returnSnapIndexRef.current = snapIndexRef.current;
      setSnapIndex(state.selected ? BROWSE_STOP : DETAIL_STOP);
    } else if (state.selected && state.selected !== previous.selected) {
      setSnapIndex(BROWSE_STOP);
    } else if (wasPanelOpen && !isPanelOpen) {
      setSnapIndex(returnSnapIndexRef.current);
    }
  }), []);

  if (isWideSidePanel || isLandscapeSidePanel) {
    return (
      <div className="pointer-events-none fixed inset-0 z-20">
        <button
          type="button"
          onClick={() => setBrowsePanelHidden(!browsePanelHidden)}
          aria-label={browsePanelHidden ? 'Show room browser' : 'Hide room browser'}
          aria-controls="campus-browse-panel"
          aria-expanded={!browsePanelHidden}
          className="pointer-events-auto absolute z-10 inline-flex min-h-10 items-center gap-2 rounded-xl border border-border/70 bg-card/95 px-3 text-xs font-semibold text-foreground shadow-lg shadow-black/10 backdrop-blur-md hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          style={{
            top: isLandscapeSidePanel ? '0.5rem' : '1rem',
            left: browsePanelHidden
              ? isLandscapeSidePanel ? '0.5rem' : '1rem'
              : isLandscapeSidePanel
                ? 'calc(0.5rem + min(360px, 53vw) + 0.5rem)'
                : 'calc(1rem + min(420px, 42vw) + 0.5rem)',
          }}
        >
          {browsePanelHidden ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          {browsePanelHidden ? 'Browse rooms' : 'Hide list'}
        </button>
        <aside
          id="campus-browse-panel"
          aria-label="Campus availability browser"
          className={`${isLandscapeSidePanel
            ? `pointer-events-auto absolute left-2 top-2 flex w-[min(360px,53vw)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-2xl shadow-black/10 backdrop-blur-md ${landscapeBriefKind === 'map'
              ? 'h-[min(275px,calc(100dvh-1rem))]'
              : landscapeBriefKind === 'residence'
                ? 'h-[min(340px,calc(100dvh-1rem))]'
                : 'h-[calc(100dvh-1rem)]'}`
            : 'pointer-events-auto absolute left-4 top-4 flex max-h-[calc(100vh-2rem)] w-[min(420px,42vw)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-2xl shadow-black/10 backdrop-blur-md'}${browsePanelHidden ? ' !hidden' : ''}`}
        >
          {children}
        </aside>
      </div>
    );
  }

  return (
    <MobileSheetContext.Provider value={{
      expand: () => setSnapIndex(EXPANDED_STOP),
      showMap: () => setSnapIndex(MAP_STOP),
    }}>
      <Drawer
        key={briefKind ? `${briefKind}-detail` : compactDetail ? 'place-detail' : 'campus-browse'}
        open
        modal={false}
        dismissible={false}
        snapPoints={snapPoints}
        activeSnapPoint={snapPoints[snapIndex]}
        setActiveSnapPoint={setActiveSnapPoint}
      >
        <DrawerContent
          aria-describedby={undefined}
          className="mt-0 h-[100dvh] rounded-t-2xl border-border/70 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md data-[vaul-drawer-direction=bottom]:max-h-[100dvh]"
          handle={
            <div className="relative flex h-11 shrink-0 items-center justify-center px-3">
              <span aria-hidden className="h-1.5 w-14 rounded-full bg-muted-foreground/35" />
              <button
                type="button"
                onClick={() => setSnapIndex(snapIndex === MAP_STOP ? BROWSE_STOP : MAP_STOP)}
                className="absolute right-3 top-0 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-accent-foreground hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                aria-label={snapIndex === MAP_STOP
                  ? selected ? `Show details for ${selectedName ?? 'selected place'}` : 'Browse campus places'
                  : 'Explore campus map'}
              >
                {snapIndex === MAP_STOP ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                {snapIndex === MAP_STOP ? selected ? 'Details' : 'Browse' : 'Map'}
              </button>
            </div>
          }
        >
          <DrawerTitle className="sr-only">Campus availability browser</DrawerTitle>
          {snapIndex === MAP_STOP && (
            <button
              type="button"
              onClick={() => setSnapIndex(BROWSE_STOP)}
              aria-label={selected
                ? `Show details for ${selectedName ?? 'selected place'}`
                : 'Browse campus buildings and rooms'}
              className="flex w-full items-center gap-3 rounded-lg px-5 pt-1 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
            >
              <span aria-hidden className="flex h-10 w-2 shrink-0 flex-col overflow-hidden rounded-sm bg-primary">
                <span className="mt-auto h-1/4 bg-[#f3c948]" />
              </span>
              <div>
                <p className="max-w-[calc(100vw-8.5rem)] truncate text-base font-semibold leading-tight tracking-tight text-foreground" title={selectedName}>
                  {selected ? selectedName ?? 'Selected place' : 'Campus Rooms'}
                </p>
                <p className="max-w-[calc(100vw-8.5rem)] truncate text-xs text-muted-foreground">
                  {selected?.kind === 'room' && selectedBuilding?.building
                    ? selectedBuilding.building.name
                    : selected ? 'Tap to view details' : 'Find buildings & rooms'}
                </p>
              </div>
            </button>
          )}
          {/* Keep local dates and room state when temporarily exploring the map.
              Bound scrolling to the visible sheet, not its translated full height. */}
          <div
            className="flex min-h-0 shrink-0 flex-col overflow-hidden"
            style={{
              display: snapIndex === MAP_STOP ? 'none' : undefined,
              height: `calc(100dvh * ${snapPoints[snapIndex]} - 2.75rem - env(safe-area-inset-bottom))`,
            }}
          >
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    </MobileSheetContext.Provider>
  );
}

// browse/BuildingList.tsx — flat, scrollable building list. Available-first
// ordering (alphabetical in All Rooms mode), status dot, availability counts,
// favorite stars with a pinned favorites section, and skeleton rows while the
// initial data load is in flight.

import { useEffect, useMemo, useState } from 'react';
import { Building2, CarFront, ChevronRight, House, RefreshCw, Star, UtensilsCrossed } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCampusStore } from '@/lib/store';
import { RESIDENCE_HALLS } from '@/lib/residenceHalls';
import { cn } from '@/lib/utils';
import { playSelectionHaptic, playToggleHaptic } from '@/lib/haptics.js';
import { useMediaQuery } from '@/components/shell/useMediaQuery';
import { LANDSCAPE_SIDE_QUERY, SIDE_PANEL_QUERY } from '@/components/shell/layout';
import type { BuildingEntry } from '@/types/campus';
import {
  STATUS_DOT_CLASS,
  STATUS_LABEL,
  STATUS_RANK,
  buildingDataIssueLabel,
  buildingFavKey,
  buildingMatchesQuery,
  getCampusClosedSnapshot,
  matchRoom,
  normalizeSearchText,
  placeMatchesSearch,
  searchMapBuildings,
} from './utils';

const SKELETON_ROWS = 9;

function BuildingRow({
  building,
  isFavorite,
  roomCountLabel,
  onOpen,
  onToggleFavorite,
}: {
  building: BuildingEntry;
  isFavorite: boolean;
  roomCountLabel: string;
  onOpen: (building: BuildingEntry) => void;
  onToggleFavorite: (code: string) => void;
}) {
  return (
    <div
      className="group relative flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-left transition-[background-color,border-color] hover:border-border/70 hover:bg-card"
    >
      <button
        type="button"
        onClick={() => onOpen(building)}
        aria-label={`Open ${building.name}. ${building.dataIssue ? 'Limited data' : STATUS_LABEL[building.status]}. ${roomCountLabel}`}
        className="absolute inset-0 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      />
      <span className="pointer-events-none flex size-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/55 text-[10px] font-bold tracking-tight text-foreground/75" aria-hidden>
        {building.code.slice(0, 3)}
      </span>
      <span className="pointer-events-none min-w-0 flex-1">
        <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground">{building.name}</span>
        <span className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-muted-foreground">
          <span className={cn('size-1.5 shrink-0 rounded-full', STATUS_DOT_CLASS[building.status])} aria-hidden />
          <span className="truncate">
            {building.dataIssue ? 'Limited data' : STATUS_LABEL[building.status]} · {roomCountLabel}
          </span>
        </span>
      </span>
      <button
        type="button"
        aria-label={isFavorite ? `Remove ${building.name} from favorites` : `Add ${building.name} to favorites`}
        aria-pressed={isFavorite}
        onClick={() => onToggleFavorite(building.code)}
        className={cn(
          'relative z-10 inline-flex size-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:size-10',
          isFavorite ? 'text-status-opening-soon' : 'text-muted-foreground/50 hover:text-muted-foreground'
        )}
      >
        <Star className={cn('size-4', isFavorite && 'fill-current')} />
      </button>
      <ChevronRight className="pointer-events-none size-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" aria-hidden />
    </div>
  );
}

export function BuildingList() {
  const isLandscapeSidePanel = useMediaQuery(LANDSCAPE_SIDE_QUERY);
  const hasSidePanel = useMediaQuery(SIDE_PANEL_QUERY);
  const buildings = useCampusStore((s) => s.buildings);
  const dining = useCampusStore((s) => s.dining);
  const parking = useCampusStore((s) => s.parking);
  const loadingStatus = useCampusStore((s) => s.loading.status);
  const viewMode = useCampusStore((s) => s.viewMode);
  const searchQuery = useCampusStore((s) => s.searchQuery);
  const activeDateKey = useCampusStore((s) => s.activeDateKey);
  const favorites = useCampusStore((s) => s.favorites);
  const toggleFavorite = useCampusStore((s) => s.toggleFavorite);
  const select = useCampusStore((s) => s.select);
  const libcalStatus = useCampusStore((s) => s.libcalStatus);
  const retryLibCal = useCampusStore((s) => s.retryLibCal);
  const dayFetchStatus = useCampusStore((s) => s.dayFetch.status);

  const normalizedQuery = normalizeSearchText(searchQuery);
  const searching = normalizedQuery.length > 0;
  const matchingPlaces = useMemo(() => {
    if (!normalizedQuery) return [];
    return [
      ...dining.map((place) => ({ ...place, kind: 'dining' as const })),
      ...parking.map((place) => ({ ...place, kind: 'parking' as const })),
    ].filter((place) => placeMatchesSearch(place.name, normalizedQuery))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [dining, parking, normalizedQuery]);
  const visiblePlaces = hasSidePanel ? [] : matchingPlaces;
  const matchingResidences = normalizedQuery
    ? RESIDENCE_HALLS.filter((hall) => normalizeSearchText(hall.name).includes(normalizedQuery))
    : [];
  const visibleResidences = hasSidePanel ? [] : matchingResidences;
  const matchingMapBuildings = useMemo(() =>
    searchMapBuildings(normalizedQuery, buildings, dining, parking),
  [normalizedQuery, buildings, dining, parking]);
  const visibleMapBuildings = hasSidePanel ? [] : matchingMapBuildings;
  const hasMatchingPlace = matchingPlaces.length > 0 || matchingResidences.length > 0 || matchingMapBuildings.length > 0;

  // Live 'now' tick (30s, like the legacy app) so the campus-closed
  // countdown stays current while the panel is open.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    if (viewMode !== 'now') return undefined;
    const intervalId = window.setInterval(() => setNowTick(Date.now()), 30000);
    return () => window.clearInterval(intervalId);
  }, [viewMode]);

  // Campus-closed snapshot (ported from legacy Sidebar.js:1506): non-null in
  // Now mode after hours / on weekends / on holidays.
  const campusClosed = useMemo(
    () => (viewMode === 'now' ? getCampusClosedSnapshot(new Date(nowTick)) : null),
    [viewMode, nowTick]
  );

  const { favoriteBuildings, otherBuildings } = useMemo(() => {
    const normalized = normalizeSearchText(searchQuery);

    const filtered = normalized
      ? buildings.filter((b) => {
          if (buildingMatchesQuery(b, normalized)) return true;
          const rooms = Array.isArray(b.rooms) ? b.rooms : [];
          return rooms.some((room) => matchRoom(room, b, normalized, activeDateKey) !== null);
        })
      : buildings;

    const sorted = [...filtered].sort((a, b) => {
      if (viewMode !== 'all') {
        const rankDiff = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        if (rankDiff !== 0) return rankDiff;
      }
      return a.name.localeCompare(b.name);
    });

    if (normalized) {
      // Flat list while searching — no pinned favorites section.
      return { favoriteBuildings: [] as BuildingEntry[], otherBuildings: sorted };
    }

    const favs: BuildingEntry[] = [];
    const rest: BuildingEntry[] = [];
    for (const building of sorted) {
      if (favorites.includes(buildingFavKey(building.code))) favs.push(building);
      else rest.push(building);
    }
    return { favoriteBuildings: favs, otherBuildings: rest };
  }, [buildings, searchQuery, activeDateKey, viewMode, favorites]);

  function openBuilding(building: BuildingEntry) {
    playSelectionHaptic();
    select({ kind: 'building', id: building.code });
  }

  function onToggleFavorite(code: string) {
    playToggleHaptic();
    toggleFavorite(buildingFavKey(code));
  }

  function countLabel(building: BuildingEntry): string {
    // The classroom inventory already knows its room count before daily
    // availability finishes. Keep All Rooms useful during that fetch.
    if (viewMode === 'all' && !['library', 'both'].includes(building.dataIssueSource ?? '')) {
      return `${building.totalRooms} room${building.totalRooms === 1 ? '' : 's'}`;
    }
    const issueLabel = buildingDataIssueLabel(building);
    if (issueLabel) return issueLabel;
    return `${building.availableRooms}/${building.totalRooms} available`;
  }

  if (loadingStatus === 'idle' || loadingStatus === 'loading') {
    return (
      <div className="min-h-0 flex-1 space-y-1 overflow-hidden px-4 pb-4 pt-4 sm:px-5" aria-busy="true">
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-3">
            <Skeleton className="size-9 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/5 rounded-md" />
              <Skeleton className="h-3 w-2/5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const isEmpty = favoriteBuildings.length === 0 && otherBuildings.length === 0 &&
    visiblePlaces.length === 0 && visibleResidences.length === 0 && visibleMapBuildings.length === 0;

  // Campus-closed empty state (legacy Sidebar.js:2858-2876): in Now mode,
  // when campus is closed and nothing is open, replace the list with the
  // turtle banner + live countdown to doors-open.
  const nothingOpen =
    buildings.length === 0 || buildings.every((b) => (b.availableRooms ?? 0) === 0);
  const closedSnapshot = !searching && campusClosed &&
    libcalStatus === 'ready' && dayFetchStatus === 'ready' &&
    (isEmpty || nothingOpen) ? campusClosed : null;

  return (
    <div className={cn('rooms-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5 pt-3 sm:px-5', isLandscapeSidePanel && '!px-2 !pt-1')}>
      {libcalStatus === 'error' && (
        <div role="status" className="mb-3 flex items-center gap-3 rounded-lg border border-status-opening-soon/30 bg-status-opening-soon/10 px-3 py-2.5 text-xs text-foreground">
          <p className="min-w-0 flex-1">Library study-room counts are temporarily unavailable.</p>
          <button type="button" onClick={retryLibCal} className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-md px-2 font-semibold text-primary hover:bg-primary/10">
            <RefreshCw className="size-3.5" /> Retry
          </button>
        </div>
      )}
      {closedSnapshot ? (
        <div className="px-4 py-10 text-center">
          <div className="text-3xl" aria-hidden>
            🐢
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{closedSnapshot.message}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Campus is closed{' '}
            {closedSnapshot.isHoliday
              ? 'for the holiday'
              : closedSnapshot.isWeekend
                ? 'for the weekend'
                : 'for the night'}
          </p>
          <div className="mt-3 inline-flex flex-col items-center rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5">
            <span className="text-lg font-semibold tabular-nums text-foreground">
              {closedSnapshot.countdown}
            </span>
            <span className="mt-0.5 text-[11px] text-muted-foreground">
              until doors open {closedSnapshot.opensLabel}
            </span>
          </div>
          <p className="mt-3 text-xs italic text-muted-foreground">
            Switch to Schedule or All Rooms to keep browsing
          </p>
        </div>
      ) : isEmpty ? (
        <div className="px-4 py-10 text-center">
          <p className="text-sm font-medium text-foreground">
            {hasMatchingPlace ? 'Place found' : searching ? 'No places or rooms match' : 'No buildings to show'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {hasMatchingPlace
              ? 'Open the search field above to choose the matching place.'
              : searching
                ? `Nothing found for “${searchQuery.trim()}”. Try a different name or room number.`
                : 'Building data will appear here once it loads.'}
          </p>
        </div>
      ) : (
        <>
          {visiblePlaces.length > 0 && (
            <section className="mb-3">
              <h2 className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Dining & parking
              </h2>
              <div className="space-y-0.5">
                {visiblePlaces.map((place) => {
                  const Icon = place.kind === 'dining' ? UtensilsCrossed : CarFront;
                  return (
                    <button
                      key={`${place.kind}:${place.id}`}
                      type="button"
                      onClick={() => {
                        playSelectionHaptic();
                        select({ kind: place.kind, id: place.id });
                      }}
                      aria-label={`Open ${place.name}. ${place.kind === 'dining' ? 'Dining' : 'Parking'}. ${place.statusText}`}
                      className="group flex w-full min-h-14 items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-[background-color,border-color] hover:border-border/70 hover:bg-card focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/55 text-muted-foreground">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-foreground">{place.name}</span>
                        <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                          {place.kind === 'dining' ? 'Dining' : 'Parking'} · {place.statusText}
                        </span>
                      </span>
                      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </button>
                  );
                })}
              </div>
            </section>
          )}
          {visibleResidences.length > 0 && (
            <section className="mb-3">
              <h2 className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Residence halls
              </h2>
              <div className="space-y-0.5">
                {visibleResidences.map((hall) => (
                  <button
                    key={hall.id}
                    type="button"
                    onClick={() => {
                      playSelectionHaptic();
                      select({ kind: 'residence', id: hall.id });
                    }}
                    aria-label={`Open ${hall.name}. ${hall.community} Community residence hall`}
                    className="group flex w-full min-h-14 items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-[background-color,border-color] hover:border-border/70 hover:bg-card focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/55 text-muted-foreground">
                      <House className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-foreground">{hall.name}</span>
                      <span className="mt-1 block truncate text-[11px] text-muted-foreground">{hall.community} Community · Residence hall</span>
                    </span>
                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </button>
                ))}
              </div>
            </section>
          )}
          {visibleMapBuildings.length > 0 && (
            <section className="mb-3">
              <h2 className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                On the map
              </h2>
              <div className="space-y-0.5">
                {visibleMapBuildings.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => {
                      playSelectionHaptic();
                      select({ kind: 'map-building', id: place.id });
                    }}
                    aria-label={`Open ${place.name} on the 3D map`}
                    className="group flex w-full min-h-14 items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-[background-color,border-color] hover:border-border/70 hover:bg-card focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/55 text-muted-foreground">
                      <Building2 className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-foreground">{place.name}</span>
                      <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                        {place.id === 'way/980371045' ? 'Athletics venue' : '3D campus building'}
                        {place.code ? ` · ${place.code}` : ''}
                      </span>
                    </span>
                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </button>
                ))}
              </div>
            </section>
          )}
          {favoriteBuildings.length + otherBuildings.length > 0 && (
            <div className="flex items-center justify-between px-3 pb-2 pt-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Buildings</h2>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {favoriteBuildings.length + otherBuildings.length} shown
              </span>
            </div>
          )}
          {favoriteBuildings.length > 0 && (
            <section className="mb-3 rounded-xl border border-border/70 bg-muted/25 p-1">
              <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Favorites
              </p>
              <div className="space-y-0.5">
                {favoriteBuildings.map((building) => (
                  <BuildingRow
                    key={`fav-${building.code}`}
                    building={building}
                    isFavorite
                    roomCountLabel={countLabel(building)}
                    onOpen={openBuilding}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            </section>
          )}
          <div className="space-y-0.5">
            {otherBuildings.map((building) => (
              <BuildingRow
                key={building.code}
                building={building}
                isFavorite={favorites.includes(buildingFavKey(building.code))}
                roomCountLabel={countLabel(building)}
                onOpen={openBuilding}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

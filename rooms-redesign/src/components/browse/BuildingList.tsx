// browse/BuildingList.tsx — flat, scrollable building list. Available-first
// ordering (alphabetical in All Rooms mode), status dot, availability counts,
// favorite stars with a pinned favorites section, and skeleton rows while the
// initial data load is in flight.

import { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCampusStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { playSelectionHaptic, playToggleHaptic } from '@/lib/haptics.js';
import type { BuildingEntry } from '@/types/campus';
import {
  STATUS_DOT_CLASS,
  STATUS_RANK,
  buildingFavKey,
  buildingMatchesQuery,
  getCampusClosedSnapshot,
  matchRoom,
  normalizeSearchText,
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
      role="button"
      tabIndex={0}
      onClick={() => onOpen(building)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(building);
        }
      }}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <span
        className={cn('size-2.5 shrink-0 rounded-full', STATUS_DOT_CLASS[building.status])}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{building.name}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {building.code} · {roomCountLabel}
        </span>
      </span>
      <button
        type="button"
        aria-label={isFavorite ? `Remove ${building.name} from favorites` : `Add ${building.name} to favorites`}
        aria-pressed={isFavorite}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(building.code);
        }}
        className={cn(
          'shrink-0 rounded-md p-1.5 transition-colors hover:bg-muted',
          isFavorite ? 'text-status-opening-soon' : 'text-muted-foreground/50 hover:text-muted-foreground'
        )}
      >
        <Star className={cn('size-4', isFavorite && 'fill-current')} />
      </button>
    </div>
  );
}

export function BuildingList() {
  const buildings = useCampusStore((s) => s.buildings);
  const loadingStatus = useCampusStore((s) => s.loading.status);
  const viewMode = useCampusStore((s) => s.viewMode);
  const searchQuery = useCampusStore((s) => s.searchQuery);
  const activeDateKey = useCampusStore((s) => s.activeDateKey);
  const favorites = useCampusStore((s) => s.favorites);
  const toggleFavorite = useCampusStore((s) => s.toggleFavorite);
  const select = useCampusStore((s) => s.select);
  const requestFlyTo = useCampusStore((s) => s.requestFlyTo);

  const searching = normalizeSearchText(searchQuery).length > 0;

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
    requestFlyTo({ lat: building.lat, lng: building.lng, zoom: 17 });
  }

  function onToggleFavorite(code: string) {
    playToggleHaptic();
    toggleFavorite(buildingFavKey(code));
  }

  function countLabel(building: BuildingEntry): string {
    if (viewMode === 'all') {
      return `${building.totalRooms} room${building.totalRooms === 1 ? '' : 's'}`;
    }
    return `${building.availableRooms}/${building.totalRooms} available`;
  }

  if (loadingStatus === 'idle' || loadingStatus === 'loading') {
    return (
      <div className="min-h-0 flex-1 space-y-1 overflow-hidden px-2 pb-4 pt-3" aria-busy="true">
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <Skeleton className="size-2.5 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/5 rounded-md" />
              <Skeleton className="h-3 w-2/5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const isEmpty = favoriteBuildings.length === 0 && otherBuildings.length === 0;

  // Campus-closed empty state (legacy Sidebar.js:2858-2876): in Now mode,
  // when campus is closed and nothing is open, replace the list with the
  // turtle banner + live countdown to doors-open.
  const nothingOpen =
    buildings.length === 0 || buildings.every((b) => (b.availableRooms ?? 0) === 0);
  const closedSnapshot = !searching && campusClosed && (isEmpty || nothingOpen) ? campusClosed : null;

  return (
    <div className="rooms-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4 pt-2">
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
            {searching ? 'No buildings match your search' : 'No buildings to show'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {searching
              ? `Nothing found for “${searchQuery.trim()}”. Try a building code or room name.`
              : 'Building data will appear here once it loads.'}
          </p>
        </div>
      ) : (
        <>
          {favoriteBuildings.length > 0 && (
            <section className="mb-2">
              <p className="px-3 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
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
              <div className="mx-3 my-2 border-t border-border/60" />
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

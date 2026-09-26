// browse/SearchBar.tsx — grouped search across buildings, rooms, classes,
// dining, parking, and residence halls. Keyboard navigable (arrows / enter / esc).
// Writes the raw query to the store so BuildingList can react to it too.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, CarFront, Clock3, DoorOpen, House, Search, UtensilsCrossed, X } from 'lucide-react';
import { useCampusStore } from '@/lib/store';
import { useExpandMobileSheet } from '@/components/shell/MobileSheetContext';
import { cn } from '@/lib/utils';
import { playSelectionHaptic } from '@/lib/haptics.js';
import { useMediaQuery } from '@/components/shell/useMediaQuery';
import { RESIDENCE_HALLS, type ResidenceHall } from '@/lib/residenceHalls';
import type { MapBuildingPlace } from '@/lib/mapPlaces';
import { LANDSCAPE_SIDE_QUERY, SIDE_PANEL_QUERY } from '@/components/shell/layout';
import type { BuildingEntry, DiningHall, ParkingLot, RoomEntry } from '@/types/campus';
import {
  buildingMatchesQuery,
  matchRoom,
  normalizeSearchText,
  placeMatchesSearch,
  roomSelectionId,
  searchMapBuildings,
} from './utils';

const MAX_BUILDING_RESULTS = 6;
const MAX_ROOM_RESULTS = 8;
const MAX_PLACE_RESULTS = 6;
const MAX_MAP_RESULTS = 6;

interface BuildingResult {
  type: 'building';
  building: BuildingEntry;
}
interface RoomResult {
  type: 'room';
  building: BuildingEntry;
  room: RoomEntry;
  matchedEventName: string | null;
}
interface PlaceResult {
  type: 'dining' | 'parking';
  place: DiningHall | ParkingLot;
}
interface ResidenceResult {
  type: 'residence';
  hall: ResidenceHall;
}
interface MapBuildingResult {
  type: 'map-building';
  place: MapBuildingPlace;
}
type SearchResult = BuildingResult | RoomResult | PlaceResult | ResidenceResult | MapBuildingResult;

function resultKey(result: SearchResult): string {
  if (result.type === 'building') return `b:${result.building.code}`;
  if (result.type === 'room') return `r:${result.building.code}/${result.room.id}`;
  if (result.type === 'residence') return `h:${result.hall.id}`;
  if (result.type === 'map-building') return `m:${result.place.id}`;
  return `${result.type}:${result.place.id}`;
}

function placeResultRank(result: PlaceResult, query: string): number {
  const name = normalizeSearchText(result.place.name);
  if (name === query) return 0;
  if (name.startsWith(query)) return 1;
  return 2;
}

function roomResultRank(result: RoomResult, query: string): number {
  const name = normalizeSearchText(result.room.name);
  if (name === query) return 0;
  if (name.startsWith(query)) return 1;
  if (name.includes(query)) return 2;
  return result.matchedEventName ? 4 : 3;
}

export function SearchBar() {
  const isLandscapeSidePanel = useMediaQuery(LANDSCAPE_SIDE_QUERY);
  const hasSidePanel = useMediaQuery(SIDE_PANEL_QUERY);
  const buildings = useCampusStore((s) => s.buildings);
  const dining = useCampusStore((s) => s.dining);
  const parking = useCampusStore((s) => s.parking);
  const loadingStatus = useCampusStore((s) => s.loading.status);
  const searchQuery = useCampusStore((s) => s.searchQuery);
  const setSearchQuery = useCampusStore((s) => s.setSearchQuery);
  const activeDateKey = useCampusStore((s) => s.activeDateKey);
  const select = useCampusStore((s) => s.select);
  const expandMobileSheet = useExpandMobileSheet();

  const [open, setOpen] = useState(false);
  const [activeResult, setActiveResult] = useState({ query: searchQuery, index: 0 });
  const activeIndex = activeResult.query === searchQuery ? activeResult.index : 0;
  const setActiveIndex = (next: number | ((previous: number) => number)) => {
    setActiveResult({
      query: searchQuery,
      index: typeof next === 'function' ? next(activeIndex) : next,
    });
  };
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const ready = loadingStatus === 'ready';

  const { buildingResults, residenceResults, placeResults, mapResults, roomResults, flatResults } = useMemo(() => {
    const normalized = normalizeSearchText(searchQuery);
    if (!normalized || !ready) {
      return { buildingResults: [] as BuildingResult[], residenceResults: [] as ResidenceResult[], placeResults: [] as PlaceResult[], mapResults: [] as MapBuildingResult[], roomResults: [] as RoomResult[], flatResults: [] as SearchResult[] };
    }

    const bResults: BuildingResult[] = [];
    const hResults: ResidenceResult[] = [];
    const pResults: PlaceResult[] = [];
    const mResults: MapBuildingResult[] = searchMapBuildings(normalized, buildings, dining, parking)
      .slice(0, MAX_MAP_RESULTS).map((place) => ({ type: 'map-building', place }));
    const rResults: RoomResult[] = [];

    for (const building of buildings) {
      if (bResults.length < MAX_BUILDING_RESULTS && buildingMatchesQuery(building, normalized)) {
        bResults.push({ type: 'building', building });
      }
      const rooms = Array.isArray(building.rooms) ? building.rooms : [];
      for (const room of rooms) {
        const matched = matchRoom(room, building, normalized, activeDateKey);
        if (matched) {
          rResults.push({
            type: 'room',
            building,
            room,
            matchedEventName: matched.matchedEventName,
          });
        }
      }
    }

    for (const place of dining) {
      if (placeMatchesSearch(place.name, normalized)) {
        pResults.push({ type: 'dining', place });
      }
    }
    for (const place of parking) {
      if (placeMatchesSearch(place.name, normalized)) {
        pResults.push({ type: 'parking', place });
      }
    }
    for (const hall of RESIDENCE_HALLS) {
      if (normalizeSearchText(hall.name).includes(normalized)) hResults.push({ type: 'residence', hall });
    }
    hResults.sort((a, b) =>
      Number(normalizeSearchText(a.hall.name) !== normalized) - Number(normalizeSearchText(b.hall.name) !== normalized) ||
      a.hall.name.localeCompare(b.hall.name),
    );
    hResults.length = Math.min(hResults.length, MAX_PLACE_RESULTS);
    pResults.sort((a, b) =>
      placeResultRank(a, normalized) - placeResultRank(b, normalized) ||
      a.place.name.localeCompare(b.place.name),
    );
    pResults.length = Math.min(pResults.length, MAX_PLACE_RESULTS);

    // A direct room-number match must not disappear behind earlier class
    // section-code matches when the suggestion list reaches its limit.
    rResults.sort((a, b) => roomResultRank(a, normalized) - roomResultRank(b, normalized));
    rResults.length = Math.min(rResults.length, MAX_ROOM_RESULTS);

    // The portrait sheet shows buildings and places in its filtered list.
    // Keep the dropdown for room/class matches without repeating those rows.
    const suggestedBuildings = hasSidePanel ? bResults : [];
    const suggestedResidences = hasSidePanel ? hResults : [];
    const suggestedPlaces = hasSidePanel ? pResults : [];
    const suggestedMap = hasSidePanel ? mResults : [];
    return {
      buildingResults: suggestedBuildings,
      residenceResults: suggestedResidences,
      placeResults: suggestedPlaces,
      mapResults: suggestedMap,
      roomResults: rResults,
      flatResults: [...suggestedBuildings, ...suggestedResidences, ...suggestedPlaces, ...suggestedMap, ...rResults] as SearchResult[],
    };
  }, [buildings, dining, parking, searchQuery, activeDateKey, ready, hasSidePanel]);

  // Close the dropdown on outside pointer down.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Keep the highlighted row visible while arrow-navigating.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-result-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  function activate(result: SearchResult) {
    playSelectionHaptic();
    if (result.type === 'building') {
      const { building } = result;
      select({ kind: 'building', id: building.code });
    } else if (result.type === 'room') {
      const { building, room } = result;
      select({ kind: 'room', id: roomSelectionId(building.code, room.id) });
    } else if (result.type === 'residence') {
      select({ kind: 'residence', id: result.hall.id });
    } else if (result.type === 'map-building') {
      select({ kind: 'map-building', id: result.place.id });
    } else {
      select({ kind: result.type, id: result.place.id });
    }
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!open && flatResults.length > 0) {
        setOpen(true);
        return;
      }
      if (flatResults.length === 0) return;
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((prev) => (prev + delta + flatResults.length) % flatResults.length);
      return;
    }
    if (event.key === 'Enter') {
      if (open && flatResults[activeIndex]) {
        event.preventDefault();
        activate(flatResults[activeIndex]);
      }
      return;
    }
    if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        setOpen(false);
      } else if (searchQuery) {
        setSearchQuery('');
      }
    }
  }

  const showDropdown = open && ready && normalizeSearchText(searchQuery).length > 0
    && (hasSidePanel || flatResults.length > 0);

  return (
    <div ref={rootRef} className={cn('relative shrink-0 px-5 pt-4 sm:px-6', !hasSidePanel && '!pt-3', isLandscapeSidePanel && '!px-3 !pt-2')}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          disabled={!ready}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            expandMobileSheet();
          }}
          onKeyDown={onKeyDown}
          placeholder={ready ? 'Places, rooms, classes…' : 'Loading campus…'}
          aria-label="Search campus places, rooms, and classes"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="rooms-search-results"
          aria-activedescendant={
            showDropdown && flatResults[activeIndex] ? `search-result-${activeIndex}` : undefined
          }
          className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-11 text-base text-foreground shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
        {searchQuery && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setSearchQuery('');
              setOpen(false);
            }}
            className="absolute right-0.5 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          id="rooms-search-results"
          role="listbox"
          ref={listRef}
          className={cn(
            'absolute inset-x-5 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-border bg-popover p-2 shadow-2xl shadow-black/15 sm:inset-x-6',
            isLandscapeSidePanel && '!inset-x-3 !max-h-[calc(100dvh-9.5rem)]',
          )}
        >
          {flatResults.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No matches for “{searchQuery.trim()}”
            </p>
          )}

          {buildingResults.length > 0 && (
            <div className="mb-1">
              <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Buildings
              </p>
              {buildingResults.map((result) => {
                const index = flatResults.indexOf(result);
                return (
                  <button
                    key={resultKey(result)}
                    id={`search-result-${index}`}
                    data-result-index={index}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => activate(result)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2.5 text-left text-[13px] transition-colors',
                      index === activeIndex ? 'bg-accent text-accent-foreground' : 'text-foreground'
                    )}
                  >
                    <Building2 className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate font-medium">{result.building.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{result.building.code}</span>
                  </button>
                );
              })}
            </div>
          )}

          {residenceResults.length > 0 && (
            <div className="mb-1">
              <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Residence halls
              </p>
              {residenceResults.map((result) => {
                const index = flatResults.indexOf(result);
                return (
                  <button
                    key={resultKey(result)}
                    id={`search-result-${index}`}
                    data-result-index={index}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => activate(result)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2.5 text-left text-[13px] transition-colors',
                      index === activeIndex ? 'bg-accent text-accent-foreground' : 'text-foreground',
                    )}
                  >
                    <House className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate font-medium">{result.hall.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{result.hall.community}</span>
                  </button>
                );
              })}
            </div>
          )}

          {placeResults.length > 0 && (
            <div className="mb-1">
              <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Dining & parking
              </p>
              {placeResults.map((result) => {
                const index = flatResults.indexOf(result);
                const Icon = result.type === 'dining' ? UtensilsCrossed : CarFront;
                return (
                  <button
                    key={resultKey(result)}
                    id={`search-result-${index}`}
                    data-result-index={index}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => activate(result)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2.5 text-left text-[13px] transition-colors',
                      index === activeIndex ? 'bg-accent text-accent-foreground' : 'text-foreground',
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate font-medium">{result.place.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {result.type === 'dining' ? 'Dining' : 'Parking'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {mapResults.length > 0 && (
            <div className="mb-1">
              <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                On the map
              </p>
              {mapResults.map((result) => {
                const index = flatResults.indexOf(result);
                return (
                  <button
                    key={resultKey(result)}
                    id={`search-result-${index}`}
                    data-result-index={index}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => activate(result)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2.5 text-left text-[13px] transition-colors',
                      index === activeIndex ? 'bg-accent text-accent-foreground' : 'text-foreground',
                    )}
                  >
                    <Building2 className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate font-medium">{result.place.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{result.place.code ?? 'Map'}</span>
                  </button>
                );
              })}
            </div>
          )}

          {roomResults.length > 0 && (
            <div>
              <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Rooms
              </p>
              {roomResults.map((result) => {
                const index = flatResults.indexOf(result);
                return (
                  <button
                    key={resultKey(result)}
                    id={`search-result-${index}`}
                    data-result-index={index}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => activate(result)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2.5 text-left text-[13px] transition-colors',
                      index === activeIndex ? 'bg-accent text-accent-foreground' : 'text-foreground'
                    )}
                  >
                    <DoorOpen className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {result.room.name}
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                          {result.building.code}
                        </span>
                      </span>
                      {result.matchedEventName && (
                        <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <Clock3 className="size-3 shrink-0" />
                          {result.matchedEventName}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// browse/SearchBar.tsx — grouped search across building names/codes, room
// names, and class/event names. Keyboard navigable (arrows / enter / esc).
// Writes the raw query to the store so BuildingList can react to it too.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, Clock3, DoorOpen, Search, X } from 'lucide-react';
import { useCampusStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { playSelectionHaptic } from '@/lib/haptics.js';
import type { BuildingEntry, RoomEntry } from '@/types/campus';
import {
  buildingMatchesQuery,
  matchRoom,
  normalizeSearchText,
  roomSelectionId,
} from './utils';

const MAX_BUILDING_RESULTS = 6;
const MAX_ROOM_RESULTS = 8;

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
type SearchResult = BuildingResult | RoomResult;

function resultKey(result: SearchResult): string {
  return result.type === 'building'
    ? `b:${result.building.code}`
    : `r:${result.building.code}/${result.room.id}`;
}

export function SearchBar() {
  const buildings = useCampusStore((s) => s.buildings);
  const loadingStatus = useCampusStore((s) => s.loading.status);
  const searchQuery = useCampusStore((s) => s.searchQuery);
  const setSearchQuery = useCampusStore((s) => s.setSearchQuery);
  const activeDateKey = useCampusStore((s) => s.activeDateKey);
  const select = useCampusStore((s) => s.select);
  const requestFlyTo = useCampusStore((s) => s.requestFlyTo);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const ready = loadingStatus === 'ready';

  const { buildingResults, roomResults, flatResults } = useMemo(() => {
    const normalized = normalizeSearchText(searchQuery);
    if (!normalized || !ready) {
      return { buildingResults: [] as BuildingResult[], roomResults: [] as RoomResult[], flatResults: [] as SearchResult[] };
    }

    const bResults: BuildingResult[] = [];
    const rResults: RoomResult[] = [];

    for (const building of buildings) {
      if (bResults.length < MAX_BUILDING_RESULTS && buildingMatchesQuery(building, normalized)) {
        bResults.push({ type: 'building', building });
      }
      if (rResults.length < MAX_ROOM_RESULTS) {
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
            if (rResults.length >= MAX_ROOM_RESULTS) break;
          }
        }
      }
      if (bResults.length >= MAX_BUILDING_RESULTS && rResults.length >= MAX_ROOM_RESULTS) break;
    }

    return {
      buildingResults: bResults,
      roomResults: rResults,
      flatResults: [...bResults, ...rResults] as SearchResult[],
    };
  }, [buildings, searchQuery, activeDateKey, ready]);

  // Reset the highlighted row whenever the result set changes.
  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

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
      requestFlyTo({ lat: building.lat, lng: building.lng, zoom: 17 });
    } else {
      const { building, room } = result;
      select({ kind: 'room', id: roomSelectionId(building.code, room.id) });
      requestFlyTo({ lat: building.lat, lng: building.lng, zoom: 17 });
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

  const showDropdown = open && ready && normalizeSearchText(searchQuery).length > 0;

  return (
    <div ref={rootRef} className="relative shrink-0 px-4 pt-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          disabled={!ready}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={ready ? 'Search buildings, rooms, classes…' : 'Loading buildings…'}
          aria-label="Search buildings, rooms, and classes"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="rooms-search-results"
          aria-activedescendant={
            showDropdown && flatResults[activeIndex] ? `search-result-${activeIndex}` : undefined
          }
          className="h-10 w-full rounded-xl border border-input bg-background/80 pl-9 pr-9 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
        />
        {searchQuery && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setSearchQuery('');
              setOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
          className="absolute inset-x-4 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-border/70 bg-popover p-1.5 shadow-xl shadow-black/10"
        >
          {flatResults.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No matches for “{searchQuery.trim()}”
            </p>
          )}

          {buildingResults.length > 0 && (
            <div className="mb-1">
              <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
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
                      'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
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

          {roomResults.length > 0 && (
            <div>
              <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
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
                      'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
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

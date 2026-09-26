// browse/BuildingDetail.tsx — detail view for a selected building (or a room
// selection, which resolves to its building). Header with back / favorite /
// navigate actions, then the building's full room list, available-first, each
// row expandable to a RoomTimeline. Reads the campus store directly (no props).

import { useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, Footprints, MapPin, Navigation, RefreshCw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCampusStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { playSelectionHaptic, playToggleHaptic } from '@/lib/haptics.js';
import { useFocusPlaceOnMap } from '@/components/common/useFocusPlaceOnMap';
import { RoomRow } from './RoomRow';
import { useUserLocation } from './useUserLocation';
import {
  STATUS_DOT_CLASS,
  STATUS_LABEL,
  STATUS_RANK,
  buildingDataIssueLabel,
  buildingFavKey,
  getNavigationUrl,
  getWalkingMinutes,
  resolveBuildingSelection,
  roomFavKey,
  roomSelectionId,
} from './utils';

export function BuildingDetail() {
  const buildings = useCampusStore((s) => s.buildings);
  const selected = useCampusStore((s) => s.selected);
  const clearSelection = useCampusStore((s) => s.clearSelection);
  const select = useCampusStore((s) => s.select);
  const favorites = useCampusStore((s) => s.favorites);
  const toggleFavorite = useCampusStore((s) => s.toggleFavorite);
  const retryLibCal = useCampusStore((s) => s.retryLibCal);
  const retryDayData = useCampusStore((s) => s.retryDayData);
  const libcalStatus = useCampusStore((s) => s.libcalStatus);
  const dayFetchStatus = useCampusStore((s) => s.dayFetch.status);
  const viewMode = useCampusStore((s) => s.viewMode);
  const activeDateKey = useCampusStore((s) => s.activeDateKey);
  const availabilityFilter = useCampusStore((s) => s.availableOnlyFilter);
  const setAvailabilityFilter = useCampusStore((s) => s.setAvailableOnlyFilter);
  const roomExpansion = useCampusStore((s) => s.roomExpansion);
  const setRoomExpansion = useCampusStore((s) => s.setRoomExpansion);
  const focusPlaceOnMap = useFocusPlaceOnMap();
  const userLocation = useUserLocation();

  const resolved = useMemo(
    () => resolveBuildingSelection(buildings, selected),
    [buildings, selected]
  );

  const buildingCode = resolved?.building.code ?? null;
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [buildingCode]);
  const selectedRoomId = resolved?.room?.id ?? null;

  const expansionKey = `${buildingCode ?? ''}:${selectedRoomId ?? ''}`;
  // A new building or selected room starts with that room open.
  const expandedRoomId = roomExpansion.key === expansionKey ? roomExpansion.roomId : selectedRoomId;
  const availabilityFilterKey = `${buildingCode ?? ''}:${viewMode}:${activeDateKey}`;

  const sortedRooms = useMemo(() => {
    if (!resolved) return [];
    const rooms = Array.isArray(resolved.building.rooms) ? resolved.building.rooms : [];
    return [...rooms].sort((a, b) => {
      const rankDiff = STATUS_RANK[a.status] - STATUS_RANK[b.status];
      if (rankDiff !== 0) return rankDiff;
      return a.name.localeCompare(b.name);
    });
  }, [resolved]);
  const availableRooms = sortedRooms.filter((room) => room.status === 'available');
  const canFilterAvailable = selectedRoomId == null && viewMode !== 'all' &&
    sortedRooms.length >= 12 && availableRooms.length > 0 && availableRooms.length < sortedRooms.length;
  const onlyAvailable = canFilterAvailable && availabilityFilter.key === availabilityFilterKey && availabilityFilter.enabled;
  const visibleRooms = onlyAvailable ? availableRooms : sortedRooms;

  if (!resolved) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-5 pt-4 sm:px-6">
        <BackRow onBack={clearSelection} />
        <div className="px-1 py-10 text-center">
          <p className="text-sm font-medium text-foreground">Building not found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            This selection isn’t in the current dataset. It may belong to a different day.
          </p>
        </div>
      </div>
    );
  }

  const { building, room: selectedRoom } = resolved;
  const favKey = buildingFavKey(building.code);
  const isFavorite = favorites.includes(favKey);
  const completeRoomCount = !['library', 'both'].includes(building.dataIssueSource ?? '');
  const summary = viewMode === 'all' && completeRoomCount
    ? `${building.totalRooms} room${building.totalRooms === 1 ? '' : 's'}`
    : buildingDataIssueLabel(building) ?? `${building.availableRooms}/${building.totalRooms} available`;
  const walkMinutes = userLocation
    ? getWalkingMinutes(userLocation, { lat: building.lat, lng: building.lng })
    : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Only navigation stays fixed; building details scroll with the rooms. */}
      <div className="shrink-0 border-b border-border/70 px-3 py-2 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <BackRow onBack={clearSelection} />
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                playToggleHaptic();
                toggleFavorite(favKey);
              }}
              aria-label={isFavorite ? `Remove ${building.name} from favorites` : `Add ${building.name} to favorites`}
              aria-pressed={isFavorite}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={cn('size-11', isFavorite && 'text-status-opening-soon')}
            >
              <Star className={cn('size-4', isFavorite && 'fill-current')} />
            </Button>
            <Button asChild variant="outline" size="sm" className="min-h-11 rounded-md border-primary/25 bg-primary/5 font-semibold text-primary hover:bg-primary/10 hover:text-primary">
              <a
                href={getNavigationUrl(building.lat, building.lng)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Walking directions to ${building.name}`}
                title="Walking directions"
              >
                <Navigation className="size-3.5" />
                Directions
              </a>
            </Button>
          </div>
        </div>

      </div>

      <div ref={scrollRef} className="rooms-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain" role="region" aria-label={`Details and rooms for ${building.name}`} tabIndex={0}>
        <div className="border-b border-border/70 px-5 py-4 sm:px-6">
          <h2 className="text-xl font-semibold leading-tight tracking-[-0.035em] text-foreground">
            {building.name}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] text-muted-foreground">
            <span className="rounded-md border border-border/70 bg-muted/50 px-2 py-1 font-bold tracking-wide text-foreground/80">
              {building.code}
            </span>
            {building.kind === 'library' && (
              <span className="rounded-md border border-border/70 bg-muted/50 px-2 py-1 font-medium text-foreground/80">
                Library
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <span className={cn('size-2 rounded-full', STATUS_DOT_CLASS[building.status])} />
              {building.dataIssue ? 'Limited data' : STATUS_LABEL[building.status]}
            </span>
            <span className="font-medium text-foreground/80">{summary}</span>
            {walkMinutes != null && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-medium text-foreground/80">
                <Footprints className="size-3" />
                {walkMinutes} min walk
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => focusPlaceOnMap(building.lat, building.lng, selectedRoomId ? 18.2 : 18)}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-border/80 bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/35 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <MapPin className="size-3.5 text-primary" aria-hidden />
            View on 3D map
          </button>
        </div>

        {/* Full room list — all rooms stay visible, available first */}
        <div className="space-y-2 px-4 pb-5 pt-3 sm:px-5">
          {(building.dataIssueSource === 'classrooms' || building.dataIssueSource === 'both') && (
            <div role="status" className="flex items-center gap-3 rounded-lg border border-status-opening-soon/30 bg-status-opening-soon/10 px-3 py-2.5 text-xs text-foreground">
              <p className="min-w-0 flex-1">
                {dayFetchStatus === 'error'
                  ? 'Classroom availability could not load. These room statuses are unknown.'
                  : 'Checking classroom availability…'}
              </p>
              {dayFetchStatus === 'error' && (
                <button type="button" onClick={retryDayData} className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-md px-2 font-semibold text-primary hover:bg-primary/10">
                  <RefreshCw className="size-3.5" /> Retry
                </button>
              )}
            </div>
          )}
          {(building.dataIssueSource === 'library' || building.dataIssueSource === 'both') && (
            <div role="status" className="flex items-center gap-3 rounded-lg border border-status-opening-soon/30 bg-status-opening-soon/10 px-3 py-2.5 text-xs text-foreground">
              <p className="min-w-0 flex-1">
                {libcalStatus !== 'error'
                  ? 'Checking library study rooms…'
                  : 'Library study rooms could not load. The room list is incomplete.'}
              </p>
              {libcalStatus === 'error' && (
                <button type="button" onClick={retryLibCal} className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-md px-2 font-semibold text-primary hover:bg-primary/10">
                  <RefreshCw className="size-3.5" /> Retry
                </button>
              )}
            </div>
          )}
          <div className="flex items-center justify-between gap-2 px-2 pb-1 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Rooms in this building</p>
            {canFilterAvailable && (
              <button
                type="button"
                onClick={() => setAvailabilityFilter(availabilityFilterKey, !onlyAvailable)}
                aria-pressed={onlyAvailable}
                aria-label={onlyAvailable ? 'Show all rooms' : 'Show available rooms only'}
                className={cn(
                  'min-h-9 shrink-0 rounded-md border px-2.5 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  onlyAvailable
                    ? 'border-primary/30 bg-primary/10 text-accent-foreground'
                    : 'border-border/80 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground',
                )}
              >
                {onlyAvailable ? `Show all ${sortedRooms.length}` : `Show ${availableRooms.length} available`}
              </button>
            )}
          </div>
          {sortedRooms.length === 0 ? (
            <div className="px-3 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No room data yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {building.dataIssue === 'error'
                  ? 'Try loading the room feed again.'
                  : 'Rooms for this building will appear once availability loads.'}
              </p>
            </div>
          ) : (
            visibleRooms.map((room) => (
              <RoomRow
                key={room.id}
                room={room}
                buildingCode={building.code}
                buildingName={building.name}
                expanded={expandedRoomId === room.id}
                selected={selectedRoom?.id === room.id}
                isFavorite={favorites.includes(roomFavKey(building.code, room.id))}
                onToggleExpand={() =>
                  setRoomExpansion(expansionKey, expandedRoomId === room.id ? null : room.id)
                }
                onToggleFavorite={() => {
                  playToggleHaptic();
                  toggleFavorite(roomFavKey(building.code, room.id));
                }}
                onBook={() => {
                  playSelectionHaptic();
                  select({ kind: 'room', id: roomSelectionId(building.code, room.id) });
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BackRow({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <ChevronLeft className="size-4" />
      All buildings
    </button>
  );
}

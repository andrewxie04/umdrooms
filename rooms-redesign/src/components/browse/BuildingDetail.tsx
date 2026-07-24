// browse/BuildingDetail.tsx — detail view for a selected building (or a room
// selection, which resolves to its building). Header with back / favorite /
// navigate actions, then the building's full room list, available-first, each
// row expandable to a RoomTimeline. Reads the campus store directly (no props).

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Footprints, Navigation, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCampusStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { playSelectionHaptic, playToggleHaptic } from '@/lib/haptics.js';
import { RoomRow } from './RoomRow';
import { useUserLocation } from './useUserLocation';
import {
  STATUS_DOT_CLASS,
  STATUS_LABEL,
  STATUS_RANK,
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
  const viewMode = useCampusStore((s) => s.viewMode);
  const userLocation = useUserLocation();

  const resolved = useMemo(
    () => resolveBuildingSelection(buildings, selected),
    [buildings, selected]
  );

  const buildingCode = resolved?.building.code ?? null;
  const selectedRoomId = resolved?.room?.id ?? null;

  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);

  // Auto-expand the selected room; reset expansion when the building changes.
  useEffect(() => {
    setExpandedRoomId(selectedRoomId);
  }, [buildingCode, selectedRoomId]);

  const sortedRooms = useMemo(() => {
    if (!resolved) return [];
    const rooms = Array.isArray(resolved.building.rooms) ? resolved.building.rooms : [];
    return [...rooms].sort((a, b) => {
      const rankDiff = STATUS_RANK[a.status] - STATUS_RANK[b.status];
      if (rankDiff !== 0) return rankDiff;
      return a.name.localeCompare(b.name);
    });
  }, [resolved]);

  if (!resolved) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pt-3">
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
  const summary =
    viewMode === 'all'
      ? `${building.totalRooms} room${building.totalRooms === 1 ? '' : 's'}`
      : `${building.availableRooms}/${building.totalRooms} available`;
  const walkMinutes = userLocation
    ? getWalkingMinutes(userLocation, { lat: building.lat, lng: building.lng })
    : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Fixed header — the room list below scrolls */}
      <div className="shrink-0 border-b border-border/60 px-4 pb-3 pt-3">
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
              className={cn(isFavorite && 'text-status-opening-soon')}
            >
              <Star className={cn('size-4', isFavorite && 'fill-current')} />
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-lg">
              <a
                href={getNavigationUrl(building.lat, building.lng)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="size-3.5" />
                Navigate
              </a>
            </Button>
          </div>
        </div>

        <h2 className="mt-2 truncate text-lg font-semibold tracking-tight text-foreground">
          {building.name}
        </h2>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium text-foreground/80">
            {building.code}
          </span>
          {building.kind === 'library' && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium text-foreground/80">
              Library
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <span className={cn('size-2 rounded-full', STATUS_DOT_CLASS[building.status])} />
            {STATUS_LABEL[building.status]}
          </span>
          <span>· {summary}</span>
          {walkMinutes != null && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-medium text-foreground/80">
              <Footprints className="size-3" />
              {walkMinutes} min walk
            </span>
          )}
        </div>
      </div>

      {/* Full room list — all rooms stay visible, available first */}
      <div className="rooms-scroll min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-2 pb-4 pt-2">
        {sortedRooms.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <p className="text-sm font-medium text-foreground">No room data yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Rooms for this building will appear once availability loads.
            </p>
          </div>
        ) : (
          sortedRooms.map((room) => (
            <RoomRow
              key={room.id}
              room={room}
              buildingCode={building.code}
              buildingName={building.name}
              expanded={expandedRoomId === room.id}
              selected={selectedRoom?.id === room.id}
              isFavorite={favorites.includes(roomFavKey(building.code, room.id))}
              onToggleExpand={() =>
                setExpandedRoomId((prev) => (prev === room.id ? null : room.id))
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
  );
}

function BackRow({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <ChevronLeft className="size-4" />
      All buildings
    </button>
  );
}

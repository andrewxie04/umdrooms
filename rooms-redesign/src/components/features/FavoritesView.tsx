// src/components/features/FavoritesView.tsx
//
// Favorites list. Reads the store's `favorites` keys ('b:CODE' for buildings,
// 'r:CODE/ROOMID' for rooms), resolves them against loaded buildings, and
// supports: tap to select + fly to the map location, per-row remove, and a
// warm empty state. Unresolvable keys (data not loaded yet or stale) stay
// visible but muted so they can still be removed.

import { BookOpen, Building2, DoorOpen, Star, X } from 'lucide-react';
import { useCampusStore } from '@/lib/store';
import { playSelectionHaptic } from '@/lib/haptics.js';
import type { Status } from '@/types/campus';
import { CloseButton, EmptyState, StatusDot } from './ui-bits';

interface ResolvedFavorite {
  key: string;
  kind: 'building' | 'room';
  selectId: string;
  title: string;
  subtitle: string;
  status: Status;
  lat: number | null;
  lng: number | null;
  missing: boolean;
}

function resolveFavorites(
  favorites: string[],
  buildings: ReturnType<typeof useCampusStore.getState>['buildings']
): ResolvedFavorite[] {
  const out: ResolvedFavorite[] = [];

  for (const key of favorites) {
    if (key.startsWith('b:')) {
      const code = key.slice(2);
      const building = buildings.find((b) => b.code === code);
      out.push({
        key,
        kind: 'building',
        selectId: code,
        title: building?.name ?? code,
        subtitle: building ? `${building.availableRooms}/${building.totalRooms} rooms available` : 'Building',
        status: building?.status ?? 'unknown',
        lat: building?.lat ?? null,
        lng: building?.lng ?? null,
        missing: !building,
      });
      continue;
    }

    if (key.startsWith('r:')) {
      const rest = key.slice(2);
      const slash = rest.indexOf('/');
      const code = slash > 0 ? rest.slice(0, slash) : '';
      const roomId = slash > 0 ? rest.slice(slash + 1) : rest;
      const building = buildings.find((b) => b.code === code);
      const room = building?.rooms.find((r) => String(r.id) === roomId);
      out.push({
        key,
        kind: 'room',
        selectId: code ? `${code}/${roomId}` : roomId, // canonical 'CODE/ROOMID'
        title: room?.name ?? roomId,
        subtitle: building?.name ?? code,
        status: room?.status ?? 'unknown',
        lat: building?.lat ?? null,
        lng: building?.lng ?? null,
        missing: !room,
      });
    }
  }

  return out;
}

export function FavoritesView() {
  const favorites = useCampusStore((s) => s.favorites);
  const buildings = useCampusStore((s) => s.buildings);
  const select = useCampusStore((s) => s.select);
  const toggleFavorite = useCampusStore((s) => s.toggleFavorite);
  const requestFlyTo = useCampusStore((s) => s.requestFlyTo);
  const setFavoritesOpen = useCampusStore((s) => s.setFavoritesOpen);

  const items = resolveFavorites(favorites, buildings);

  const openItem = (item: ResolvedFavorite) => {
    playSelectionHaptic();
    if (item.missing) return;
    select({ kind: item.kind, id: item.selectId });
    setFavoritesOpen(false); // hand the panel over to the selection's view
    if (item.lat != null && item.lng != null) {
      requestFlyTo({ lat: item.lat, lng: item.lng, zoom: 17.5, pitch: 60 });
    }
  };

  return (
    <div className="flex h-full w-full max-w-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Saved
          </div>
          <h2 className="text-base font-semibold text-foreground">Favorites</h2>
        </div>
        <CloseButton onClose={() => setFavoritesOpen(false)} label="Close favorites" />
      </div>
      <div className="rooms-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {!items.length ? (
          <EmptyState
            icon={<Star className="h-5 w-5" />}
            title="No favorites yet"
            body="Star a building or room from its detail view and it will show up here for quick access."
          />
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.key}
                className="group flex items-center gap-2 rounded-xl border border-border bg-card p-2 pl-3 transition-colors hover:border-foreground/20"
              >
                <button
                  type="button"
                  onClick={() => openItem(item)}
                  disabled={item.missing}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:opacity-50"
                >
                  <span className="text-muted-foreground">
                    {item.kind === 'room' ? (
                      item.subtitle.toLowerCase().includes('library') ? (
                        <BookOpen className="h-4 w-4" />
                      ) : (
                        <DoorOpen className="h-4 w-4" />
                      )
                    ) : (
                      <Building2 className="h-4 w-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <StatusDot status={item.status} />
                      <span className="truncate text-sm font-medium text-foreground">
                        {item.title}
                      </span>
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.missing ? 'Not available right now' : item.subtitle}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${item.title} from favorites`}
                  onClick={() => {
                    playSelectionHaptic();
                    toggleFavorite(item.key);
                  }}
                  className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesView;

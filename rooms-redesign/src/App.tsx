// src/App.tsx — integration root (Stage 3).
//
//   <CampusMap3D/> full-bleed 3D map (custom three.js renderer, store-driven)
//   <AppShell/>    responsive panel (desktop floating panel / mobile sheet)
//     └ <PanelRouter/>  routes on selected / legendOpen / favoritesOpen
//   <BootLoader/>  full-screen boot + error overlay while the pipeline runs
//
// Boot sequence: mount dark-mode sync once, kick off store.init() (guarded
// against StrictMode double-invoke inside the store), then consume the
// pending deep link (?building=CODE&room=ID) once the data pipeline reports
// ready — select the target, fly the camera to it, and clear the link.

import { useEffect } from 'react';
import CampusMap3D from './components/map3d/CampusMap3D';
import { AppShell, PanelRouter } from './components/shell';
import { BootLoader } from './components/features';
import { useCampusStore } from './lib/store';
import { useDarkModeSync } from './lib/useDarkModeSync';

export default function App() {
  useDarkModeSync();

  const init = useCampusStore((s) => s.init);
  useEffect(() => {
    void init();
  }, [init]);

  // Deep links: consume pendingDeepLink exactly once, after data is ready.
  const loadingStatus = useCampusStore((s) => s.loading.status);
  const pendingDeepLink = useCampusStore((s) => s.pendingDeepLink);
  useEffect(() => {
    if (loadingStatus !== 'ready' || !pendingDeepLink) return;

    const s = useCampusStore.getState();
    const { building, room } = pendingDeepLink;

    // Share URLs carry the room NAME (legacy handleShareRoom) and may be
    // arbitrarily cased — match building code and room id/name loosely.
    const matchesRoom = (r: { id: string; name: string }, value: string) => {
      const v = value.toLowerCase();
      return String(r.id).toLowerCase() === v || r.name.toLowerCase() === v;
    };

    // Resolve the target building: by code when given, otherwise by scanning
    // room inventories for a bare room id/name.
    const target = building
      ? (s.buildings.find(
          (b) =>
            b.code.toLowerCase() === building.toLowerCase() ||
            b.id.toLowerCase() === building.toLowerCase()
        ) ?? null)
      : room
        ? (s.buildings.find((b) => (b.rooms ?? []).some((r) => matchesRoom(r, room))) ?? null)
        : null;

    if (target) {
      const roomEntry = room
        ? ((target.rooms ?? []).find((r) => matchesRoom(r, room)) ?? null)
        : null;
      if (room && roomEntry) {
        s.select({ kind: 'room', id: `${target.code}/${roomEntry.id}` });
      } else {
        s.select({ kind: 'building', id: target.code });
      }
      s.requestFlyTo({ lat: target.lat, lng: target.lng, zoom: 17, pitch: 60 });
    }

    // Consume the link even when unresolved so it never fires twice.
    useCampusStore.setState({ pendingDeepLink: null });
  }, [loadingStatus, pendingDeepLink]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0">
        <CampusMap3D />
      </div>
      <AppShell>
        <PanelRouter />
      </AppShell>
      <BootLoader />
    </div>
  );
}

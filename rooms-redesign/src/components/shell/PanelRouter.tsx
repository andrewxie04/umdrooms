// shell/PanelRouter.tsx — routes the shell panel's content. Precedence:
//
//   1. legendOpen   -> LegendSheet (map legend, reference overlay)
//   2. favoritesOpen -> FavoritesView (header star button entry point)
//   3. selected dining  -> DiningPanel
//   4. selected parking -> ParkingPanel
//   5. selected LibCal room -> LibraryBookingSheet (booking state machine)
//   6. otherwise -> BrowsePanel (list, or BuildingDetail for building/room)
//
// All routed components read the campus store directly; this component only
// decides which one is mounted.

import { useCampusStore } from '@/lib/store';
import { BrowsePanel } from '../browse/BrowsePanel';
import { resolveBuildingSelection } from '../browse/utils';
import {
  DiningPanel,
  FavoritesView,
  LegendSheet,
  LibraryBookingSheet,
  ParkingPanel,
} from '../features';

export function PanelRouter() {
  const selected = useCampusStore((s) => s.selected);
  const buildings = useCampusStore((s) => s.buildings);
  const legendOpen = useCampusStore((s) => s.legendOpen);
  const favoritesOpen = useCampusStore((s) => s.favoritesOpen);

  if (legendOpen) return <LegendSheet />;
  if (favoritesOpen) return <FavoritesView />;
  if (selected?.kind === 'dining') return <DiningPanel />;
  if (selected?.kind === 'parking') return <ParkingPanel />;
  if (selected?.kind === 'room') {
    const resolved = resolveBuildingSelection(buildings, selected);
    if (resolved?.room?.raw?.source === 'libcal') return <LibraryBookingSheet />;
  }
  return <BrowsePanel />;
}

export default PanelRouter;

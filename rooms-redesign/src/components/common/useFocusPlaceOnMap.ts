import { useCampusStore } from '@/lib/store';
import { playSelectionHaptic } from '@/lib/haptics.js';
import { useShowMobileMap } from '@/components/shell/MobileSheetContext';
import { SIDE_PANEL_QUERY } from '@/components/shell/layout';

/** Reframe a selected place and uncover the map beside any details panel. */
export function useFocusPlaceOnMap() {
  const requestFlyTo = useCampusStore((state) => state.requestFlyTo);
  const setBrowsePanelHidden = useCampusStore((state) => state.setBrowsePanelHidden);
  const showMobileMap = useShowMobileMap();

  return (lat: number, lng: number, zoom = 18, pitch = 37) => {
    playSelectionHaptic();
    const sidePanel = window.matchMedia(SIDE_PANEL_QUERY).matches;
    if (sidePanel) setBrowsePanelHidden(true);
    requestFlyTo({
      lat, lng, zoom, pitch,
      screenX: sidePanel ? 0.5 : 0.48,
      screenY: sidePanel ? 0.5 : 0.48,
    });
    showMobileMap();
  };
}

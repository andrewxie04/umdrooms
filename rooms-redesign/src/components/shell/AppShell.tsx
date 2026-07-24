// shell/AppShell.tsx — responsive application shell around the browse column.
//
//   >=1024px: floating left panel (~420px, top-left offset, max-height
//             calc(100vh-2rem), rounded-2xl, warm translucent surface, elegant
//             shadow) — the map shows through around it.
//   <1024px:  map-first vaul bottom sheet with 15% / 55% / 92% snap points,
//             drag-to-snap; auto-raises to 55% when a selection exists.
//
// Mounted by the integration stage next to <CampusMap/>; reads the campus
// store directly and never calls init() itself. Panel content is provided by
// the integration stage as `children` (the PanelRouter).

import { useEffect, useState, type ReactNode } from 'react';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { useCampusStore } from '@/lib/store';
import { useMediaQuery } from './useMediaQuery';

const SNAP_POINTS = [0.15, 0.55, 0.92];
const SNAP_PEEK = 0.15;
const SNAP_MID = 0.55;

export default function AppShell({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const selected = useCampusStore((s) => s.selected);
  const legendOpen = useCampusStore((s) => s.legendOpen);
  const favoritesOpen = useCampusStore((s) => s.favoritesOpen);
  const [snap, setSnap] = useState<number | string | null>(SNAP_PEEK);

  // Auto-raise the sheet to the mid snap point whenever panel content needs
  // attention (a selection, the legend, or the favorites view).
  const panelActive = Boolean(selected) || legendOpen || favoritesOpen;
  useEffect(() => {
    if (panelActive) setSnap(SNAP_MID);
  }, [panelActive]);

  if (isDesktop) {
    return (
      <div className="pointer-events-none fixed inset-0 z-20">
        <aside
          aria-label="Campus availability browser"
          className="pointer-events-auto absolute left-4 top-4 flex max-h-[calc(100vh-2rem)] w-[420px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-2xl shadow-black/10 backdrop-blur-md"
        >
          {children}
        </aside>
      </div>
    );
  }

  return (
    <Drawer
      open
      modal={false}
      dismissible={false}
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <DrawerContent
        aria-describedby={undefined}
        className="mt-0 h-[100dvh] rounded-t-2xl border-border/70 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md data-[vaul-drawer-direction=bottom]:max-h-[100dvh]"
      >
        <DrawerTitle className="sr-only">Campus availability browser</DrawerTitle>
        {children}
      </DrawerContent>
    </Drawer>
  );
}

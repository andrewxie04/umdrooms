// browse/BrowsePanel.tsx — composes the browse column: header, search, mode
// tabs, then either the building list or the building detail, with a
// full-panel error state (retry runs the store's init pipeline again).
// Rendered by AppShell inside the desktop panel or the mobile drawer.

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCampusStore } from '@/lib/store';
import { AppHeader } from './AppHeader';
import { SearchBar } from './SearchBar';
import { ModeTabs } from './ModeTabs';
import { BuildingList } from './BuildingList';
import { BuildingDetail } from './BuildingDetail';

export function BrowsePanel() {
  const loading = useCampusStore((s) => s.loading);
  const selected = useCampusStore((s) => s.selected);
  const init = useCampusStore((s) => s.init);

  const showDetail = selected?.kind === 'building' || selected?.kind === 'room';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader />
      {loading.status === 'error' ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-5 text-destructive" />
          </span>
          <p className="mt-3 text-sm font-medium text-foreground">Couldn’t load campus data</p>
          <p className="mt-1 max-w-[26rem] text-xs text-muted-foreground">
            {loading.error ?? 'Something went wrong while loading availability.'}
          </p>
          <Button onClick={() => void init()} size="sm" className="mt-4 rounded-lg">
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          <SearchBar />
          <ModeTabs />
          {showDetail ? <BuildingDetail /> : <BuildingList />}
        </>
      )}
    </div>
  );
}

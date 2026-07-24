// src/components/features/DiningPanel.tsx
//
// Dining hall detail panel, shown when the store selection is
// { kind: 'dining' }. Ports the legacy Sidebar.js dining card behavior:
//   - live status badge + summary (getDiningStatusInfo)
//   - hall hours for the active reference time
//   - menu browsing by day (prev/next/today + date input) with per-day fetch
//     through /.netlify/functions/dining-status and a local cache
//   - meal tabs (Breakfast/Lunch/Dinner/Brunch) with station sections and
//     menu items (linked to nutrition pages when URLs exist)
//   - retail venues render their subvenue shops with per-shop status
//   - external full-menu page link + walking directions

import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, UtensilsCrossed } from 'lucide-react';
import { useCampusStore } from '@/lib/store';
import {
  fetchDiningHallsForDate,
  getDiningHoursLabel,
  getDiningStatusInfo,
  getRecommendedDiningMealName,
  getRetailSubvenueStatusInfo,
  isRetailDiningVenue,
} from '@/lib/diningData.js';
import { playSelectionHaptic } from '@/lib/haptics.js';
import { cn } from '@/lib/utils';
import type { Status } from '@/types/campus';
import {
  DaySwitcher,
  DetailBlock,
  EmptyState,
  ErrorNote,
  GhostButton,
  LoadingNote,
  PanelFrame,
  PrimaryButton,
  SectionHeader,
  StatusBadge,
  StatusDot,
  openWalkingDirections,
} from './ui-bits';

interface BrowseState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  hall: any | null;
  error: string | null;
}

const EMPTY_BROWSE: BrowseState = { status: 'idle', hall: null, error: null };

function toContractStatus(displayStatus: string | null | undefined): Status {
  if (displayStatus === 'Available') return 'available';
  if (displayStatus === 'Opening Soon') return 'opening-soon';
  return 'unavailable';
}

export function DiningPanel() {
  const selected = useCampusStore((s) => s.selected);
  const dining = useCampusStore((s) => s.dining);
  const viewMode = useCampusStore((s) => s.viewMode);
  const activeDateKey = useCampusStore((s) => s.activeDateKey);
  const clearSelection = useCampusStore((s) => s.clearSelection);

  const isDining = selected?.kind === 'dining';
  const storeHall = isDining
    ? dining.find((h) => String(h.id) === String(selected!.id))
    : undefined;

  // The store's hall record is only valid for its own dateKey (the active day).
  const storeDateKey: string = storeHall?.raw?.dateKey || activeDateKey;

  const [browseKey, setBrowseKey] = useState<string>('');
  const [browse, setBrowse] = useState<BrowseState>(EMPTY_BROWSE);
  const [mealName, setMealName] = useState<string>('');
  const cacheRef = useRef(new Map<string, any[]>());
  const requestRef = useRef(0);

  // Reset browse state when the selected hall changes.
  const selectedId = isDining ? String(selected!.id) : null;
  useEffect(() => {
    if (!selectedId) return;
    setBrowseKey(storeHall?.raw?.dateKey || activeDateKey);
    setBrowse(EMPTY_BROWSE);
    setMealName('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Fetch menus when browsing a day other than the one backing the store hall.
  useEffect(() => {
    if (!isDining || !browseKey || browseKey === storeDateKey) {
      setBrowse(EMPTY_BROWSE);
      return;
    }
    const cached = cacheRef.current.get(browseKey);
    if (cached) {
      const hall =
        cached.find((h: any) => String(h.id ?? h.name) === String(selected!.id)) || null;
      setBrowse({
        status: 'ready',
        hall,
        error: hall ? null : 'No dining data for this date.',
      });
      return;
    }
    const requestId = ++requestRef.current;
    setBrowse({ status: 'loading', hall: null, error: null });
    fetchDiningHallsForDate(browseKey)
      .then((halls: any[]) => {
        if (requestRef.current !== requestId) return;
        const list = Array.isArray(halls) ? halls : [];
        cacheRef.current.set(browseKey, list);
        const hall =
          list.find((h: any) => String(h.id ?? h.name) === String(selected!.id)) || null;
        setBrowse({
          status: 'ready',
          hall,
          error: hall ? null : 'No dining data for this date.',
        });
      })
      .catch((err: any) => {
        if (requestRef.current !== requestId) return;
        setBrowse({
          status: 'error',
          hall: null,
          error: err?.message || 'Could not load menus for that day.',
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browseKey, isDining, storeDateKey, selectedId]);

  const browsingStoreDay = !browseKey || browseKey === storeDateKey;
  const rawHall: any | null = browsingStoreDay ? storeHall?.raw ?? null : browse.hall;

  // Reference time: "now" only when viewing the active day in Now mode;
  // otherwise noon of the browsed day (ported from legacy Sidebar.js).
  const referenceDate = useMemo(() => {
    if (viewMode === 'now' && browsingStoreDay && storeDateKey === activeDateKey) {
      return new Date();
    }
    return new Date(`${browseKey || activeDateKey}T12:00:00`);
  }, [viewMode, browsingStoreDay, storeDateKey, activeDateKey, browseKey]);

  const statusInfo = useMemo(
    () => (rawHall ? getDiningStatusInfo(rawHall, referenceDate) : null),
    [rawHall, referenceDate]
  );
  const hoursLabel = useMemo(
    () => (rawHall ? getDiningHoursLabel(rawHall, referenceDate) : ''),
    [rawHall, referenceDate]
  );

  const isRetail = rawHall ? isRetailDiningVenue(rawHall) : false;
  const meals: any[] = Array.isArray(rawHall?.meals) ? rawHall.meals : [];

  // Keep the selected meal valid for the browsed hall/date.
  useEffect(() => {
    if (!rawHall || isRetail) return;
    setMealName((prev) => {
      if (prev && meals.some((m) => m?.name === prev)) return prev;
      return getRecommendedDiningMealName(rawHall, referenceDate) || meals[0]?.name || '';
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawHall, isRetail, referenceDate, meals]);

  const selectedMeal = meals.find((m) => m?.name === mealName) || null;

  if (!isDining) return null;

  return (
    <PanelFrame eyebrow="Dining" title={storeHall?.name ?? 'Dining'} onBack={clearSelection}>
      {!storeHall ? (
        <LoadingNote>Loading dining details…</LoadingNote>
      ) : (
        <>
          {/* Live status */}
          {statusInfo ? (
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                status={toContractStatus(statusInfo.status)}
                label={statusInfo.badgeLabel || 'Unknown'}
              />
              {statusInfo.summary ? (
                <span className="text-sm text-muted-foreground">{statusInfo.summary}</span>
              ) : null}
            </div>
          ) : null}

          {/* Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <PrimaryButton
              onClick={() => {
                playSelectionHaptic();
                openWalkingDirections(storeHall.lat, storeHall.lng);
              }}
            >
              Navigate to Dining
            </PrimaryButton>
            {rawHall?.pageUrl ? (
              <GhostButton
                onClick={() => {
                  playSelectionHaptic();
                  window.open(rawHall.pageUrl, '_blank', 'noopener,noreferrer');
                }}
              >
                {isRetail ? 'View Hours Page' : 'View Full Menu'}
                <ExternalLink className="h-3.5 w-3.5" />
              </GhostButton>
            ) : null}
          </div>

          {/* Day browser (residential halls only, matches legacy behavior) */}
          {!isRetail ? (
            <div className="mt-5">
              <DaySwitcher
                label="Dining Date"
                dateKey={browseKey}
                onChange={(key) => {
                  playSelectionHaptic();
                  setBrowseKey(key);
                }}
              />
              <div className="mt-2 space-y-2">
                {browse.status === 'loading' ? (
                  <LoadingNote>Loading menu…</LoadingNote>
                ) : null}
                {browse.status === 'error' && browse.error ? (
                  <ErrorNote
                    message={browse.error}
                    onRetry={() => {
                      cacheRef.current.delete(browseKey);
                      setBrowse({ status: 'loading', hall: null, error: null });
                      fetchAndCache(browseKey, cacheRef.current, requestRef, setBrowse, selectedId);
                    }}
                  />
                ) : null}
              </div>
            </div>
          ) : null}

          {browse.status === 'ready' && !rawHall ? (
            <div className="mt-4">
              <EmptyState
                icon={<UtensilsCrossed className="h-5 w-5" />}
                title="No menu posted"
                body="This hall has no posted dining data for the selected date."
              />
            </div>
          ) : null}

          {/* Hours */}
          {!isRetail && hoursLabel ? (
            <DetailBlock label="Hours">{hoursLabel}</DetailBlock>
          ) : null}

          {/* Retail venue: shops + per-shop status */}
          {isRetail && rawHall ? (
            <>
              <DetailBlock label="Location">
                <p>{rawHall.description || 'Retail dining venue on campus.'}</p>
                {rawHall.paymentNote ? (
                  <p className="mt-1 text-muted-foreground">{rawHall.paymentNote}</p>
                ) : null}
              </DetailBlock>
              <SectionHeader>Shops</SectionHeader>
              <div className="space-y-2">
                {(Array.isArray(rawHall.subvenues) ? rawHall.subvenues : []).length ? (
                  rawHall.subvenues.map((sub: any) => {
                    const subInfo = getRetailSubvenueStatusInfo(rawHall, sub, referenceDate);
                    return (
                      <div
                        key={sub.id || sub.name}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">
                            {sub.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sub.hoursLabel || 'Closed'}
                          </div>
                        </div>
                        <StatusBadge
                          status={toContractStatus(subInfo.status)}
                          label={subInfo.badgeLabel}
                          className="shrink-0"
                        />
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No posted hours for this date yet.
                  </p>
                )}
              </div>
            </>
          ) : null}

          {/* Residential hall: meal tabs + menu sections */}
          {!isRetail && rawHall ? (
            <>
              {meals.length ? (
                <div className="mt-5">
                  <SectionHeader className="mt-0">Meals</SectionHeader>
                  <div className="flex flex-wrap gap-1.5">
                    {meals.map((meal: any) => (
                      <button
                        key={meal?.name}
                        type="button"
                        onClick={() => {
                          playSelectionHaptic();
                          setMealName(meal?.name || '');
                        }}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          selectedMeal?.name === meal?.name
                            ? 'border-umd-red/40 bg-umd-red/10 text-umd-red'
                            : 'border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
                        )}
                      >
                        {meal?.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {selectedMeal ? (
                <div className="mt-4">
                  <SectionHeader className="mt-0">{selectedMeal.name} Menu</SectionHeader>
                  <div className="space-y-4">
                    {(Array.isArray(selectedMeal.sections) ? selectedMeal.sections : []).map(
                      (section: any) => (
                        <div key={section?.name}>
                          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <StatusDot status="unknown" className="h-1.5 w-1.5 bg-umd-red" />
                            {section?.name}
                          </div>
                          <div className="flex flex-wrap gap-1.5 pl-3.5">
                            {(Array.isArray(section?.items) ? section.items : []).map(
                              (item: any) =>
                                item?.url ? (
                                  <a
                                    key={`${section?.name}-${item?.name}`}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground/90 transition-colors hover:border-umd-red/40 hover:text-umd-red"
                                  >
                                    {item?.name}
                                  </a>
                                ) : (
                                  <span
                                    key={`${section?.name}-${item?.name}`}
                                    className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground/90"
                                  >
                                    {item?.name}
                                  </span>
                                )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : meals.length ? null : browse.status !== 'loading' ? (
                <div className="mt-4">
                  <EmptyState
                    icon={<UtensilsCrossed className="h-5 w-5" />}
                    title="No meal details posted"
                    body="No meal details are posted for this date yet."
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </PanelFrame>
  );
}

// Extracted so the retry button can re-run the fetch outside the effect.
function fetchAndCache(
  dateKey: string,
  cache: Map<string, any[]>,
  requestRef: { current: number },
  setBrowse: (s: BrowseState) => void,
  selectedId: string | null
) {
  const requestId = ++requestRef.current;
  fetchDiningHallsForDate(dateKey)
    .then((halls: any[]) => {
      if (requestRef.current !== requestId) return;
      const list = Array.isArray(halls) ? halls : [];
      cache.set(dateKey, list);
      const hall = list.find((h: any) => String(h.id ?? h.name) === String(selectedId)) || null;
      setBrowse({ status: 'ready', hall, error: hall ? null : 'No dining data for this date.' });
    })
    .catch((err: any) => {
      if (requestRef.current !== requestId) return;
      setBrowse({
        status: 'error',
        hall: null,
        error: err?.message || 'Could not load menus for that day.',
      });
    });
}

export default DiningPanel;

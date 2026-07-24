// src/components/map3d/CampusMap3D.tsx
//
// Rooms — custom three.js 3D campus map (Phase 2 Mapbox replacement).
//
// Default export, no required props: reads useCampusStore directly and owns
// the full overlay layer on top of the scene core in ./scene (owned by the
// SceneCore agent — this file codes ONLY against the CampusSceneHandle
// contract, never three.js):
//   - scene lifecycle (StrictMode double-mount safe, warm loading shimmer,
//     styled error card)
//   - imperative HTML markers (status dots at far/medium zoom; small code-only
//     pills at close zoom when markers are sparse; dining emoji chips, parking
//     'P' chips) projected per frame via handle.onFrame + project()
//   - marker clicks -> store.select(..., { source: 'map' }) + haptic; canvas
//     background clicks intentionally do NOTHING (the sheet owns dismissal)
//   - selection sync via store subscribe: 3D pulse ring + camera fly when the
//     selection came from a panel; store flyTo requests honored and cleared
//   - solar day/night wiring: store.darkModeAuto -> scene time mode ('auto'
//     follows the real sun; a manual toggle forces eased day/night), and the
//     scene's effective darkness (sun elevation < -1°) is pushed back into
//     the store via setDarkModeAuto so the whole UI theme follows the sun
//   - warm Tailwind controls: 2D/3D tilt, north reset, geolocate (pulsing
//     blue dot + one-time fly on first fix), collapsible legend chip, and the
//     required OSM attribution chip (campus geometry is ODbL OSM data).

import { useEffect, useRef, useState } from 'react';
import { Compass, LocateFixed, MapPinned } from 'lucide-react';
import { useCampusStore, type CampusStore } from '@/lib/store';
import { getStatusColors } from '@/lib/theme';
import { playSelectionHaptic } from '@/lib/haptics.js';
import type { BuildingEntry, DiningHall, ParkingLot, Status } from '@/types/campus';
import { createCampusScene, HOME_VIEW, HOME_VIEW_2D } from './scene';
import type { CampusSceneHandleV2, SceneTimeMode } from './scene/scene';
import MapLegendChip3D from './MapLegendChip3D';

export { default as MapLegendChip3D } from './MapLegendChip3D';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// The scene's flyTo pitch is elevation above the horizon (phi = 90 - pitch):
// 90 = straight top-down, lower = more tilted.
const PITCH_3D = 62;
const BASE_URL = import.meta.env.BASE_URL || '/';

/** px-per-0.001°-longitude at which code-pill labels may replace bare dots. */
const LABEL_ZOOM_THRESHOLD = 120;

/** Density guard: when more on-screen building markers than this would carry a
 * pill, the layer stays dots-only even past LABEL_ZOOM_THRESHOLD. */
const MAX_VISIBLE_LABELS = 25;

type MarkerKind = 'building' | 'dining' | 'parking';

interface MarkerRecord {
  key: string;
  kind: MarkerKind;
  id: string;
  lat: number;
  lng: number;
  el: HTMLDivElement;
  /** Elements whose color follows the live status (dot / chip). */
  statusEls: HTMLElement[];
  labelEl: HTMLDivElement | null;
  hidden: boolean;
}

// ---------------------------------------------------------------------------
// Injected marker / overlay CSS (self-contained; index.css is shared and
// must not be edited, so the marker chrome lives in one <style> tag).
// ---------------------------------------------------------------------------

const STYLE_ID = 'campus-map3d-overlay-styles';

const OVERLAY_CSS = `
.m3d-layer { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 10; }
.m3d-marker { position: absolute; left: 0; top: 0; pointer-events: auto; cursor: pointer; will-change: transform; }
.m3d-dot { width: 12px; height: 12px; border-radius: 9999px; border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(35, 31, 26, 0.35); transform: translate(-50%, -50%); }
.m3d-label { position: absolute; top: 8px; left: 50%; transform: translateX(-50%);
  white-space: nowrap; font-size: 10px; font-weight: 600; line-height: 1.2;
  padding: 2px 6px; border-radius: 9999px; background: rgba(255, 253, 248, 0.94);
  color: #4a443b; border: 1px solid rgba(35, 31, 26, 0.08);
  box-shadow: 0 1px 3px rgba(35, 31, 26, 0.18); display: none; }
.m3d-layer.m3d-dark .m3d-label { background: rgba(38, 34, 30, 0.94); color: #d8d2c8;
  border-color: rgba(255, 255, 255, 0.09); }
.m3d-layer.m3d-zoomed .m3d-label { display: block; }
.m3d-chip { display: flex; align-items: center; justify-content: center;
  transform: translate(-50%, -50%); border-radius: 9999px; background: #fffdf8;
  border: 2px solid #8c867a; box-shadow: 0 1px 4px rgba(35, 31, 26, 0.3); }
.m3d-layer.m3d-dark .m3d-chip { background: #26221e; }
.m3d-chip img { width: 14px; height: 14px; display: block; }
.m3d-chip.m3d-dining { width: 24px; height: 24px; }
.m3d-chip.m3d-parking { width: 20px; height: 20px; background: #3a352f; color: #fffdf8;
  font-size: 11px; font-weight: 700; line-height: 1; }
.m3d-marker.m3d-selected .m3d-dot, .m3d-marker.m3d-selected .m3d-chip {
  box-shadow: 0 0 0 2px #e21833, 0 1px 4px rgba(35, 31, 26, 0.35); }
.m3d-user { position: absolute; left: 0; top: 0; pointer-events: none; will-change: transform; }
.m3d-user-dot { width: 14px; height: 14px; border-radius: 9999px; background: #3b82c4;
  border: 2.5px solid #fff; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%); }
.m3d-user-pulse { position: absolute; left: 0; top: 0; width: 14px; height: 14px;
  border-radius: 9999px; background: rgba(59, 130, 196, 0.35);
  transform: translate(-50%, -50%); animation: m3d-user-ping 1.8s ease-out infinite; }
@keyframes m3d-user-ping {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
  100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0; }
}
.m3d-shimmer { position: absolute; inset: 0; overflow: hidden; background: #f1ebe2; }
.m3d-shimmer.m3d-shimmer-dark { background: #17140f; }
.m3d-shimmer::after { content: ''; position: absolute; top: -20%; bottom: -20%; left: -30%;
  width: 45%; background: rgba(255, 253, 248, 0.5); filter: blur(48px);
  animation: m3d-sheen 2.2s ease-in-out infinite; }
.m3d-shimmer.m3d-shimmer-dark::after { background: rgba(239, 236, 231, 0.08); }
@keyframes m3d-sheen {
  0% { transform: translateX(0); }
  100% { transform: translateX(320%); }
}
`;

function ensureOverlayStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = OVERLAY_CSS;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Selection target resolution (self-contained; originally ported from the
// retired Mapbox map's style helpers).
// ---------------------------------------------------------------------------

function validCoord(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng);
}

function findRoomSelectionBuilding(
  buildings: BuildingEntry[],
  id: string,
): BuildingEntry | undefined {
  const slash = id.indexOf('/');
  if (slash > 0) {
    const code = id.slice(0, slash);
    const byCode = buildings.find((b) => b.id === code || b.code === code);
    if (byCode) return byCode;
  }
  return buildings.find((b) => (b.rooms ?? []).some((r) => String(r.id) === id));
}

interface ResolvedTarget {
  lat: number;
  lng: number;
  isRoom: boolean;
  /** UMD building code when the selection is a building/room — used for the
   * 3D whole-building highlight. */
  code?: string;
  /** PARKING_RULES lot name when the selection is a parking lot — used for
   * the 3D parking highlight (garage shell / surface-lot plate). */
  parkingName?: string;
}

function resolveSelectionTarget(s: CampusStore): ResolvedTarget | null {
  const sel = s.selected;
  if (!sel) return null;
  let lat = NaN;
  let lng = NaN;
  let code: string | undefined;
  let parkingName: string | undefined;
  const isRoom = sel.kind === 'room';

  if (sel.kind === 'building' || sel.kind === 'room') {
    const building =
      sel.kind === 'building'
        ? s.buildings.find((b) => b.id === sel.id)
        : findRoomSelectionBuilding(s.buildings, sel.id);
    if (building) {
      lat = building.lat;
      lng = building.lng;
      code = building.code;
    }
  } else if (sel.kind === 'dining') {
    const hall = s.dining.find((d) => d.id === sel.id);
    if (hall) {
      lat = hall.lat;
      lng = hall.lng;
    }
  } else if (sel.kind === 'parking') {
    const lot = s.parking.find((p) => p.id === sel.id);
    if (lot) {
      lat = lot.lat;
      lng = lot.lng;
      parkingName = lot.name;
    }
  }

  if (!validCoord(lat, lng)) return null;
  return { lat, lng, isRoom, code, parkingName };
}

// ---------------------------------------------------------------------------
// Marker construction (imperative DOM — no React re-renders per frame)
// ---------------------------------------------------------------------------

function onMarkerClick(kind: MarkerKind, id: string): void {
  playSelectionHaptic();
  useCampusStore.getState().select({ kind, id }, { source: 'map' });
}

function makeWrapper(kind: MarkerKind, id: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'm3d-marker';
  el.style.display = 'none'; // hidden until the first frame positions it
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onMarkerClick(kind, id);
  });
  return el;
}

function makeLabel(text: string): HTMLDivElement {
  const label = document.createElement('div');
  label.className = 'm3d-label';
  label.textContent = text;
  return label;
}

function createBuildingMarker(b: BuildingEntry, colors: Record<Status, string>): MarkerRecord {
  const el = makeWrapper('building', b.id);
  const dot = document.createElement('div');
  dot.className = 'm3d-dot';
  dot.style.backgroundColor = colors[b.status];
  el.appendChild(dot);
  // Code-only pill — availability counts live in the sidebar, never on the
  // map (the `CODE · n/m open` pills cluttered campus-zoom views).
  const label = makeLabel(b.code);
  el.appendChild(label);
  return {
    key: `building:${b.id}`,
    kind: 'building',
    id: b.id,
    lat: b.lat,
    lng: b.lng,
    el,
    statusEls: [dot],
    labelEl: label,
    hidden: true,
  };
}

function createDiningMarker(d: DiningHall, colors: Record<Status, string>): MarkerRecord {
  const el = makeWrapper('dining', d.id);
  const chip = document.createElement('div');
  chip.className = 'm3d-chip m3d-dining';
  chip.style.borderColor = colors[d.status];
  const isRetail = (d.raw as { kind?: string } | undefined)?.kind === 'retail';
  const img = document.createElement('img');
  img.src = `${BASE_URL}map-icons/${isRetail ? 'market-shop-emoji.png' : 'dining-hall-emoji.png'}`;
  img.alt = '';
  img.draggable = false;
  // Graceful fallback: if the emoji art is missing, show a status dot instead.
  img.onerror = () => {
    img.remove();
    chip.classList.remove('m3d-chip', 'm3d-dining');
    chip.classList.add('m3d-dot');
    chip.style.backgroundColor = colors[d.status];
    chip.style.borderColor = '#fff';
  };
  chip.appendChild(img);
  el.appendChild(chip);
  return {
    key: `dining:${d.id}`,
    kind: 'dining',
    id: d.id,
    lat: d.lat,
    lng: d.lng,
    el,
    statusEls: [chip],
    labelEl: null,
    hidden: true,
  };
}

function createParkingMarker(p: ParkingLot, colors: Record<Status, string>): MarkerRecord {
  const el = makeWrapper('parking', p.id);
  const chip = document.createElement('div');
  chip.className = 'm3d-chip m3d-parking';
  chip.style.borderColor = colors[p.status];
  chip.textContent = 'P';
  el.appendChild(chip);
  return {
    key: `parking:${p.id}`,
    kind: 'parking',
    id: p.id,
    lat: p.lat,
    lng: p.lng,
    el,
    statusEls: [chip],
    labelEl: null,
    hidden: true,
  };
}

/** Updates an existing marker in place (colors, label text, selection ring). */
function refreshMarker(
  rec: MarkerRecord,
  status: Status,
  labelText: string | null,
  selected: boolean,
  colors: Record<Status, string>,
): void {
  for (const el of rec.statusEls) {
    if (el.classList.contains('m3d-dot')) {
      el.style.backgroundColor = colors[status];
    } else {
      el.style.borderColor = colors[status];
    }
  }
  if (rec.labelEl && labelText != null && rec.labelEl.textContent !== labelText) {
    rec.labelEl.textContent = labelText;
  }
  rec.el.classList.toggle('m3d-selected', selected);
}

/** Diffs the desired marker set (derived from the store) against the cached
 * DOM markers, creating / updating / removing as needed. */
function rebuildMarkers(
  layer: HTMLDivElement,
  cache: Map<string, MarkerRecord>,
  s: CampusStore,
): void {
  const colors = getStatusColors(s.darkMode);
  const overlays = s.activeOverlays;
  const wanted = new Set<string>();
  const sel = s.selected;
  const selectedBuildingId =
    sel?.kind === 'building'
      ? sel.id
      : sel?.kind === 'room'
        ? (findRoomSelectionBuilding(s.buildings, sel.id)?.id ?? null)
        : null;

  if (overlays.includes('classrooms') || overlays.includes('library')) {
    for (const b of s.buildings) {
      if (b.kind === 'classroom' && !overlays.includes('classrooms')) continue;
      if (b.kind === 'library' && !overlays.includes('library')) continue;
      if (!validCoord(b.lat, b.lng)) continue;
      const key = `building:${b.id}`;
      wanted.add(key);
      const labelText = b.code; // code-only pill; counts stay in the sidebar
      const existing = cache.get(key);
      if (existing) {
        existing.lat = b.lat;
        existing.lng = b.lng;
        refreshMarker(existing, b.status, labelText, selectedBuildingId === b.id, colors);
      } else {
        const rec = createBuildingMarker(b, colors);
        rec.el.classList.toggle('m3d-selected', selectedBuildingId === b.id);
        cache.set(key, rec);
        layer.appendChild(rec.el);
      }
    }
  }

  if (overlays.includes('dining')) {
    for (const d of s.dining) {
      if (!validCoord(d.lat, d.lng)) continue;
      const key = `dining:${d.id}`;
      wanted.add(key);
      const existing = cache.get(key);
      if (existing) {
        existing.lat = d.lat;
        existing.lng = d.lng;
        refreshMarker(existing, d.status, null, sel?.kind === 'dining' && sel.id === d.id, colors);
      } else {
        const rec = createDiningMarker(d, colors);
        rec.el.classList.toggle('m3d-selected', sel?.kind === 'dining' && sel.id === d.id);
        cache.set(key, rec);
        layer.appendChild(rec.el);
      }
    }
  }

  if (overlays.includes('parking')) {
    for (const p of s.parking) {
      if (!validCoord(p.lat, p.lng)) continue;
      const key = `parking:${p.id}`;
      wanted.add(key);
      const existing = cache.get(key);
      if (existing) {
        existing.lat = p.lat;
        existing.lng = p.lng;
        refreshMarker(existing, p.status, null, sel?.kind === 'parking' && sel.id === p.id, colors);
      } else {
        const rec = createParkingMarker(p, colors);
        rec.el.classList.toggle('m3d-selected', sel?.kind === 'parking' && sel.id === p.id);
        cache.set(key, rec);
        layer.appendChild(rec.el);
      }
    }
  }

  for (const [key, rec] of cache) {
    if (!wanted.has(key)) {
      rec.el.remove();
      cache.delete(key);
    }
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CampusMap3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<CampusSceneHandleV2 | null>(null);
  const markersRef = useRef<Map<string, MarkerRecord>>(new Map());
  const frameOffRef = useRef<(() => void) | null>(null);
  const labelsZoomedRef = useRef<boolean | null>(null);
  /** Last camera target (selection / flyTo / geolocate), used by the tilt and
   * north-reset controls since the scene contract exposes no camera getter. */
  const lastTargetRef = useRef<{ lat: number; lng: number }>({
    lat: HOME_VIEW.lat,
    lng: HOME_VIEW.lng,
  });
  const pitchRef = useRef(PITCH_3D);
  /** Lets the scene-lifecycle effect (mounted once) call the latest goHome. */
  const goHomeRef = useRef<() => void>(() => {});

  const watchIdRef = useRef<number | null>(null);
  const firstFixRef = useRef(false);
  const userPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const userMarkerRef = useRef<HTMLDivElement | null>(null);

  const [sceneState, setSceneState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [is3D, setIs3D] = useState(true);
  const [geoActive, setGeoActive] = useState(false);
  const darkMode = useCampusStore((s) => s.darkMode);
  const loadingStatus = useCampusStore((s) => s.loading.status);

  // -- geolocate -------------------------------------------------------------
  const stopGeolocate = () => {
    if (watchIdRef.current != null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = null;
    userPosRef.current = null;
    firstFixRef.current = false;
    userMarkerRef.current?.remove();
    userMarkerRef.current = null;
    setGeoActive(false);
  };

  const ensureUserMarker = () => {
    if (userMarkerRef.current || !layerRef.current) return;
    const el = document.createElement('div');
    el.className = 'm3d-user';
    el.style.display = 'none';
    const pulse = document.createElement('div');
    pulse.className = 'm3d-user-pulse';
    const dot = document.createElement('div');
    dot.className = 'm3d-user-dot';
    el.appendChild(pulse);
    el.appendChild(dot);
    layerRef.current.appendChild(el);
    userMarkerRef.current = el;
  };

  const toggleGeolocate = () => {
    if (geoActive) {
      stopGeolocate();
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    setGeoActive(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (!validCoord(lat, lng)) return;
        userPosRef.current = { lat, lng };
        ensureUserMarker();
        if (!firstFixRef.current) {
          firstFixRef.current = true;
          lastTargetRef.current = { lat, lng };
          handleRef.current?.flyTo({ lat, lng, zoom: 16, pitch: pitchRef.current });
        }
      },
      () => stopGeolocate(),
      { enableHighAccuracy: true },
    );
  };

  // -- scene lifecycle + store subscriptions ---------------------------------
  useEffect(() => {
    const container = containerRef.current;
    const layer = layerRef.current;
    if (!container || !layer) return;

    ensureOverlayStyles();
    let disposed = false;
    let handle: CampusSceneHandleV2 | null = null;

    /** Pushes the store's dark-mode policy into the scene: auto follows the
     * real solar cycle; a manual toggle forces day/night (eased, ~2.5s). */
    const syncTimeMode = () => {
      const s = useCampusStore.getState();
      const h = handleRef.current;
      if (!h) return;
      const mode: SceneTimeMode = s.darkModeAuto
        ? 'auto'
        : s.darkMode
          ? 'force-night'
          : 'force-day';
      h.setTimeMode(mode);
    };

    /** UI theme follows the sun while darkModeAuto is on: push the scene's
     * effective darkness (sun elevation < -1°) back into the store. */
    const syncThemeFromSun = () => {
      const s = useCampusStore.getState();
      if (!s.darkModeAuto) return;
      const elev = handleRef.current?.getSunElevation();
      if (elev == null) return;
      const dark = elev < -1;
      if (dark !== s.darkMode) s.setDarkModeAuto(dark);
    };
    const sunThemeTimer = window.setInterval(syncThemeFromSun, 15000);

    const applySelection = (fly: boolean) => {
      const s = useCampusStore.getState();
      const h = handleRef.current;
      const target = resolveSelectionTarget(s);
      if (!target) {
        h?.clearPulseRing();
        h?.clearHighlightBuilding();
        h?.clearHighlightParking();
        return;
      }
      h?.setPulseRing(target.lng, target.lat);
      // Whole-building red highlight for building/room selections; dining
      // keeps the pulse ring only.
      if (target.code) h?.setHighlightBuilding({ lng: target.lng, lat: target.lat, code: target.code });
      else h?.clearHighlightBuilding();
      // Parking selections highlight the lot: garages get the red building
      // shell, surface lots a flat red plate over their parking polygon(s).
      if (target.parkingName) h?.setHighlightParking({ name: target.parkingName });
      else h?.clearHighlightParking();
      lastTargetRef.current = { lat: target.lat, lng: target.lng };
      if (fly) {
        pitchRef.current = PITCH_3D;
        setIs3D(true);
        h?.flyTo({
          lat: target.lat,
          lng: target.lng,
          zoom: target.isRoom ? 17 : 16.5,
          pitch: PITCH_3D,
        });
      }
    };

    const rebuild = () => {
      const s = useCampusStore.getState();
      layer.classList.toggle('m3d-dark', s.darkMode);
      rebuildMarkers(layer, markersRef.current, s);
    };

    // Per-frame marker projection. React never re-renders here — positions
    // are written straight to translate3d, and code-pill visibility toggles a
    // single class on the layer when zoom AND on-screen density allow it.
    const frame = () => {
      const h = handleRef.current;
      if (!h) return;
      const anchor = lastTargetRef.current;
      const p0 = h.project(anchor.lng, anchor.lat);
      const p1 = h.project(anchor.lng + 0.001, anchor.lat);
      const pxPer = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const zoomed = pxPer >= LABEL_ZOOM_THRESHOLD;
      let visibleLabeled = 0;
      for (const rec of markersRef.current.values()) {
        const p = h.project(rec.lng, rec.lat);
        if (!p.visible) {
          if (!rec.hidden) {
            rec.el.style.display = 'none';
            rec.hidden = true;
          }
          continue;
        }
        if (rec.labelEl) visibleLabeled += 1;
        if (rec.hidden) {
          rec.el.style.display = '';
          rec.hidden = false;
        }
        rec.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      }
      // Density guard: even past the zoom threshold, hide pills when too many
      // labeled markers are on screen — dots only until the view is sparse.
      const showLabels = zoomed && visibleLabeled <= MAX_VISIBLE_LABELS;
      if (showLabels !== labelsZoomedRef.current) {
        labelsZoomedRef.current = showLabels;
        layer.classList.toggle('m3d-zoomed', showLabels);
      }
      const user = userPosRef.current;
      const userEl = userMarkerRef.current;
      if (userEl) {
        if (!user) {
          userEl.style.display = 'none';
        } else {
          const p = h.project(user.lng, user.lat);
          if (!p.visible) {
            userEl.style.display = 'none';
          } else {
            userEl.style.display = '';
            userEl.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
          }
        }
      }
    };

    rebuild();
    const unsubscribe = useCampusStore.subscribe((s, prev) => {
      if (
        s.buildings !== prev.buildings ||
        s.dining !== prev.dining ||
        s.parking !== prev.parking ||
        s.activeOverlays !== prev.activeOverlays ||
        s.selected !== prev.selected ||
        s.darkMode !== prev.darkMode
      ) {
        rebuild();
      }
      if (s.darkMode !== prev.darkMode || s.darkModeAuto !== prev.darkModeAuto) {
        syncTimeMode();
      }
      if (s.flyTo && s.flyTo !== prev.flyTo) {
        const t = s.flyTo;
        lastTargetRef.current = { lat: t.lat, lng: t.lng };
        if (t.pitch != null) {
          pitchRef.current = t.pitch;
          setIs3D(t.pitch < 85); // pitch ~90 = top-down 2D
        }
        handleRef.current?.flyTo({ lat: t.lat, lng: t.lng, zoom: t.zoom, pitch: t.pitch });
        s.clearFlyTo();
      }
      if (s.selected !== prev.selected) {
        // Map-tap selections already have the camera in place — only panel
        // selections trigger the camera fly.
        applySelection(s.selectionSource !== 'map');
        // Backing out of a detail panel (selection cleared) returns the
        // camera to the canonical HOME_VIEW load-in pose.
        if (!s.selected && prev.selected) goHomeRef.current();
      }
    });

    setSceneState('loading');
    const initialStore = useCampusStore.getState();
    createCampusScene(container, {
      darkMode: initialStore.darkMode,
      timeMode: initialStore.darkModeAuto
        ? 'auto'
        : initialStore.darkMode
          ? 'force-night'
          : 'force-day',
    })
      .then((h) => {
        if (disposed) {
          h.dispose();
          return;
        }
        handle = h;
        handleRef.current = h;
        // Dev-only QA hook: lets the console read/drive the camera
        // (e.g. __m3d.getPose()) when tuning HOME_VIEW.
        if (import.meta.env.DEV) (window as any).__m3d = h;
        frameOffRef.current = h.onFrame(frame);
        setSceneState('ready');
        syncTimeMode();
        syncThemeFromSun(); // snap the UI theme to the sun right away
        // Restore any deep-linked selection / pending fly that arrived while
        // the scene was still initializing.
        applySelection(false);
        const pending = useCampusStore.getState().flyTo;
        if (pending) {
          lastTargetRef.current = { lat: pending.lat, lng: pending.lng };
          if (pending.pitch != null) {
            pitchRef.current = pending.pitch;
            setIs3D(pending.pitch < 85); // pitch ~90 = top-down 2D
          }
          h.flyTo({ lat: pending.lat, lng: pending.lng, zoom: pending.zoom, pitch: pending.pitch });
          useCampusStore.getState().clearFlyTo();
        }
      })
      .catch((err) => {
        console.error('[CampusMap3D] scene failed to initialize:', err);
        if (!disposed) setSceneState('error');
      });

    return () => {
      disposed = true;
      unsubscribe();
      window.clearInterval(sunThemeTimer);
      frameOffRef.current?.();
      frameOffRef.current = null;
      if (watchIdRef.current != null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
      userPosRef.current = null;
      firstFixRef.current = false;
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      handleRef.current = null;
      handle?.dispose();
      for (const rec of markersRef.current.values()) rec.el.remove();
      markersRef.current.clear();
      labelsZoomedRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -- controls ---------------------------------------------------------------
  /** 2D/3D toggle flies to the matching canonical pose: HOME_VIEW_2D is the
   * tuned top-down framing, HOME_VIEW the tilted load-in view. */
  const toggleTilt = () => {
    const next3D = !is3D;
    const view = next3D ? HOME_VIEW : HOME_VIEW_2D;
    pitchRef.current = view.pitch;
    setIs3D(next3D);
    lastTargetRef.current = { lat: view.lat, lng: view.lng };
    handleRef.current?.flyTo(view);
  };

  /** Recenter to the canonical HOME_VIEW load-in pose (position + zoom +
   * pitch + bearing) — used by the compass button and back-to-list nav. */
  const goHome = () => {
    lastTargetRef.current = { lat: HOME_VIEW.lat, lng: HOME_VIEW.lng };
    pitchRef.current = HOME_VIEW.pitch;
    setIs3D(HOME_VIEW.pitch < 85); // pitch ~90 = top-down 2D
    handleRef.current?.flyTo(HOME_VIEW);
  };
  goHomeRef.current = goHome;

  // -- render ------------------------------------------------------------------
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Inline style is required (same lesson as the old mapbox map): an
          external stylesheet could silently override a class-based position
          and collapse the container height. */}
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      {/* HTML marker overlay (markers themselves are pointer-events-auto) */}
      <div ref={layerRef} className="m3d-layer" />

      {sceneState === 'loading' ? (
        <div className={`m3d-shimmer${darkMode ? ' m3d-shimmer-dark' : ''}`}>
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 shadow-sm backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-status-opening-soon" />
              <span className="text-[11px] font-medium text-muted-foreground">
                Loading 3D campus…
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {sceneState === 'error' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted p-6">
          <div className="max-w-xs rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <MapPinned className="mx-auto mb-3 h-7 w-7 text-muted-foreground" aria-hidden />
            <p className="text-sm font-semibold text-foreground">Campus map unavailable</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              The 3D campus renderer failed to start. Try reloading the page.
            </p>
          </div>
        </div>
      ) : null}

      {sceneState === 'ready' ? (
        <div className="absolute right-2.5 top-2.5 z-20 flex flex-col gap-0.5 rounded-xl border border-border bg-card/90 p-1 shadow-md backdrop-blur">
          <button
            type="button"
            onClick={toggleTilt}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold tracking-tight text-foreground transition-colors hover:bg-accent"
            title={is3D ? 'Switch to 2D view' : 'Switch to 3D view'}
            aria-label={is3D ? 'Switch to 2D view' : 'Switch to 3D view'}
          >
            {is3D ? '2D' : '3D'}
          </button>
          <button
            type="button"
            onClick={goHome}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent"
            title="Recenter map"
            aria-label="Recenter map"
          >
            <Compass className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={toggleGeolocate}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent ${
              geoActive ? 'text-[#3b82c4]' : 'text-foreground'
            }`}
            title={geoActive ? 'Stop showing my location' : 'Show my location'}
            aria-label={geoActive ? 'Stop showing my location' : 'Show my location'}
            aria-pressed={geoActive}
          >
            <LocateFixed className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}

      <MapLegendChip3D />

      {/* NOTE: OpenStreetMap attribution removed per request. Campus geometry
          is still ODbL OSM data, which requires visible attribution — restore
          the "© OpenStreetMap contributors" link here to stay compliant. */}

      {loadingStatus === 'idle' || loadingStatus === 'loading' ? (
        <div className="pointer-events-none absolute left-3 top-3 z-10">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 shadow-sm backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-status-opening-soon" />
            <span className="text-[11px] font-medium text-muted-foreground">
              Loading campus data…
            </span>
          </div>
        </div>
      ) : null}

      {loadingStatus === 'error' ? (
        <div className="pointer-events-none absolute left-3 top-3 z-10">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-status-unavailable" />
            <span className="text-[11px] font-medium text-muted-foreground">
              Live data unavailable
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

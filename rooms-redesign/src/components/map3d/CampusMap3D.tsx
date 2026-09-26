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
//   - marker and modeled-building taps -> store.select(..., { source: 'map' });
//     empty canvas taps leave the current sheet alone
//   - selection sync via store subscribe: 3D pulse ring + camera focus for
//     marker, modeled-building, and panel selections; store flyTo requests
//     honored and cleared
//   - solar day/night wiring: store.darkModeAuto -> scene time mode ('auto'
//     follows the real sun; a manual toggle forces eased day/night), and the
//     scene's effective darkness (sun elevation < -1°) is pushed back into
//     the store via setDarkModeAuto so the whole UI theme follows the sun
//   - warm Tailwind controls: 2D/3D tilt, north reset, geolocate (pulsing
//     blue dot + one-time fly on first fix) and collapsible legend chip.
//     OSM attribution sits in the info sheet beside the other data credits.

import { useEffect, useRef, useState } from 'react';
import { Compass, LocateFixed, MapPinned, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { useCampusStore, type CampusStore } from '@/lib/store';
import { getStatusColors } from '@/lib/theme';
import { playSelectionHaptic } from '@/lib/haptics.js';
import { RESIDENCE_HALLS } from '@/lib/residenceHalls';
import { getMapBuilding, getMapBuildingByCode } from '@/lib/mapPlaces';
import type { BuildingEntry, DiningHall, ParkingLot, Status } from '@/types/campus';
import { HOME_VIEW, HOME_VIEW_2D } from './scene/home-view';
import type { CampusSceneHandleV2, SceneTimeMode } from './scene/scene';
import MapLegendChip3D from './MapLegendChip3D';
import { LANDSCAPE_SIDE_QUERY, SIDE_PANEL_QUERY, mobileSelectionScreenY } from '@/components/shell/layout';

export { default as MapLegendChip3D } from './MapLegendChip3D';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// The scene's flyTo pitch is elevation above the horizon (phi = 90 - pitch):
// 90 = straight top-down, lower = more tilted.
const BASE_URL = import.meta.env.BASE_URL || '/';

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
  /** Screen-space separation for venues that share one mapped coordinate. */
  offsetX?: number;
}

// ---------------------------------------------------------------------------
// Injected marker / overlay CSS (self-contained; index.css is shared and
// must not be edited, so the marker chrome lives in one <style> tag).
// ---------------------------------------------------------------------------

const STYLE_ID = 'campus-map3d-overlay-styles';

const OVERLAY_CSS = `
.m3d-layer { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 10; }
.m3d-marker { position: absolute; left: -20px; top: -20px; width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center; pointer-events: auto;
  cursor: pointer; will-change: transform; border-radius: 9999px; outline: none; }
.m3d-marker:focus-visible { outline: 2px solid #e21833; outline-offset: 1px; }
.m3d-marker::after { content: attr(data-name); position: absolute; bottom: calc(100% + 4px);
  left: 50%; transform: translate(-50%, 3px); z-index: 2; width: max-content;
  max-width: min(220px, calc(100vw - 24px));
  padding: 6px 9px; border-radius: 7px; background: rgba(255, 253, 248, 0.97);
  color: #292521; box-shadow: 0 3px 12px rgba(20, 18, 17, 0.26);
  font-size: 11px; font-weight: 650; line-height: 1.3; text-align: center;
  white-space: normal; overflow-wrap: anywhere; opacity: 0; visibility: hidden; pointer-events: none;
  transition: opacity 120ms ease, transform 120ms ease; }
.m3d-layer.m3d-dark .m3d-marker::after { background: rgba(38, 34, 30, 0.97); color: #f4f0e9; }
.m3d-marker.m3d-selected::after { opacity: 1; visibility: visible; transform: translate(-50%, 0); }
.m3d-dot { width: 12px; height: 12px; border-radius: 9999px; border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(35, 31, 26, 0.35); }
.m3d-label { position: absolute; top: calc(50% + 8px); left: 50%; transform: translateX(-50%);
  white-space: nowrap; font-size: 10px; font-weight: 600; line-height: 1.2;
  padding: 2px 6px; border-radius: 9999px; background: rgba(255, 253, 248, 0.94);
  color: #4a443b; border: 1px solid rgba(35, 31, 26, 0.08);
  box-shadow: 0 1px 3px rgba(35, 31, 26, 0.18); display: none; }
.m3d-layer.m3d-dark .m3d-label { background: rgba(38, 34, 30, 0.94); color: #d8d2c8;
  border-color: rgba(255, 255, 255, 0.09); }
.m3d-marker.m3d-selected .m3d-label { display: block; }
.m3d-chip { display: flex; align-items: center; justify-content: center;
  border-radius: 9999px; background: #fffdf8;
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
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  if (style.textContent !== OVERLAY_CSS) style.textContent = OVERLAY_CSS;
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
  compactPlace: boolean;
  residenceId?: string;
  mapBuildingId?: string;
  /** UMD building code when the selection is a building/room — used for the
   * 3D whole-building highlight. */
  code?: string;
  /** PARKING_RULES lot name when the selection is a parking lot — used for
   * the 3D parking highlight (garage shell / surface-lot plate). */
  parkingName?: string;
}

type BuildingCenterLookup = (code: string) => { lat: number; lng: number } | null;

function resolveSelectionTarget(s: CampusStore, centerFor?: BuildingCenterLookup): ResolvedTarget | null {
  const sel = s.selected;
  if (!sel) return null;
  let lat = NaN;
  let lng = NaN;
  let code: string | undefined;
  let parkingName: string | undefined;
  let residenceId: string | undefined;
  let mapBuildingId: string | undefined;
  const isRoom = sel.kind === 'room';

  if (sel.kind === 'building' || sel.kind === 'room') {
    const building =
      sel.kind === 'building'
        ? s.buildings.find((b) => b.id === sel.id)
        : findRoomSelectionBuilding(s.buildings, sel.id);
    if (building) {
      const mapped = centerFor?.(building.code);
      lat = mapped?.lat ?? building.lat;
      lng = mapped?.lng ?? building.lng;
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
  } else if (sel.kind === 'residence') {
    const hall = RESIDENCE_HALLS.find((place) => place.id === sel.id);
    if (hall) {
      lat = hall.lat;
      lng = hall.lng;
      residenceId = hall.id;
    }
  } else if (sel.kind === 'map-building') {
    const place = getMapBuilding(sel.id);
    if (place) {
      lat = place.lat;
      lng = place.lng;
      code = place.code;
      mapBuildingId = place.id;
    }
  }

  if (!validCoord(lat, lng)) return null;
  return { lat, lng, isRoom, compactPlace: true,
    code, parkingName, residenceId, mapBuildingId };
}

function hasSidePanel(): boolean {
  return window.matchMedia(SIDE_PANEL_QUERY).matches;
}

function selectionScreenAnchor(target?: ResolvedTarget | null) {
  // Short phones have a narrow strip between the top controls and detail
  // sheet. Keep the building in that strip instead of tucking its roof behind
  // the control tray.
  const mobileY = mobileSelectionScreenY(
    window.innerHeight,
    Boolean(target?.compactPlace),
    target?.mapBuildingId ? 'map' : target?.residenceId ? 'residence' : null,
  );
  return {
    // The phone's map controls occupy the upper-right corner of the exposed
    // strip; a slight left bias keeps broad roofs clear of that tray.
    screenX: hasSidePanel()
      ? useCampusStore.getState().browsePanelHidden ? 0.5 : 0.72
      : 0.44,
    screenY: hasSidePanel() ? 0.5 : mobileY,
  };
}

function homeScreenAnchor() {
  if (!hasSidePanel() || useCampusStore.getState().browsePanelHidden)
    return { screenX: 0.5, screenY: 0.5 };
  const width = window.innerWidth;
  const landscape = window.matchMedia(LANDSCAPE_SIDE_QUERY).matches;
  const panelRight = landscape
    ? 8 + Math.min(360, width * 0.53)
    : 16 + Math.min(420, width * 0.42);
  return { screenX: Math.min(0.8, 0.5 + panelRight / (2 * width)), screenY: 0.5 };
}

/** Approach researched entrances from the side where their facade reads best. */
function selectionBearing(code: string | null | undefined, residenceId?: string, mapBuildingId?: string): { bearing: number } | Record<string, never> {
  if (code === 'MCK') return { bearing: -85 }; // east, facing McKeldin Mall
  if (code === 'AJC') return { bearing: -85 }; // east, showing Clark Hall's glazed and shaded facade
  if (code === 'HBK') return { bearing: 85 }; // west, facing Hornbake Plaza
  // These modeled entrances face a specific campus approach. Selecting one
  // should reveal that facade even when the user arrived from another angle.
  if (code === 'EDU' || code === 'ARM' || code === 'SHM') return { bearing: -85 };
  if (code === 'KEY' || code === 'MMH' || code === 'TYD' || code === 'WDS') return { bearing: 180 };
  if (code === 'BPS' || code === 'HJP' || code === 'JMZ' || code === 'LEF'
    || code === 'SKN' || code === 'SYM' || code === 'TLF') return { bearing: 0 };
  if (residenceId === 'way/23543512') return { bearing: -85 }; // Anne Arundel's east portico
  if (residenceId === 'way/23891414') return { bearing: 180 }; // Queen Anne's north portico and gable
  if (residenceId === 'way/23585307') return { bearing: 85 }; // Dorchester's west entrance gable
  if (residenceId === 'way/23891435') return { bearing: 180 }; // Somerset's north portico
  if (residenceId === 'way/23579434') return { bearing: 180 }; // Caroline's courtyard entrance
  if (residenceId === 'way/23546215') return { bearing: 85 }; // Worcester's mapped west stair entrance
  if (mapBuildingId === 'way/24306090') return { bearing: -60 }; // Morrill's east tower, clear of its front tree
  if (mapBuildingId === 'way/23546179') return { bearing: 180 }; // Chincoteague's north portico
  if (mapBuildingId === 'way/23891545') return { bearing: 0 }; // Lee's south portico
  if (mapBuildingId === 'way/23989098') return { bearing: -65 }; // Turner's east visitor entrance
  if (mapBuildingId === 'way/23887405') return { bearing: -85 }; // Geology's Regents Drive portico
  if (mapBuildingId === 'way/23970685') return { bearing: 180 }; // Mitchell's north portico
  if (mapBuildingId === 'way/23543883') return { bearing: 0 }; // Nyumburu's south arcade
  if (mapBuildingId === 'way/23585331') return { bearing: 0 }; // Health Center's south gable
  if (mapBuildingId === 'way/980371045') return { bearing: -28 }; // whole SECU bowl and field
  if (mapBuildingId === 'way/23988920' || mapBuildingId === 'way/1499355407')
    return { bearing: -125 }; // Rossborough's surviving east front, clear of its nearest tree
  return {};
}

function selectionZoom(target: ResolvedTarget): number {
  if (target.code === 'HBK') return 18.8;
  if (target.isRoom) return 18.2;
  if (target.code === 'EDU' || target.code === 'KEY' || target.code === 'JMZ'
    || target.code === 'LEF' || target.code === 'MMH' || target.code === 'SHM'
    || target.code === 'SKN' || target.code === 'SYM' || target.code === 'TLF'
    || target.code === 'WDS') return 18.55;
  if (target.mapBuildingId === 'way/24306090') return 19.4;
  if (target.mapBuildingId === 'way/23546179') return 18.85;
  if (target.mapBuildingId === 'way/23891545') return 18.95;
  if (target.mapBuildingId === 'way/23989098') return 19.05;
  if (target.mapBuildingId === 'way/23887405' || target.mapBuildingId === 'way/23970685'
    || target.mapBuildingId === 'way/23543883' || target.mapBuildingId === 'way/23585331') return 18.85;
  if (target.mapBuildingId === 'way/980371045') return 16.9;
  if (target.mapBuildingId === 'way/23988920' || target.mapBuildingId === 'way/1499355407') return 19.8;
  if (target.mapBuildingId) return 18.45;
  // These small historic halls lose their entrance details at the broad
  // building-selection distance. Large modern residences keep the wider view.
  if (target.residenceId === 'way/23543512' || target.residenceId === 'way/23891414'
    || target.residenceId === 'way/23585307' || target.residenceId === 'way/23891435'
    || target.residenceId === 'way/23579434' || target.residenceId === 'way/23546215') return 18.55;
  return 18;
}

function matchesSelectedPoint(s: CampusStore, lat: number, lng: number): boolean {
  const selected = resolveSelectionTarget(s);
  return selected != null &&
    Math.abs(selected.lat - lat) < 0.000001 &&
    Math.abs(selected.lng - lng) < 0.000001;
}

// ---------------------------------------------------------------------------
// Marker construction (imperative DOM — no React re-renders per frame)
// ---------------------------------------------------------------------------

function onMarkerClick(kind: MarkerKind, id: string): void {
  playSelectionHaptic();
  useCampusStore.getState().select({ kind, id }, { source: 'map' });
}

function makeWrapper(kind: MarkerKind, id: string, name: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'm3d-marker';
  el.setAttribute('role', 'button');
  el.tabIndex = 0;
  el.setAttribute('aria-label', `Open ${name}`);
  el.dataset.name = name;
  el.style.display = 'none'; // hidden until the first frame positions it
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onMarkerClick(kind, id);
  });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onMarkerClick(kind, id);
    }
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
  const el = makeWrapper('building', b.id, b.name);
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
  const el = makeWrapper('dining', d.id, d.name);
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
  const el = makeWrapper('parking', p.id, p.name);
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
  centerFor?: BuildingCenterLookup,
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
      const mapped = centerFor?.(b.code);
      const existing = cache.get(key);
      if (existing) {
        existing.lat = mapped?.lat ?? b.lat;
        existing.lng = mapped?.lng ?? b.lng;
        refreshMarker(existing, b.status, labelText, selectedBuildingId === b.id, colors);
      } else {
        const rec = createBuildingMarker(b, colors);
        rec.lat = mapped?.lat ?? b.lat;
        rec.lng = mapped?.lng ?? b.lng;
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

  // South Campus Dining Hall and South Campus Market have exactly the same
  // published point. Separate every co-located marker by a full tap target
  // so the later DOM element cannot intercept taps on the earlier one.
  const coincident = new Map<string, MarkerRecord[]>();
  for (const rec of cache.values()) {
    const point = `${rec.lat.toFixed(6)},${rec.lng.toFixed(6)}`;
    const group = coincident.get(point) ?? [];
    group.push(rec);
    coincident.set(point, group);
  }
  for (const group of coincident.values()) {
    for (let index = 0; index < group.length; index++) {
      group[index].offsetX = (index - (group.length - 1) / 2) * 44;
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
  /** Last camera target (selection / flyTo / geolocate), used by the tilt and
   * north-reset controls since the scene contract exposes no camera getter. */
  const lastTargetRef = useRef<{ lat: number; lng: number }>({
    lat: HOME_VIEW.lat,
    lng: HOME_VIEW.lng,
  });
  const pitchRef = useRef(HOME_VIEW.pitch);
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
    const markerRecords = markersRef.current;

    ensureOverlayStyles();
    let disposed = false;
    let handle: CampusSceneHandleV2 | null = null;
    let detachBuildingTaps = () => {};
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

    /** Schedule mode drives the environment: the sky, sun angle and every
     * time-of-day easter egg follow the date/time the user picked, so
     * planning for 9pm Tuesday shows a campus at night. Now mode hands the
     * scene back to the live clock. */
    const syncSolarTime = () => {
      const s = useCampusStore.getState();
      handleRef.current?.setSolarTime(s.viewMode === 'schedule' ? s.scheduleDate : null);
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

    /** Long-idle / backgrounded tabs pause rAF and timers, so the sun the
     * scene last computed can be hours stale when the user returns. On
     * visibility regain, force an immediate solar resync (setTimeMode('auto')
     * recomputes realSun now) and snap the UI theme too. */
    const onVisibilityResync = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      const s = useCampusStore.getState();
      if (!s.darkModeAuto) return;
      handleRef.current?.setTimeMode('auto'); // idempotent realtime resync
      syncThemeFromSun();
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityResync);
    }

    const applySelection = (fly: boolean) => {
      const s = useCampusStore.getState();
      const h = handleRef.current;
      const target = resolveSelectionTarget(s, h?.getBuildingCenter.bind(h));
      if (!target) {
        h?.clearPulseRing();
        h?.clearHighlightBuilding();
        h?.clearHighlightParking();
        return;
      }
      h?.setPulseRing(target.lng, target.lat);
      // Whole-building red highlight for building/room selections; dining
      // keeps the pulse ring only.
      if (target.code || target.mapBuildingId) h?.setHighlightBuilding({ lng: target.lng, lat: target.lat, code: target.code });
      else h?.clearHighlightBuilding();
      // Parking selections highlight the lot: garages get the red building
      // shell, surface lots a flat red plate over their parking polygon(s).
      if (target.parkingName) h?.setHighlightParking({ name: target.parkingName });
      else h?.clearHighlightParking();
      lastTargetRef.current = { lat: target.lat, lng: target.lng };
      if (fly) {
        const facadePitch = target.code === 'HJP' ? 27
          : target.mapBuildingId === 'way/23989098' ? 20
          : target.mapBuildingId ? 31 : 37;
        const selectionPitch = target.mapBuildingId === 'way/980371045' ? 60
          : pitchRef.current < 85
            ? Math.min(pitchRef.current, facadePitch) : pitchRef.current;
        pitchRef.current = selectionPitch;
        h?.flyTo({
          lat: target.lat,
          lng: target.lng,
          // Bring facade and roof details into view when a building is chosen.
          zoom: selectionZoom(target),
          pitch: selectionPitch,
          ...selectionBearing(target.code, target.residenceId, target.mapBuildingId),
          // The mobile detail sheet covers the lower part of the canvas;
          // desktop's browse panel occupies the left side. Keep the selected
          // geometry in the exposed part so its facade remains inspectable.
          ...selectionScreenAnchor(target),
        });
      }
    };

    // Re-anchor after a layout or orientation change. A landscape phone and
    // a portrait tablet both use a side panel, but need different home poses.
    let lastLayout = {
      width: window.innerWidth,
      height: window.innerHeight,
      sidePanel: hasSidePanel(),
      landscape: window.matchMedia(LANDSCAPE_SIDE_QUERY).matches,
    };
    const onViewportResize = () => {
      const nextLayout = {
        width: window.innerWidth,
        height: window.innerHeight,
        sidePanel: hasSidePanel(),
        landscape: window.matchMedia(LANDSCAPE_SIDE_QUERY).matches,
      };
      const shouldReframe = nextLayout.sidePanel !== lastLayout.sidePanel ||
        nextLayout.landscape !== lastLayout.landscape ||
        Math.abs(nextLayout.width - lastLayout.width) >= 120 ||
        Math.abs(nextLayout.height - lastLayout.height) >= 120;
      if (!shouldReframe) return;
      lastLayout = nextLayout;
      const h = handleRef.current;
      const s = useCampusStore.getState();
      if (!h) return;
      if (!s.selected) {
        h.flyTo({ ...HOME_VIEW, ...homeScreenAnchor() });
        return;
      }
      const target = resolveSelectionTarget(s, h.getBuildingCenter.bind(h));
      if (!target) return;
      lastTargetRef.current = { lat: target.lat, lng: target.lng };
      h.flyTo({ lat: target.lat, lng: target.lng, ...selectionScreenAnchor(target) });
    };
    window.addEventListener('resize', onViewportResize);
    const breakpointObserver = new ResizeObserver(onViewportResize);
    breakpointObserver.observe(container);

    const rebuild = () => {
      const s = useCampusStore.getState();
      layer.classList.toggle('m3d-dark', s.darkMode);
      rebuildMarkers(layer, markersRef.current, s, handleRef.current?.getBuildingCenter.bind(handleRef.current));
    };

    // Per-frame marker projection. React never re-renders here — positions
    // are written straight to translate3d. Names and code pills are shown
    // only on the selected marker, keeping the unselected campus uncluttered.
    const frame = () => {
      const h = handleRef.current;
      if (!h) return;
      const mapWidth = container.clientWidth;
      const mapHeight = container.clientHeight;
      const state = useCampusStore.getState();
      const sidePanel = hasSidePanel() && !state.browsePanelHidden;
      const panelRight = sidePanel
        ? window.matchMedia(LANDSCAPE_SIDE_QUERY).matches
          ? 8 + Math.min(360, mapWidth * 0.53)
          : 16 + Math.min(420, mapWidth * 0.42)
        : 0;
      const safeLeft = panelRight + 8;
      for (const rec of markersRef.current.values()) {
        const p = h.project(rec.lng, rec.lat);
        const x = p.x + (rec.offsetX ?? 0);
        const visualRadius = rec.kind === 'dining' ? 12 : rec.kind === 'parking' ? 10 : 6;
        const toolbarInset = mapWidth < 480
          ? p.y - visualRadius < 74 ? 250 : 8
          : p.y - visualRadius < 260 ? 72 : 8;
        const markerFits = p.visible && x - visualRadius >= safeLeft &&
          x + visualRadius <= mapWidth - toolbarInset &&
          p.y - visualRadius >= 8 && p.y + visualRadius <= mapHeight - 8;
        if (!markerFits) {
          if (!rec.hidden) {
            rec.el.style.display = 'none';
            rec.hidden = true;
          }
          continue;
        }
        if (rec.labelEl) {
          // Keep code pills wholly inside the exposed map. project() allows a
          // margin beyond the screen so the marker dot can enter smoothly,
          // but a half-visible code is distracting and hard to read.
          const halfLabel = ((rec.labelEl.textContent?.length ?? 3) * 7 + 14) / 2;
          const labelTop = p.y + 8;
          const toolbarInset = mapWidth < 480
            ? labelTop < 74 ? 250 : 8
            : labelTop < 260 ? 72 : 8;
          const fits = x - halfLabel >= safeLeft && x + halfLabel <= mapWidth - toolbarInset &&
            labelTop >= 8 && labelTop + 18 <= mapHeight - 8;
          const visibility = fits ? '' : 'hidden';
          if (rec.labelEl.style.visibility !== visibility) rec.labelEl.style.visibility = visibility;
        }
        if (rec.hidden) {
          rec.el.style.display = '';
          rec.hidden = false;
        }
        rec.el.style.transform = `translate3d(${x}px, ${p.y}px, 0)`;
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
        // Returning to Realtime: snap the UI theme to the real sun right away
        // instead of waiting up to 15s for the sunThemeTimer.
        if (s.darkModeAuto && !prev.darkModeAuto) syncThemeFromSun();
      }
      if (s.viewMode !== prev.viewMode || s.scheduleDate !== prev.scheduleDate) {
        syncSolarTime();
        syncThemeFromSun(); // light/dark UI should track the scheduled hour too
      }
      if (s.flyTo && s.flyTo !== prev.flyTo) {
        const t = s.flyTo;
        const selectedTarget = matchesSelectedPoint(s, t.lat, t.lng)
          ? resolveSelectionTarget(s, handleRef.current?.getBuildingCenter.bind(handleRef.current))
          : null;
        const lat = selectedTarget?.lat ?? t.lat;
        const lng = selectedTarget?.lng ?? t.lng;
        lastTargetRef.current = { lat, lng };
        if (t.pitch != null) {
          pitchRef.current = t.pitch;
          setIs3D(t.pitch < 85); // pitch ~90 = top-down 2D
        }
        handleRef.current?.flyTo({
          lat, lng, zoom: t.zoom, pitch: t.pitch,
          ...selectionBearing(selectedTarget?.code ?? null, selectedTarget?.residenceId, selectedTarget?.mapBuildingId),
          ...(selectedTarget ? selectionScreenAnchor(selectedTarget) : {}),
          ...(t.screenX != null ? { screenX: t.screenX } : {}),
          ...(t.screenY != null ? { screenY: t.screenY } : {}),
        });
        s.clearFlyTo();
      }
      if (s.selected !== prev.selected) {
        // Tapping a marker should reveal the modeled building from its useful
        // facade angle, just like selecting it in the list. This also keeps
        // it in the exposed map area when the phone detail sheet rises.
        applySelection(true);
        // Backing out of a detail panel (selection cleared) returns the
        // camera to the canonical HOME_VIEW load-in pose.
        if (!s.selected && prev.selected) goHomeRef.current();
      }
    });

    import('./scene/scene')
      .then(({ createCampusScene }) => {
        if (disposed) return null;
        const initialStore = useCampusStore.getState();
        return createCampusScene(container, {
          darkMode: initialStore.darkMode,
          initialHomeScreenX: homeScreenAnchor().screenX,
          timeMode: initialStore.darkModeAuto
            ? 'auto'
            : initialStore.darkMode
              ? 'force-night'
              : 'force-day',
        });
      })
      .then((h) => {
        if (!h) return;
        if (disposed) {
          h.dispose();
          return;
        }
        handle = h;
        handleRef.current = h;
        const canvas = container.querySelector('canvas');
        if (canvas) {
          let press: { id: number; x: number; y: number; valid: boolean } | null = null;
          let lastHoverAt = 0;
          canvas.style.cursor = 'grab';
          const onDown = (event: PointerEvent) => {
            if (event.pointerType === 'mouse' && event.button !== 0) return;
            if (press) {
              press.valid = false; // a second finger means pinch/rotate, not tap
              return;
            }
            press = { id: event.pointerId, x: event.clientX, y: event.clientY, valid: true };
            if (event.pointerType === 'mouse') canvas.style.cursor = 'grabbing';
          };
          const onMove = (event: PointerEvent) => {
            if (press?.id === event.pointerId &&
                Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8) {
              press.valid = false;
            }
            if (event.pointerType === 'mouse' && !press && event.timeStamp - lastHoverAt >= 80) {
              lastHoverAt = event.timeStamp;
              canvas.style.cursor = h.pickPlace(event.clientX, event.clientY) ? 'pointer' : 'grab';
            }
          };
          const onUp = (event: PointerEvent) => {
            if (press?.id !== event.pointerId) return;
            const tap = press.valid &&
              Math.hypot(event.clientX - press.x, event.clientY - press.y) <= 8;
            press = null;
            if (event.pointerType === 'mouse') canvas.style.cursor = 'grab';
            if (!tap) return;
            const picked = h.pickPlace(event.clientX, event.clientY);
            if (!picked) return;
            if (picked.kind === 'residence' || picked.kind === 'map-building') {
              playSelectionHaptic();
              useCampusStore.getState().select(picked, { source: 'map' });
            } else {
              const building = useCampusStore.getState().buildings.find((b) => b.code === picked.id);
              if (building) {
                playSelectionHaptic();
                useCampusStore.getState().select({ kind: 'building', id: building.id }, { source: 'map' });
              } else {
                const mapped = getMapBuildingByCode(picked.id);
                if (mapped) {
                  playSelectionHaptic();
                  useCampusStore.getState().select({ kind: 'map-building', id: mapped.id }, { source: 'map' });
                }
              }
            }
          };
          const onCancel = () => { press = null; canvas.style.cursor = 'grab'; };
          const onLeave = () => { if (!press) canvas.style.cursor = 'grab'; };
          canvas.addEventListener('pointerdown', onDown);
          canvas.addEventListener('pointermove', onMove);
          canvas.addEventListener('pointerup', onUp);
          canvas.addEventListener('pointercancel', onCancel);
          canvas.addEventListener('pointerleave', onLeave);
          detachBuildingTaps = () => {
            canvas.removeEventListener('pointerdown', onDown);
            canvas.removeEventListener('pointermove', onMove);
            canvas.removeEventListener('pointerup', onUp);
            canvas.removeEventListener('pointercancel', onCancel);
            canvas.removeEventListener('pointerleave', onLeave);
          };
        }
        rebuild(); // replace metadata coordinates with mapped model centers
        // Dev-only QA hook: lets the console read/drive the camera
        // (e.g. __m3d.getPose()) when tuning HOME_VIEW.
        if (import.meta.env.DEV) (window as Window & { __m3d?: CampusSceneHandleV2 }).__m3d = h;
        frameOffRef.current = h.onFrame(frame);
        setSceneState('ready');
        syncTimeMode();
        syncSolarTime(); // honour a schedule chosen before the scene was ready
        syncThemeFromSun(); // snap the UI theme to the sun right away
        // A building may be selected from the browse panel before Three.js
        // finishes loading. Complete its camera move when the scene is ready.
        // Deep links carry a separate pending fly request below.
        const readyStore = useCampusStore.getState();
        applySelection(Boolean(readyStore.selected) && !readyStore.flyTo);
        const pending = readyStore.flyTo;
        if (pending) {
          const selectedTarget = matchesSelectedPoint(useCampusStore.getState(), pending.lat, pending.lng)
            ? resolveSelectionTarget(useCampusStore.getState(), h.getBuildingCenter.bind(h))
            : null;
          const lat = selectedTarget?.lat ?? pending.lat;
          const lng = selectedTarget?.lng ?? pending.lng;
          lastTargetRef.current = { lat, lng };
          if (pending.pitch != null) {
            pitchRef.current = pending.pitch;
            setIs3D(pending.pitch < 85); // pitch ~90 = top-down 2D
          }
          h.flyTo({
            lat, lng, zoom: pending.zoom, pitch: pending.pitch,
            ...selectionBearing(selectedTarget?.code ?? null, selectedTarget?.residenceId, selectedTarget?.mapBuildingId),
            ...(selectedTarget ? selectionScreenAnchor(selectedTarget) : {}),
            ...(pending.screenX != null ? { screenX: pending.screenX } : {}),
            ...(pending.screenY != null ? { screenY: pending.screenY } : {}),
          });
          useCampusStore.getState().clearFlyTo();
        }
      })
      .catch((err) => {
        console.error('[CampusMap3D] scene failed to initialize:', err);
        if (!disposed) setSceneState('error');
      });

    return () => {
      disposed = true;
      detachBuildingTaps();
      unsubscribe();
      window.clearInterval(sunThemeTimer);
      window.removeEventListener('resize', onViewportResize);
      breakpointObserver.disconnect();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityResync);
      }
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
      for (const rec of markerRecords.values()) rec.el.remove();
      markerRecords.clear();
    };
  }, []);

  // -- controls ---------------------------------------------------------------
  /** The modeled campus stays visible in both camera pitches. */
  const toggleTilt = () => {
    const next3D = !is3D;
    const view = next3D ? HOME_VIEW : HOME_VIEW_2D;
    const h = handleRef.current;
    const selected = resolveSelectionTarget(
      useCampusStore.getState(),
      h?.getBuildingCenter.bind(h),
    );
    pitchRef.current = view.pitch;
    setIs3D(next3D);
    const destination = selected
      ? {
          ...view,
          lat: selected.lat,
          lng: selected.lng,
          zoom: next3D ? 18 : 18.2,
          ...(next3D ? selectionBearing(selected.code, selected.residenceId, selected.mapBuildingId) : {}),
          ...selectionScreenAnchor(selected),
        }
      : { ...view, ...homeScreenAnchor() };
    lastTargetRef.current = { lat: destination.lat, lng: destination.lng };
    h?.flyTo(destination);
  };

  /** Recenter to the canonical HOME_VIEW load-in pose (position + zoom +
   * pitch + bearing) — used by the compass button and back-to-list nav. */
  const goHome = () => {
    lastTargetRef.current = { lat: HOME_VIEW.lat, lng: HOME_VIEW.lng };
    pitchRef.current = HOME_VIEW.pitch;
    setIs3D(HOME_VIEW.pitch < 85); // pitch ~90 = top-down 2D
    handleRef.current?.flyTo({ ...HOME_VIEW, ...homeScreenAnchor() });
  };
  const recenter = () => {
    const store = useCampusStore.getState();
    store.setSearchQuery('');
    // Clearing a selection also clears its map highlight and returns the
    // camera home through the scene's selection subscription.
    if (store.selected) store.clearSelection();
    else goHome();
  };
  useEffect(() => {
    goHomeRef.current = goHome;
  });

  const zoomMap = (factor: number) => {
    const h = handleRef.current;
    if (!h) return;
    const selected = resolveSelectionTarget(useCampusStore.getState(), h.getBuildingCenter.bind(h));
    h.zoomBy(factor, selected ? {
      lat: selected.lat,
      lng: selected.lng,
      ...selectionScreenAnchor(selected),
    } : undefined);
  };

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
                Building 3D campus…
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
              The campus map failed to start. Your building list is still available.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Retry map
            </button>
          </div>
        </div>
      ) : null}

      {sceneState === 'ready' ? (
        <div className="absolute right-2.5 top-2.5 z-20 flex flex-col gap-0.5 rounded-xl border border-border bg-card/90 p-1 shadow-md backdrop-blur max-[479px]:grid max-[479px]:w-[236px] max-[479px]:grid-cols-5">
          <button
            type="button"
            onClick={toggleTilt}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-[11px] font-bold tracking-tight text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary"
            title={is3D ? 'Switch to 2D view' : 'Switch to 3D view'}
            aria-label={is3D ? 'Switch to 2D view' : 'Switch to 3D view'}
          >
            {is3D ? '2D' : '3D'}
          </button>
          <button
            type="button"
            onClick={recenter}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary"
            title="Recenter map"
            aria-label="Recenter map"
          >
            <Compass className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={toggleGeolocate}
            className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary ${
              geoActive ? 'text-[#3b82c4]' : 'text-foreground'
            }`}
            title={geoActive ? 'Stop showing my location' : 'Show my location'}
            aria-label={geoActive ? 'Stop showing my location' : 'Show my location'}
            aria-pressed={geoActive}
          >
            <LocateFixed className="h-4 w-4" aria-hidden />
          </button>
          <div className="mt-0.5 border-t border-border/70 pt-0.5 max-[479px]:col-span-2 max-[479px]:mt-0 max-[479px]:flex max-[479px]:justify-center max-[479px]:border-t-0 max-[479px]:pt-0">
            <button
              type="button"
              onClick={() => zoomMap(0.7)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => zoomMap(1 / 0.7)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}

      <MapLegendChip3D />

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

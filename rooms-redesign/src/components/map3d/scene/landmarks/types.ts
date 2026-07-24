// src/components/map3d/scene/landmarks/types.ts
//
// THE LANDMARK BUILDER API — the contract every per-building module codes
// against. A building module is a single self-contained file at
// scene/landmarks/buildings/<slug>.ts that exports ONE named const:
//
//   export const landmark: LandmarkModule = { id, spec, build?, maxHeight? };
//
// Registration is automatic via import.meta.glob in landmarks/index.ts — no
// central index to edit, no shared file to touch. See landmarks/index.ts for
// the registry and landmarks/buildings/secu-stadium.ts for a reference
// custom builder.

import type * as THREE from 'three';

export type LandmarkRoof = 'parapet' | 'hipped' | 'spire' | 'bowl' | 'glass';

export interface LandmarkSpec {
  /** Display name, for docs/debugging only. */
  name: string;
  /** Base hex color (fixed — landmarks skip the per-building tint jitter). */
  color: number;
  /** Meters. Omit to keep the tagged height from campus-data.json. */
  height?: number;
  /** Preset roof treatment — used when the module has NO custom `build`.
   * With a custom `build`, keep this set only if it still describes the
   * silhouette: geometry.ts uses it for the highlight-shell max height and
   * the lit-window wall cap (hipped walls stop at 80%). */
  roof?: LandmarkRoof;
  /** Secondary hex color: spire cone / stadium field / free for custom use. */
  accent?: number;
  /** 0..1 — approximated as a warm vertex-color tint (the buildings material
   * emissive is global in scene.ts, so true per-landmark emissive isn't
   * possible without touching it). Presets apply it via withGlow; custom
   * builders apply it themselves (helpers.withGlow). */
  nightGlow?: number;
}

/** Helper functions handed to every custom builder through the ctx — the
 * exact same implementations geometry.ts uses, so parts come out
 * merge-compatible by construction. All ring inputs/outputs are SHAPE-SPACE
 * Vector2s (x = east, y = north, meters); all geometries come back in y-up
 * world space (x = east, y = up, z = south = -north). */
export interface LandmarkHelpers {
  /** Footprint ring -> extruded solid, y-up world orientation, base at y=0. */
  extrudeFootprint(pts: THREE.Vector2[], depth: number): THREE.BufferGeometry;
  /** Outer ring + hole rings (same CCW winding as the outer) -> extruded
   * band, y-up world orientation. The stadium bowl reference uses this. */
  extrudeWithHoles(
    outer: THREE.Vector2[],
    holes: THREE.Vector2[][],
    depth: number,
  ): THREE.BufferGeometry;
  /** Normalize any geometry for merging: non-indexed, uv stripped, constant
   * per-vertex color attribute set. THE canonical way to color a part. */
  withColor(geom: THREE.BufferGeometry, color: THREE.Color): THREE.BufferGeometry;
  /** Ring centroid in shape space. */
  centroidOf(pts: THREE.Vector2[]): { cx: number; cy: number };
  /** Deterministic 32-bit hash -> [0, 1). Use `${buildingId}:<purpose>` keys
   * for any repeatable jitter so renders are stable frame to frame. */
  hash01(id: string): number;
  /** Scale a ring about (cx, cy) by a factor — setbacks, inner fields. */
  scaleAbout(pts: THREE.Vector2[], cx: number, cy: number, s: number): THREE.Vector2[];
  /** Push every ring vertex outward from the ring centroid by a FIXED meter
   * distance (negative to inset) — uniform clearance for narrow wings. */
  outsetRing(pts: THREE.Vector2[], offset: number): THREE.Vector2[];
  /** Shape-space bounding box. */
  bboxOf(pts: THREE.Vector2[]): { minX: number; maxX: number; minY: number; maxY: number };
  /** Hex color with the nightGlow warm-amber lerp applied (no-op when glow
   * is undefined/<=0). Apply to spec.color/spec.accent yourself in a custom
   * builder — presets do this for you, custom builds must opt in. */
  withGlow(hex: number, glow: number | undefined): THREE.Color;
  /** Darken a color in HSL lightness (default -0.055) for roof shades. */
  darkerShade(c: THREE.Color, dl?: number): THREE.Color;
  /** Hipped roof surface: ring at baseY converging to a ridge segment along
   * the footprint's longest bbox axis at baseY + rise. Non-indexed, flat
   * per-face normals, y-up world orientation (pass through withColor). */
  buildHippedRoof(pts: THREE.Vector2[], baseY: number, rise: number): THREE.BufferGeometry;
}

/** Everything a custom builder needs — assembled by geometry.ts. */
export interface LandmarkBuildContext {
  /** Shape-space footprint ring: Vector2(x = east, y = north), meters,
   * deduped, closure point removed, normalized CCW. >= 3 points. */
  pts: THREE.Vector2[];
  /** Shape-space centroid of `pts` (same as helpers.centroidOf(pts)). */
  cx: number;
  cy: number;
  /** Main-mass height in meters, ALREADY resolved: spec.height override ??
   * tagged campus-data height ?? 11, floored at 1.5, NO hash jitter. The
   * same value the highlight shell and lit windows agree on. */
  baseHeight: number;
  /** The module's own spec (colors, accent, nightGlow, roof hint). */
  spec: LandmarkSpec;
  /** Shared helpers (see LandmarkHelpers). */
  helpers: LandmarkHelpers;
}

/** Custom geometry builder. Returns the building's parts in MERGE-READY
 * form — every part MUST be non-indexed, carry position + normal + color
 * attributes (all Float32 itemSize 3), and carry NO uv attribute, because
 * all parts across the whole campus go through ONE mergeGeometries call
 * (three requires identical attribute sets and uniform indexing). Routing
 * every part through ctx.helpers.withColor guarantees this; hand-built
 * geometry must replicate it manually (build non-indexed or call
 * toNonIndexed(), deleteAttribute('uv'), computeVertexNormals(), then set a
 * constant 'color' BufferAttribute — or just call withColor last). World
 * space is y-up meters, ground at y = 0: world (x, z) = (shapeX, -shapeY). */
export type LandmarkBuilder = (ctx: LandmarkBuildContext) => THREE.BufferGeometry[];

/** One building module's exports, as collected by the glob registry. */
export interface LandmarkModule {
  /** OSM way id — MUST equal CampusBuilding.id in campus-data.json
   * (e.g. 'way/980371045'). This is the registry key. */
  id: string;
  spec: LandmarkSpec;
  /** Custom builder. Omit it to render the spec's preset `roof` treatment
   * through the shared presets module (exactly the legacy behavior). */
  build?: LandmarkBuilder;
  /** Tallest point of the building in meters, for the selection-highlight
   * shell (which must fully envelop the real geometry). REQUIRED when a
   * custom `build` rises above the preset silhouette implied by spec.roof
   * (or above baseHeight when no roof is set) — otherwise the translucent
   * highlight can clip through the custom top. */
  maxHeight?: number;
}

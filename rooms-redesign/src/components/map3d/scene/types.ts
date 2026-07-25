// src/components/map3d/scene/types.ts
//
// Data contract for public/campus-data.json plus the public scene-handle
// contract (plan.md Phase 2). Pure types — no runtime imports.

export interface CampusBuilding {
  id: string;
  name?: string;
  /** [lng, lat] ring; NOT closed (first != last) in the baked data. */
  footprint: [number, number][];
  /** Courtyard rings punched out of `footprint` (OSM multipolygon `inner`
   * members), same [lng, lat] unclosed convention. Only produced by the
   * relation patch script — the way-only bake never emits them. */
  holes?: [number, number][][];
  /** Meters; mostly synthetic ~11m in the baked data. */
  height: number;
  levels?: number;
  umdCode?: string;
}

export type RoadKind = 'road' | 'service' | 'path';

export interface CampusRoad {
  kind: RoadKind;
  highway?: string;
  name?: string;
  /** Meters. */
  width: number;
  line: [number, number][];
}

export type AreaKind = 'grass' | 'water' | 'parking' | 'sport' | 'fountain' | 'pool';

export interface CampusArea {
  kind: AreaKind;
  polygon: [number, number][];
}

export type WaterwayKind = 'stream' | 'river' | 'ditch' | 'canal' | 'drain';

export interface CampusWaterway {
  id: string;
  kind: WaterwayKind;
  name: string | null;
  /** Meters; baked widths: river 10 / canal 6 / stream 4 / ditch+drain 2. */
  width: number;
  /** [lng, lat] polyline. */
  line: [number, number][];
}

export interface CampusData {
  /** [lng, lat]. */
  center: [number, number];
  /** [minLng, minLat, maxLng, maxLat]. */
  bbox: [number, number, number, number];
  generatedAt?: string;
  featureCounts?: Record<string, number>;
  buildings: CampusBuilding[];
  roads: CampusRoad[];
  areas: CampusArea[];
  waterways: CampusWaterway[];
  trees: [number, number][];
}

export interface FlyToTarget {
  lat: number;
  lng: number;
  /** Mapbox-ish zoom; distance = 2600 * 2^(15 - zoom), clamped [120, 4000]. */
  zoom?: number;
  /** Degrees above horizon (mapbox pitch = 90 - pitch). */
  pitch?: number;
  /** Degrees, clockwise from north. */
  bearing?: number;
}

export interface ProjectedPoint {
  /** CSS px relative to the container's top-left corner. */
  x: number;
  y: number;
  /** In front of the camera, inside the frustum, and within the canvas rect + 40px margin. */
  visible: boolean;
}

export interface CampusSceneHandle {
  setDarkMode(dark: boolean): void;
  flyTo(t: FlyToTarget): void;
  project(lng: number, lat: number): ProjectedPoint;
  /** cb runs every rendered-frame tick while mounted; returns an unsubscribe fn. */
  onFrame(cb: () => void): () => void;
  setPulseRing(lng: number, lat: number): void;
  clearPulseRing(): void;
  /**
   * Highlights a whole 3D building (UMD-red translucent shell over its real
   * footprint). Matches by `code` (UMD building code) first, then by nearest
   * footprint centroid to lng/lat. No-op when nothing matches.
   */
  setHighlightBuilding(t: { lng: number; lat: number; code?: string }): void;
  clearHighlightBuilding(): void;
  /**
   * Highlights a parking lot by its PARKING_RULES name: garages get the same
   * UMD-red translucent shell as buildings (over their real footprint);
   * surface lots get a flat red plate over their campus-data parking
   * polygon(s). No-op for names without a curated highlight target.
   */
  setHighlightParking(t: { name: string }): void;
  clearHighlightParking(): void;
  dispose(): void;
}

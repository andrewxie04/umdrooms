// src/components/map3d/scene/projection.ts
//
// Equirectangular lng/lat -> local-meters projection about the dataset
// center. Local frame: x = east, z = south (so north = -z), y = up, ground
// plane at y = 0. Matches the camera convention where bearing 0 looks north.

import type { CampusData } from './types';

const METERS_PER_DEG_LAT = 111320;

export interface Projection {
  readonly centerLng: number;
  readonly centerLat: number;
  toLocal(lng: number, lat: number): { x: number; z: number };
}

export function createProjection(data: CampusData): Projection {
  const [centerLng, centerLat] = data.center;
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos((centerLat * Math.PI) / 180);
  return {
    centerLng,
    centerLat,
    toLocal(lng: number, lat: number) {
      return {
        x: (lng - centerLng) * metersPerDegLng,
        z: -(lat - centerLat) * METERS_PER_DEG_LAT,
      };
    },
  };
}

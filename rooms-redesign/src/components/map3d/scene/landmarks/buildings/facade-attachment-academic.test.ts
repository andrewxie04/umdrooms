import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import campusData from '../../../../../../public/campus-data.json';
import { ringToShapePoints } from '../../geom-utils';
import { createProjection } from '../../projection';
import type { CampusData } from '../../types';
import { makeLandmarkCtx } from '..';
import type { LandmarkModule } from '../types';
import { landmark as edward } from './edward-st-john';
import { landmark as hornbake } from './hornbake-library';
import { landmark as vanMunching } from './van-munching-hall';
import { landmark as glenn } from './glenn-martin-hall';
import { landmark as patterson } from './h-j-patterson-hall';
import { landmark as administration } from './main-administration';
import { landmark as architecture } from './architecture-building';
import { landmark as publicHealth } from './school-of-public-health';

const data = campusData as unknown as CampusData;
const projection = createProjection(data);

function edgeDistance(x: number, north: number, ring: THREE.Vector2[]): number {
  let closest = Infinity;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    const dx = b.x - a.x, dn = b.y - a.y;
    const t = Math.max(0, Math.min(1,
      ((x - a.x) * dx + (north - a.y) * dn) / (dx * dx + dn * dn)));
    closest = Math.min(closest, Math.hypot(x - a.x - t * dx, north - a.y - t * dn));
  }
  return closest;
}

function insideRing(x: number, north: number, ring: THREE.Vector2[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a.y > north) !== (b.y > north)
      && x < (b.x - a.x) * (north - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

function hasColor(part: THREE.BufferGeometry, shade: THREE.Color): boolean {
  const color = part.getAttribute('color');
  return !!color && Math.abs(color.getX(0) - shade.r) < 0.001
    && Math.abs(color.getY(0) - shade.g) < 0.001
    && Math.abs(color.getZ(0) - shade.b) < 0.001;
}

// Distinct glass heights isolate facade panes from roof lights and atrium roofs.
const cases: readonly [string, LandmarkModule, number, number, number][] = [
  ['Edward St. John north windows', edward, 0x425e69, 2.21, 20],
  ['Edward St. John east windows', edward, 0x425e69, 2.12, 10],
  ['Hornbake window strips', hornbake, 0x52646d, 1.88, 30],
  ['Hornbake south-wing entry', hornbake, 0x3c4a51, 3.0, 1],
  ['Van Munching atrium', vanMunching, 0x57717a, 14, 3],
  ['Van Munching window strips', vanMunching, 0x57717a, 1.88, 20],
  ['Glenn Martin window strips', glenn, 0x5b7078, 1.88, 40],
  ['H. J. Patterson window strips', patterson, 0x52636d, 1.88, 20],
  ['Administration entrance panes', administration, 0x414b4d, 4.8, 3],
  ['Administration window strips', administration, 0x46545a, 1.88, 20],
  ['Architecture north windows', architecture, 0x465e68, 3.9, 4],
  ['Architecture south slits', architecture, 0x465e68, 1.9, 3],
  ['Public Health entrance', publicHealth, 0x607983, 6, 1],
  ['Public Health window strips', publicHealth, 0x607983, 1.88, 30],
];

describe('academic facade attachment on mapped footprints', () => {
  it.each(cases)('%s meets a footprint wall', (_name, module, hex, height, minimumCount) => {
    const building = data.buildings.find(entry => entry.id === module.id)!;
    const ring = ringToShapePoints(building.footprint, projection);
    const holes = (building.holes ?? []).map(hole => ringToShapePoints(hole, projection));
    const ctx = makeLandmarkCtx(ring, module.spec.height ?? building.height ?? 11, module.spec, holes);
    const parts = module.build!(ctx);
    try {
      const shade = new THREE.Color(hex);
      const panes = parts.filter(part => {
        if (!hasColor(part, shade)) return false;
        part.computeBoundingBox();
        const bounds = part.boundingBox!;
        return Math.abs(bounds.max.y - bounds.min.y - height) < 0.01;
      });
      expect(panes.length).toBeGreaterThanOrEqual(minimumCount);
      for (const pane of panes) {
        const center = pane.boundingBox!.getCenter(new THREE.Vector3());
        expect(insideRing(center.x, -center.z, ring)).toBe(false);
        const positions = pane.getAttribute('position');
        for (let i = 0; i < positions.count; i++) {
          expect(edgeDistance(positions.getX(i), -positions.getZ(i), ring)).toBeLessThan(0.45);
        }
      }
    } finally {
      parts.forEach(part => part.dispose());
    }
  });
});

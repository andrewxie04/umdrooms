import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import campusData from '../../../../../../public/campus-data.json';
import { createProjection } from '../../projection';
import { ringToShapePoints } from '../../geom-utils';
import type { CampusData } from '../../types';
import { makeLandmarkCtx } from '..';
import type { LandmarkModule } from '../types';
import { landmark as knight } from './knight-hall';
import { landmark as thurgood } from './thurgood-marshall-hall';
import { landmark as stamp } from './stamp-student-union';

const data = campusData as unknown as CampusData;
const projection = createProjection(data);

function distanceToEdge(x: number, north: number, a: THREE.Vector2, b: THREE.Vector2): number {
  const dx = b.x - a.x;
  const dn = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (north - a.y) * dn) / (dx * dx + dn * dn)));
  return Math.hypot(x - a.x - dx * t, north - a.y - dn * t);
}

function insideFootprint(pts: THREE.Vector2[], x: number, north: number): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if ((a.y > north) !== (b.y > north)
      && x < (b.x - a.x) * (north - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

describe('custom curtain walls', () => {
  it.each([
    ['Knight Hall', knight, 0x4f6c76, 0.35, 2],
    ['Thurgood Marshall Hall', thurgood, 0x56717d, 0.5, 3],
    ['Stamp Student Union', stamp, 0x576973, 0.25, 28],
  ] as const)('%s glass follows the actual footprint walls without crossing a corner', (_name, module: LandmarkModule, hex, glow, expected) => {
    const building = data.buildings.find(item => item.id === module.id)!;
    const pts = ringToShapePoints(building.footprint, projection);
    const ctx = makeLandmarkCtx(pts, module.spec.height ?? building.height ?? 11, module.spec);
    const glass = ctx.helpers.withGlow(hex, glow);
    const glassParts = module.build!(ctx).filter(part => {
      const color = part.getAttribute('color');
      return color && Math.abs(color.getX(0) - glass.r) < 0.001
        && Math.abs(color.getY(0) - glass.g) < 0.001
        && Math.abs(color.getZ(0) - glass.b) < 0.001;
    });
    // Stamp's entrance and arcade panes belong to projecting structures;
    // the regular 2.45m-high windows should sit on the mapped brick walls.
    const parts = _name === 'Stamp Student Union' ? glassParts.filter(part => {
      part.computeBoundingBox();
      return Math.abs((part.boundingBox!.max.y - part.boundingBox!.min.y) - 2.45) < 0.01;
    }) : glassParts;
    if (_name === 'Thurgood Marshall Hall') {
      expect(parts.length).toBeGreaterThanOrEqual(50);
    } else {
      expect(parts).toHaveLength(expected);
    }
    for (const part of parts) {
      part.computeBoundingBox();
      const center = part.boundingBox!.getCenter(new THREE.Vector3());
      expect(insideFootprint(pts, center.x, -center.z)).toBe(false);
      const positions = part.getAttribute('position');
      let furthest = 0;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const north = -positions.getZ(i);
        const nearest = Math.min(...pts.map((a, j) => distanceToEdge(x, north, a, pts[(j + 1) % pts.length])));
        furthest = Math.max(furthest, nearest);
      }
      expect(furthest).toBeLessThan(0.3);
    }
  });

  it('wraps the six visible Thurgood Marshall Hall side walls with glazing', () => {
    const building = data.buildings.find(item => item.id === thurgood.id)!;
    const pts = ringToShapePoints(building.footprint, projection);
    const ctx = makeLandmarkCtx(pts, thurgood.spec.height ?? building.height ?? 11, thurgood.spec);
    const glass = ctx.helpers.withGlow(0x56717d, 0.5);
    const allParts = thurgood.build!(ctx);
    const paneCenters = allParts.filter(part => {
      const color = part.getAttribute('color');
      part.computeBoundingBox();
      return color && Math.abs(color.getX(0) - glass.r) < 0.001
        && Math.abs(color.getY(0) - glass.g) < 0.001
        && Math.abs(color.getZ(0) - glass.b) < 0.001
        && part.boundingBox!.max.y - part.boundingBox!.min.y < 3;
    }).map(part => part.boundingBox!.getCenter(new THREE.Vector3()));
    try {
      for (const index of [4, 8, 11, 12, 13, 15]) {
        const first = building.footprint[index];
        const last = building.footprint[(index + 1) % building.footprint.length];
        const a = projection.toLocal(...first);
        const b = projection.toLocal(...last);
        const start = new THREE.Vector2(a.x, -a.z);
        const end = new THREE.Vector2(b.x, -b.z);
        expect(paneCenters.filter(center =>
          distanceToEdge(center.x, -center.z, start, end) < 0.35).length,
        `mapped wall ${index}`).toBeGreaterThanOrEqual(6);
      }
    } finally { allParts.forEach(part => part.dispose()); }
  });
});

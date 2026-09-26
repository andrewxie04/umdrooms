import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import campusData from '../../../../../../public/campus-data.json';
import { createProjection } from '../../projection';
import { ringToShapePoints } from '../../geom-utils';
import type { CampusData } from '../../types';
import { makeLandmarkCtx } from '..';
import type { LandmarkModule } from '../types';
import { landmark as kim } from './jeong-h-kim-engineering';
import { landmark as chapel } from './memorial-chapel';
import { landmark as hotel } from './the-hotel-umd';
import { landmark as cole } from './cole-field-house';
import { landmark as sciences } from './physical-sciences-complex';

const data = campusData as unknown as CampusData;
const projection = createProjection(data);

function edgeDistance(x: number, north: number, ring: THREE.Vector2[]): number {
  let nearest = Infinity;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    const dx = b.x - a.x;
    const dn = b.y - a.y;
    const t = THREE.MathUtils.clamp(((x - a.x) * dx + (north - a.y) * dn)
      / (dx * dx + dn * dn), 0, 1);
    nearest = Math.min(nearest, Math.hypot(x - a.x - t * dx, north - a.y - t * dn));
  }
  return nearest;
}

function hasColor(part: THREE.BufferGeometry, color: THREE.Color): boolean {
  const attribute = part.getAttribute('color');
  return !!attribute && Math.abs(attribute.getX(0) - color.r) < 0.001
    && Math.abs(attribute.getY(0) - color.g) < 0.001
    && Math.abs(attribute.getZ(0) - color.b) < 0.001;
}

describe('remaining landmark facade attachment', () => {
  it.each([
    ['Kim laboratory windows', kim, 0x7795a0, 1.55, 30, 0.2],
    ['Chapel nave glazing', chapel, 0x767c84, 3.55, 8, 0.3],
    ['Hotel podium storefronts', hotel, 0x37434c, 3.15, 5, 0.2],
  ] as const)('%s stays on projected footprint edges', (_name, module: LandmarkModule,
    hex, height, minimumCount, maxGap) => {
    const building = data.buildings.find((item) => item.id === module.id)!;
    const ring = ringToShapePoints(building.footprint, projection);
    const ctx = makeLandmarkCtx(ring, module.spec.height ?? building.height ?? 11, module.spec);
    const color = ctx.helpers.withGlow(hex, module.spec.nightGlow);
    const parts = module.build!(ctx);
    try {
      const panes = parts.filter((part) => {
        if (!hasColor(part, color)) return false;
        part.computeBoundingBox();
        return Math.abs(part.boundingBox!.max.y - part.boundingBox!.min.y - height) < 0.01;
      });
      expect(panes.length).toBeGreaterThanOrEqual(minimumCount);
      for (const pane of panes) {
        const vertices = pane.getAttribute('position');
        for (let i = 0; i < vertices.count; i++) {
          expect(edgeDistance(vertices.getX(i), -vertices.getZ(i), ring)).toBeLessThan(maxGap);
        }
      }
    } finally {
      parts.forEach((part) => part.dispose());
    }
  });

  it('Physical Sciences glass bands follow both the outer walls and atrium edge', () => {
    const building = data.buildings.find((item) => item.id === sciences.id)!;
    const ring = ringToShapePoints(building.footprint, projection);
    const holes = building.holes!.map((hole) => ringToShapePoints(hole, projection));
    const ctx = makeLandmarkCtx(ring, sciences.spec.height!, sciences.spec, holes);
    const baseColor = ctx.helpers.withGlow(0x3e5766, sciences.spec.nightGlow);
    const ribbonColor = ctx.helpers.withGlow(0x4d6a7d, sciences.spec.nightGlow);
    const parts = sciences.build!(ctx);
    try {
      const bands = parts.filter((part) => hasColor(part, baseColor)
        || hasColor(part, ribbonColor));
      expect(bands).toHaveLength(3);
      for (const band of bands) {
        const vertices = band.getAttribute('position');
        for (let i = 0; i < vertices.count; i++) {
          const x = vertices.getX(i);
          const north = -vertices.getZ(i);
          const distance = Math.min(edgeDistance(x, north, ring),
            ...holes.map((hole) => edgeDistance(x, north, hole)));
          expect(distance).toBeLessThan(0.3);
        }
      }
    } finally {
      parts.forEach((part) => part.dispose());
    }
  });

  it('Cole Field House glazed arch meets its brick base and vault', () => {
    const building = data.buildings.find((item) => item.id === cole.id)!;
    const ring = ringToShapePoints(building.footprint, projection);
    const ctx = makeLandmarkCtx(ring, cole.spec.height!, cole.spec);
    const glassColor = ctx.helpers.withGlow(0xa8c2cc, cole.spec.nightGlow);
    const parts = cole.build!(ctx);
    try {
      const glass = parts.find((part) => hasColor(part, glassColor));
      expect(glass).toBeDefined();
      const vertices = glass!.getAttribute('position');
      let low = Infinity;
      let high = -Infinity;
      for (let i = 0; i < vertices.count; i++) {
        low = Math.min(low, vertices.getY(i));
        high = Math.max(high, vertices.getY(i));
      }
      expect(low).toBeCloseTo(cole.spec.height!, 4);
      expect(high).toBeCloseTo(20, 4);
      const roof = parts[1].getAttribute('position');
      const roofVertices = new Set<string>();
      for (let i = 0; i < roof.count; i++) {
        roofVertices.add(`${roof.getX(i).toFixed(3)},${roof.getY(i).toFixed(3)},${roof.getZ(i).toFixed(3)}`);
      }
      let shared = 0;
      for (let i = 0; i < vertices.count; i++) {
        if (vertices.getY(i) <= low + 0.01) continue;
        const key = `${vertices.getX(i).toFixed(3)},${vertices.getY(i).toFixed(3)},${vertices.getZ(i).toFixed(3)}`;
        if (roofVertices.has(key)) shared++;
      }
      expect(shared).toBeGreaterThan(0);
    } finally {
      parts.forEach((part) => part.dispose());
    }
  });
});

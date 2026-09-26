import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import campusData from '../../../../../../public/campus-data.json';
import { createProjection } from '../../projection';
import { ringToShapePoints } from '../../geom-utils';
import { windowPlacements } from '../../geometry';
import type { CampusData } from '../../types';
import { makeLandmarkCtx } from '..';
import type { LandmarkModule } from '../types';
import { landmark as oakland } from './oakland-hall';
import { landmark as princeFrederick } from './prince-frederick-hall';
import { landmark as pyonChen } from './pyon-chen-hall';
import { landmark as johnsonWhittle } from './johnson-whittle-hall';
import { landmark as belAir } from './bel-air-hall';
import { landmark as cambridge } from './cambridge-hall';
import { landmark as centreville } from './centreville-hall';
import { landmark as chestertown } from './chestertown-hall';
import { landmark as cumberland } from './cumberland-hall';
import { landmark as denton } from './denton-hall';
import { landmark as easton } from './easton-hall';
import { landmark as elkton } from './elkton-hall';
import { landmark as ellicott } from './ellicott-hall';
import { landmark as hagerstown } from './hagerstown-hall';
import { landmark as laPlata } from './la-plata-hall';

const data = campusData as unknown as CampusData;
const projection = createProjection(data);

function distanceToRing(x: number, north: number, ring: THREE.Vector2[]): number {
  return Math.min(...ring.map((a, index) => {
    const b = ring[(index + 1) % ring.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = THREE.MathUtils.clamp(((x - a.x) * dx + (north - a.y) * dy)
      / (dx * dx + dy * dy), 0, 1);
    return Math.hypot(x - a.x - t * dx, north - a.y - t * dy);
  }));
}

function hasColor(part: THREE.BufferGeometry, color: THREE.Color): boolean {
  const attribute = part.getAttribute('color');
  return !!attribute && Math.abs(attribute.getX(0) - color.r) < 0.001
    && Math.abs(attribute.getY(0) - color.g) < 0.001
    && Math.abs(attribute.getZ(0) - color.b) < 0.001;
}

function planDistanceRange(part: THREE.BufferGeometry, ring: THREE.Vector2[]): [number, number] {
  const vertices = part.getAttribute('position');
  const distances = Array.from({ length: vertices.count }, (_, i) =>
    distanceToRing(vertices.getX(i), -vertices.getZ(i), ring));
  return [Math.min(...distances), Math.max(...distances)];
}

describe('residence facade attachment', () => {
  it.each([
    belAir, cambridge, centreville, chestertown, cumberland,
    denton, easton, elkton, ellicott, hagerstown, laPlata,
  ])('$spec.name shared windows stay on projected footprint walls', (module) => {
    const building = data.buildings.find((item) => item.id === module.id)!;
    const ring = ringToShapePoints(building.footprint, projection);
    const windows = windowPlacements({ ...data, buildings: [building] }, projection, true);
    expect(module.spec.genericWindows).toBe(true);
    expect(windows.length).toBeGreaterThan(0);
    for (const window of windows) {
      expect(distanceToRing(window.cx, -window.cz, ring)).toBeLessThan(0.11);
    }
  });

  it.each([
    ['Oakland Hall', oakland, 0x405964],
    ['Prince Frederick Hall', princeFrederick, 0x405964],
    ['Pyon-Chen Hall', pyonChen, 0x3c535c],
    ['Johnson-Whittle Hall', johnsonWhittle, 0x3c535c],
  ] as const)('%s custom glass follows its projected footprint', (_name, module: LandmarkModule, glassHex) => {
    const building = data.buildings.find((item) => item.id === module.id)!;
    const ring = ringToShapePoints(building.footprint, projection);
    const ctx = makeLandmarkCtx(ring, module.spec.height ?? building.height ?? 11, module.spec);
    const glass = ctx.helpers.withGlow(glassHex, module.spec.nightGlow);
    const parts = module.build!(ctx);
    try {
      const panes = parts.filter((part) => hasColor(part, glass));
      const windows = panes.filter((part) => {
        part.computeBoundingBox();
        return part.boundingBox!.max.y - part.boundingBox!.min.y < 3;
      });
      expect(windows.length).toBeGreaterThan(20);
      const gaps = windows.map((pane) => {
        const vertices = pane.getAttribute('position');
        let nearest = Infinity;
        let farthest = 0;
        for (let i = 0; i < vertices.count; i++) {
          const gap = distanceToRing(vertices.getX(i), -vertices.getZ(i), ring);
          nearest = Math.min(nearest, gap);
          farthest = Math.max(farthest, gap);
        }
        return { nearest, farthest };
      });
      if (module.id === oakland.id) {
        const wallPanes = gaps.filter((gap) => gap.nearest < 0.12);
        const stairPanes = gaps.filter((gap) => gap.nearest >= 0.12);
        expect(wallPanes.length).toBeGreaterThan(100);
        expect(stairPanes.length).toBeGreaterThan(0);
        expect(Math.max(...wallPanes.map((gap) => gap.farthest))).toBeLessThan(0.12);
        // The stair glazing sits on its projecting dark panel, whose rear
        // edge meets the cream facade that in turn meets the mapped wall.
        const dark = ctx.helpers.withGlow(0x38474a, module.spec.nightGlow);
        const panel = parts.find((part) => {
          if (!hasColor(part, dark)) return false;
          part.computeBoundingBox();
          return part.boundingBox!.max.y - part.boundingBox!.min.y > 10;
        })!;
        expect(panel).toBeDefined();
        const [panelRear, panelFront] = planDistanceRange(panel, ring);
        const cream = ctx.helpers.withGlow(0xd9d3c4, module.spec.nightGlow);
        const wall = parts.find((part) => {
          if (!hasColor(part, cream)) return false;
          part.computeBoundingBox();
          return part.boundingBox!.max.y - part.boundingBox!.min.y > 10;
        })!;
        expect(wall).toBeDefined();
        expect(panelRear).toBeLessThan(planDistanceRange(wall, ring)[1] + 0.01);
        expect(panelFront).toBeLessThan(0.49);
        for (const pane of stairPanes) {
          expect(pane.nearest).toBeLessThan(panelFront + 0.01);
          expect(pane.farthest).toBeLessThan(panelFront + 0.09);
        }
      } else if (module.id === princeFrederick.id) {
        const backingColor = ctx.helpers.withGlow(0x677b7e, module.spec.nightGlow);
        const backing = parts.find((part) => hasColor(part, backingColor))!;
        expect(backing).toBeDefined();
        const [, panelFront] = planDistanceRange(backing, ring);
        expect(panelFront).toBeLessThan(0.16);
        for (const pane of gaps) {
          expect(pane.farthest).toBeLessThan(0.22);
          if (pane.nearest > 0.11) expect(pane.nearest).toBeLessThan(panelFront + 0.01);
        }
      } else {
        for (const pane of gaps) expect(pane.farthest).toBeLessThan(0.11);
      }
    } finally {
      parts.forEach((part) => part.dispose());
    }
  });
});

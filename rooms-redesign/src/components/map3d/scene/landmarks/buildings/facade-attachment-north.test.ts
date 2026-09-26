import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import campusData from '../../../../../../public/campus-data.json';
import { ringToShapePoints } from '../../geom-utils';
import { createProjection } from '../../projection';
import type { CampusData } from '../../types';
import { makeLandmarkCtx } from '..';
import type { LandmarkModule } from '../types';
import { landmark as mckeldin } from './mckeldin-library';
import { landmark as iribe } from './iribe-center';
import { landmark as clark } from './a-james-clark-hall';
import { landmark as clarice } from './clarice-smith-pac';
import { landmark as eppley } from './eppley-recreation-center';
import { landmark as xfinity } from './xfinity-center';

const data = campusData as unknown as CampusData;
const projection = createProjection(data);

function model(module: LandmarkModule) {
  const building = data.buildings.find(entry => entry.id === module.id)!;
  const pts = ringToShapePoints(building.footprint, projection);
  const holes = (building.holes ?? []).map(hole => ringToShapePoints(hole, projection));
  const ctx = makeLandmarkCtx(pts, module.spec.height ?? building.height ?? 11, module.spec, holes);
  return { pts, ctx, parts: module.build!(ctx) };
}

function sameColor(part: THREE.BufferGeometry, color: THREE.Color): boolean {
  const c = part.getAttribute('color');
  return !!c && Math.abs(c.getX(0) - color.r) < 0.001
    && Math.abs(c.getY(0) - color.g) < 0.001
    && Math.abs(c.getZ(0) - color.b) < 0.001;
}

function bounds(part: THREE.BufferGeometry): THREE.Box3 {
  part.computeBoundingBox();
  return part.boundingBox!;
}

function distanceToRing(x: number, north: number, pts: THREE.Vector2[]): number {
  let nearest = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (north - a.y) * dy) / (dx * dx + dy * dy)));
    nearest = Math.min(nearest, Math.hypot(x - a.x - t * dx, north - a.y - t * dy));
  }
  return nearest;
}

describe('landmark facade attachment on projected footprint geometry', () => {
  it('places McKeldin addition glass slots against the stepped mapped walls', () => {
    const { pts, ctx, parts } = model(mckeldin);
    try {
      const glass = new THREE.Color(0x344d54);
      const tallSlots = parts.filter(part => sameColor(part, glass)
        && bounds(part).max.y - bounds(part).min.y > 15);
      expect(tallSlots).toHaveLength(26);
      for (const part of tallSlots) {
        const pos = part.getAttribute('position');
        for (let i = 0; i < pos.count; i++) {
          expect(distanceToRing(pos.getX(i), -pos.getZ(i), pts)).toBeLessThan(0.65);
        }
      }
      expect(ctx.helpers.bboxOf(pts).maxX - ctx.helpers.bboxOf(pts).minX).toBeGreaterThan(70);
    } finally { parts.forEach(part => part.dispose()); }
  });

  it('keeps Clark Hall curtain glass on the long mapped east wall', () => {
    const { pts, ctx, parts } = model(clark);
    try {
      const glass = ctx.helpers.withGlow(clark.spec.accent!, clark.spec.nightGlow);
      const wall = parts.find(part => sameColor(part, glass))!;
      expect(wall).toBeDefined();
      const pos = wall.getAttribute('position');
      for (let i = 0; i < pos.count; i++) {
        expect(distanceToRing(pos.getX(i), -pos.getZ(i), pts)).toBeLessThan(0.5);
      }
    } finally { parts.forEach(part => part.dispose()); }
  });

  it('joins the Clarice pavilion glass to its drum and surrounding village', () => {
    const { ctx, parts } = model(clarice);
    try {
      const glass = ctx.helpers.withGlow(clarice.spec.accent!, 0.8);
      const curvedBand = parts.find(part => sameColor(part, glass)
        && bounds(part).max.x - bounds(part).min.x > 30)!;
      expect(curvedBand).toBeDefined();
      const bb = ctx.helpers.bboxOf(ctx.pts);
      const cx = bb.minX + 0.571 * (bb.maxX - bb.minX);
      const north = bb.minY + 0.648 * (bb.maxY - bb.minY);
      const pos = curvedBand.getAttribute('position');
      const radii = Array.from({ length: pos.count }, (_, i) =>
        Math.hypot(pos.getX(i) - cx, -pos.getZ(i) - north));
      expect(Math.min(...radii)).toBeLessThan(18);
      expect(Math.max(...radii)).toBeGreaterThan(23.3);
    } finally { parts.forEach(part => part.dispose()); }
  });

  it('supports Iribe glass floors continuously above the inset ground story', () => {
    const { ctx, parts } = model(iribe);
    try {
      const dark = ctx.helpers.withGlow(0x758b96, iribe.spec.nightGlow);
      const lower = parts.find(part => sameColor(part, dark))!;
      expect(bounds(lower).min.y).toBeCloseTo(0);
      expect(bounds(lower).max.y).toBeCloseTo(6.5);
      const floors = parts.filter(part => {
        const box = bounds(part);
        return box.max.y - box.min.y > 2.9 && box.max.y - box.min.y < 3.1
          && box.min.y >= 6.5 && box.max.y <= 21.5;
      });
      expect(floors).toHaveLength(5);
      expect(Math.min(...floors.map(part => bounds(part).min.y))).toBeCloseTo(bounds(lower).max.y);
    } finally { parts.forEach(part => part.dispose()); }
  });

  it('seats Eppley clerestory and bay glazing on its field house wall', () => {
    const { ctx, parts } = model(eppley);
    try {
      const glass = ctx.helpers.withGlow(0xb9cfd4, 0.6);
      const field = parts.find(part => {
        const box = bounds(part);
        return Math.abs(box.max.y - 13) < 0.01 && box.max.x - box.min.x > 100;
      })!;
      expect(field).toBeDefined();
      const windows = parts.filter(part => sameColor(part, glass)
        && Math.abs(bounds(part).max.y - bounds(part).min.y - 2.45) < 0.01
        && bounds(part).max.x - bounds(part).min.x > 10);
      expect(windows).toHaveLength(7);
      for (const window of windows) {
        const box = bounds(window);
        expect(Math.abs(box.max.z - field.boundingBox!.max.z)).toBeLessThan(0.2);
        expect(box.min.y).toBeLessThan(field.boundingBox!.max.y);
      }
      const clerestory = parts.find(part => sameColor(part, glass)
        && bounds(part).min.y > 13 && bounds(part).max.y > 15)!;
      expect(clerestory).toBeDefined();
      expect(Math.abs(bounds(clerestory).max.z - field.boundingBox!.max.z)).toBeLessThan(0.2);
    } finally { parts.forEach(part => part.dispose()); }
  });

  it('wraps XFINITY concourse glazing directly around the bowl wall', () => {
    const { ctx, parts } = model(xfinity);
    try {
      const glass = ctx.helpers.withGlow(0x43555c, xfinity.spec.nightGlow);
      const concourse = parts.find(part => sameColor(part, glass))!;
      const bowl = parts.find(part => {
        const box = bounds(part);
        return Math.abs(box.max.y - 18) < 0.01 && box.max.x - box.min.x > 100;
      })!;
      expect(concourse).toBeDefined();
      expect(bowl).toBeDefined();
      const bpos = bowl.getAttribute('position');
      const outline: THREE.Vector2[] = [];
      for (let i = 0; i < bpos.count; i++) {
        if (Math.abs(bpos.getY(i) - 18) < 0.01) {
          const p = new THREE.Vector2(bpos.getX(i), -bpos.getZ(i));
          if (!outline.some(q => q.distanceTo(p) < 0.01)) outline.push(p);
        }
      }
      // The curtain band has the same plan bounds as the bowl, plus its
      // intentional 0.26m shallow projection.
      const glassBox = bounds(concourse);
      const bowlBox = bounds(bowl);
      expect(glassBox.min.x).toBeGreaterThan(bowlBox.min.x - 0.4);
      expect(glassBox.max.x).toBeLessThan(bowlBox.max.x + 0.4);
      expect(glassBox.min.z).toBeGreaterThan(bowlBox.min.z - 0.4);
      expect(glassBox.max.z).toBeLessThan(bowlBox.max.z + 0.4);
      expect(outline).toHaveLength(8);
      expect(glassBox.min.y).toBeGreaterThan(bowlBox.min.y);
      expect(glassBox.max.y).toBeLessThan(bowlBox.max.y);
      const center = outline.reduce((sum, point) => sum.add(point), new THREE.Vector2())
        .multiplyScalar(1 / outline.length);
      outline.sort((a, b) => Math.atan2(a.y - center.y, a.x - center.x)
        - Math.atan2(b.y - center.y, b.x - center.x));
      const pos = concourse.getAttribute('position');
      for (let i = 0; i < pos.count; i++) {
        expect(distanceToRing(pos.getX(i), -pos.getZ(i), outline)).toBeLessThan(0.35);
      }
    } finally { parts.forEach(part => part.dispose()); }
  });
});

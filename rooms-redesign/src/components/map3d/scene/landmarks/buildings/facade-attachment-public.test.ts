import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import campusData from '../../../../../../public/campus-data.json';
import { createProjection } from '../../projection';
import { ringToShapePoints } from '../../geom-utils';
import type { CampusData } from '../../types';
import { makeLandmarkCtx } from '..';
import type { LandmarkModule } from '../types';
import { landmark as northDining } from './251-north-dining-hall';
import { landmark as southDining } from './south-campus-dining-hall';
import { landmark as yahentamitsi } from './yahentamitsi-dining-hall';
import { landmark as diner } from './the-diner';
import { landmark as ritchie } from './ritchie-coliseum';
import { landmark as gossett } from './gossett-football-team-house';
import { landmark as riggs } from './samuel-riggs-alumni-center';
import { landmark as nyumburu } from './nyumburu-cultural-center';
import { landmark as toll } from './toll-physics';
import { landmark as health } from './umd-health-center';
import { landmark as turner } from './turner-hall';

const data = campusData as unknown as CampusData;
const projection = createProjection(data);

function distanceToRing(x: number, north: number, ring: THREE.Vector2[]): number {
  let nearest = Infinity;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    const dx = b.x - a.x, dn = b.y - a.y;
    const t = THREE.MathUtils.clamp(((x - a.x) * dx + (north - a.y) * dn)
      / (dx * dx + dn * dn), 0, 1);
    nearest = Math.min(nearest, Math.hypot(x - a.x - t * dx, north - a.y - t * dn));
  }
  return nearest;
}

function hasColor(part: THREE.BufferGeometry, color: THREE.Color): boolean {
  const c = part.getAttribute('color');
  return !!c && Math.abs(c.getX(0) - color.r) < 0.001
    && Math.abs(c.getY(0) - color.g) < 0.001
    && Math.abs(c.getZ(0) - color.b) < 0.001;
}

function bounds(part: THREE.BufferGeometry): THREE.Box3 {
  part.computeBoundingBox();
  return part.boundingBox!;
}

function maxGap(part: THREE.BufferGeometry, ring: THREE.Vector2[]): number {
  const pos = part.getAttribute('position');
  let gap = 0;
  for (let i = 0; i < pos.count; i++) {
    gap = Math.max(gap, distanceToRing(pos.getX(i), -pos.getZ(i), ring));
  }
  return gap;
}

function build(module: LandmarkModule, hex: number) {
    const building = data.buildings.find((entry) => entry.id === module.id)!;
    const ring = ringToShapePoints(building.footprint, projection);
    const ctx = makeLandmarkCtx(ring, module.spec.height ?? building.height ?? 11, module.spec);
    const color = ctx.helpers.withGlow(hex, module.spec.nightGlow);
    const parts = module.build!(ctx);
    const panes = parts.filter((part) => hasColor(part, color));
    return { ring, ctx, parts, panes };
}

describe('public building facade attachment', () => {
  it.each([
    ['251 North', northDining, 0x465b5d, 6, 0.36],
    ['South Campus Dining', southDining, 0x506771, 12, 0.8],
    ['Yahentamitsi', yahentamitsi, 0x527581, 3, 0.5],
    ['Ritchie Coliseum', ritchie, 0x35454b, 40, 0.85],
    ['Samuel Riggs Alumni Center', riggs, 0x354b53, 100, 0.5],
    ['Nyumburu Cultural Center', nyumburu, 0x334a50, 17, 0.95],
    ['Toll Physics', toll, 0xb6c6c9, 27, 0.75],
  ] as const)('%s glazing follows mapped wall edges',
    (_name, module, hex, count, tolerance) => {
      const { ring, parts, panes } = build(module, hex);
      try {
        expect(panes.length).toBeGreaterThanOrEqual(count);
        for (const pane of panes) expect(maxGap(pane, ring)).toBeLessThan(tolerance);
      } finally { parts.forEach((part) => part.dispose()); }
    });

  it('The Diner entrance glass meets its wall and clerestory glass meets its rooftop mass', () => {
    const { ring, parts, panes, ctx } = build(diner, 0x53636a);
    try {
      expect(panes).toHaveLength(3);
      for (const pane of panes.filter((part) => bounds(part).min.y < 5)) {
        expect(maxGap(pane, ring)).toBeLessThan(1);
      }
      const clerestory = panes.find((part) => bounds(part).min.y > 5)!;
      const pale = ctx.helpers.withGlow(0xd9d6cb, diner.spec.nightGlow);
      const support = parts.find((part) => hasColor(part, pale)
        && Math.abs(bounds(part).min.y - 5.42) < 0.01
        && Math.abs(bounds(part).max.y - 7.22) < 0.01)!;
      expect(support).toBeDefined();
      expect(bounds(clerestory).intersectsBox(bounds(support))).toBe(true);
    } finally { parts.forEach((part) => part.dispose()); }
  });

  it('Gossett facade strips meet the footprint and rooflights rest in their frames', () => {
    const { ring, parts, panes } = build(gossett, 0x455a62);
    try {
      const facade = panes.filter((pane) => bounds(pane).max.y < 10);
      const rooflights = panes.filter((pane) => bounds(pane).min.y > 10);
      expect(facade.length).toBeGreaterThanOrEqual(10);
      expect(rooflights).toHaveLength(3);
      for (const pane of facade) expect(maxGap(pane, ring)).toBeLessThan(0.2);
      const frames = parts.filter((part) => hasColor(part, new THREE.Color(0x929996)));
      expect(frames).toHaveLength(3);
      for (const pane of rooflights) {
        expect(frames.some((frame) => bounds(frame).clone().expandByScalar(0.03)
          .intersectsBox(bounds(pane)))).toBe(true);
      }
    } finally { parts.forEach((part) => part.dispose()); }
  });

  it('Health Center wall glazing meets the outline and dormers meet their frames', () => {
    const { ring, parts, panes } = build(health, 0x40575f);
    try {
      expect(panes.length).toBeGreaterThan(50);
      for (const pane of panes.filter((part) => bounds(part).max.y < 9)) {
        expect(maxGap(pane, ring)).toBeLessThan(0.8);
      }
      const limestone = parts.filter((part) => hasColor(part, new THREE.Color(0xe6e3d9)));
      for (const [index, pane] of panes.filter((part) => bounds(part).min.y > 9).entries()) {
        expect(limestone.some((frame) => bounds(frame).intersectsBox(bounds(pane))),
          `upper pane ${index}: ${JSON.stringify(bounds(pane))}`).toBe(true);
      }
    } finally { parts.forEach((part) => part.dispose()); }
  });

  it('Turner entrance meets the footprint and upper sash stays on the end gable', () => {
    const { ring, parts, panes } = build(turner, 0x40555c);
    try {
      expect(panes).toHaveLength(11);
      const entrance = panes.find((part) => bounds(part).min.y < 5)!;
      expect(maxGap(entrance, ring)).toBeLessThan(0.6);
      const brick = new THREE.Color(0x965242);
      const gable = parts.find((part) => hasColor(part, brick)
        && Math.abs(bounds(part).max.y - 19.25) < 0.01)!;
      expect(gable).toBeDefined();
      const gableBounds = bounds(gable).clone().expandByScalar(0.06);
      for (const pane of panes.filter((part) => part !== entrance)) {
        expect(gableBounds.containsBox(bounds(pane))).toBe(true);
      }
    } finally { parts.forEach((part) => part.dispose()); }
  });
});

// South Campus Dining Hall. UMD's Facilities exterior photo shows a broad
// two-story red-brick wing beside a pale, windowed wing; Dining Services
// documents the green metal canopy above the glazed public entrance.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { addBox, addFootprint, fractionBox } from './_shared/science-parts';

export const landmark: LandmarkModule = {
  id: 'way/23891590',
  spec: {
    name: 'South Campus Dining Hall',
    color: 0x9c6251,
    accent: 0x6caaa0,
    height: 11,
    roof: 'parapet',
  },
  maxHeight: 12.5,
  build(ctx) {
    const parts: THREE.BufferGeometry[] = [];
    const b = ctx.helpers.bboxOf(ctx.pts);
    const x = (f: number) => b.minX + (b.maxX - b.minX) * f;
    const n = (f: number) => b.minY + (b.maxY - b.minY) * f;
    const brick = 0x9c6251;
    const pale = 0xc5c2b8;
    const glass = 0x506771;
    const roof = 0x737776;
    const copper = 0x6d9a91;

    addFootprint(parts, ctx, ctx.pts, 10.7, brick);
    addFootprint(parts, ctx, ctx.helpers.outsetRing(ctx.pts, 0.15), 11.07, pale, 10.7);
    addFootprint(parts, ctx, ctx.helpers.outsetRing(ctx.pts, -0.38), 11.24, roof, 11.07);

    // The lighter eastern wing and brick western dining block read as two
    // joined buildings in UMD's north-plaza exterior photograph.
    fractionBox(parts, ctx, 0.48, 0.83, 0.997, 1.006, 0.65, 10.48, pale);
    fractionBox(parts, ctx, 0.994, 1.004, 0.39, 0.80, 0.65, 10.48, pale);
    fractionBox(parts, ctx, 0.15, 0.48, 0.997, 1.006, 0.55, 3.35, pale);
    fractionBox(parts, ctx, 0.18, 0.45, 1.006, 1.011, 0.70, 3.05, glass);
    for (const f of [0.20, 0.27, 0.34, 0.41]) {
      fractionBox(parts, ctx, f, f + 0.031, 1.001, 1.010, 6.10, 8.45, glass);
    }
    for (const f of [0.55, 0.64, 0.73]) {
      fractionBox(parts, ctx, f, f + 0.04, 1.008, 1.013, 2.0, 4.15, glass);
      fractionBox(parts, ctx, f, f + 0.04, 1.008, 1.013, 6.25, 8.5, glass);
    }

    // Low hip and glazed doors reproduce the distinctive green entrance
    // canopy without draping a photographic texture over the building.
    // The glass is the wall below the projecting canopy, not the full depth
    // of the canopy itself. Keep its inner face in the mapped north wall.
    fractionBox(parts, ctx, 0.57, 0.81, 0.997, 1.010, 0.6, 4.05, glass);
    const canopyRing = [
      new THREE.Vector2(x(0.55), n(1.003)),
      new THREE.Vector2(x(0.83), n(1.003)),
      new THREE.Vector2(x(0.83), n(1.080)),
      new THREE.Vector2(x(0.55), n(1.080)),
    ];
    parts.push(ctx.helpers.withColor(
      ctx.helpers.buildHippedRoof(canopyRing, 4.12, 1.15), new THREE.Color(copper),
    ));
    addBox(parts, ctx, x(0.55), x(0.83), n(1.003), n(1.080), 4.0, 4.16, copper);

    // A few stepped pads make the western plaza entrance visible at oblique
    // zoom. The roof garden is represented as a restrained inset planting
    // patch, as documented by UMD's Sustainability Fund.
    for (let step = 0; step < 3; step++) {
      addBox(parts, ctx, x(0.17), x(0.47), n(1.009 + step * 0.013),
        n(1.055 + step * 0.012), 0.06 + step * 0.16, 0.22 + step * 0.16, pale);
    }
    fractionBox(parts, ctx, 0.16, 0.38, 0.37, 0.56, 11.26, 11.42, 0x80926d);
    fractionBox(parts, ctx, 0.52, 0.75, 0.43, 0.57, 11.25, 12.12, 0x8e9290);
    return parts;
  },
};

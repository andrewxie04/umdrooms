// Yahentamitsi Dining Hall. Ayers Saint Gross's exterior photographs show a
// low brick service mass, two levels of continuous glazing toward Stadium
// Drive and the Heritage plaza, and a thin, dark projecting roof edge.
// The mapped outline supplies the actual L-shaped plan; details are scaled
// approximations, built entirely as native Three.js geometry.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { addBox, addFootprint, fractionBox } from './_shared/science-parts';

export const landmark: LandmarkModule = {
  id: 'way/981881553',
  spec: {
    name: 'Yahentamitsi Dining Hall',
    color: 0x965b4f,
    accent: 0x557883,
    height: 8.24,
    roof: 'parapet',
    nightGlow: 0.2,
  },
  maxHeight: 10.5,
  build(ctx) {
    const parts: THREE.BufferGeometry[] = [];
    const b = ctx.helpers.bboxOf(ctx.pts);
    const x = (f: number) => b.minX + (b.maxX - b.minX) * f;
    const n = (f: number) => b.minY + (b.maxY - b.minY) * f;
    const brick = 0x965b4f;
    const glass = 0x527581;
    const trim = 0xb9c5c4;
    const roof = 0xd6d8d2;
    const canopy = 0x333d42;

    addFootprint(parts, ctx, ctx.pts, 8.24, brick);
    // The broad pale roof follows the real plan rather than filling its
    // open eastern recess with a bounding rectangle.
    addFootprint(parts, ctx, ctx.helpers.outsetRing(ctx.pts, -0.38), 8.55, roof, 8.24);

    // Stadium Drive frontage: a long curtain wall with the brick entrance
    // block remaining legible at the eastern end.
    fractionBox(parts, ctx, 0.055, 0.73, -0.004, 0.003, 0.85, 7.85, glass);
    fractionBox(parts, ctx, 0.80, 0.93, -0.004, 0.003, 0.85, 4.35, glass);
    fractionBox(parts, ctx, 0.04, 0.76, -0.034, 0.008, 7.95, 8.31, canopy);
    fractionBox(parts, ctx, 0.78, 0.95, -0.022, 0.008, 4.30, 4.60, canopy);

    // The western glazed face wraps the corner toward the Heritage plaza.
    fractionBox(parts, ctx, -0.005, 0.003, 0.055, 0.57, 0.85, 7.80, glass);
    fractionBox(parts, ctx, -0.035, 0.009, 0.045, 0.61, 7.94, 8.31, canopy);

    for (let i = 1; i < 14; i++) {
      const f = 0.055 + (0.73 - 0.055) * i / 14;
      addBox(parts, ctx, x(f) - 0.06, x(f) + 0.06,
        n(-0.006), n(0.006), 0.88, 7.83, trim);
    }
    for (let i = 1; i < 10; i++) {
      const f = 0.055 + (0.57 - 0.055) * i / 10;
      addBox(parts, ctx, x(-0.006), x(0.006),
        n(f) - 0.06, n(f) + 0.06, 0.88, 7.79, trim);
    }
    fractionBox(parts, ctx, 0.055, 0.73, -0.007, 0.007, 3.85, 4.02, trim);
    fractionBox(parts, ctx, -0.007, 0.007, 0.055, 0.57, 3.85, 4.02, trim);

    // A screened kitchen / mechanical zone breaks up the light roof without
    // turning the entire dining hall into an opaque roof slab.
    fractionBox(parts, ctx, 0.20, 0.66, 0.71, 0.77, 8.55, 10.15, 0x646e70);
    fractionBox(parts, ctx, 0.20, 0.66, 0.69, 0.71, 8.55, 10.15, 0x808b8a);
    return parts;
  },
};

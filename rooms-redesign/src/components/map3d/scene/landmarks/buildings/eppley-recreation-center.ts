// Eppley Recreation Center — UMD's ~230k sqft rec complex (Ayers Saint Gross).
// The real building is a chain of distinct masses, which the OSM footprint
// confirms: a very long (~150x40m) field-house bar across the north, a lower
// glass natatorium wing on the east, and low brick gym blocks wrapping a
// south courtyard. Modeled as three height zones on the true footprint:
//
//   1. Podium: the FULL footprint extruded to 9m — the base brick band that
//      ties the west bar, south wing, and connector blocks together.
//   2. Field house (tallest): a bboxOf-derived rect over the north bar at
//      13m eaves carrying a MULTI-GABLED roof (7 repeated gable bays, custom
//      triangles, ridges running N-S across the depth) peaking at 16.5m.
//      Thin pale skylight strips sit astride each ridge — the field house's
//      signature rooflight line.
//   3. Natatorium (east wing): lighter blue-gray glass curtain box at 10m
//      with a high night glow — it reads as the luminous pool hall at night.
//
// Silhouette bookkeeping: apex ~17m > baseHeight, so maxHeight is set.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

const GABLE_BAYS = 7;
const EAVE_H = 13;
const RIDGE_H = 16.5;

/** Rect ring (CCW in shape space) from bbox fractions + meter inset. */
function zoneRect(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  inset: number,
): THREE.Vector2[] {
  const x0 = minX + inset;
  const y0 = minY + inset;
  const x1 = maxX - inset;
  const y1 = maxY - inset;
  return [
    new THREE.Vector2(x0, y0),
    new THREE.Vector2(x1, y0),
    new THREE.Vector2(x1, y1),
    new THREE.Vector2(x0, y1),
  ];
}

/** Multi-gabled field-house roof: per bay, two slope quads + two end-cap
 * triangles, hand-built in world space (x = east, z = -north). */
function buildGabledRoof(
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  bays: number,
): { slopes: THREE.BufferGeometry; caps: THREE.BufferGeometry } {
  const slopePos: number[] = [];
  const capPos: number[] = [];
  const v = (arr: number[], sx: number, h: number, sy: number) => {
    arr.push(sx, h, -sy); // shape (x, y=north) -> world (x, h, -y)
  };
  const bayW = (x1 - x0) / bays;
  for (let i = 0; i < bays; i++) {
    const bx0 = x0 + i * bayW;
    const bx1 = bx0 + bayW;
    const xm = (bx0 + bx1) / 2;
    // West slope: eave at bx0 rising to the ridge at xm (outward: -x, +y).
    v(slopePos, bx0, EAVE_H, y0);
    v(slopePos, xm, RIDGE_H, y0);
    v(slopePos, xm, RIDGE_H, y1);
    v(slopePos, bx0, EAVE_H, y0);
    v(slopePos, xm, RIDGE_H, y1);
    v(slopePos, bx0, EAVE_H, y1);
    // East slope: ridge at xm falling to the eave at bx1 (outward: +x, +y).
    v(slopePos, xm, RIDGE_H, y0);
    v(slopePos, bx1, EAVE_H, y0);
    v(slopePos, bx1, EAVE_H, y1);
    v(slopePos, xm, RIDGE_H, y0);
    v(slopePos, bx1, EAVE_H, y1);
    v(slopePos, xm, RIDGE_H, y1);
    // Gable end caps on the south + north faces of EVERY bay — that row of
    // triangles is exactly the sawtooth/gable elevation you see from the
    // mall. Bays are adjacent in x, so the east/west seams need no caps.
    // South cap (outward +z).
    v(capPos, bx0, EAVE_H, y0);
    v(capPos, bx1, EAVE_H, y0);
    v(capPos, xm, RIDGE_H, y0);
    // North cap (outward -z, reversed winding).
    v(capPos, bx0, EAVE_H, y1);
    v(capPos, xm, RIDGE_H, y1);
    v(capPos, bx1, EAVE_H, y1);
  }
  const slopes = new THREE.BufferGeometry();
  slopes.setAttribute('position', new THREE.Float32BufferAttribute(slopePos, 3));
  slopes.computeVertexNormals();
  const caps = new THREE.BufferGeometry();
  caps.setAttribute('position', new THREE.Float32BufferAttribute(capPos, 3));
  caps.computeVertexNormals();
  return { slopes, caps };
}

export const landmark: LandmarkModule = {
  id: 'way/23545077',
  spec: {
    name: 'Eppley Recreation Center',
    color: 0xd8d4c8,
    height: 9, // podium band; zones rise above it
    roof: 'parapet',
    nightGlow: 0.2,
  },
  maxHeight: 17,
  build(ctx) {
    const { pts, baseHeight, spec, helpers } = ctx;
    const base = helpers.withGlow(spec.color, spec.nightGlow);
    const roofShade = helpers.darkerShade(base, -0.1);
    const glass = helpers.withGlow(0xb9cfd4, 0.6); // natatorium curtain wall
    const skylight = helpers.withGlow(0xcfe0e3, 0.55); // ridge rooflights

    // Zone rectangles derived from the real footprint bbox (meters, shape
    // space). Fractions match the measured OSM geometry:
    //   field house  x[0.00,0.948] y[0.509,0.921]  (~152 x 40m north bar)
    //   natatorium   x[0.688,1.000] y[0.221,0.541]  (east glass wing)
    const bb = helpers.bboxOf(pts);
    const W = bb.maxX - bb.minX;
    const H = bb.maxY - bb.minY;
    const fx = (f: number) => bb.minX + f * W;
    const fy = (f: number) => bb.minY + f * H;

    const field = zoneRect(fx(0.0), fy(0.509), fx(0.948), fy(0.921), 2.5);
    const nata = zoneRect(fx(0.688), fy(0.221), fx(1.0), fy(0.541), 2.0);
    // West gym block (x[0.00,0.1085] y[0.213,1.00]) — the N-S bar on the
    // west edge; steps the podium up to 11m for the varied gym-block heights.
    const west = zoneRect(fx(0.0), fy(0.213), fx(0.1085), fy(1.0), 1.5);

    const fbb = helpers.bboxOf(field);
    const { slopes, caps } = buildGabledRoof(
      fbb.minX,
      fbb.maxX,
      fbb.minY,
      fbb.maxY,
      GABLE_BAYS,
    );

    // Skylight strips astride each gable ridge.
    const bayW = (fbb.maxX - fbb.minX) / GABLE_BAYS;
    const skylights: THREE.BufferGeometry[] = [];
    for (let i = 0; i < GABLE_BAYS; i++) {
      const xm = fbb.minX + (i + 0.5) * bayW;
      const strip = [
        new THREE.Vector2(xm - 0.6, fbb.minY + 1),
        new THREE.Vector2(xm + 0.6, fbb.minY + 1),
        new THREE.Vector2(xm + 0.6, fbb.maxY - 1),
        new THREE.Vector2(xm - 0.6, fbb.maxY - 1),
      ];
      const g = helpers.extrudeFootprint(strip, 0.5);
      g.translate(0, RIDGE_H - 0.05, 0);
      skylights.push(helpers.withColor(g, skylight));
    }

    return [
      // 1. Podium over the full footprint.
      helpers.withColor(helpers.extrudeFootprint(pts, baseHeight), base),
      // 1b. West gym block: mid-height step above the podium.
      helpers.withColor(helpers.extrudeFootprint(west, 11), base),
      // 2. Field house: tall walls + multi-gabled roof + skylights.
      helpers.withColor(helpers.extrudeFootprint(field, EAVE_H), base),
      helpers.withColor(slopes, roofShade),
      helpers.withColor(caps, base),
      ...skylights,
      // 3. Natatorium: glass curtain wing on the east.
      helpers.withColor(helpers.extrudeFootprint(nata, 10), glass),
    ];
  },
};

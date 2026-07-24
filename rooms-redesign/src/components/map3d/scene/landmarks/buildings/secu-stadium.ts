// SECU Stadium (Capital One Field at Maryland Stadium) — way/980371045.
// Structural recreation of the real venue:
//   - Concrete outer wall: SOLID extrusion of the real OSM horseshoe-band
//     footprint at rim height (18m) — the band polygon is not star-shaped,
//     so ring-with-hole extrusions of scaled crescents triangulate badly;
//     the bowl interior is instead modeled inside the band's concave opening.
//   - Bowl floor polygon C100 = the band's inner boundary chain (the shorter
//     of the two chains between the footprint's two long chord edges) closed
//     across the opening. C100 is star-shaped about its own centroid, so
//     scaled copies nest strictly — safe for extrudeWithHoles.
//   - Two seating tiers stepping DOWN toward the field: D-shaped ring bands
//     (C100 x 1.03->0.82 at 12m, 0.81->0.60 at 6m) in darker concrete shades,
//     outer edges tucked into the wall mass (no z-fighting, no ground gaps).
//   - Green field slab flat at y=1 (accent 0x7b9c5e), C100 x 0.62 so its
//     edge tucks just under the lowest tier's inner wall.
//   - Tyser Tower: tall narrow press-box/suite slab (38m) straddling the
//     SOUTH rim at the real tower's position (matches OSM way/25215513
//     centroid to ~3m), derived from the footprint's southernmost vertex.
//   - Scoreboard mass at the open NORTH end (dark charcoal box).
// spec.roof stays 'bowl' but the tower rises above it, so maxHeight=40.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/980371045',
  spec: {
    name: 'SECU Stadium',
    color: 0xc8c2b2,
    height: 18,
    roof: 'bowl',
    accent: 0x7b9c5e,
    nightGlow: 0.2,
  },
  maxHeight: 40,
  build(ctx) {
    const { pts, baseHeight, spec, helpers } = ctx;
    const concrete = helpers.withGlow(spec.color, spec.nightGlow);
    const fieldC = spec.accent != null ? helpers.withGlow(spec.accent, spec.nightGlow) : concrete;
    const tier2shade = helpers.darkerShade(concrete, 0.05);
    const tier3shade = helpers.darkerShade(concrete, 0.1);
    const dark = helpers.withGlow(0x3a3f44, spec.nightGlow);

    // --- Bowl floor polygon C100 -----------------------------------------
    // The footprint is a BAND (crescent) polygon: inner arc + outer arc
    // joined by two long chord edges. Extract the inner boundary chain (the
    // shorter of the two chains between the chord edges); closed across the
    // opening it forms the D-shaped bowl floor.
    const n = pts.length;
    const edgeLen = (i: number) =>
      Math.hypot(pts[(i + 1) % n].x - pts[i].x, pts[(i + 1) % n].y - pts[i].y);
    let e1 = 0;
    let e2 = 1;
    for (let i = 0; i < n; i++) {
      const l = edgeLen(i);
      if (l > edgeLen(e1)) {
        e2 = e1;
        e1 = i;
      } else if (i !== e1 && l > edgeLen(e2)) {
        e2 = i;
      }
    }
    const lo = Math.min(e1, e2);
    const hi = Math.max(e1, e2);
    const chainA = pts.slice(lo + 1, hi + 1);
    const chainB = [...pts.slice(hi + 1), ...pts.slice(0, lo + 1)];
    const chainLen = (c: THREE.Vector2[]) => {
      let s = 0;
      for (let i = 0; i < c.length - 1; i++) s += Math.hypot(c[i + 1].x - c[i].x, c[i + 1].y - c[i].y);
      return s;
    };
    const innerChain = chainLen(chainA) <= chainLen(chainB) ? chainA : chainB;
    // Normalize winding to CCW (helpers require it; the closed chain can
    // come out CW depending on which side of the ring it was cut from).
    let ringArea = 0;
    for (let i = 0; i < innerChain.length; i++) {
      const a = innerChain[i];
      const b = innerChain[(i + 1) % innerChain.length];
      ringArea += a.x * b.y - b.x * a.y;
    }
    const C100 = ringArea >= 0 ? innerChain : [...innerChain].reverse();
    const fc = helpers.centroidOf(C100);
    const dRing = (s: number) => helpers.scaleAbout(C100, fc.cx, fc.cy, s);

    // --- Anchors ----------------------------------------------------------
    let south = pts[0];
    let north = pts[0];
    for (const p of pts) {
      if (p.y < south.y) south = p;
      if (p.y > north.y) north = p;
    }

    // Tyser Tower — 40m x 16m slab on the SOUTH rim, 38m tall. The offset
    // from the southernmost footprint vertex lands on the real tower's
    // centroid (OSM way/25215513, the ~107m-long south-side structure).
    const tx = south.x - 60;
    const ty = south.y + 40;
    const towerRing = [
      new THREE.Vector2(tx - 20, ty - 8),
      new THREE.Vector2(tx + 20, ty - 8),
      new THREE.Vector2(tx + 20, ty + 8),
      new THREE.Vector2(tx - 20, ty + 8),
    ];

    // Scoreboard — dark box just inside the open north end.
    const sx = north.x;
    const sy = north.y - 10;
    const boardRing = [
      new THREE.Vector2(sx - 12, sy - 3),
      new THREE.Vector2(sx + 12, sy - 3),
      new THREE.Vector2(sx + 12, sy + 3),
      new THREE.Vector2(sx - 12, sy + 3),
    ];

    return [
      // Outer wall: solid band extrusion at full rim height (18m).
      helpers.withColor(helpers.extrudeFootprint(pts, baseHeight), concrete),
      // Upper seating tier ring (12m), outer edge tucked into the wall mass.
      helpers.withColor(helpers.extrudeWithHoles(dRing(1.03), [dRing(0.82)], baseHeight * 0.67), tier2shade),
      // Lower seating tier ring (6m).
      helpers.withColor(helpers.extrudeWithHoles(dRing(0.81), [dRing(0.6)], baseHeight * 0.33), tier3shade),
      // Field, flat at y=1.
      helpers.withColor(helpers.extrudeFootprint(dRing(0.62), 1), fieldC),
      // Tyser Tower on the south rim.
      helpers.withColor(helpers.extrudeFootprint(towerRing, 38), concrete),
      // Scoreboard at the north end.
      helpers.withColor(helpers.extrudeFootprint(boardRing, 14), dark),
    ];
  },
};

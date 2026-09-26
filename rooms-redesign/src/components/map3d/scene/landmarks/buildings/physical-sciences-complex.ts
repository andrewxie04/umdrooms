// Physical Sciences Complex (PSC) — relation/2909990. The mapped relation
// includes the inner atrium opening; the nearby way/23580194 is the separate
// Institute for Physical Science & Technology building.
// Structural recreation (HDR design, opened 2013):
//   - Red brick and glass laboratory wings around the mapped atrium.
//   - Glazed ground floor: full-height glass band wrapping the base.
//   - Two proud ribbon-window bands (glass striping) at floors 2-3.
//   - Roof band that preserves the mapped open atrium.
//   - The famous elliptical glass "oculus" volume in the atrium: a taller
//     (~24.5m) tapered elliptical cone of pale glass with red checker panels
//     checkerboard glass and a thin open rim.
// References: https://facilities.umd.edu/node/531
// https://cmns.umd.edu/index.php/news-events/news/great-science-happens-here-physical-sciences-complex-opens-its-doors
// maxHeight=26 (ellipse top 24.5 + margin) so the highlight shell clears it.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

/** Accumulate a non-indexed position list; quads become two triangles. */
class TriBag {
  pos: number[] = [];
  tri(a: number[], b: number[], c: number[]) {
    this.pos.push(...a, ...b, ...c);
  }
  quad(a: number[], b: number[], c: number[], d: number[]) {
    this.tri(a, b, c);
    this.tri(a, c, d);
  }
  geom(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.computeVertexNormals();
    return g;
  }
}

export const landmark: LandmarkModule = {
  id: 'relation/2909990',
  spec: {
    name: 'Physical Sciences Complex',
    color: 0xa86550, // campus brick seen on the outer laboratory wings
    height: 19.8,
    roof: 'parapet',
    accent: 0x7e2a26, // oculus red glass
    nightGlow: 0.35, // the lighted oculus is a night landmark
  },
  maxHeight: 26,
  build(ctx) {
    const { pts, holes, baseHeight, spec, helpers } = ctx;
    const glow = spec.nightGlow;
    const brick = helpers.withGlow(spec.color, glow);
    const glass = helpers.withGlow(0x4d6a7d, glow);
    const baseGlass = helpers.withGlow(0x3e5766, glow);
    const roofMetal = helpers.withGlow(0x8f969c, glow);
    const oculusGlass = helpers.withGlow(0x9db8c6, glow);
    const oculusRed = spec.accent != null ? helpers.withGlow(spec.accent, glow) : oculusGlass;
    const crownMetal = helpers.withGlow(0x848b91, glow);

    const parts: THREE.BufferGeometry[] = [];
    const extrudeBand = (outer: THREE.Vector2[], inner: THREE.Vector2[][], depth: number) =>
      inner.length ? helpers.extrudeWithHoles(outer, inner, depth) : helpers.extrudeFootprint(outer, depth);

    // 1) Laboratory wings around the real inner courtyard.
    parts.push(helpers.withColor(extrudeBand(pts, holes, baseHeight), brick));

    // 2) Glazed ground floor (slightly proud glass wrap, 0..3.4m).
    parts.push(
      helpers.withColor(extrudeBand(
        helpers.outsetRing(pts, 0.06), holes.map((ring) => helpers.outsetRing(ring, -0.06)), 3.4,
      ), baseGlass),
    );

    // 3) Ribbon-window bands at floors 2 and 3 (proud glass striping).
    const bandRing = helpers.outsetRing(pts, 0.12);
    for (const bandY of [4.0, 7.9]) {
      const band = extrudeBand(bandRing, holes.map((ring) => helpers.outsetRing(ring, -0.12)), 1.3);
      band.translate(0, bandY, 0);
      parts.push(helpers.withColor(band, glass));
    }

    // 4) A low metal roof/parapet keeps the open courtyard visible from above.
    const roof = extrudeBand(
      helpers.outsetRing(pts, -0.16),
      holes.map((ring) => helpers.outsetRing(ring, 0.16)), 0.28,
    );
    roof.translate(0, baseHeight, 0);
    parts.push(helpers.withColor(roof, roofMetal));

    // 5) Elliptical oculus within the open atrium: clear and red glass panes
    //    on an inverted cone with a thin metal rim, open to the sky.
    const atrium = helpers.bboxOf(holes[0] ?? pts);
    const ex = (atrium.minX + atrium.maxX) / 2;
    const ey = (atrium.minY + atrium.maxY) / 2;
    const ra = Math.min(7.0, (atrium.maxX - atrium.minX) * 0.37);
    const rb = Math.min(9.2, (atrium.maxY - atrium.minY) * 0.37);
    const taper = 1.18; // the glass ellipse widens toward the open sky
    const M = 24;
    const wallTop = 24.2;
    const glassBag = new TriBag();
    const redBag = new TriBag();
    const crownBag = new TriBag();
    for (let i = 0; i < M; i++) {
      const t0 = (i / M) * Math.PI * 2;
      const t1 = ((i + 1) / M) * Math.PI * 2;
      const q0 = [ex + ra * taper * Math.cos(t0), -(ey + rb * taper * Math.sin(t0))];
      const q1 = [ex + ra * taper * Math.cos(t1), -(ey + rb * taper * Math.sin(t1))];
      // The photographed checkerboard changes color in both directions.
      // Each narrow panel follows the widening inverted-cone profile.
      for (let row = 0; row < 8; row++) {
        const h0 = row * wallTop / 8;
        const h1 = (row + 1) * wallTop / 8;
        const s0 = 1 + (taper - 1) * h0 / wallTop;
        const s1 = 1 + (taper - 1) * h1 / wallTop;
        const bag = (i + row * 3) % 5 < 2 ? redBag : glassBag;
        bag.quad(
          [ex + ra * s0 * Math.cos(t0), h0, -(ey + rb * s0 * Math.sin(t0))],
          [ex + ra * s0 * Math.cos(t1), h0, -(ey + rb * s0 * Math.sin(t1))],
          [ex + ra * s1 * Math.cos(t1), h1, -(ey + rb * s1 * Math.sin(t1))],
          [ex + ra * s1 * Math.cos(t0), h1, -(ey + rb * s1 * Math.sin(t0))],
        );
      }
      crownBag.quad(
        [q0[0], wallTop, q0[1]],
        [q1[0], wallTop, q1[1]],
        [q1[0], wallTop + 0.3, q1[1]],
        [q0[0], wallTop + 0.3, q0[1]],
      );
    }
    parts.push(helpers.withColor(glassBag.geom(), oculusGlass));
    parts.push(helpers.withColor(redBag.geom(), oculusRed));
    parts.push(helpers.withColor(crownBag.geom(), crownMetal));

    return parts;
  },
};

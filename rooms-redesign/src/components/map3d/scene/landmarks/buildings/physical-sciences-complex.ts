// Physical Sciences Complex (PSC) — way/23580194.
// NOTE on id: the real PSC is OSM relation 2909990 (outer way 220042578,
// 4296 Stadium Dr), which is absent from campus-data.json; the dataset's only
// "Physical Sciences" name match is this way (tagged 'Institute for Physical
// Science & Technology', an elongated ~11x42m bar immediately east of the PSC
// site). The PSC signature architecture is modeled on that footprint.
// Structural recreation (HDR/CUH2A design, opened 2013):
//   - Long silver-gray precast + glass bar (the office/lab bar), 12m.
//   - Glazed ground floor: full-height glass band wrapping the base.
//   - Two proud ribbon-window bands (glass striping) at floors 2-3.
//   - Signature swooping roofline: segmented sloped quads whose height follows
//     a sin curve along the long axis, with side skirts + end caps.
//   - The famous elliptical glass "oculus" volume piercing the bar: a taller
//     (~24.5m) elliptical cylinder of pale glass with a red-glass sector
//     facing south (Stadium Drive) and a metal crown band.
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
  id: 'way/23580194',
  spec: {
    name: 'Physical Sciences Complex',
    color: 0xb7bcc1, // silver-gray precast
    height: 12,
    roof: 'parapet',
    accent: 0x7e2a26, // oculus red glass
    nightGlow: 0.35, // the lighted oculus is a night landmark
  },
  maxHeight: 26,
  build(ctx) {
    const { pts, cx, cy, baseHeight, spec, helpers } = ctx;
    const glow = spec.nightGlow;
    const precast = helpers.withGlow(spec.color, glow);
    const glass = helpers.withGlow(0x4d6a7d, glow);
    const baseGlass = helpers.withGlow(0x3e5766, glow);
    const roofMetal = helpers.withGlow(0x8f969c, glow);
    const oculusGlass = helpers.withGlow(0x9db8c6, glow);
    const oculusRed = spec.accent != null ? helpers.withGlow(spec.accent, glow) : oculusGlass;
    const crownMetal = helpers.withGlow(0x848b91, glow);

    const { minX, maxX, minY, maxY } = helpers.bboxOf(pts);
    const parts: THREE.BufferGeometry[] = [];

    // 1) Main bar, full footprint.
    parts.push(helpers.withColor(helpers.extrudeFootprint(pts, baseHeight), precast));

    // 2) Glazed ground floor (slightly proud glass wrap, 0..3.4m).
    parts.push(
      helpers.withColor(helpers.extrudeFootprint(helpers.outsetRing(pts, 0.06), 3.4), baseGlass),
    );

    // 3) Ribbon-window bands at floors 2 and 3 (proud glass striping).
    const bandRing = helpers.outsetRing(pts, 0.12);
    for (const bandY of [4.0, 7.9]) {
      const band = helpers.extrudeFootprint(bandRing, 1.3);
      band.translate(0, bandY, 0);
      parts.push(helpers.withColor(band, glass));
    }

    // 4) Swooping roof: segmented sloped quads along the long (N-S) axis.
    //    Height profile rises from the south end, peaks mid-bar, settles north.
    const N = 14;
    const rx0 = minX + 0.15;
    const rx1 = maxX - 0.15;
    const hAt = (t: number) =>
      baseHeight + 0.15 + 3.2 * Math.sin(Math.PI * t) + 0.7 * t;
    const roof = new TriBag();
    let prevY = minY;
    let prevH = hAt(0);
    for (let i = 1; i <= N; i++) {
      const t = i / N;
      const y = minY + (maxY - minY) * t;
      const h = hAt(t);
      // world: (x, up, z = -north)
      const za = -prevY;
      const zb = -y;
      // top surface (up-facing)
      roof.quad(
        [rx0, prevH, za],
        [rx1, prevH, za],
        [rx1, h, zb],
        [rx0, h, zb],
      );
      // west skirt (faces -x)
      roof.quad(
        [rx0, baseHeight, za],
        [rx0, prevH, za],
        [rx0, h, zb],
        [rx0, baseHeight, zb],
      );
      // east skirt (faces +x, reversed winding)
      roof.quad(
        [rx1, baseHeight, za],
        [rx1, h, zb],
        [rx1, prevH, za],
        [rx1, baseHeight, zb],
      );
      prevY = y;
      prevH = h;
    }
    // end caps (south faces +z, north faces -z)
    roof.quad(
      [rx0, baseHeight, -minY],
      [rx1, baseHeight, -minY],
      [rx1, hAt(0), -minY],
      [rx0, hAt(0), -minY],
    );
    roof.quad(
      [rx0, baseHeight, -maxY],
      [rx0, hAt(1), -maxY],
      [rx1, hAt(1), -maxY],
      [rx1, baseHeight, -maxY],
    );
    parts.push(helpers.withColor(roof.geom(), roofMetal));

    // 5) Elliptical oculus volume piercing the bar (taller lab/collaboration
    //    ellipse). Centered slightly north of the centroid, full height 24.5m,
    //    red-glass sector facing south (Stadium Drive), metal crown band.
    const ex = cx + 0.2;
    const ey = cy + 1.2;
    const ra = 3.8; // semi-axis east-west (fits the 11.3m width)
    const rb = 6.2; // semi-axis north-south
    const M = 24;
    const wallTop = 23.4;
    const capTop = 24.5;
    const glassBag = new TriBag();
    const redBag = new TriBag();
    const crownBag = new TriBag();
    const capBag = new TriBag();
    for (let i = 0; i < M; i++) {
      const t0 = (i / M) * Math.PI * 2;
      const t1 = ((i + 1) / M) * Math.PI * 2;
      const tm = (t0 + t1) / 2;
      const p0 = [ex + ra * Math.cos(t0), -(ey + rb * Math.sin(t0))]; // world x,z
      const p1 = [ex + ra * Math.cos(t1), -(ey + rb * Math.sin(t1))];
      // Scattered red-glass panels across the south-facing half (the real
      // oculus mixes clear and individually-cut red glass) — every other
      // segment with sin(tm) < -0.2, instead of one solid red wall.
      const bag = Math.sin(tm) < -0.2 && i % 2 === 0 ? redBag : glassBag;
      bag.quad(
        [p0[0], 0, p0[1]],
        [p1[0], 0, p1[1]],
        [p1[0], wallTop, p1[1]],
        [p0[0], wallTop, p0[1]],
      );
      crownBag.quad(
        [p0[0], wallTop, p0[1]],
        [p1[0], wallTop, p1[1]],
        [p1[0], capTop, p1[1]],
        [p0[0], capTop, p0[1]],
      );
      // top cap fan (up-facing)
      capBag.tri([ex, capTop, -ey], [p0[0], capTop, p0[1]], [p1[0], capTop, p1[1]]);
    }
    parts.push(helpers.withColor(glassBag.geom(), oculusGlass));
    parts.push(helpers.withColor(redBag.geom(), oculusRed));
    parts.push(helpers.withColor(crownBag.geom(), crownMetal));
    parts.push(helpers.withColor(capBag.geom(), crownMetal));

    return parts;
  },
};

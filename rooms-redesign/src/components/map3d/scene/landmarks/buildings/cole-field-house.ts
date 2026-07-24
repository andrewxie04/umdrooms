// Cole Field House / Jones-Hill House (way/23502754)
// 1955 arena by Balt. architects; converted 2016-2021 by CannonDesign into the
// Jones-Hill House football performance center.
//
// Real building (refs: AISC Modern Steel Construction Jan 2021, CannonDesign,
// Gilbane, UMD Today — see report):
//   - The signature: a huge barrel-vault (lamella) roof — 15 steel arches
//     spanning the ~250-ft WIDTH of the arena; the vault extrudes along the
//     N-S length (three new arch bays were added at the NORTH end in 2021,
//     indistinguishable from the originals). Roof apex ~92 ft over the arena
//     floor => ~20 m above grade.
//   - Red-brick end walls and perimeter (the historic Union Drive facade with
//     its pilastered entry is preserved).
//   - The stadium-facing (north) end is the new glass facade of Jones-Hill
//     House; the Terrapin Performance Center wraps the arena as lower flat
//     masses (the irregular OSM footprint includes all of it).
//
// Modeling decisions (campus-zoom readable):
//   1. Whole complex footprint extruded to an 8 m brick base (the additions
//      are all lower flat brick masses around the arena).
//   2. Barrel vault lofted over the main N-S mass: at each N-S station the
//      widest E-W interior interval of the real footprint is found by scanline
//      intersection; the vault domain grows from the footprint centroid while
//      the span stays near the arena width (this rejects the thin E-W wings).
//      Arch profile = half-cosine, 12 segments, non-indexed quads.
//   3. North end = glass arch-infill wall (the Jones-Hill glass facade),
//      south end = brick arch-infill wall (historic brick end wall).
//   4. maxHeight 20 covers the vault apex for the highlight shell.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

const ARC_SEGMENTS = 12; // across the span (item: 10-14)
const STATION_STEP = 4; // meters along the vault
const APEX = 20; // vault apex above grade, meters

export const landmark: LandmarkModule = {
  id: 'way/23502754',
  spec: {
    name: 'Cole Field House (Jones-Hill House)',
    color: 0x9c5a48, // UMD red brick
    height: 8, // brick base / perimeter wall height (tagged 41.29 is wrong)
    accent: 0xd8d4c8, // barrel-vault roof, light gray
    nightGlow: 0.3,
  },
  maxHeight: APEX,
  build(ctx) {
    const { pts, cy, baseHeight, spec, helpers } = ctx;
    const glow = spec.nightGlow;
    const brickC = helpers.withGlow(spec.color, glow);
    const roofC = helpers.withGlow(spec.accent ?? 0xd8d4c8, glow);
    const glassC = helpers.withGlow(0xa8c2cc, glow); // lighter blue-gray glass
    const base = baseHeight;
    const rise = Math.max(2, APEX - base);

    const parts: THREE.BufferGeometry[] = [];

    // 1. Brick base over the whole complex footprint.
    parts.push(helpers.withColor(helpers.extrudeFootprint(pts, base), brickC));

    // 2. Barrel vault. Scanline helper: widest E-W interior interval of the
    //    footprint at shape-space latitude ys (parity pairing of sorted
    //    edge intersections).
    const n = pts.length;
    const widestAt = (ys: number): [number, number] | null => {
      const xs: number[] = [];
      for (let i = 0; i < n; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % n];
        if (a.y > ys !== b.y > ys) {
          xs.push(a.x + ((b.x - a.x) * (ys - a.y)) / (b.y - a.y));
        }
      }
      if (xs.length < 2) return null;
      xs.sort((p, q) => p - q);
      let best: [number, number] | null = null;
      for (let i = 0; i + 1 < xs.length; i += 2) {
        if (!best || xs[i + 1] - xs[i] > best[1] - best[0]) best = [xs[i], xs[i + 1]];
      }
      return best;
    };

    // Grow the vault domain north & south from the centroid while the span
    // stays near the arena width — rejects the thin E-W connector wings.
    const atCentroid = widestAt(cy);
    if (atCentroid) {
      const span0 = atCentroid[1] - atCentroid[0];
      const minSpan = span0 * 0.6;
      const maxSpan = span0 + 15;
      const stations: { ys: number; x0: number; x1: number }[] = [];
      for (let ys = cy; ; ys += STATION_STEP) {
        const iv = widestAt(ys);
        if (!iv) break;
        const w = iv[1] - iv[0];
        if (w < minSpan || w > maxSpan) break;
        stations.push({ ys, x0: iv[0], x1: iv[1] });
      }
      const south: typeof stations = [];
      for (let ys = cy - STATION_STEP; ; ys -= STATION_STEP) {
        const iv = widestAt(ys);
        if (!iv) break;
        const w = iv[1] - iv[0];
        if (w < minSpan || w > maxSpan) break;
        south.push({ ys, x0: iv[0], x1: iv[1] });
      }
      stations.unshift(...south.reverse()); // ascending ys = south -> north

      if (stations.length >= 2) {
        // Straight barrel: the real lamella roof is 18 identical parallel
        // arches on one straight axis. Per-station widths/centers made ugly
        // scalloped flanks and kinks (the footprint's width changes come from
        // the flat additions, not the arena). Fit a straight centerline by
        // least squares, use one constant span (the narrowest station, so the
        // springs stay on the footprint everywhere), tapering only if the
        // fitted line nears an interval edge.
        let span = Infinity;
        for (const s of stations) span = Math.min(span, s.x1 - s.x0);
        const nSt = stations.length;
        let meanC = 0;
        let meanY = 0;
        for (const s of stations) {
          meanC += (s.x0 + s.x1) / 2;
          meanY += s.ys;
        }
        meanC /= nSt;
        meanY /= nSt;
        let num = 0;
        let den = 0;
        for (const s of stations) {
          num += (s.ys - meanY) * ((s.x0 + s.x1) / 2 - meanC);
          den += (s.ys - meanY) ** 2;
        }
        const slope = den > 1e-6 ? num / den : 0;
        // Half-cosine arch profile per station: [x, height] across the span.
        const profiles = stations.map((s) => {
          const c = meanC + slope * (s.ys - meanY);
          const half = Math.max(10, Math.min(span / 2, s.x1 - c, c - s.x0));
          const prof: [number, number][] = [];
          for (let j = 0; j <= ARC_SEGMENTS; j++) {
            const t = j / ARC_SEGMENTS;
            prof.push([
              c - half + t * half * 2,
              base + rise * Math.cos((t - 0.5) * Math.PI),
            ]);
          }
          return prof;
        });

        const roofPos: number[] = [];
        const push = (out: number[], ...vs: number[][]) => {
          for (const v of vs) out.push(v[0], v[1], v[2]);
        };
        // Vault surface: quads between consecutive stations, wound up.
        for (let i = 0; i + 1 < stations.length; i++) {
          const zA = -stations[i].ys;
          const zB = -stations[i + 1].ys; // world z = -north
          const A = profiles[i];
          const B = profiles[i + 1];
          for (let j = 0; j < ARC_SEGMENTS; j++) {
            const a0 = [A[j][0], A[j][1], zA];
            const a1 = [A[j + 1][0], A[j + 1][1], zA];
            const b0 = [B[j][0], B[j][1], zB];
            const b1 = [B[j + 1][0], B[j + 1][1], zB];
            push(roofPos, a0, a1, b1);
            push(roofPos, a0, b1, b0);
          }
        }
        const roofG = new THREE.BufferGeometry();
        roofG.setAttribute('position', new THREE.Float32BufferAttribute(roofPos, 3));
        roofG.computeVertexNormals();
        parts.push(helpers.withColor(roofG, roofC));

        // 3. Arch-infill end walls from the brick deck (h=base) up to the
        //    arch curve. North end (largest ys) = glass facade, wound to
        //    face north (world -z); south end = brick, wound to face south.
        const endWall = (si: number, northFacing: boolean) => {
          const z = -stations[si].ys;
          const P = profiles[si];
          const pos: number[] = [];
          for (let j = 0; j < ARC_SEGMENTS; j++) {
            const p0 = [P[j][0], base, z];
            const p1 = [P[j + 1][0], base, z];
            const q0 = [P[j][0], P[j][1], z];
            const q1 = [P[j + 1][0], P[j + 1][1], z];
            if (northFacing) {
              push(pos, p0, q1, p1);
              push(pos, p0, q0, q1);
            } else {
              push(pos, p0, p1, q1);
              push(pos, p0, q1, q0);
            }
          }
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
          g.computeVertexNormals();
          return g;
        };
        parts.push(helpers.withColor(endWall(0, false), brickC));
        parts.push(helpers.withColor(endWall(stations.length - 1, true), glassC));
      }
    }

    return parts;
  },
};

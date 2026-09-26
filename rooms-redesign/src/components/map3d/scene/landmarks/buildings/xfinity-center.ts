// XFINITY Center (way/23544340) — UMD's 17,300-seat basketball arena
// (Ellerbe Becket / Design Collective, opened 2002 as Comcast Center).
// Exterior read from photos: a massive octagonal-ish bowl in buff
// campus-blend masonry over a concrete base band, four corner entrance
// pavilions, and a broad dark metal roof stepping up to a low domed crown.
//
// Model (all heights in meters):
//   1. Concrete base band  — the real OSM footprint extruded to 7m.
//   2. Main bowl           — clean octagon derived from the footprint bbox
//      (3m inset, diagonal corner cuts = the chamfered mass) up to 18m.
//   3. Low-arched roof     — sloped bands rise from the octagonal eave to a
//      broad flat crown; a small rooftop mechanical drum is visible above it.
//   4. Corner pavilions    — 4 boxes anchored to the footprint vertices
//      nearest each bbox corner, pulled 12m toward the centroid so they sit
//      ON the real footprint; 9m tall with thin dark caps.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/23544340',
  spec: {
    name: 'XFINITY Center',
    color: 0xb9b2a4, // buff masonry, blends with campus brick
    height: 18, // main bowl wall top; roof tiers rise above this
    roof: 'hipped', // domed silhouette ≈ hipped: caps lit windows at 80%
    accent: 0x8b9096, // dark gray-blue metal roof
    nightGlow: 0.25, // arena glow on game nights
  },
  maxHeight: 29, // roof crown plus rooftop mechanical drum
  build(ctx) {
    const { pts, cx, cy, baseHeight, spec, helpers } = ctx;
    const glow = spec.nightGlow;
    const body = helpers.withGlow(spec.color, glow);
    const band = helpers.darkerShade(helpers.withGlow(spec.color, glow), 0.08);
    const roof = helpers.withGlow(spec.accent ?? 0x8b9096, glow);
    const capC = helpers.darkerShade(roof, 0.06);
    const brick = helpers.withGlow(0x9d6253, glow);
    const glazing = helpers.withGlow(0x43555c, glow);

    const BAND_H = 7; // concrete base band
    const BOWL_H = baseHeight; // 18 — bowl wall top
    const PAV_H = BAND_H + 2; // corner pavilions slightly taller than band

    // --- Main bowl: chamfered octagon from the footprint bbox -------------
    // Inset the bbox 3m, then cut each corner diagonally (chamfer leg =
    // 22% of the shorter axis) — reads as the arena's octagonal mass.
    const bb = helpers.bboxOf(pts);
    const ix0 = bb.minX + 3;
    const ix1 = bb.maxX - 3;
    const iy0 = bb.minY + 3;
    const iy1 = bb.maxY - 3;
    const ch = Math.min(ix1 - ix0, iy1 - iy0) * 0.22;
    const bowl = [
      new THREE.Vector2(ix0 + ch, iy0),
      new THREE.Vector2(ix1 - ch, iy0),
      new THREE.Vector2(ix1, iy0 + ch),
      new THREE.Vector2(ix1, iy1 - ch),
      new THREE.Vector2(ix1 - ch, iy1),
      new THREE.Vector2(ix0 + ch, iy1),
      new THREE.Vector2(ix0, iy1 - ch),
      new THREE.Vector2(ix0, iy0 + ch),
    ];
    const ocx = (ix0 + ix1) / 2;
    const ocy = (iy0 + iy1) / 2;

    // --- Faceted low arch: continuous sloped metal skin and flat crown ---
    const tier1 = helpers.scaleAbout(bowl, ocx, ocy, 0.85);
    const tier2 = helpers.scaleAbout(bowl, ocx, ocy, 0.65);
    const tier3 = helpers.scaleAbout(bowl, ocx, ocy, 0.45);
    const T1 = BOWL_H + 3; // 21
    const T2 = T1 + 2.5; // 23.5
    const T3 = T2 + 2.5; // 26 — flat crown
    const roofPos: number[] = [];
    const roofRings = [bowl, tier1, tier2, tier3];
    const roofLevels = [BOWL_H, T1, T2, T3];
    const push = (p: THREE.Vector2, h: number) => roofPos.push(p.x, h, -p.y);
    for (let k = 0; k < roofRings.length - 1; k++) {
      const outer = roofRings[k];
      const inner = roofRings[k + 1];
      for (let i = 0; i < outer.length; i++) {
        const j = (i + 1) % outer.length;
        push(outer[i], roofLevels[k]); push(outer[j], roofLevels[k]); push(inner[j], roofLevels[k + 1]);
        push(outer[i], roofLevels[k]); push(inner[j], roofLevels[k + 1]); push(inner[i], roofLevels[k + 1]);
      }
    }
    const roofSkin = new THREE.BufferGeometry();
    roofSkin.setAttribute('position', new THREE.Float32BufferAttribute(roofPos, 3));
    roofSkin.computeVertexNormals();
    const crown = helpers.extrudeFootprint(tier3, 0.18);
    crown.translate(0, T3 - 0.18, 0);
    const drum = new THREE.CylinderGeometry(9, 9, 2.6, 12);
    drum.translate(ocx, T3 + 1.3, -ocy);

    // The arena is a broad brick-and-masonry volume, with a recessed
    // concourse glazing band below the metal roof. The band follows the
    // actual chamfered wall rather than reading as a plain gray cylinder.
    const brickBelt = helpers.extrudeWithHoles(
      helpers.outsetRing(bowl, 0.22), [bowl], 1.65,
    );
    brickBelt.translate(0, 7.1, 0);
    const concourse = helpers.extrudeWithHoles(
      helpers.outsetRing(bowl, 0.26), [bowl], 1.4,
    );
    concourse.translate(0, 13.0, 0);
    const cornice = helpers.extrudeWithHoles(
      helpers.outsetRing(bowl, 0.45), [bowl], 0.46,
    );
    cornice.translate(0, BOWL_H - 0.32, 0);

    // Metal roof seams converge toward the low flat crown, which makes the
    // octagonal roof legible from the normal oblique map camera.
    const seams: THREE.BufferGeometry[] = [];
    for (let i = 0; i < bowl.length; i++) {
      for (let k = 0; k < roofRings.length - 1; k++) {
        const a = new THREE.Vector3(roofRings[k][i].x, roofLevels[k] + 0.1, -roofRings[k][i].y);
        const b = new THREE.Vector3(roofRings[k + 1][i].x, roofLevels[k + 1] + 0.1, -roofRings[k + 1][i].y);
        const direction = new THREE.Vector3().subVectors(b, a);
        const seam = new THREE.CylinderGeometry(0.11, 0.11, direction.length(), 5);
        seam.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()));
        seam.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
        seams.push(helpers.withColor(seam, capC));
      }
    }

    // --- Corner entrance pavilions ---------------------------------------
    // For each bbox corner, anchor to the nearest real footprint vertex and
    // pull 12m toward the centroid so the box lands on the footprint.
    const corners: [number, number][] = [
      [bb.minX, bb.minY],
      [bb.maxX, bb.minY],
      [bb.maxX, bb.maxY],
      [bb.minX, bb.maxY],
    ];
    const PAV_HALF = 7; // 14m x 14m boxes
    const pavilions: THREE.BufferGeometry[] = [];
    for (const [px, py] of corners) {
      let best = pts[0];
      let bestD = Infinity;
      for (const p of pts) {
        const d = (p.x - px) ** 2 + (p.y - py) ** 2;
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      }
      const dx = cx - best.x;
      const dy = cy - best.y;
      const len = Math.hypot(dx, dy) || 1;
      const pxIn = best.x + (dx / len) * 12;
      const pyIn = best.y + (dy / len) * 12;
      const sq = [
        new THREE.Vector2(pxIn - PAV_HALF, pyIn - PAV_HALF),
        new THREE.Vector2(pxIn + PAV_HALF, pyIn - PAV_HALF),
        new THREE.Vector2(pxIn + PAV_HALF, pyIn + PAV_HALF),
        new THREE.Vector2(pxIn - PAV_HALF, pyIn + PAV_HALF),
      ];
      pavilions.push(helpers.withColor(helpers.extrudeFootprint(sq, PAV_H), body));
      // Thin dark cap so the pavilion reads as an entrance block.
      const capSq = helpers.scaleAbout(sq, pxIn, pyIn, 0.8);
      const capGeom = helpers.extrudeFootprint(capSq, 0.7);
      capGeom.translate(0, PAV_H, 0);
      pavilions.push(helpers.withColor(capGeom, capC));
    }

    return [
      helpers.withColor(helpers.extrudeFootprint(pts, BAND_H), band),
      helpers.withColor(helpers.extrudeFootprint(bowl, BOWL_H), body),
      helpers.withColor(brickBelt, brick),
      helpers.withColor(concourse, glazing),
      helpers.withColor(cornice, brick),
      helpers.withColor(roofSkin, roof),
      helpers.withColor(crown, roof),
      helpers.withColor(drum, capC),
      ...seams,
      ...pavilions,
    ];
  },
};

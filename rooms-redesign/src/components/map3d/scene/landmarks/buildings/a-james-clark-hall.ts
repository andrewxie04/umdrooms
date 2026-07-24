// A. James Clark Hall (way/363185813) — UMD's 184,000 sqft bioengineering
// flagship (Ballinger / Clark Construction, opened 2017), 8278 Paint Branch
// Drive. Exterior read from photos/press: warm red-brick lab blocks with a
// dramatic sweeping curved glass curtain-wall atrium running along the Paint
// Branch Drive (east) side — the "flex lab" facade with eastward views onto
// the pedestrian plaza — plus flat roofs with setback mechanical penthouses.
//
// The real OSM footprint is a Z-shaped sliver: a thin ~6m N-S spine on the
// east with triangular wedges flaring west at both ends — a good match for
// the building's curved glass spine + brick end blocks, so the model keeps
// the real outline as the main mass:
//
//   1. Brick mass    — full footprint extruded to 20m (5 floors), warm
//      campus brick 0xb5856c; the flared wedges read as the brick lab blocks.
//   2. Curved glass  — the signature atrium: a faceted arc (8 segments,
//      quadratic-curve samples) hugging the east edge and bulging ~6m out
//      over the plaza, 0.6..14.8m in light glass blue, with a slightly proud
//      darker spandrel band 14.8..16.5m and a curved glass cap fan on top.
//   3. Penthouses    — two setback mechanical boxes on the brick roofs of the
//      south and north wedges (darker brick), tops at 23.2m.
//
// Custom-geometry note: the arc walls/cap are hand-built non-indexed
// triangles in world space (x, y, -shapeY), both windings emitted (the merge
// material is FrontSide Lambert), computeVertexNormals, then withColor.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/363185813',
  spec: {
    name: 'A. James Clark Hall',
    color: 0xb5856c, // warm red-brown campus brick
    height: 20, // 5 lab floors; tagged 29.72 is LiDAR max, not wall height
    roof: 'parapet', // flat roof (roof:shape=flat), penthouses above
    accent: 0xbcd9e2, // light glass blue — the curved atrium curtain wall
    nightGlow: 0.55, // the glass atrium glows warm after dark
  },
  maxHeight: 24, // penthouse tops (23.2) + highlight-shell margin
  build(ctx) {
    const { pts, baseHeight, spec, helpers } = ctx;
    const glow = spec.nightGlow;
    const brick = helpers.withGlow(spec.color, glow);
    const glass = helpers.withGlow(spec.accent ?? 0xbcd9e2, glow);
    const spandrel = helpers.darkerShade(glass, 0.1);
    const pent = helpers.darkerShade(brick, 0.09);

    const bb = helpers.bboxOf(pts);

    // --- Curved glass atrium ---------------------------------------------
    // Chord along the east edge (Paint Branch Drive side), arc bulging east
    // over the plaza. Endpoints bury ~0.4m into the brick so the ends read
    // as wrapping past the masonry corners.
    const chordX = bb.maxX - 0.4;
    const y1 = bb.minY + 27; // south end of the glass run
    const y2 = bb.maxY - 1.6; // just short of the north corner
    const chordLen = y2 - y1;
    const bulge = Math.min(6, Math.max(3, chordLen * 0.1));
    const apexX = bb.maxX + bulge;
    const apexY = (y1 + y2) / 2;

    /** Faceted arc wall: quadratic-curve ribbon from yBot..yTop, plus an
     * optional cap fan at yTop. Non-indexed, both windings, world space. */
    function curvedRibbon(
      yBot: number,
      yTop: number,
      extraBulge: number,
      cap: boolean,
    ): THREE.BufferGeometry {
      const ax = apexX + extraBulge;
      // Quadratic Bezier control point so the curve passes through the apex.
      const cqX = 2 * ax - chordX;
      const cqY = 2 * apexY - (y1 + y2) / 2;
      const SEGS = 8;
      const sample = (t: number): [number, number] => {
        const u = 1 - t;
        return [
          u * u * chordX + 2 * u * t * cqX + t * t * chordX,
          u * u * y1 + 2 * u * t * cqY + t * t * y2,
        ];
      };
      const pos: number[] = [];
      const tri = (a: number[], b: number[], c: number[]) => {
        pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
      };
      const arcTop: [number, number][] = [];
      for (let i = 0; i < SEGS; i++) {
        const [pax, pay] = sample(i / SEGS);
        const [pbx, pby] = sample((i + 1) / SEGS);
        arcTop.push([pax, pay]);
        // world coords: (x, height, -shapeY)
        const A0 = [pax, yBot, -pay];
        const B0 = [pbx, yBot, -pby];
        const A1 = [pax, yTop, -pay];
        const B1 = [pbx, yTop, -pby];
        tri(A0, B0, B1); tri(A0, B1, A1); // outward face
        tri(A0, B1, B0); tri(A0, A1, B1); // inward face (FrontSide material)
      }
      if (cap) {
        // Curved glass roof: fan from an interior center to each arc segment.
        const capC = [(chordX + ax) / 2, yTop, -apexY];
        for (let i = 0; i < SEGS; i++) {
          const [pax, pay] = arcTop[i];
          const nxt = arcTop[i + 1] ?? [chordX, y2];
          const A = [pax, yTop, -pay];
          const B = [nxt[0], yTop, -nxt[1]];
          tri(capC, A, B);
          tri(capC, B, A);
        }
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geom.computeVertexNormals();
      return geom;
    }

    const GLASS_TOP = 16.5; // atrium roof, below the brick parapet
    const BAND_BOT = 14.8; // spandrel band under the atrium roofline
    const glassWall = helpers.withColor(curvedRibbon(0.6, BAND_BOT, 0, true), glass);
    const glassBand = helpers.withColor(
      curvedRibbon(BAND_BOT, GLASS_TOP, 0.14, false),
      spandrel,
    );

    // --- Rooftop mechanical penthouses ------------------------------------
    // Setback boxes sitting inside the wide wedge ends of the footprint.
    function rectRing(
      x0: number,
      y0: number,
      x1: number,
      yy1: number,
    ): THREE.Vector2[] {
      return [
        new THREE.Vector2(x0, y0),
        new THREE.Vector2(x1, y0),
        new THREE.Vector2(x1, yy1),
        new THREE.Vector2(x0, yy1),
      ];
    }
    const PENT_TOP = baseHeight + 3.2; // 23.2
    // South wedge (interior: right of the (minX,minY)->spine diagonal).
    const southPent = rectRing(bb.minX + 14, bb.minY + 5, bb.minX + 20.5, bb.minY + 14);
    // North wedge (interior: below the top slant, right of the neck slant —
    // narrower, so this box is smaller and pushed further into the corner).
    const northPent = rectRing(bb.minX + 16, bb.maxY - 3.0, bb.minX + 23, bb.maxY - 1.2);

    return [
      helpers.withColor(helpers.extrudeFootprint(pts, baseHeight), brick),
      glassWall,
      glassBand,
      helpers.withColor(helpers.extrudeFootprint(southPent, PENT_TOP), pent),
      helpers.withColor(helpers.extrudeFootprint(northPent, PENT_TOP), pent),
    ];
  },
};

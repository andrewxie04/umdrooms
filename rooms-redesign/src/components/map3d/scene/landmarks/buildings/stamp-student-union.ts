// Adele H. Stamp Student Union — way/23543832
//
// Custom builder for the sprawling 1954 Georgian student union on the north
// side of McKeldin Mall (mall facade faces SOUTH). Real-world reference:
// red brick, white trim/cornice lines, a colonnaded main entrance on the
// mall, and connected wings of varying height around a slightly taller
// central block (photos: stamp.umd.edu/visit front exterior column view;
// collegerank.net "four thick columns in front and a red brick façade").
//
// Massing (all derived from bboxOf the real 44-point OSM footprint, which is
// a stepped L/U complex — each wing is built from 2 overlapping rects so
// nothing pokes past the actual walls; the rect that dominates an overlap
// strip is 0.2m taller so no coplanar top faces z-fight):
//   1. base slab      — full footprint, 11m (tagged height), brick
//   2. west wing      — NW + SW rects at 13.0 / 12.8m
//   3. east wing      — NE + SE rects at 12.0 / 11.8m
//   4. central block  — main + north-tower rects at 14.5 / 14.7m
//   5. penthouse      — 0.6x central-block inset cap, darker brick, 15.9m
//   6. cornice rings  — white 0xf5f2ea band caps at the base top (11m) and
//                       the central block top (14.5m)
//   7. mall portico   — low stone platform + 6 thin white column boxes +
//                       white entablature slab, projecting south of the
//                       facade toward the mall
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/23543832',
  spec: {
    name: 'Stamp Student Union',
    color: 0xb5856c, // warm red brick
    roof: 'parapet',
    nightGlow: 0.25,
  },
  maxHeight: 16.5, // penthouse tops out at 15.9m
  build(ctx) {
    const { pts, baseHeight, spec, helpers } = ctx;
    const { minX, minY, maxY } = helpers.bboxOf(pts);

    const brick = helpers.withGlow(spec.color, spec.nightGlow);
    const trim = helpers.withGlow(0xf5f2ea, spec.nightGlow); // white cornice/columns
    const stone = helpers.withGlow(0xe9e5db, spec.nightGlow); // portico platform
    const roofBrick = helpers.darkerShade(brick);

    /** CCW shape-space rectangle. */
    const rect = (x0: number, y0: number, x1: number, y1: number): THREE.Vector2[] => [
      new THREE.Vector2(x0, y0),
      new THREE.Vector2(x1, y0),
      new THREE.Vector2(x1, y1),
      new THREE.Vector2(x0, y1),
    ];
    /** Brick mass extruded from the ground to `h`. */
    const mass = (ring: THREE.Vector2[], h: number, color = brick): THREE.BufferGeometry =>
      helpers.withColor(helpers.extrudeFootprint(ring, h), color);
    /** Thin white cornice band: ring cap from topY to topY + 0.45, outset
     * 0.35 outside the wall and inset 0.4 into the roof (no coplanar walls). */
    const cornice = (ring: THREE.Vector2[], topY: number): THREE.BufferGeometry => {
      const g = helpers.extrudeWithHoles(
        helpers.outsetRing(ring, 0.35),
        [helpers.outsetRing(ring, -0.4)],
        0.45,
      );
      g.translate(0, topY, 0);
      return helpers.withColor(g, trim);
    };

    // -- wing sub-masses (hug the real stepped footprint; see header) --------
    const westSouth = rect(minX + 1.0, minY + 1.2, minX + 28.5, minY + 53.1);
    const westNorth = rect(minX + 4.9, minY + 52.6, minX + 28.5, maxY - 1.2);
    const eastMain = rect(minX + 55.0, minY + 12.6, minX + 96.0, minY + 77.1);
    const eastSouth = rect(minX + 55.0, minY + 4.6, minX + 80.5, minY + 13.6);
    const centerMain = rect(minX + 31.5, minY + 3.1, minX + 54.0, minY + 78.1);
    const centerNorth = rect(minX + 42.5, minY + 77.6, minX + 52.7, minY + 84.4);

    // -- central rooftop penthouse (mechanical block, darker brick) ----------
    const ccx = minX + 42.75;
    const ccy = minY + 40.6;
    const penthouse = helpers.scaleAbout(centerMain, ccx, ccy, 0.6);

    // -- mall-side portico (south facade): platform, columns, entablature ----
    const px0 = minX + 40;
    const px1 = minX + 68;
    const pyFront = minY - 3.6; // projects south, onto the mall walkway
    const pyBack = minY + 0.6; // keyed 0.6m into the facade
    const platform = helpers.withColor(
      helpers.extrudeFootprint(rect(px0, pyFront, px1, pyBack), 0.9),
      stone,
    );
    const colY = minY - 2.4; // near the platform's front edge
    const columns: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const x = px0 + 2.5 + i * 4.6;
      const col = new THREE.BoxGeometry(0.7, 5.6, 0.7);
      col.translate(x, 0.8 + 2.8, -colY); // world: z = -north; base sunk 0.1 into platform
      columns.push(helpers.withColor(col, trim));
    }
    const entablature = new THREE.BoxGeometry(px1 - px0 + 0.8, 1.3, 4.4);
    entablature.translate((px0 + px1) / 2, 6.3 + 0.65, -(minY - 1.6)); // overlaps column tops

    return [
      mass(pts, baseHeight), // 11m full-footprint base
      mass(westSouth, 12.8),
      mass(westNorth, 13.0),
      mass(eastSouth, 11.8),
      mass(eastMain, 12.0),
      mass(centerMain, 14.5),
      mass(centerNorth, 14.7),
      mass(penthouse, 15.9, roofBrick),
      cornice(pts, baseHeight), // continuous Georgian cornice line at 11m
      cornice(centerMain, 14.5), // crown band on the taller central block
      platform,
      ...columns,
      helpers.withColor(entablature, trim),
    ];
  },
};

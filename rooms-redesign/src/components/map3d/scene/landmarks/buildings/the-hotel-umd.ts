// The Hotel at the University of Maryland (way/571025620) — 7777 Baltimore
// Ave. Opened 2017, 10 stories, ~297 rooms, College Park's tallest building
// near campus. Structural reads from exterior photos:
//   - 2-story dark brick/precast podium over the full wedge footprint
//   - 8-story lighter tower slab inset from the podium, regular window grid
//     (suggested here by horizontal spandrel/glass banding every 3.2m)
//   - flat roof: thin parapet + setback mechanical penthouse
//   - entrance canopy slab at the southern tip (drop-off facing the
//     Baltimore Ave / Campus Dr intersection)
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

const PODIUM_H = 6.4; // 2 stories
const FLOOR_H = 3.2; // item: horizontal banding every ~3.2m
const ROOF_Y = 32; // ~10-story slab
const SPANDREL_H = 1.2;

export const landmark: LandmarkModule = {
  id: 'way/571025620',
  spec: {
    name: 'The Hotel at the University of Maryland',
    color: 0xcfc6b4, // light warm precast of the upper slab
    height: 32,
    roof: 'parapet',
    accent: 0x37434c, // window glass
    nightGlow: 0.35,
  },
  maxHeight: 35,
  build(ctx) {
    const { pts, cx, cy, spec, helpers } = ctx;
    const glow = spec.nightGlow;
    const panel = helpers.withGlow(spec.color, glow);
    const glass = helpers.withGlow(spec.accent ?? 0x37434c, glow);
    const podiumColor = helpers.withGlow(0x4f4038, glow);
    const penthouseColor = helpers.withGlow(0x9a9284, glow);
    const canopyColor = helpers.withGlow(0x2e2a26, glow);
    const roofColor = helpers.darkerShade(panel, 0.18);

    // Tower slab sits ON the real footprint: uniform shrink about the
    // centroid keeps the wedge shape simple (no outset self-intersections
    // at the serrated south edge) and leaves a podium ledge all around.
    const towerRing = helpers.scaleAbout(pts, cx, cy, 0.85);
    const glassRing = helpers.outsetRing(towerRing, -0.18); // recessed glazing

    const parts: THREE.BufferGeometry[] = [];

    // 2-story dark brick podium over the full footprint.
    parts.push(helpers.withColor(helpers.extrudeFootprint(pts, PODIUM_H), podiumColor));

    // Tower: stacked spandrel (full ring) + recessed glass bands per floor.
    let y = PODIUM_H;
    let guard = 0;
    while (y < ROOF_Y - 1e-6 && guard++ < 16) {
      const sH = Math.min(SPANDREL_H, ROOF_Y - y);
      const spandrel = helpers.extrudeFootprint(towerRing, sH);
      spandrel.translate(0, y, 0);
      parts.push(helpers.withColor(spandrel, panel));
      y += sH;
      const gH = Math.min(FLOOR_H - SPANDREL_H, ROOF_Y - y);
      if (gH > 0) {
        const band = helpers.extrudeFootprint(glassRing, gH);
        band.translate(0, y, 0);
        parts.push(helpers.withColor(band, glass));
        y += gH;
      }
    }

    // Flat roof: darker cap slab, thin parapet, setback mechanical penthouse.
    const cap = helpers.extrudeFootprint(towerRing, 0.25);
    cap.translate(0, ROOF_Y, 0);
    parts.push(helpers.withColor(cap, roofColor));

    const parapet = helpers.extrudeWithHoles(
      helpers.outsetRing(towerRing, 0.35),
      [towerRing],
      0.9,
    );
    parapet.translate(0, ROOF_Y + 0.25, 0);
    parts.push(helpers.withColor(parapet, panel));

    const tc = helpers.centroidOf(towerRing);
    const penthouseRing = helpers.scaleAbout(towerRing, tc.cx, tc.cy, 0.45);
    const penthouse = helpers.extrudeFootprint(penthouseRing, 1.75);
    penthouse.translate(0, ROOF_Y + 0.25, 0);
    parts.push(helpers.withColor(penthouse, penthouseColor));

    // Entrance canopy slab at the southern tip (shape -y => world +z),
    // tucked 1.5m in from the tip vertex so it anchors to the podium wall.
    let tip = pts[0];
    for (const p of pts) if (p.y < tip.y) tip = p;
    const canopy = new THREE.BoxGeometry(11, 0.6, 5);
    canopy.translate(tip.x, 4.8, -(tip.y - 1.0));
    parts.push(helpers.withColor(canopy, canopyColor));

    return parts;
  },
};

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
    const canopyColor = helpers.withGlow(0x9db8bf, glow); // documented glass entrance canopy
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

    // Continuous dark ribbons made the tower read like an office block.
    // Slim precast mullions break each ribbon into the repeated guest-room
    // window bays visible in the hotel's exterior photographs.
    for (let edge = 0; edge < towerRing.length; edge++) {
      const a = towerRing[edge];
      const b = towerRing[(edge + 1) % towerRing.length];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy);
      if (len < 7) continue;
      const divisions = Math.max(2, Math.round(len / 3.6));
      for (let i = 1; i < divisions; i++) {
        const t = i / divisions;
        const mullion = new THREE.BoxGeometry(0.27, ROOF_Y - PODIUM_H - 0.25, 0.34);
        mullion.rotateY(Math.atan2(dy, dx));
        mullion.translate(a.x + dx * t, (ROOF_Y + PODIUM_H) / 2, -(a.y + dy * t));
        parts.push(helpers.withColor(mullion, panel));
      }
    }

    // Two-story transparent lobby/restaurant glazing within the darker
    // street podium; keep a solid brick corner at each change of direction.
    for (let edge = 0; edge < pts.length; edge++) {
      const a = pts[edge];
      const b = pts[(edge + 1) % pts.length];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy);
      if (len < 12) continue;
      const storefront = new THREE.BoxGeometry(len - 3.5, 3.15, 0.18);
      storefront.rotateY(Math.atan2(dy, dx));
      storefront.translate((a.x + b.x) / 2, 3.15, -(a.y + b.y) / 2);
      parts.push(helpers.withColor(storefront, glass));
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
    const canopyFrame = new THREE.BoxGeometry(11.5, 0.18, 5.4);
    canopyFrame.translate(tip.x, 5.18, -(tip.y - 1.0));
    parts.push(helpers.withColor(canopyFrame, penthouseColor));

    return parts;
  },
};

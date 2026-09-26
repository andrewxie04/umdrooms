// Architecture Building (ARC, 145). The mapped outline includes the narrow
// link to the southern auditorium wing.
// Sources: https://api.drum.lib.umd.edu/server/api/core/bitstreams/3cad3fed-b33b-4cf6-b805-905d7b28ec0c/content
// (p. 5: floor/roof plans, exterior photo, brick veneer, steel-frame glazing)
// https://arch.umd.edu/about/news-and-events/news/display-mapps-kibel-gallery-turns-20-look-behind-exhibits-inspired-school
// (red brick, glazed ground-floor gallery, exposed concrete and steel).
// https://arch.umd.edu/about/news-and-events/news/faculty-promotions-fall-2024
// (Betsy Nolen Petrusic exterior photo: angled brick wall, recessed glazed entry,
// low exposed-concrete canopy).
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { facadePointAt } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23587113',
  spec: { name: 'Architecture Building', color: 0x78483d, height: 6.6 },
  maxHeight: 8.35,
  build(ctx) {
    const { pts, baseHeight, helpers } = ctx;
    const b = helpers.bboxOf(pts);
    const east = (t: number) => b.minX + t * (b.maxX - b.minX);
    const north = (t: number) => b.minY + t * (b.maxY - b.minY);
    const brick = new THREE.Color(0x78483d);
    const brickShade = new THREE.Color(0x673e36);
    const concrete = new THREE.Color(0xa7a19a);
    const roof = new THREE.Color(0x555b5d);
    const roofLight = new THREE.Color(0x767c7c);
    const glass = new THREE.Color(0x465e68);
    const parts: THREE.BufferGeometry[] = [
      helpers.withColor(helpers.extrudeFootprint(pts, baseHeight), brick),
    ];

    // Boxes use east/north coordinates and world-space elevation. The main
    // solid is exactly the supplied OSM ring; roof details sit within it.
    const box = (
      x0: number, x1: number, y0: number, y1: number,
      n0: number, n1: number, color: THREE.Color,
    ) => {
      const geometry = new THREE.BoxGeometry(x1 - x0, y1 - y0, n1 - n0);
      geometry.translate((x0 + x1) / 2, (y0 + y1) / 2, -(n0 + n1) / 2);
      parts.push(helpers.withColor(geometry, color));
    };

    const wallPanel = (side: 'north' | 'south', x0: number, x1: number,
      y0: number, y1: number, offset: number, thickness: number, color: THREE.Color) => {
      const edge = facadePointAt(ctx, side, (x0 + x1) / 2, (x1 - x0) / 2);
      if (!edge) return;
      const geometry = new THREE.BoxGeometry(x1 - x0, y1 - y0, thickness);
      geometry.rotateY(Math.atan2(edge.tn, edge.tx));
      geometry.translate(edge.x + edge.outX * offset, (y0 + y1) / 2,
        -(edge.north + edge.outN * offset));
      parts.push(helpers.withColor(geometry, color));
    };

    // Dark roof fields distinguish the studio bar from the south auditorium.
    box(east(.155), east(.56), baseHeight + .015, baseHeight + .055,
      north(.56), north(.92), roof);
    box(east(.695), east(.955), baseHeight + .015, baseHeight + .055,
      north(.085), north(.33), roof);
    box(east(.715), east(.765), baseHeight + .06, baseHeight + .14,
      north(.14), north(.28), roofLight); // auditorium roof light

    // Six sawtooth skylight monitors occupy the two rows of three shown on
    // the UMD roof plan. Separate glass risers avoid coincident faces.
    const monitor = (x0: number, x1: number, n0: number, n1: number) => {
      const low = baseHeight + .18;
      const high = baseHeight + 1.72;
      const profile = new THREE.Shape();
      profile.moveTo(x0, baseHeight + .07);
      profile.lineTo(x1, baseHeight + .07);
      profile.lineTo(x1, high);
      profile.lineTo(x0, low);
      profile.closePath();
      const shell = new THREE.ExtrudeGeometry(profile, {
        depth: n1 - n0, bevelEnabled: false,
      });
      shell.translate(0, 0, -n1);
      parts.push(helpers.withColor(shell, roofLight));
      box(x1 + .025, x1 + .07, baseHeight + .19, high - .06,
        n0 + .12, n1 - .12, glass);
    };
    for (const [start, end] of [[.18, .265], [.305, .39], [.43, .515]]) {
      monitor(east(start), east(end), north(.59), north(.69));
      monitor(east(start), east(end), north(.77), north(.87));
    }

    // Long, narrow end lights bookend the studio roof in the same plan.
    for (const [a, z] of [[.057, .092], [.695, .73]]) {
      box(east(a), east(z), baseHeight + .08, baseHeight + .27,
        north(.62), north(.89), concrete);
      box(east(a) + .1, east(z) - .1, baseHeight + .285, baseHeight + .325,
        north(.635), north(.875), glass);
    }

    // The photographed brick screen rises to a sharp, sloping edge beside
    // the entrance. It stays over the north bar, clear of the roof lights.
    const screenShape = new THREE.Shape();
    screenShape.moveTo(east(.475), baseHeight + .07);
    screenShape.lineTo(east(.555), baseHeight + .07);
    screenShape.lineTo(east(.555), baseHeight + .18);
    screenShape.lineTo(east(.475), baseHeight + 1.55);
    screenShape.closePath();
    const screen = new THREE.ExtrudeGeometry(screenShape, {
      depth: .35, bevelEnabled: false,
    });
    screen.translate(0, 0, -north(.94));
    parts.push(helpers.withColor(screen, brick));

    // Northern approach: steel-framed bays, brick piers, and a glazed entry
    // beneath an exposed-concrete canopy. Details project just beyond the wall.
    for (const [a, z] of [[.18, .255], [.295, .37], [.41, .485]]) {
      wallPanel('north', east(a), east(z), 1.0, 4.9, .10, .05, glass);
      wallPanel('north', east(a) - .1, east(a) + .055, .92, 5.15,
        .20, .08, brickShade);
      wallPanel('north', east(z) - .055, east(z) + .1, .92, 5.15,
        .20, .08, brickShade);
      wallPanel('north', east(a) + .07, east(z) - .07, 4.98, 5.12,
        .20, .08, concrete);
    }
    wallPanel('north', east(.505), east(.552), .25, 4.15, .11, .06, glass);
    wallPanel('north', east(.527), east(.529), .25, 4.15, .18, .05, roof);
    wallPanel('north', east(.494), east(.563), 4.22, 4.43, .22, .25, concrete);

    // Shallow slit windows emphasize the largely solid brick auditorium.
    for (const a of [.525, .585, .645]) {
      wallPanel('south', east(a), east(a + .026), 2.1, 4.0, .07, .05, glass);
    }
    return parts;
  },
};

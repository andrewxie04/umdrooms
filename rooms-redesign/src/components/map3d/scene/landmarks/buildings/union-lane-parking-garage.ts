// Union Lane Parking Garage (UMD building 179, way/23502756).
// The slabs follow the stepped campus-data.json outline. UMD's building photo
// shows continuous red-brown brick spandrels, long open bays, and pale columns;
// its rooftop photo shows a low perimeter wall and an exposed parking deck.
// The ramp and stair position are schematic: public floor plans require login.
// Sources: https://facilities.umd.edu/node/393
// https://facilities.umd.edu/sites/default/files/UMDBuildings/179.jpg
// https://today.umd.edu/buildings-toward-completion-a6261a6d-f4ba-46b1-b530-3667384a356f
// https://fellercenter.umd.edu/directions/union
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/23502756',
  spec: {
    name: 'Union Lane Parking Garage',
    color: 0x915d4c,
    height: 10.9,
    roof: 'parapet',
  },
  maxHeight: 13.1,
  build({ pts, holes, spec, helpers }) {
    const bounds = helpers.bboxOf(pts);
    const east = (meters: number) => bounds.minX + meters;
    const north = (meters: number) => bounds.minY + meters;
    const brick = new THREE.Color(spec.color);
    const concrete = new THREE.Color(0xc5c7c3);
    const slabColor = new THREE.Color(0x929792);
    const roofColor = new THREE.Color(0xadafaa);
    const shadow = new THREE.Color(0x666b68);
    const metal = new THREE.Color(0x777d7c);
    const glass = new THREE.Color(0x4d5a59);
    const parts: THREE.BufferGeometry[] = [];
    const add = (geometry: THREE.BufferGeometry, color: THREE.Color) => {
      parts.push(helpers.withColor(geometry, color));
    };
    const box = (
      x: number, y: number, n: number,
      width: number, height: number, depth: number,
      color: THREE.Color, angle = 0,
    ) => {
      const geometry = new THREE.BoxGeometry(width, height, depth);
      geometry.rotateY(angle);
      geometry.translate(x, y, -n);
      add(geometry, color);
    };
    const rectangle = (x0: number, x1: number, n0: number, n1: number) => [
      new THREE.Vector2(east(x0), north(n0)),
      new THREE.Vector2(east(x1), north(n0)),
      new THREE.Vector2(east(x1), north(n1)),
      new THREE.Vector2(east(x0), north(n1)),
    ];

    // Four deck surfaces, including the open top, fit the mapped 11 m height.
    // A real hole in each upper slab exposes the internal ramp from above.
    const floors = [0.08, 3.18, 6.28, 9.38];
    const slabDepth = 0.32;
    const rampOpening = rectangle(32.5, 41.5, 33, 67);
    for (let level = 0; level < floors.length; level++) {
      const slab = level === 0
        ? helpers.extrudeWithHoles(pts, holes, slabDepth)
        : helpers.extrudeWithHoles(pts, [...holes, rampOpening], slabDepth);
      slab.translate(0, floors[level], 0);
      add(slab, level === floors.length - 1 ? roofColor : slabColor);
    }

    // The long diagonal north edge faces Fieldhouse Drive. Leave a car-width
    // break in its ground-level curb while retaining the overhead lintel.
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const length = a.distanceTo(b);
      if (length < 0.2) continue;
      const tangent = b.clone().sub(a).divideScalar(length);
      const inward = new THREE.Vector2(-tangent.y, tangent.x);
      const angle = Math.atan2(tangent.y, tangent.x);
      const isEntranceEdge = length > 30 &&
        a.y > bounds.maxY - 11 && b.y > bounds.maxY - 11;
      const edgeBox = (
        from: number, to: number, y: number, height: number,
        depth: number, color: THREE.Color, inset = 0.22,
      ) => {
        const p = a.clone().lerp(b, (from + to) / 2)
          .addScaledVector(inward, inset);
        box(p.x, y, p.y, length * (to - from), height, depth, color, angle);
      };

      if (isEntranceEdge) {
        edgeBox(0, 0.38, 0.76, 0.72, 0.24, brick);
        edgeBox(0.62, 1, 0.76, 0.72, 0.24, brick);
      } else {
        edgeBox(0, 1, 0.76, 0.72, 0.24, brick);
      }
      // Shallow brick bands and white lintels frame three unobstructed bays.
      for (let level = 1; level < floors.length; level++) {
        edgeBox(0, 1, floors[level] + 0.69, 0.98, 0.24, brick);
      }
      for (let level = 0; level < floors.length - 1; level++) {
        edgeBox(0, 1, floors[level + 1] - 0.13, 0.16, 0.28, concrete, 0.34);
      }
      // The uppermost brick band serves as the roof's low safety parapet.
      if (length >= 7) {
        for (let d = 3.4; d < length - 2.2; d += 8.4) {
          const fraction = d / length;
          if (isEntranceEdge && fraction > 0.34 && fraction < 0.66) continue;
          const p = a.clone().lerp(b, fraction).addScaledVector(inward, 0.68);
          box(p.x, 4.78, p.y, 0.62, 8.9, 0.62, concrete, angle);
        }
      }
    }

    // Alternating ramp flights rise 3.1 m over 38 m (about an 8% grade).
    // The upper slabs have a 34 m opening; each flight projects 2 m onto
    // solid deck at either end to form its connection without coplanar faces.
    const rampLength = 38;
    const rise = floors[1] - floors[0];
    for (let level = 0; level < floors.length - 1; level++) {
      const angle = Math.atan2(rise, rampLength) * (level % 2 ? -1 : 1);
      const surfaceMid = floors[level] + slabDepth + rise / 2;
      const ramp = new THREE.BoxGeometry(6.5, 0.22, rampLength);
      ramp.rotateX(angle);
      ramp.translate(east(37), surfaceMid - 0.11, -north(50));
      add(ramp, concrete);
      for (const x of [33.93, 40.07]) {
        const rail = new THREE.BoxGeometry(0.16, 0.55, rampLength - 0.7);
        rail.rotateX(angle);
        rail.translate(east(x), surfaceMid + 0.33, -north(50));
        add(rail, metal);
      }
    }

    // A compact stair/elevator enclosure sits in the wide northern portion.
    // Its dark glazed strip is proud of the wall, so the two faces do not
    // occupy the same plane.
    const core = rectangle(7.5, 14.5, 75, 86);
    add(helpers.extrudeFootprint(core, 11.25), brick);
    box(east(14.52), 6.42, north(80.5), 0.12, 7.6, 2.1, glass);
    box(east(11), 11.31, north(80.5), 7.35, 0.22, 11.35, concrete);

    // A few rooftop light standards echo UMD's rooftop photograph. All
    // bases stay within the mapped outline, clear of the ramp opening.
    for (const [x, n] of [[20, 48], [50, 49], [25, 80]]) {
      const pole = new THREE.CylinderGeometry(0.075, 0.11, 2.65, 6);
      pole.translate(east(x), 11.02, -north(n));
      add(pole, metal);
      box(east(x), 12.42, north(n), 1.2, 0.16, 0.32, shadow);
    }

    return parts;
  },
};

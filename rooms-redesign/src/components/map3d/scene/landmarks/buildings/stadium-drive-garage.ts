// Stadium Drive Garage (UMD building 218). The mapped way is a long crescent,
// with its open side facing the stadium. UMD's exterior photograph shows a
// brick ground-floor arcade, open concrete decks, and glazed stair towers.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/23502759',
  spec: {
    name: 'Stadium Drive Garage',
    color: 0xbdb9ad,
    accent: 0x884b3d,
    height: 14.85,
    roof: 'parapet',
  },
  maxHeight: 15.8,
  build({ pts, helpers }) {
    const concrete = new THREE.Color(0xbdb9ad);
    const light = new THREE.Color(0xd3d0c5);
    const brick = new THREE.Color(0x884b3d);
    const dark = new THREE.Color(0x777770);
    const glazing = new THREE.Color(0x4b5960);
    const parts: THREE.BufferGeometry[] = [];
    const add = (geometry: THREE.BufferGeometry, color: THREE.Color) => {
      parts.push(helpers.withColor(geometry, color));
    };

    // Every slab uses the actual campus-data.json polygon, including the
    // concave stadium-facing edge and the small jogs at either end.
    const floors = [0.08, 3.3, 6.55, 9.8, 13.3];
    const slabDepth = 0.32;
    const box = (
      x: number, y: number, north: number,
      width: number, height: number, depth: number,
      angle: number, color: THREE.Color,
    ) => {
      const geometry = new THREE.BoxGeometry(width, height, depth);
      geometry.rotateY(angle);
      geometry.translate(x, y, -north);
      add(geometry, color);
    };

    // An open strip in the upper deck reveals the last ramp flight. It lies
    // in the broad southern leg of the mapped footprint.
    const bounds = helpers.bboxOf(pts);
    const rampX0 = bounds.minX + 13;
    const rampX1 = bounds.minX + 23;
    const rampY0 = bounds.minY + 21;
    const rampY1 = bounds.minY + 57;
    const rampOpening = [
      new THREE.Vector2(rampX0, rampY0),
      new THREE.Vector2(rampX1, rampY0),
      new THREE.Vector2(rampX1, rampY1),
      new THREE.Vector2(rampX0, rampY1),
    ];
    for (let level = 0; level < floors.length; level++) {
      const slab = level === floors.length - 1
        ? helpers.extrudeWithHoles(pts, [rampOpening], slabDepth)
        : helpers.extrudeFootprint(pts, slabDepth);
      slab.translate(0, floors[level], 0);
      add(slab, level === floors.length - 1 ? light : concrete);
    }

    // A sloping solid deck connects the fourth floor to the open top.
    // Its rectangular opening and the ramp itself have separate surfaces,
    // so neither is coplanar with the surrounding roof slab.
    const rampStart = floors[3] + slabDepth;
    const rampEnd = floors[4] + slabDepth;
    const rampCenterX = (rampX0 + rampX1) / 2;
    const rampCenterY = (rampY0 + rampY1) / 2;
    const rampLength = rampY1 - rampY0;
    const ramp = new THREE.BoxGeometry(rampX1 - rampX0 - 0.35, 0.22, rampLength - 0.35);
    ramp.rotateX(Math.atan2(rampEnd - rampStart, rampLength));
    ramp.translate(rampCenterX, (rampStart + rampEnd) / 2, -rampCenterY);
    add(ramp, dark);
    for (const x of [rampX0 + 0.32, rampX1 - 0.32]) {
      const rail = new THREE.BoxGeometry(0.22, 0.65, rampLength - 0.5);
      rail.rotateX(Math.atan2(rampEnd - rampStart, rampLength));
      rail.translate(x, (rampStart + rampEnd) / 2 + 0.49, -rampCenterY);
      add(rail, light);
    }

    // Rail bands track every real polygon edge. Thin rails and widely spaced
    // piers leave deep, unobstructed horizontal bays between deck plates.
    let walked = 0;
    let nextPier = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const edge = b.clone().sub(a);
      const length = edge.length();
      if (length < 0.08) continue;
      const tangent = edge.clone().divideScalar(length);
      const inward = new THREE.Vector2(-tangent.y, tangent.x);
      const angle = Math.atan2(tangent.y, tangent.x);
      const middle = a.clone().add(b).multiplyScalar(0.5);
      const strip = middle.clone().addScaledVector(inward, 0.26);

      // The lower brick spandrel reads as an arcade rather than a solid wall.
      box(strip.x, 0.86, strip.y, length, 0.92, 0.22, angle, brick);
      box(strip.x, 3.02, strip.y, length, 0.55, 0.25, angle, brick);
      for (let level = 1; level < floors.length - 1; level++) {
        const sill = floors[level] + slabDepth;
        box(strip.x, sill + 0.37, strip.y, length, 0.38, 0.22, angle, light);
        box(strip.x, sill + 1.03, strip.y, length, 0.15, 0.18, angle, light);
      }
      box(strip.x, floors[4] + slabDepth + 0.59, strip.y,
        length, 1.16, 0.29, angle, light);

      while (nextPier < walked + length) {
        const t = (nextPier - walked) / length;
        const point = a.clone().lerp(b, t).addScaledVector(inward, 0.67);
        box(point.x, 6.86, point.y, 0.8, 13.02, 0.75, angle,
          point.x < bounds.minX + (bounds.maxX - bounds.minX) * 0.57 ? brick : concrete);
        nextPier += 8.2;
      }
      walked += length;
    }

    // The photographed stair enclosure rises just above the parking rails.
    // Anchor it to the western outside curve and pull it inside the footprint.
    const targetY = bounds.minY + (bounds.maxY - bounds.minY) * 0.56;
    let towerPoint = pts[0];
    let towerEdge = new THREE.Vector2(1, 0);
    let nearest = Infinity;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const score = Math.abs(p.y - targetY) * 2 + (p.x - bounds.minX);
      if (score < nearest) {
        nearest = score;
        towerPoint = p;
        towerEdge = pts[(i + 1) % pts.length].clone().sub(p).normalize();
      }
    }
    const inward = new THREE.Vector2(-towerEdge.y, towerEdge.x);
    const towerCenter = towerPoint.clone().addScaledVector(inward, 3.7);
    const towerAngle = Math.atan2(towerEdge.y, towerEdge.x);
    box(towerCenter.x, 7.1, towerCenter.y, 5.3, 14.2, 4.6, towerAngle, brick);
    box(towerCenter.x, 14.72, towerCenter.y, 4.95, 1.65, 4.28, towerAngle, glazing);
    box(towerCenter.x, 15.66, towerCenter.y, 5.55, 0.28, 4.85, towerAngle, dark);

    return parts;
  },
};

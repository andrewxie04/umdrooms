// Atlantic Building (#224), formerly Computer and Space Sciences.
// UMD's exterior photo shows a four-story red-brick range, pale horizontal
// trim, and the tall curved glass entrance on the south plaza frontage.
// Sources: https://aosc.umd.edu/about-us/visitor-guide/directions
// https://facilities.umd.edu/sites/default/files/UMDBuildings/224.jpg
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { box, color, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23579495',
  spec: {
    name: 'Atlantic Building',
    color: 0x975749,
    accent: 0x66858a,
    height: 15.2,
    roof: 'parapet',
  },
  maxHeight: 18.35,
  build(ctx) {
    const { pts, helpers } = ctx;
    const b = helpers.bboxOf(pts);
    const width = b.maxX - b.minX;
    const centerX = b.minX + width * 0.49;
    const faceN = b.minY;
    const radius = 4.25;
    const parts: Parts = [];
    const brick = color(0x975749);
    const stone = color(0xcfc7b9);
    const slate = color(0x606669);
    const glass = [color(0x5c7982), color(0x66868e), color(0x749096)];

    // Preserve every wing and recess of the mapped outline. The OSM 11 m
    // height is an unqualified fallback; UMD's exterior photo clearly shows
    // four occupied levels below the parapet.
    parts.push(helpers.withColor(helpers.extrudeFootprint(pts, 15.2), brick));
    const roof = helpers.extrudeFootprint(pts, 0.08);
    roof.translate(0, 15.24, 0);
    parts.push(helpers.withColor(roof, slate));
    // This outline has deep U-shaped recesses. Offset-and-hole extrusion
    // crosses itself at their tight corners, so the parapet is built as a
    // narrow vertical face along each actual boundary edge instead.
    const parapetVertices: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], z = pts[(i + 1) % pts.length];
      const dx = z.x - a.x, dn = z.y - a.y;
      const len = Math.hypot(dx, dn);
      if (len < 0.12) continue;
      const offX = dn / len * 0.10;
      const offN = -dx / len * 0.10;
      const ax = a.x + offX, az = -(a.y + offN);
      const bx = z.x + offX, bz = -(z.y + offN);
      parapetVertices.push(
        ax, 15.29, az, bx, 15.29, bz, bx, 15.64, bz,
        ax, 15.29, az, bx, 15.64, bz, ax, 15.64, az,
      );
    }
    const parapet = new THREE.BufferGeometry();
    parapet.setAttribute('position', new THREE.Float32BufferAttribute(parapetVertices, 3));
    parapet.computeVertexNormals();
    parts.push(helpers.withColor(parapet, stone));

    // The two main south-facing brick ranges have the thin pale story bands
    // seen in the photo. They project slightly beyond the masonry surface.
    for (const y of [4.30, 8.05, 11.82]) {
      box(ctx, parts, b.minX + width * 0.385, b.minX + width * 0.59,
        faceN - 0.19, faceN + 0.04, y, y + 0.22, stone);
      box(ctx, parts, b.minX + width * 0.795, b.maxX - 0.8,
        faceN - 0.19, faceN + 0.04, y, y + 0.22, stone);
    }

    // Broad, evenly spaced windows are more faithful to the 1996-renovated
    // exterior than the scene's small generic window grid. Follow the real
    // outer edges so the bays also turn around the long side wings.
    const windowTrim = color(0xbdbbb2);
    const windowGlass = color(0x69818a);
    for (let edge = 0; edge < pts.length; edge++) {
      const a = pts[edge], z = pts[(edge + 1) % pts.length];
      const dx = z.x - a.x, dn = z.y - a.y;
      const len = Math.hypot(dx, dn);
      if (len < 6.2) continue;
      const tx = dx / len, tn = dn / len;
      const outX = tn, outN = -tx;
      const angle = Math.atan2(tn, tx);
      const count = Math.max(1, Math.floor((len - 2.8) / 4.25));
      for (let column = 0; column < count; column++) {
        const distance = (column + 0.5) * len / count;
        const x = a.x + tx * distance;
        const north = a.y + tn * distance;
        if (north < faceN + 0.8 && Math.abs(x - centerX) < radius + 1.4) continue;
        for (const floor of [1.28, 5.03, 8.78, 12.53]) {
          const trim = new THREE.BoxGeometry(2.02, 2.03, 0.10);
          trim.rotateY(angle);
          trim.translate(x + outX * 0.13, floor + 1.015,
            -(north + outN * 0.13));
          parts.push(helpers.withColor(trim, windowTrim));
          const pane = new THREE.BoxGeometry(1.66, 1.67, 0.08);
          pane.rotateY(angle);
          pane.translate(x + outX * 0.21, floor + 1.015,
            -(north + outN * 0.21));
          parts.push(helpers.withColor(pane, windowGlass));
        }
      }
    }

    // The photographed south entrance is a curved, full-height glass bay.
    // An open arc of vertical panels keeps the brick mass behind it; drawing
    // the facade as a cylinder would fill the lobby with an opaque drum.
    const arcSegments = 14;
    const top = 14.15;
    for (let i = 0; i < arcSegments; i++) {
      const a = Math.PI + i * Math.PI / arcSegments;
      const z = Math.PI + (i + 1) * Math.PI / arcSegments;
      const ax = centerX + Math.cos(a) * radius;
      const an = faceN + Math.sin(a) * radius;
      const bx = centerX + Math.cos(z) * radius;
      const bn = faceN + Math.sin(z) * radius;
      const positions = new Float32Array([
        ax, 0.72, -an, bx, 0.72, -bn, bx, top, -bn,
        ax, 0.72, -an, bx, top, -bn, ax, top, -an,
      ]);
      const panel = new THREE.BufferGeometry();
      panel.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      panel.computeVertexNormals();
      parts.push(helpers.withColor(panel, glass[i % glass.length]));
    }
    for (let i = 0; i <= arcSegments; i += 2) {
      const angle = Math.PI + i * Math.PI / arcSegments;
      const x = centerX + Math.cos(angle) * radius;
      const north = faceN + Math.sin(angle) * radius;
      const mullion = new THREE.CylinderGeometry(0.105, 0.105, top - 0.70, 6);
      mullion.translate(x, (top + 0.70) / 2, -north);
      parts.push(helpers.withColor(mullion, stone));
    }
    // Slim floor divisions follow the curvature, with each level set just
    // forward of the glass so the band never shares its exact surface.
    for (const y of [4.31, 8.05, 11.82, 14.17]) {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= arcSegments; i++) {
        const angle = Math.PI + i * Math.PI / arcSegments;
        points.push(new THREE.Vector3(
          centerX + Math.cos(angle) * (radius + 0.13), y,
          -(faceN + Math.sin(angle) * (radius + 0.13)),
        ));
      }
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i], z = points[i + 1];
        const length = a.distanceTo(z);
        const band = new THREE.BoxGeometry(length, 0.17, 0.20);
        band.rotateY(Math.atan2(-(z.z - a.z), z.x - a.x));
        band.translate((a.x + z.x) / 2, y, (a.z + z.z) / 2);
        parts.push(helpers.withColor(band, stone));
      }
    }

    // Dark inset doors, landing, and shallow steps at the plaza entrance.
    box(ctx, parts, centerX - 2.20, centerX + 2.20,
      faceN - radius - 0.27, faceN - radius - 0.14,
      0.80, 3.38, color(0x354a52));
    box(ctx, parts, centerX - 0.08, centerX + 0.08,
      faceN - radius - 0.31, faceN - radius - 0.23,
      0.80, 3.38, stone);
    for (let i = 0; i < 3; i++) {
      const outward = radius + 0.28 + i * 0.52;
      box(ctx, parts, centerX - 4.3, centerX + 4.3,
        faceN - outward - 0.50, faceN - outward,
        0.02, 0.47 - i * 0.13, stone);
    }

    // The brick triangular crown above the glass bay is a distinctive part
    // of the photographed entrance silhouette.
    const crown = new THREE.Shape([
      new THREE.Vector2(-6.1, 0), new THREE.Vector2(6.1, 0),
      new THREE.Vector2(0, 2.45),
    ]);
    const crownGeom = new THREE.ExtrudeGeometry(crown, {
      depth: 1.25, bevelEnabled: false,
    });
    crownGeom.translate(centerX, 15.60, -(faceN + 1.0));
    parts.push(helpers.withColor(crownGeom, brick));

    // Small rooftop mechanical housings, set back from the glass frontage.
    for (const [xFrac, nFrac, w, d, h] of [
      [0.22, 0.76, 5.2, 4.2, 1.15],
      [0.86, 0.72, 6.2, 4.1, 1.35],
    ] as const) {
      const x = b.minX + width * xFrac;
      const north = b.minY + (b.maxY - b.minY) * nFrac;
      box(ctx, parts, x - w / 2, x + w / 2, north - d / 2, north + d / 2,
        15.41, 15.41 + h, color(0x9da3a1));
    }
    return parts;
  },
};

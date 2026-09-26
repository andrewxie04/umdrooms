import * as THREE from 'three';
import type { LandmarkBuildContext, LandmarkModule } from '../types';
import { box, brickShell, color, hip, portico, stripWindows, type Parts } from './historic-central-parts';

function addQueenAnnesHall(ctx: LandmarkBuildContext): Parts {
  const parts: Parts = [];
  const brick = color(0x955741);
  const white = color(0xe7e2d5);
  const slate = color(0x535961);
  const glass = color(0x4b5c62);
  const b = ctx.helpers.bboxOf(ctx.pts);
  const x = (fraction: number) => b.minX + (b.maxX - b.minX) * fraction;
  const center = x(0.16);

  brickShell(ctx, parts, 11.35, brick, white, slate);
  // A long east-west block joins the perpendicular south wing. Two separate
  // roofs preserve the L-like outline instead of capping its courtyard.
  hip(ctx, parts, [0.01, 0.99, 0.51, 0.99], 11.48, 3.05, slate);
  hip(ctx, parts, [0.64, 0.95, 0.02, 0.58], 11.48, 2.70, slate);

  // Brick front gable behind the white four-column entrance.
  const half = 7.4;
  const gableBase = 11.48;
  const gableTop = 16.05;
  const gable = new THREE.Shape([
    new THREE.Vector2(-half, 0), new THREE.Vector2(half, 0),
    new THREE.Vector2(0, gableTop - gableBase),
  ]);
  const gableGeom = new THREE.ExtrudeGeometry(gable, { depth: 6.1, bevelEnabled: false });
  gableGeom.translate(center, gableBase, -b.maxY);
  parts.push(ctx.helpers.withColor(gableGeom, brick));
  for (const direction of [-1, 1]) {
    const beam = new THREE.BoxGeometry(Math.hypot(half, gableTop - gableBase), 0.24, 0.44);
    beam.rotateZ(-direction * Math.atan2(gableTop - gableBase, half));
    beam.translate(center + direction * half / 2, (gableBase + gableTop) / 2,
      -b.maxY - 0.17);
    parts.push(ctx.helpers.withColor(beam, white));
  }
  portico(ctx, parts, {
    side: 'north', center: 0.16, width: 10.4, depth: 2.8,
    columns: 4, baseY: 1.20, columnHeight: 7.30,
  }, white, glass);
  for (let step = 0; step < 3; step++) {
    box(ctx, parts, center - 5.7 - step * 0.45, center + 5.7 + step * 0.45,
      b.maxY + 2.0 + step * 0.62, b.maxY + 2.83 + step * 0.62,
      0, 1.14 - step * 0.29, white);
  }

  stripWindows(ctx, parts, 'north', [0.35, 0.94], [1.05, 4.24, 7.43], 6, white, glass);
  stripWindows(ctx, parts, 'south', [0.04, 0.60], [1.05, 4.24, 7.43], 5, white, glass);
  stripWindows(ctx, parts, 'east', [0.06, 0.54], [1.05, 4.24, 7.43], 3, white, glass);

  // White dormers cut into the dark roof beyond the gable.
  for (const fraction of [0.42, 0.55, 0.72, 0.86]) {
    const dx = x(fraction);
    const north = b.maxY - 1.45;
    box(ctx, parts, dx - 0.90, dx + 0.90, north - 0.85, north + 0.85,
      11.63, 13.52, white);
    box(ctx, parts, dx - 0.50, dx + 0.50, north + 0.86, north + 0.98,
      11.92, 13.30, glass);
    box(ctx, parts, dx - 1.03, dx + 1.03, north - 1.0, north + 1.0,
      13.52, 13.72, slate);
  }
  return parts;
}

export const landmark: LandmarkModule = {
  id: 'way/23891414',
  spec: { name: "Queen Anne's Hall", color: 0x955741, height: 14.8, roof: 'hipped' },
  maxHeight: 16.2,
  build: addQueenAnnesHall,
};

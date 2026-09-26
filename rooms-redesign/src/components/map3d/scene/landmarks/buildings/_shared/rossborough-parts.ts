import * as THREE from 'three';
import type { LandmarkBuildContext } from '../../types';

type Point = { u: number; v: number };
type Wall = { x: number; north: number; angle: number; outX: number; outN: number };
type Basis = {
  ux: number; un: number; vx: number; vn: number;
  minU: number; maxU: number; minV: number; maxV: number;
  angle: number;
};

function basisFor(ctx: LandmarkBuildContext, main: boolean): Basis {
  const desired = main ? new THREE.Vector2(0, 1) : new THREE.Vector2(1, 0);
  let edge = desired.clone();
  let score = -Infinity;
  for (let i = 0; i < ctx.pts.length; i++) {
    const delta = ctx.pts[(i + 1) % ctx.pts.length].clone().sub(ctx.pts[i]);
    const length = delta.length();
    if (length < 2) continue;
    const candidate = delta.multiplyScalar(1 / length);
    const candidateScore = length * (0.45 + 0.55 * Math.abs(candidate.dot(desired)));
    if (candidateScore > score) { edge = candidate; score = candidateScore; }
  }
  if (edge.dot(desired) < 0) edge.negate();
  const ux = edge.x, un = edge.y, vx = -un, vn = ux;
  const projected: Point[] = ctx.pts.map(p => ({
    u: (p.x - ctx.cx) * ux + (p.y - ctx.cy) * un,
    v: (p.x - ctx.cx) * vx + (p.y - ctx.cy) * vn,
  }));
  return {
    ux, un, vx, vn, angle: Math.atan2(un, ux),
    minU: Math.min(...projected.map(p => p.u)), maxU: Math.max(...projected.map(p => p.u)),
    minV: Math.min(...projected.map(p => p.v)), maxV: Math.max(...projected.map(p => p.v)),
  };
}

/** Both mapped Rossborough footprints use the current, post-1939 gabled form.
 * The north-south main block has an east front; the narrower westward wing is
 * lower. Angles follow each surveyed footprint instead of the map axes. */
export function buildRossborough(ctx: LandmarkBuildContext, main: boolean): THREE.BufferGeometry[] {
  const b = basisFor(ctx, main);
  const projected = ctx.pts.map(p => ({
    u: (p.x - ctx.cx) * b.ux + (p.y - ctx.cy) * b.un,
    v: (p.x - ctx.cx) * b.vx + (p.y - ctx.cy) * b.vn,
  }));
  const winding = Math.sign(ctx.pts.reduce((sum, p, i) => {
    const next = ctx.pts[(i + 1) % ctx.pts.length];
    return sum + p.x * next.y - next.x * p.y;
  }, 0)) || 1;
  // Resolve each bay against the surveyed wall crossing its position. The inn
  // has several setbacks; its bounding rectangle is only suitable for the roof.
  const wallAt = (u: number, side: number, clearance = 1.35): Wall | undefined => {
    let selected: Wall | undefined;
    let extreme = side < 0 ? Infinity : -Infinity;
    for (let i = 0; i < ctx.pts.length; i++) {
      const a = projected[i], next = projected[(i + 1) % projected.length];
      const du = next.u - a.u;
      if (Math.abs(du) < 0.01) continue;
      const t = (u - a.u) / du;
      const pa = ctx.pts[i], pb = ctx.pts[(i + 1) % ctx.pts.length];
      const dx = pb.x - pa.x, dn = pb.y - pa.y;
      const length = Math.hypot(dx, dn);
      if (t * length < clearance || (1 - t) * length < clearance) continue;
      const outX = winding * dn / length, outN = -winding * dx / length;
      if ((outX * b.vx + outN * b.vn) * side < 0.6) continue;
      const v = a.v + (next.v - a.v) * t;
      if (selected && (side < 0 ? v >= extreme : v <= extreme)) continue;
      extreme = v;
      selected = { x: pa.x + dx * t, north: pa.y + dn * t,
        angle: Math.atan2(dn, dx), outX, outN };
    }
    return selected;
  };
  const parts: THREE.BufferGeometry[] = [];
  const brick = new THREE.Color(main ? 0x8c4d3e : 0x915543);
  const mortar = new THREE.Color(0xd6cfbd);
  const sash = new THREE.Color(0xe8e4d5);
  const shutters = new THREE.Color(0x354a3c);
  const glass = new THREE.Color(0x394b50);
  const slate = new THREE.Color(0x51585b);
  const ridge = new THREE.Color(0x444c4e);
  const wallHeight = main ? 7.9 : 5.65;
  const roofTop = main ? 11.25 : 8.8;

  const colorPart = (g: THREE.BufferGeometry, c: THREE.Color) =>
    parts.push(ctx.helpers.withColor(g, c));
  const localBox = (u0: number, u1: number, v0: number, v1: number,
    y0: number, y1: number, c: THREE.Color) => {
    const g = new THREE.BoxGeometry(u1 - u0, y1 - y0, v1 - v0);
    g.rotateY(b.angle);
    const u = (u0 + u1) / 2, v = (v0 + v1) / 2;
    g.translate(ctx.cx + u * b.ux + v * b.vx, (y0 + y1) / 2,
      -(ctx.cy + u * b.un + v * b.vn));
    colorPart(g, c);
  };
  const wallBox = (wall: Wall, width: number, depth: number, offset: number,
    y0: number, y1: number, shade: THREE.Color, shift = 0) => {
    const g = new THREE.BoxGeometry(width, y1 - y0, depth);
    g.rotateY(wall.angle);
    const alongX = Math.cos(wall.angle), alongN = Math.sin(wall.angle);
    g.translate(wall.x + wall.outX * offset + alongX * shift,
      (y0 + y1) / 2, -(wall.north + wall.outN * offset + alongN * shift));
    colorPart(g, shade);
  };
  const vertex = (u: number, v: number, y: number): [number, number, number] => [
    ctx.cx + u * b.ux + v * b.vx, y, -(ctx.cy + u * b.un + v * b.vn),
  ];
  const roofTriangles: number[] = [];
  const triangle = (a: number[], c: number[], d: number[]) => {
    const va = new THREE.Vector3(...(a as [number, number, number]));
    const vc = new THREE.Vector3(...(c as [number, number, number]));
    const vd = new THREE.Vector3(...(d as [number, number, number]));
    const normal = vc.clone().sub(va).cross(vd.clone().sub(va));
    const order = normal.y < 0 ? [a, d, c] : [a, c, d];
    roofTriangles.push(...order[0], ...order[1], ...order[2]);
  };

  // The OSM perimeter controls the walls. The roof alone regularizes the
  // complex outline into the recognizable long gable from university photos.
  colorPart(ctx.helpers.extrudeFootprint(ctx.pts, wallHeight), brick);
  colorPart(ctx.helpers.extrudeFootprint(ctx.helpers.outsetRing(ctx.pts, 0.10), 0.43), mortar);
  // Finish the stone cornice above the brick shell's top face so the two
  // upward caps cannot trade depth while orbiting the inn.
  colorPart(ctx.helpers.extrudeFootprint(ctx.helpers.outsetRing(ctx.pts, 0.11), 0.34)
    .translate(0, wallHeight - 0.24, 0), mortar);

  const u0 = b.minU - 0.25, u1 = b.maxU + 0.25;
  const v0 = b.minV - 0.35, v1 = b.maxV + 0.35;
  const midV = (v0 + v1) / 2;
  for (const edgeV of [v0, v1]) {
    triangle(vertex(u0, edgeV, wallHeight), vertex(u1, edgeV, wallHeight), vertex(u1, midV, roofTop));
    triangle(vertex(u0, edgeV, wallHeight), vertex(u1, midV, roofTop), vertex(u0, midV, roofTop));
  }
  const roof = new THREE.BufferGeometry();
  roof.setAttribute('position', new THREE.Float32BufferAttribute(roofTriangles, 3));
  roof.computeVertexNormals();
  colorPart(roof, slate);
  // Close both gable ends so the brick attic remains visible below the ridge.
  for (const endU of [u0, u1]) {
    const ends = new THREE.BufferGeometry();
    ends.setAttribute('position', new THREE.Float32BufferAttribute([
      ...vertex(endU, v0, wallHeight), ...vertex(endU, v1, wallHeight),
      ...vertex(endU, midV, roofTop),
    ], 3));
    ends.computeVertexNormals();
    colorPart(ends, brick);
  }
  localBox(u0, u1, midV - 0.10, midV + 0.10, roofTop - 0.11, roofTop + 0.12, ridge);
  for (const edgeV of [v0, v1]) {
    localBox(u0, u1, edgeV - 0.14, edgeV + 0.14, wallHeight - 0.12, wallHeight + 0.10, mortar);
  }

  // White six-over-six sash and dark green shutters are the details that
  // distinguish the inn from the newer brick campus halls at map scale.
  const bayCount = main ? 5 : 3;
  for (const side of [-1, 1]) {
    for (let i = 0; i < bayCount; i++) {
      if (main && side === -1 && i === 2) continue; // east main entrance
      const u = b.minU + (b.maxU - b.minU) * (i + 0.5) / bayCount;
      const wall = wallAt(u, side);
      if (!wall) continue;
      for (const y of main ? [1.30, 4.45] : [1.12]) {
        wallBox(wall, 1.64, 0.14, 0.15, y - 0.14, y + 2.06, sash);
        wallBox(wall, 1.32, 0.05, 0.24, y, y + 1.88, glass);
        wallBox(wall, 0.06, 0.08, 0.27, y, y + 1.88, sash);
        wallBox(wall, 1.36, 0.08, 0.27, y + 0.94, y + 1.02, sash);
        for (const t of [-1, 1]) {
          wallBox(wall, 0.5, 0.14, 0.15, y - 0.07, y + 2.01, shutters, t * 0.96);
        }
      }
    }
  }

  if (main) {
    const u = (b.minU + b.maxU) / 2;
    const front = wallAt(u, -1, 1.7);
    if (front) {
      wallBox(front, 2.24, 0.14, 0.24, 0.42, 3.77, sash);
      wallBox(front, 1.64, 0.08, 0.34, 0.48, 3.18, new THREE.Color(0x353f36));
      wallBox(front, 2.92, 0.38, 0.36, 3.76, 4.02, mortar);
      for (let step = 0; step < 3; step++) {
        wallBox(front, 3.3 + step * 0.4, 1.1 + step * 0.3,
          0.6 + step * 0.2, 0, 0.48 - step * 0.14, mortar);
      }
    }
  }

  // The dormers sit on the lower half of each roof slope and face the same
  // direction as the first-floor window rows. Their white pediments and dark
  // glazing break up the long slate surface in the current Facilities photo.
  const dormerCount = main ? 3 : 2;
  for (const side of [-1, 1]) {
    const slopeV = midV + side * (v1 - v0) * 0.31;
    for (let i = 0; i < dormerCount; i++) {
      const u = b.minU + (b.maxU - b.minU) * (i + 0.5) / dormerCount;
      const lower = wallHeight + (roofTop - wallHeight) * 0.35;
      localBox(u - 0.83, u + 0.83, slopeV - 0.60, slopeV + 0.60,
        lower, lower + 1.95, sash);
      localBox(u - 0.58, u + 0.58,
        slopeV + side * 0.61 - 0.07, slopeV + side * 0.61 + 0.07,
        lower + 0.20, lower + 1.62, glass);
      localBox(u - 1.0, u + 1.0, slopeV - 0.76, slopeV + 0.76,
        lower + 1.91, lower + 2.16, slate);
    }
  }
  localBox(u1 - 2.5, u1 - 1.2, midV - 0.75, midV + 0.75,
    roofTop - 1.0, roofTop + 1.55, brick);
  localBox(u1 - 2.64, u1 - 1.06, midV - 0.90, midV + 0.90,
    roofTop + 1.50, roofTop + 1.76, mortar);
  return parts;
}

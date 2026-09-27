import * as THREE from 'three';
import type { CampusData } from './types';
import type { Projection } from './projection';
import { ringToShapePoints } from './geom-utils';

export type Sport = 'football' | 'soccer' | 'baseball';
export interface SportsFrame { sport: Sport; x: number; z: number; y: number; angle: number }

/** Football uses the same four stadium-opening corners as the modeled turf. */
export function sportsFrames(data: CampusData, proj: Projection): SportsFrame[] {
  const frames: SportsFrame[] = [];
  const stadium = data.buildings.find(b => b.id === 'way/980371045');
  if (stadium) {
    const pts = ringToShapePoints(stadium.footprint, proj);
    const edges = pts.map((p, i) => ({ i, length: p.distanceTo(pts[(i + 1) % pts.length]) }))
      .sort((a, b) => b.length - a.length);
    const a = pts[edges[0].i], b = pts[(edges[0].i + 1) % pts.length];
    const c = pts[edges[1].i], d = pts[(edges[1].i + 1) % pts.length];
    frames.push({ sport: 'football', x: (a.x + b.x + c.x + d.x) / 4,
      z: -(a.y + b.y + c.y + d.y) / 4, y: 1.16,
      angle: Math.atan2(b.x - a.x, -(b.y - a.y)) });
  }
  // Centers/home plate inside the existing mapped Ludwig and Shipley pitches.
  for (const [sport, lng, lat] of [
    ['soccer', -76.950530, 38.988153],
    ['baseball', -76.944520, 38.988930],
  ] as const) {
    const p = proj.toLocal(lng, lat);
    frames.push({ sport, ...p, y: 0.23, angle: 0 });
  }
  return frames;
}

/** Continuous flight with exact endpoints, shared by passes, kicks and pitches. */
export function ballArc(t: number, start: number, end: number, height: number): number {
  return start + (end - start) * t + 4 * height * t * (1 - t);
}

const RED = 0xb62e3b, WHITE = 0xe7e2d3, DARK = 0x292b2a;
const BASES = [[0, 0], [19.4, -19.4], [0, -38.8], [-19.4, -19.4], [0, 0]];
const GOAL_ENDS = [-48, 48];
const skin = [0xc9926d, 0x80583e, 0xdab18d, 0xa47351];

/** Two instanced draws per venue. No timers, skinned rigs, textures or shadows. */
export function initSports(scene: THREE.Scene, camera: THREE.Camera, data: CampusData, proj: Projection) {
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const sphereGeometry = new THREE.IcosahedronGeometry(1, 1);
  const material = new THREE.MeshStandardMaterial({ roughness: 0.92 });
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const frustum = new THREE.Frustum();
  const matrix = new THREE.Matrix4();
  const venues = sportsFrames(data, proj).map(frame => {
    const root = new THREE.Group();
    root.name = `mini-${frame.sport}`;
    root.position.set(frame.x, frame.y, frame.z);
    root.rotation.y = frame.angle;
    const boxes = new THREE.InstancedMesh(boxGeometry, material, 160);
    const rounds = new THREE.InstancedMesh(sphereGeometry, material, 32);
    for (const mesh of [boxes, rounds]) {
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      // Visibility is controlled by the full venue sphere below; initial
      // instance bounds would become stale when players run across the field.
      mesh.frustumCulled = false;
    }
    root.add(boxes, rounds);
    scene.add(root);
    return { frame, root, boxes, rounds,
      bounds: new THREE.Sphere(new THREE.Vector3(frame.x, frame.y, frame.z), 110) };
  });
  let elapsed = 0;
  let bi = 0, ri = 0;
  let boxes: THREE.InstancedMesh, rounds: THREE.InstancedMesh;
  const part = (round: boolean, x: number, y: number, z: number,
    sx: number, sy: number, sz: number, tint: number, yaw = 0, tilt = 0) => {
    dummy.position.set(x, y, z);
    dummy.rotation.set(tilt, yaw, 0, 'YXZ');
    dummy.scale.set(sx, sy, sz);
    dummy.updateMatrix();
    const mesh = round ? rounds : boxes;
    const index = round ? ri++ : bi++;
    mesh.setMatrixAt(index, dummy.matrix);
    mesh.setColorAt(index, color.setHex(tint));
  };
  const player = (id: number, x: number, z: number, yaw: number, team: boolean,
    run = 0, action = 0, kick = 0, helmet = false) => {
    const jersey = team ? WHITE : RED;
    const stride = Math.sin(elapsed * 9 + id) * run;
    const cs = Math.cos(yaw), sn = Math.sin(yaw);
    const limb = (dx: number, y: number, dz: number, sx: number, sy: number, sz: number, tint: number, tilt = 0) =>
      part(false, x + dx * cs + dz * sn, y, z - dx * sn + dz * cs, sx, sy, sz, tint, yaw, tilt);
    limb(0, 1.8, 0, 0.95, 1.05, 0.52, jersey);
    limb(0, 1.17, 0, 0.82, 0.35, 0.5, team ? RED : WHITE);
    part(true, x, 2.7, z, 0.36, 0.4, 0.36, helmet ? jersey : skin[id % skin.length]);
    limb(-0.26, 0.62, stride * 0.3, 0.29, 1, 0.31, DARK, stride);
    limb(0.26, 0.62 + kick * 0.25, -stride * 0.3 - kick * 0.55, 0.29, 1, 0.31, DARK, -stride - kick);
    limb(-0.66, 1.77, -stride * 0.15, 0.26, 0.92, 0.27, jersey, -stride);
    limb(0.66, 1.8 + action * 0.4, -action * 0.25, 0.26, 0.92, 0.27, jersey, stride - action * 1.8);
  };
  const ball = (x: number, y: number, z: number, football = false) =>
    part(true, x, y, z, football ? 0.3 : 0.32, football ? 0.3 : 0.32,
      football ? 0.53 : 0.32, football ? 0x78452b : WHITE, elapsed * 5);
  const segment = (ax: number, az: number, bx: number, bz: number) => {
    part(false, (ax + bx) / 2, 0.03, (az + bz) / 2, 0.16, 0.025,
      Math.hypot(bx - ax, bz - az), WHITE, Math.atan2(bx - ax, bz - az));
  };
  return {
    update(dt: number): boolean {
      elapsed += dt;
      camera.updateMatrixWorld();
      matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(matrix);
      let changed = false;
      for (const venue of venues) {
        const visible = camera.position.distanceToSquared(venue.bounds.center) < 1500 ** 2 && frustum.intersectsSphere(venue.bounds);
        if (venue.root.visible !== visible) changed = true;
        venue.root.visible = visible;
        if (!visible) continue;
        changed = true;
        boxes = venue.boxes; rounds = venue.rounds; bi = 0; ri = 0;
        if (venue.frame.sport === 'football') {
          const t = (elapsed % 9) / 9;
          const flight = THREE.MathUtils.clamp((t - 0.2) / 0.32, 0, 1);
          const receiverX = 8 + 9 * Math.sin(t * Math.PI * 2);
          player(0, -8, 14, 0, false, 0, t < 0.25 ? Math.sin(t / 0.25 * Math.PI) : 0, 0, true);
          player(1, receiverX, -18, Math.PI, false, 0.6, flight === 1 ? 0.8 : 0, 0, true);
          player(2, receiverX + 4, -14, 0, true, 0.6, 0, 0, true);
          player(3, -14, -8 + 5 * Math.sin(t * Math.PI * 2), 0, true, 0.4, 0, 0, true);
          if (t < 0.2) ball(-7.4, 2, 14, true);
          else if (t < 0.52) ball(-8 + (receiverX + 8) * flight, ballArc(flight, 2.1, 2.3, 7), 14 - 32 * flight, true);
          else ball(receiverX, 2.2, -18, true);
          const k = (elapsed % 7) / 7;
          player(4, 12, 23, 0, false, 0, 0, k < 0.18 ? Math.sin(k / 0.18 * Math.PI) : 0, true);
          player(5, 12, -35, Math.PI, true, 0, k > 0.75 ? 0.6 : 0, 0, true);
          const kickT = THREE.MathUtils.clamp((k - 0.12) / 0.65, 0, 1);
          ball(12, ballArc(kickT, 0.4, 2, 13), 21 - 56 * kickT, true);
        } else if (venue.frame.sport === 'soccer') {
          // Markings stay inside Ludwig's existing rectangular playing surface.
          segment(-30, -48, 30, -48); segment(-30, 48, 30, 48);
          segment(-30, -48, -30, 48); segment(30, -48, 30, 48); segment(-30, 0, 30, 0);
          for (const z of GOAL_ENDS) {
            segment(-12, z, -12, z - Math.sign(z) * 14);
            segment(12, z, 12, z - Math.sign(z) * 14);
            segment(-12, z - Math.sign(z) * 14, 12, z - Math.sign(z) * 14);
            part(false, -3.7, 1.4, z, 0.2, 2.8, 0.2, WHITE);
            part(false, 3.7, 1.4, z, 0.2, 2.8, 0.2, WHITE);
            part(false, 0, 2.8, z, 7.6, 0.2, 0.2, WHITE);
          }
          const t = (elapsed % 10) / 10;
          const pass = t < 0.45 ? t / 0.45 : (t - 0.45) / 0.55;
          player(6, -13, 10, -0.9, false, 0, 0, t < 0.1 ? Math.sin(t * 10 * Math.PI) : 0);
          player(7, 10, -12, 0.25, false, 0, 0, t > 0.45 && t < 0.55 ? Math.sin((t - 0.45) * 10 * Math.PI) : 0);
          player(8, -3 + 4 * Math.sin(t * Math.PI * 2), -3, 0, true, 0.6);
          player(9, 16, 13 + 6 * Math.sin(t * Math.PI * 2), Math.PI, true, 0.5);
          player(10, 4 * Math.sin(t * Math.PI * 2), -46, Math.PI, true, 0.2, t > 0.85 ? 0.7 : 0);
          player(11, -5, 45, 0, false);
          if (t < 0.45) ball(-13 + 23 * pass, 0.45 + Math.abs(Math.sin(pass * Math.PI * 4)) * 0.2, 9 - 21 * pass);
          else ball(10 * (1 - pass), ballArc(pass, 0.45, 0.5, 1.6), -13 - 33 * pass);
        } else {
          // 90-foot base paths, rotated into the north-facing mapped diamond.
          const b = 19.4;
          segment(0, 0, b, -b); segment(b, -b, 0, -2 * b);
          segment(0, -2 * b, -b, -b); segment(-b, -b, 0, 0);
          for (const [x, z] of BASES)
            part(false, x, 0.09, z, 0.8, 0.12, 0.8, WHITE, Math.PI / 4);
          const t = elapsed % 12;
          player(12, 0, -18.4, Math.PI, true, 0, t < 2 ? Math.sin(t / 2 * Math.PI) : 0);
          player(13, -1.8, 0, Math.PI / 2, false, 0, t > 1.8 && t < 2.5 ? 1 : 0);
          const swing = THREE.MathUtils.clamp((t - 1.8) / 0.6, 0, 1);
          part(false, -0.8 + Math.sin(swing * Math.PI) * 1.2, 1.7, -0.7, 0.14, 0.14, 2.1, 0xb8935c, swing * Math.PI);
          player(14, 0, 3, 0, true, 0, 0.4);
          player(15, 23, -23, Math.PI, true);
          player(16, -23, -24, Math.PI, true);
          player(17, 0, -44, Math.PI, true);
          const fieldX = 12 + 8 * Math.sin(Math.min(1, Math.max(0, (t - 2) / 4)) * Math.PI / 2);
          player(18, fieldX, -64, Math.PI, true, t > 2 && t < 6 ? 0.8 : 0, t > 5 && t < 6.5 ? 1 : 0);
          // Runner rounds all four bases and comes home before the next pitch.
          const run = THREE.MathUtils.clamp((t - 2) / 8, 0, 1) * 4;
          const leg = Math.min(3, Math.floor(run)), f = Math.min(1, run - leg);
          const from = BASES[leg], to = BASES[leg + 1];
          player(19, from[0] + (to[0] - from[0]) * f, from[1] + (to[1] - from[1]) * f,
            Math.atan2(-(to[0] - from[0]), -(to[1] - from[1])), false, t > 2 && t < 10 ? 0.9 : 0);
          if (t < 2) ball(0, ballArc(t / 2, 2, 1.8, 0.2), -18.4 + 18.4 * t / 2);
          else if (t < 6) ball(fieldX * (t - 2) / 4, ballArc((t - 2) / 4, 1.8, 2.4, 12), -64 * (t - 2) / 4);
          else if (t < 9) ball(fieldX * (1 - (t - 6) / 3), ballArc((t - 6) / 3, 2.4, 2, 5), -64 + 45.6 * (t - 6) / 3);
          else ball(0, 2, -18.4);
        }
        boxes.count = bi; rounds.count = ri;
        boxes.instanceMatrix.needsUpdate = rounds.instanceMatrix.needsUpdate = true;
        if (boxes.instanceColor) boxes.instanceColor.needsUpdate = true;
        if (rounds.instanceColor) rounds.instanceColor.needsUpdate = true;
      }
      return changed;
    },
    dispose() {
      for (const venue of venues) {
        scene.remove(venue.root);
        venue.boxes.dispose(); venue.rounds.dispose();
      }
      boxGeometry.dispose(); sphereGeometry.dispose(); material.dispose();
    },
  };
}

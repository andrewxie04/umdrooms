// src/components/map3d/scene/controls.ts
//
// Map-style camera controls for the campus scene. Spherical rig around a
// ground target: theta = bearing of the view direction (radians, clockwise
// from north), phi = polar angle from +y (0 = top-down), distance in meters.
//
// - left-drag / 1-finger: screen-space pan
// - wheel: zoom toward cursor
// - right-drag or ctrl/meta-drag: rotate + pitch
// - 2-finger: pinch zoom (toward midpoint), twist rotate, vertical pitch
// - exponential damping; pan clamped to campus +/-panBound, distance and
//   polar clamped; flyTo tween (easeInOutCubic) cancelled by pointer input.
//
// Gesture review (Ambience pass — derivations inline at each site; the one
// real bug found was the pinch-twist sign, fixed below):
// - pan: ground-anchored via ground-plane raycasts at prev/current cursor —
//   content follows the cursor exactly at any pitch (replaced the old
//   frustum-height approximation that only worked top-down).
// - wheel: scroll down (dy>0) -> distance *= exp(+k) -> zoom out; anchor math
//   uses the GOAL pose consistently so continuous scrolls don't wobble. VERIFIED OK.
// - right-drag pitch: drag down -> phi+ -> camera lowers toward the horizon —
//   same direction as the two-finger vertical pitch (consistent). VERIFIED OK.
// - pinch zoom: fingers spread -> prev/next < 1 -> zoom in, anchored at the
//   midpoint via zoomTo. VERIFIED OK.
// - damping: update() approaches goal for x/z/distance/theta/phi every frame
//   and tweens short-circuit it. VERIFIED OK.

import * as THREE from 'three';

export interface CameraPose {
  /** Target east offset (meters). */
  x: number;
  /** Target south offset (meters). */
  z: number;
  /** Camera-target distance (meters). */
  distance: number;
  /** Bearing of view direction (radians, clockwise from north). */
  theta: number;
  /** Polar angle from +y (radians). */
  phi: number;
}

export interface MapControlsOptions {
  minDistance: number;
  maxDistance: number;
  minPhi: number;
  maxPhi: number;
  /** Square clamp for the pan target, +/- meters around the campus center. */
  panBound: number;
}

const DAMPING = 9; // 1/s exponential approach toward the goal pose
const EPS_PAN = 0.05;
const EPS_DISTANCE = 0.05;
const EPS_ANGLE = 1e-4;
const ROTATE_SPEED = 0.0038; // rad per px
const PITCH_SPEED = 0.0026; // rad per px — full pitch range ≈ 440 px of drag, not ~220
const WHEEL_SPEED = 0.0012; // zoom factor per wheel px
const MIN_EFFECTIVE_PHI = 0.02; // avoids a degenerate straight-down lookAt

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface PinchMetrics {
  dist: number;
  angle: number;
  midX: number;
  midY: number;
}

export class MapControls {
  private camera: THREE.PerspectiveCamera;
  private dom: HTMLElement;
  private opts: MapControlsOptions;
  private cur: CameraPose = { x: 0, z: 0, distance: 1900, theta: 0, phi: 0.49 };
  private goal: CameraPose = { ...this.cur };
  private tween: { t: number; dur: number; from: CameraPose; to: CameraPose } | null = null;
  private pointers = new Map<number, { x: number; y: number }>();
  private mode: 'none' | 'pan' | 'rotate' | 'pinch' = 'none';
  private pinchPrev: PinchMetrics | null = null;
  private raycaster = new THREE.Raycaster();
  private disposed = false;

  constructor(camera: THREE.PerspectiveCamera, dom: HTMLElement, opts: MapControlsOptions) {
    this.camera = camera;
    this.dom = dom;
    this.opts = opts;

    this.dom.addEventListener('pointerdown', this.handlePointerDown);
    this.dom.addEventListener('pointermove', this.handlePointerMove);
    this.dom.addEventListener('pointerup', this.handlePointerUp);
    this.dom.addEventListener('pointercancel', this.handlePointerUp);
    this.dom.addEventListener('lostpointercapture', this.handlePointerUp);
    this.dom.addEventListener('wheel', this.handleWheel, { passive: false });
    this.dom.addEventListener('contextmenu', this.handleContextMenu);
  }

  // -- public API ------------------------------------------------------------

  /** Instantly sets the pose (missing fields keep current values). */
  setPose(partial: Partial<CameraPose>): void {
    this.tween = null;
    const next = { ...this.cur, ...partial };
    next.x = this.clampPan(next.x);
    next.z = this.clampPan(next.z);
    next.distance = this.clampDistance(next.distance);
    next.phi = this.clampPhi(next.phi);
    this.cur = { ...next };
    this.goal = { ...next };
  }

  /** QA/telemetry snapshot of the current (post-damping) pose. */
  getPose(): CameraPose {
    return { ...this.cur };
  }

  /** Starts a ~durationMs easeInOutCubic tween toward the target pose. */
  flyTo(partial: Partial<CameraPose>, durationMs = 1200): void {
    const to: CameraPose = { ...this.goal };
    if (partial.x != null) to.x = this.clampPan(partial.x);
    if (partial.z != null) to.z = this.clampPan(partial.z);
    if (partial.distance != null) to.distance = this.clampDistance(partial.distance);
    if (partial.phi != null) to.phi = this.clampPhi(partial.phi);
    if (partial.theta != null) {
      // shortest angular path from the current bearing
      const d = THREE.MathUtils.euclideanModulo(
        partial.theta - this.cur.theta + Math.PI,
        Math.PI * 2,
      ) - Math.PI;
      to.theta = this.cur.theta + d;
    }
    this.tween = {
      t: 0,
      dur: Math.max(0.001, durationMs / 1000),
      from: { ...this.cur },
      to,
    };
    this.goal = { ...to };
  }

  cancelTween(): void {
    if (!this.tween) return;
    this.tween = null;
    this.goal = { ...this.cur };
  }

  /**
   * Advances damping/tween. Returns true when the pose changed this frame
   * (caller should re-apply to the camera and render).
   */
  update(dt: number): boolean {
    if (this.tween) {
      this.tween.t += dt;
      const p = Math.min(1, this.tween.t / this.tween.dur);
      const e = easeInOutCubic(p);
      const { from, to } = this.tween;
      this.cur.x = THREE.MathUtils.lerp(from.x, to.x, e);
      this.cur.z = THREE.MathUtils.lerp(from.z, to.z, e);
      this.cur.distance = THREE.MathUtils.lerp(from.distance, to.distance, e);
      this.cur.theta = THREE.MathUtils.lerp(from.theta, to.theta, e);
      this.cur.phi = THREE.MathUtils.lerp(from.phi, to.phi, e);
      if (p >= 1) {
        this.cur = { ...to };
        this.tween = null;
      }
      return true;
    }
    const t = 1 - Math.exp(-dt * DAMPING);
    let moving = this.approach('x', t, EPS_PAN);
    moving = this.approach('z', t, EPS_PAN) || moving;
    moving = this.approach('distance', t, EPS_DISTANCE) || moving;
    moving = this.approach('theta', t, EPS_ANGLE) || moving;
    moving = this.approach('phi', t, EPS_ANGLE) || moving;
    return moving;
  }

  /** Positions the camera from the current pose (call after update()). */
  applyToCamera(): void {
    const { x, z, distance, theta } = this.cur;
    const phi = Math.max(this.cur.phi, MIN_EFFECTIVE_PHI);
    const sinPhi = Math.sin(phi);
    // view direction (horizontal) = (sin theta, -cos theta); camera sits opposite.
    this.camera.position.set(
      x - Math.sin(theta) * distance * sinPhi,
      distance * Math.cos(phi),
      z + Math.cos(theta) * distance * sinPhi,
    );
    this.camera.lookAt(x, 0, z);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.dom.removeEventListener('pointerdown', this.handlePointerDown);
    this.dom.removeEventListener('pointermove', this.handlePointerMove);
    this.dom.removeEventListener('pointerup', this.handlePointerUp);
    this.dom.removeEventListener('pointercancel', this.handlePointerUp);
    this.dom.removeEventListener('lostpointercapture', this.handlePointerUp);
    this.dom.removeEventListener('wheel', this.handleWheel);
    this.dom.removeEventListener('contextmenu', this.handleContextMenu);
    this.pointers.clear();
  }

  // -- internals ---------------------------------------------------------------

  private approach(key: keyof CameraPose, t: number, eps: number): boolean {
    const delta = this.goal[key] - this.cur[key];
    if (Math.abs(delta) < eps) {
      const changed = this.cur[key] !== this.goal[key];
      this.cur[key] = this.goal[key];
      return changed;
    }
    this.cur[key] += delta * t;
    return true;
  }

  private clampDistance(d: number): number {
    return THREE.MathUtils.clamp(d, this.opts.minDistance, this.opts.maxDistance);
  }

  private clampPhi(p: number): number {
    return THREE.MathUtils.clamp(p, this.opts.minPhi, this.opts.maxPhi);
  }

  private clampPan(v: number): number {
    return THREE.MathUtils.clamp(v, -this.opts.panBound, this.opts.panBound);
  }

  /**
   * Ground-anchored pan: the world point under the cursor follows the cursor
   * exactly, at any pitch. Raycasts the ground plane at the previous and
   * current cursor positions with the SAME camera and shifts the target by
   * the world delta. (The old frustum-height meters-per-pixel approximation
   * was only valid top-down and felt broken at high pitch.)
   */
  private panTo(prevClientX: number, prevClientY: number, clientX: number, clientY: number): void {
    const before = this.groundPoint(prevClientX, prevClientY);
    const after = this.groundPoint(clientX, clientY);
    if (!before || !after) return;
    this.goal.x = this.clampPan(this.goal.x - (after.x - before.x));
    this.goal.z = this.clampPan(this.goal.z - (after.z - before.z));
  }

  /** Changes distance while anchoring the ground point under the cursor. */
  private zoomTo(rawDistance: number, clientX: number, clientY: number): void {
    // Anchor math must use the GOAL pose consistently: during continuous
    // scrolling the rendered camera (cur) lags behind, so a cur-based ratio
    // compounds anchor drift into a visible wobble.
    const distance = this.clampDistance(rawDistance);
    const ratio = distance / this.goal.distance;
    const ground = this.groundPoint(clientX, clientY);
    if (ground) {
      this.goal.x = this.clampPan(this.goal.x + (ground.x - this.goal.x) * (1 - ratio));
      this.goal.z = this.clampPan(this.goal.z + (ground.z - this.goal.z) * (1 - ratio));
    }
    this.goal.distance = distance;
  }

  /** Raycasts a client point onto the ground plane y=0; null if it misses. */
  private groundPoint(clientX: number, clientY: number): THREE.Vector3 | null {
    const rect = this.dom.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -(((clientY - rect.top) / rect.height) * 2 - 1),
    );
    this.raycaster.setFromCamera(ndc, this.camera);
    const { origin, direction } = this.raycaster.ray;
    if (direction.y >= -1e-6) return null;
    const t = -origin.y / direction.y;
    if (t <= 0 || t > 20000) return null;
    return origin.clone().addScaledVector(direction, t);
  }

  private computePinch(): PinchMetrics | null {
    const it = this.pointers.values();
    const a = it.next().value;
    const b = it.next().value;
    if (!a || !b) return null;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return {
      dist: Math.hypot(dx, dy),
      angle: Math.atan2(dy, dx),
      midX: (a.x + b.x) / 2,
      midY: (a.y + b.y) / 2,
    };
  }

  private handlePointerDown = (e: PointerEvent): void => {
    if (this.disposed) return;
    this.cancelTween(); // user input cancels any flyTo
    try {
      this.dom.setPointerCapture(e.pointerId);
    } catch {
      /* pointer already gone */
    }
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 1) {
      this.mode = e.button === 2 || e.ctrlKey || e.metaKey ? 'rotate' : 'pan';
    } else if (this.pointers.size === 2) {
      this.mode = 'pinch';
      this.pinchPrev = this.computePinch();
    }
  };

  private handlePointerMove = (e: PointerEvent): void => {
    const tracked = this.pointers.get(e.pointerId);
    if (!tracked) return;
    const prevX = tracked.x;
    const prevY = tracked.y;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    tracked.x = e.clientX;
    tracked.y = e.clientY;

    if (this.mode === 'pan' && this.pointers.size === 1) {
      this.panTo(prevX, prevY, e.clientX, e.clientY);
    } else if (this.mode === 'rotate' && this.pointers.size === 1) {
      this.goal.theta += dx * ROTATE_SPEED;
      this.goal.phi = this.clampPhi(this.goal.phi + dy * PITCH_SPEED);
    } else if (this.mode === 'pinch' && this.pointers.size >= 2 && this.pinchPrev) {
      const next = this.computePinch();
      if (!next) return;
      if (next.dist > 1 && this.pinchPrev.dist > 1) {
        this.zoomTo(this.goal.distance * (this.pinchPrev.dist / next.dist), next.midX, next.midY);
      }
      // Twist — BUG FIX (sign): the screen-space angle (atan2 with y DOWN)
      // grows for a CLOCKWISE finger rotation, but a positive theta spins map
      // content COUNTER-clockwise (view bearing increases => world features
      // swing left, e.g. north goes 12 o'clock -> 9 o'clock). Negate so the
      // content follows the fingers, like rotating a physical map.
      this.goal.theta -= next.angle - this.pinchPrev.angle;
      this.goal.phi = this.clampPhi(this.goal.phi + (next.midY - this.pinchPrev.midY) * PITCH_SPEED);
      this.pinchPrev = next;
    }
  };

  private handlePointerUp = (e: PointerEvent): void => {
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.delete(e.pointerId);
    try {
      if (this.dom.hasPointerCapture(e.pointerId)) this.dom.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    if (this.pointers.size === 0) {
      this.mode = 'none';
      this.pinchPrev = null;
    } else if (this.pointers.size === 1) {
      this.mode = 'pan';
      this.pinchPrev = null;
    }
  };

  private handleWheel = (e: WheelEvent): void => {
    e.preventDefault();
    this.cancelTween();
    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16; // lines -> px
    else if (e.deltaMode === 2) dy *= 120; // pages -> px
    this.zoomTo(this.goal.distance * Math.exp(dy * WHEEL_SPEED), e.clientX, e.clientY);
  };

  private handleContextMenu = (e: MouseEvent): void => {
    e.preventDefault();
  };
}

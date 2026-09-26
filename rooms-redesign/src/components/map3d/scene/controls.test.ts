import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { MapControls } from './controls';

describe('map camera depth range', () => {
  it('preserves depth precision at overview scale without clipping close building views', () => {
    const camera = new THREE.PerspectiveCamera(45, 1, 30, 11000);
    const controls = new MapControls(camera, new EventTarget() as HTMLElement, {
      minDistance: 80,
      maxDistance: 4000,
      minPhi: 0,
      maxPhi: 1.15,
      panBound: 5000,
    });

    try {
      controls.setPose({ distance: 4000, phi: 1.15 });
      controls.applyToCamera();
      expect(camera.near).toBe(480);
      expect(camera.position.y).toBeGreaterThan(camera.near);

      controls.setPose({ distance: 80, phi: 1.15 });
      controls.applyToCamera();
      expect(camera.near).toBeCloseTo(9.6);
      expect(camera.position.y).toBeGreaterThan(camera.near);
    } finally {
      controls.dispose();
    }
  });
});

describe('zoom buttons during focus flights', () => {
  const options = {
    minDistance: 80,
    maxDistance: 4000,
    minPhi: 0,
    maxPhi: 1.15,
    panBound: 5000,
  };

  it('zooms inward from the visible view when a focus flight is heading outward', () => {
    const controls = new MapControls(new THREE.PerspectiveCamera(),
      new EventTarget() as HTMLElement, options);
    try {
      controls.setPose({ distance: 160 });
      controls.flyTo({ distance: 500 });
      controls.update(0.1);
      const visible = controls.getPose().distance;
      controls.zoomBy(0.8);
      expect(controls.getGoalPose().distance).toBeLessThan(visible);
      controls.update(0.4);
      expect(controls.getPose().distance).toBeLessThan(visible);
    } finally { controls.dispose(); }
  });

  it('accumulates quick taps and keeps outward zoom moving outward', () => {
    const controls = new MapControls(new THREE.PerspectiveCamera(),
      new EventTarget() as HTMLElement, options);
    try {
      controls.setPose({ distance: 500 });
      controls.flyTo({ distance: 160 });
      controls.update(0.1);
      const visible = controls.getPose().distance;
      controls.zoomBy(1.2);
      const first = controls.getGoalPose().distance;
      expect(first).toBeGreaterThan(visible);
      controls.zoomBy(1.2);
      expect(controls.getGoalPose().distance).toBeGreaterThan(first);
    } finally { controls.dispose(); }
  });
});

// Exercise the actual pointer listeners: touch events arrive one finger at a
// time, including releases and browser capture cancellations.
function touchRig() {
  const target = Object.assign(new EventTarget(), {
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
    setPointerCapture: () => undefined,
    hasPointerCapture: () => false,
  });
  const camera = new THREE.PerspectiveCamera(45, 800 / 600, 4, 11000);
  const controls = new MapControls(camera, target as unknown as HTMLElement, {
    minDistance: 80, maxDistance: 4000, minPhi: 0, maxPhi: 1.15, panBound: 5000,
  });
  controls.setPose({ distance: 1000, theta: 0, phi: 0.6 });
  controls.applyToCamera();
  camera.updateMatrixWorld();
  const pointer = (type: string, id: number, x: number, y: number) => {
    target.dispatchEvent(Object.assign(new Event(type), {
      pointerId: id, clientX: x, clientY: y, button: 0, pointerType: 'touch',
    }));
  };
  return { controls, pointer, target };
}

describe('two-finger map navigation', () => {
  it('does not spin when the finger angle crosses minus/plus pi', () => {
    const { controls, pointer } = touchRig();
    try {
      pointer('pointerdown', 1, 500, 300);
      pointer('pointerdown', 2, 300, 301);
      pointer('pointermove', 2, 300, 299);
      expect(Math.abs(controls.getGoalPose().theta)).toBeLessThan(0.02);
      controls.update(0.05);
      expect(Math.abs(controls.getPose().theta)).toBeLessThan(0.02);
    } finally { controls.dispose(); }
  });

  it('ignores a reversed or almost coincident pair instead of flipping', () => {
    const { controls, pointer } = touchRig();
    try {
      pointer('pointerdown', 1, 400, 300);
      pointer('pointerdown', 2, 500, 300);
      pointer('pointermove', 2, 405, 300);
      pointer('pointermove', 2, 395, 300);
      pointer('pointermove', 2, 300, 300);
      pointer('pointermove', 2, 500, 300); // direct crossover between events
      expect(controls.getGoalPose().theta).toBe(0);
      expect(controls.getGoalPose().distance).toBe(1000);
    } finally { controls.dispose(); }
  });

  it('zooms inward on spreading fingers without pitching or rotating', () => {
    const { controls, pointer } = touchRig();
    try {
      pointer('pointerdown', 1, 350, 300);
      pointer('pointerdown', 2, 450, 300);
      pointer('pointermove', 1, 325, 300);
      pointer('pointermove', 2, 475, 300);
      expect(controls.getGoalPose().distance).toBeCloseTo(1000 * 100 / 150);
      expect(controls.getGoalPose().theta).toBe(0);
      expect(controls.getGoalPose().phi).toBe(0.6);
    } finally { controls.dispose(); }
  });

  it('pans with parallel fingers and keeps the viewing angle stable', () => {
    const { controls, pointer } = touchRig();
    try {
      pointer('pointerdown', 1, 300, 300);
      pointer('pointerdown', 2, 500, 300);
      for (let y = 302; y <= 340; y += 2) {
        pointer('pointermove', 1, 300, y);
        pointer('pointermove', 2, 500, y);
      }
      expect(controls.getGoalPose().z).not.toBe(0);
      expect(controls.getGoalPose().phi).toBe(0.6);
      expect(controls.getGoalPose().theta).toBe(0);
      expect(controls.getGoalPose().distance).toBeCloseTo(1000);
    } finally { controls.dispose(); }
  });

  it('allows a deliberate twist without making the camera overshoot', () => {
    const { controls, pointer } = touchRig();
    try {
      pointer('pointerdown', 1, 400, 300);
      pointer('pointerdown', 2, 500, 300);
      for (let degrees = 2; degrees <= 30; degrees += 2) {
        const angle = THREE.MathUtils.degToRad(degrees);
        pointer('pointermove', 2, 400 + 100 * Math.cos(angle), 300 + 100 * Math.sin(angle));
      }
      expect(controls.getGoalPose().theta).toBeCloseTo(-THREE.MathUtils.degToRad(25));
    } finally { controls.dispose(); }
  });

  it('rebases when a third finger replaces a finger in the active pair', () => {
    const { controls, pointer } = touchRig();
    try {
      pointer('pointerdown', 1, 300, 300);
      pointer('pointerdown', 2, 500, 300);
      pointer('pointerdown', 3, 250, 300);
      pointer('pointerup', 1, 300, 300);
      pointer('pointermove', 3, 249, 300);
      expect(controls.getGoalPose().theta).toBe(0);
      expect(controls.getGoalPose().distance).toBeGreaterThan(990);
      pointer('pointercancel', 2, 500, 300);
      pointer('lostpointercapture', 3, 249, 300);
      controls.update(10);
      expect(controls.isMoving()).toBe(false);
    } finally { controls.dispose(); }
  });

  it('handles trackpad pinch wheel events without changing orientation', () => {
    const { controls, target } = touchRig();
    try {
      target.dispatchEvent(Object.assign(new Event('wheel', { cancelable: true }), {
        deltaY: -120, deltaMode: 0, ctrlKey: true, clientX: 400, clientY: 300,
      }));
      expect(controls.getGoalPose().distance).toBeLessThan(1000);
      expect(controls.getGoalPose().theta).toBe(0);
      expect(controls.getGoalPose().phi).toBe(0.6);
    } finally { controls.dispose(); }
  });
});

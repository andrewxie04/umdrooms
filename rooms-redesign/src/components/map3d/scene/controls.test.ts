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

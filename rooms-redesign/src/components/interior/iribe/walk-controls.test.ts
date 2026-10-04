import * as THREE from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WalkControls } from './walk';
import { WEST_STAIR } from './west-stair-layout';

class MockElement extends EventTarget {
  closest() { return null; }
}

function controlsRig() {
  const windowEvents = new EventTarget();
  const documentEvents = new EventTarget();
  vi.stubGlobal('window', windowEvents);
  vi.stubGlobal('document', documentEvents);
  vi.stubGlobal('HTMLElement', MockElement);

  const element = new MockElement();
  const captured = new Set<number>();
  const canvas = Object.assign(element, {
    focus: vi.fn(),
    setPointerCapture: vi.fn((id: number) => { captured.add(id); }),
    hasPointerCapture: (id: number) => captured.has(id),
    releasePointerCapture: vi.fn((id: number) => {
      if (captured.delete(id)) {
        // Synchronous delivery also exercises cleanup reentrancy.
        element.dispatchEvent(Object.assign(new Event('lostpointercapture'), { pointerId: id }));
      }
    }),
  });
  const camera = new THREE.PerspectiveCamera();
  const dirty = vi.fn();
  const controls = new WalkControls(camera, canvas as unknown as HTMLCanvasElement, () => [], dirty);
  const pointer = (type: string, id: number, x = 0, y = 0,
    options: Partial<Pick<PointerEvent, 'pointerType' | 'button' | 'isPrimary'>> = {}) => {
    if (type === 'lostpointercapture') captured.delete(id);
    canvas.dispatchEvent(Object.assign(new Event(type), {
      pointerId: id, clientX: x, clientY: y, button: 0, pointerType: 'touch', isPrimary: true,
      ...options,
    }));
  };
  const key = (type: string, code: string) => {
    windowEvents.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), { code }));
  };
  return { controls, camera, canvas, captured, dirty, pointer, key, windowEvents, documentEvents };
}

describe('Iribe walk look pointer ownership', () => {
  let rig: ReturnType<typeof controlsRig>;
  beforeEach(() => { rig = controlsRig(); });
  afterEach(() => { rig.controls.dispose(); vi.unstubAllGlobals(); });

  const expectLook = (yaw: number, pitch: number) => {
    expect(rig.camera.rotation.y).toBeCloseTo(yaw);
    expect(rig.camera.rotation.x).toBeCloseTo(pitch);
    expect(rig.camera.rotation.z).toBe(0);
    expect(rig.camera.rotation.order).toBe('YXZ');
  };

  it('keeps the original finger coordinates when a second finger lands and moves', () => {
    rig.pointer('pointerdown', 1, 100, 100);
    rig.pointer('pointermove', 1, 120, 110);
    expectLook(-0.06, -0.03);
    rig.pointer('pointerdown', 2, 1000, 800, { isPrimary: false });
    rig.pointer('pointermove', 2, 1400, 900, { isPrimary: false });
    expectLook(-0.06, -0.03);
    expect(rig.dirty).toHaveBeenCalledTimes(1);
    expect(rig.canvas.setPointerCapture).toHaveBeenCalledExactlyOnceWith(1);
    expect(rig.canvas.focus).toHaveBeenCalledTimes(1);
    rig.pointer('pointermove', 1, 125, 114);
    expectLook(-0.075, -0.042);
  });

  it.each(['pointerup', 'pointercancel', 'lostpointercapture'])(
    'keeps the original drag continuous after a secondary %s', type => {
      rig.pointer('pointerdown', 1, 100, 100);
      rig.pointer('pointermove', 1, 120, 110);
      rig.pointer('pointerdown', 2, 1000, 800, { isPrimary: false });
      rig.pointer(type, 2, 1000, 800);
      expect(rig.captured.has(1)).toBe(true);
      expect(rig.canvas.releasePointerCapture).not.toHaveBeenCalled();
      rig.pointer('pointermove', 1, 125, 114);
      expectLook(-0.075, -0.042);
    });

  it('does not rebase an existing drag on repeated pointerdown', () => {
    rig.pointer('pointerdown', 0, 100, 100);
    rig.pointer('pointermove', 0, 110, 105);
    rig.pointer('pointerdown', 0, 5000, 5000);
    rig.pointer('pointermove', 0, 120, 110);
    expectLook(-0.06, -0.03);
    expect(rig.canvas.setPointerCapture).toHaveBeenCalledExactlyOnceWith(0);
  });

  it.each(['pointerup', 'pointercancel', 'lostpointercapture'])(
    'ends only the owner drag on %s and requires a fresh down before looking again', type => {
      rig.pointer('pointerdown', 1, 100, 100);
      rig.pointer('pointermove', 1, 110, 105);
      rig.pointer('pointerdown', 2, 1000, 1000, { isPrimary: false });
      rig.pointer(type, 1);
      expect(rig.captured.size).toBe(0);
      rig.pointer('pointermove', 1, 5000, 5000);
      rig.pointer('pointermove', 2, 5000, 5000);
      expectLook(-0.03, -0.015);
      rig.pointer('pointerdown', 2, 5000, 5000, { isPrimary: false });
      expectLook(-0.03, -0.015);
      rig.pointer('pointermove', 2, 5002, 5003);
      expectLook(-0.036, -0.024);
    });

  it('preserves primary mouse sensitivity, unbounded yaw, and pitch clamps', () => {
    const mouse = { pointerType: 'mouse' };
    rig.pointer('pointerdown', 1, 100, 100, mouse);
    rig.pointer('pointermove', 1, 110, 105, mouse);
    expectLook(-0.03, -0.015);
    rig.pointer('pointermove', 1, 2100, -900, mouse);
    expectLook(-6, 1.35);
    rig.pointer('pointermove', 1, 2100, -890, mouse);
    expectLook(-6, 1.32);
    rig.pointer('pointermove', 1, 2100, 1000, mouse);
    expectLook(-6, -1.35);
    rig.pointer('pointermove', 1, 2100, 990, mouse);
    expectLook(-6, -1.32);
  });

  it.each([
    { button: 1, isPrimary: true },
    { button: 2, isPrimary: true },
    { button: 0, isPrimary: false },
  ])('ignores mouse down with button $button and isPrimary $isPrimary', options => {
    rig.pointer('pointerdown', 1, 100, 100, { pointerType: 'mouse', ...options });
    rig.pointer('pointermove', 1, 5000, 5000, { pointerType: 'mouse', ...options });
    expect(rig.camera.rotation.x).toBe(0);
    expect(rig.camera.rotation.y).toBe(0);
    expect(rig.canvas.setPointerCapture).not.toHaveBeenCalled();
    expect(rig.dirty).not.toHaveBeenCalled();
    rig.pointer('pointerdown', 2, 5000, 5000, { pointerType: 'mouse' });
    rig.pointer('pointermove', 2, 5002, 5003, { pointerType: 'mouse' });
    expectLook(-0.006, -0.009);
  });

  it('accepts a touch look drag when another finger already operates a walking button', () => {
    rig.controls.setMove(0, -1);
    rig.pointer('pointerdown', 2, 100, 100, { isPrimary: false });
    rig.pointer('pointermove', 2, 110, 105, { isPrimary: false });
    expectLook(-0.03, -0.015);
    expect(rig.controls.update(0)).toBe(true);
  });

  it.each(['KeyW', 'ArrowUp'])('walks onto a stair while $0 is held and stops on release', code => {
    const stair=WEST_STAIR,point=stair.at(stair.width*.75,stair.doorZ),target=stair.flights[0].to;
    rig.controls.setPose(point,Math.atan2(point[0]-target[0],point[1]-target[2]),'G');
    const start=rig.camera.position.clone();
    rig.key('keydown',code);
    for(let frame=0;frame<10;frame++)expect(rig.controls.update(.05)).toBe(true);
    expect(Math.hypot(rig.camera.position.x-start.x,rig.camera.position.z-start.z)).toBeGreaterThan(1.2);
    expect(rig.camera.position.y).toBeGreaterThan(start.y+.3);
    rig.key('keyup',code);
    const stopped=rig.camera.position.clone();
    expect(rig.controls.update(.05)).toBe(false);
    expect(rig.camera.position.equals(stopped)).toBe(true);
  });

  it.each(['reset', 'pose', 'pause', 'blur', 'visibility'])(
    'clears capture and walking input on %s, with no stale movement or jump', interruption => {
      rig.key('keydown', 'KeyW');
      rig.controls.setMove(1, 0);
      rig.pointer('pointerdown', 1, 100, 100);
      rig.pointer('pointermove', 1, 110, 105);
      if (interruption === 'reset') rig.controls.resetInput();
      if (interruption === 'pose') rig.controls.setPose([0, 0], -0.03, 'G', 0, -0.015);
      if (interruption === 'pause') rig.controls.setPaused(true);
      if (interruption === 'blur') rig.windowEvents.dispatchEvent(new Event('blur'));
      if (interruption === 'visibility') rig.documentEvents.dispatchEvent(new Event('visibilitychange'));
      expect(rig.captured.size).toBe(0);
      expect(rig.canvas.releasePointerCapture).toHaveBeenCalledExactlyOnceWith(1);
      if (interruption === 'pause') {
        rig.pointer('pointerdown', 2, 5000, 5000);
        rig.pointer('pointermove', 2, 6000, 6000);
        rig.key('keydown', 'KeyD');
        rig.controls.setMove(1, 1);
        rig.controls.setPaused(false);
      }
      expect(rig.controls.update(1)).toBe(false);
      rig.dirty.mockClear();
      rig.pointer('pointermove', 1, 5000, 5000);
      rig.pointer('pointermove', 2, 6000, 6000);
      expectLook(-0.03, -0.015);
      expect(rig.dirty).not.toHaveBeenCalled();
      rig.pointer('pointerdown', 3, 5000, 5000);
      // A delayed loss from the previous capture cannot end the new drag.
      rig.pointer('lostpointercapture', 1);
      expectLook(-0.03, -0.015);
      rig.pointer('pointermove', 3, 5002, 5003);
      expectLook(-0.036, -0.024);
    });

  it('releases capture and removes pointer and keyboard listeners on dispose', () => {
    rig.key('keydown', 'KeyW');
    rig.controls.setMove(1, 0);
    rig.pointer('pointerdown', 1, 100, 100);
    rig.pointer('pointermove', 1, 110, 105);
    rig.controls.dispose();
    expect(rig.captured.size).toBe(0);
    expect(rig.canvas.releasePointerCapture).toHaveBeenCalledExactlyOnceWith(1);
    rig.dirty.mockClear();
    rig.key('keydown', 'KeyD');
    rig.pointer('pointermove', 1, 5000, 5000);
    rig.pointer('pointerdown', 2, 5000, 5000);
    rig.pointer('pointermove', 2, 6000, 6000);
    expectLook(-0.03, -0.015);
    expect(rig.controls.update(1)).toBe(false);
    expect(rig.dirty).not.toHaveBeenCalled();
    expect(rig.canvas.setPointerCapture).toHaveBeenCalledTimes(1);
  });
});

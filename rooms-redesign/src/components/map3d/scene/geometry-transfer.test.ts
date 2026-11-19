import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import type { CampusGeometries } from './geometry';
import { packCampusGeometries, unpackCampusGeometries } from './geometry-transfer';

describe('campus geometry transfer', () => {
  it('round-trips attributes, indices, geometry arrays and plain values', () => {
    const box = new THREE.BoxGeometry(1, 2, 3);
    const plane = new THREE.PlaneGeometry(4, 4).toNonIndexed();
    const color = new Float32Array(plane.getAttribute('position').count * 3).fill(.5);
    plane.setAttribute('color', new THREE.BufferAttribute(color, 3));
    const expected = { position: Array.from(box.getAttribute('position').array), index: Array.from(box.index!.array), plane: Array.from(plane.getAttribute('position').array) };

    const { packed, transfer } = packCampusGeometries({
      buildings: box,
      lampFlickerHeads: [plane],
      lampFlickerLate: [true, false],
    } as unknown as CampusGeometries);
    expect(transfer.length).toBeGreaterThan(0);
    expect(new Set(transfer).size).toBe(transfer.length);

    // Structured clone is what postMessage applies between threads.
    const result = unpackCampusGeometries(structuredClone(packed));
    expect(Array.from(result.buildings.getAttribute('position').array)).toEqual(expected.position);
    expect(Array.from(result.buildings.index!.array)).toEqual(expected.index);
    expect(result.buildings.getAttribute('normal').itemSize).toBe(3);
    expect(result.lampFlickerHeads[0].index).toBeNull();
    expect(Array.from(result.lampFlickerHeads[0].getAttribute('position').array)).toEqual(expected.plane);
    expect(result.lampFlickerHeads[0].getAttribute('color').itemSize).toBe(3);
    expect(result.lampFlickerLate).toEqual([true, false]);
  });
});

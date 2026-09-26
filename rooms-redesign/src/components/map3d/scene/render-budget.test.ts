import { expect, it } from 'vitest';
import { campusFrameInterval, campusPixelRatio } from './render-budget';

it('preserves phone detail while bounding GPU pixels on large Retina displays', () => {
  expect(campusPixelRatio(390, 844, 3)).toBe(2);
  for (const [width, height] of [[1920, 1080], [3840, 2160]]) {
    const ratio = campusPixelRatio(width, height, 2);
    expect(width * height * ratio * ratio).toBeLessThanOrEqual(3_000_001);
  }
  expect(campusPixelRatio(0, 0, 2)).toBe(2);
});

it('halves ambient frame work while retaining 60 Hz camera movement', () => {
  expect(campusFrameInterval(false)).toBeCloseTo(1000 / 30);
  expect(campusFrameInterval(true)).toBeCloseTo(1000 / 60);
});

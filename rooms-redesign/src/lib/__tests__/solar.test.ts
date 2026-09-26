import { describe, expect, it } from 'vitest';
import { computeSunPosition } from '../solar';

describe('College Park solar time', () => {
  it('distinguishes daytime from night using UTC instants', () => {
    const midday = computeSunPosition(new Date('2026-09-25T17:00:00Z'));
    const midnight = computeSunPosition(new Date('2026-09-25T04:00:00Z'));
    expect(midday.elevation).toBeGreaterThan(20);
    expect(midnight.elevation).toBeLessThan(-10);
  });
});

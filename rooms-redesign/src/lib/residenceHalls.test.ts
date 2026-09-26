import { describe, expect, it } from 'vitest';
import campus from '../../public/campus-data.json';
import { RESIDENCE_HALLS, residenceHallDetailsUrl } from './residenceHalls';

describe('residence hall search index', () => {
  it('points every official hall at a distinct mapped building', () => {
    const byId = new Map(campus.buildings.map((building) => [building.id, building]));
    expect(RESIDENCE_HALLS).toHaveLength(38);
    expect(new Set(RESIDENCE_HALLS.map((hall) => hall.id)).size).toBe(RESIDENCE_HALLS.length);
    for (const hall of RESIDENCE_HALLS) {
      const building = byId.get(hall.id);
      expect(building, hall.name).toBeDefined();
      const lngs = building!.footprint.map(([lng]) => lng);
      const lats = building!.footprint.map(([, lat]) => lat);
      expect(hall.lng, hall.name).toBeGreaterThanOrEqual(Math.min(...lngs));
      expect(hall.lng, hall.name).toBeLessThanOrEqual(Math.max(...lngs));
      expect(hall.lat, hall.name).toBeGreaterThanOrEqual(Math.min(...lats));
      expect(hall.lat, hall.name).toBeLessThanOrEqual(Math.max(...lats));
    }
  });

  it('opens the official building page for names with punctuation', () => {
    for (const [name, slug] of [
      ["Queen Anne's Hall", 'queen-annes-hall'],
      ["St. Mary's Hall", 'st-marys-hall'],
      ["Prince George's Hall", 'prince-georges-hall'],
    ]) {
      const hall = RESIDENCE_HALLS.find((entry) => entry.name === name);
      expect(hall, name).toBeDefined();
      expect(residenceHallDetailsUrl(hall!)).toBe(
        `https://drf.umd.edu/facilities/residence-halls-communities/${slug}`,
      );
    }
  });
});

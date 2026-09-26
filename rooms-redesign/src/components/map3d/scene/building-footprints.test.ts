import { describe, expect, it } from 'vitest';
import campusData from '../../../../public/campus-data.json';
import { uniqueBuildingFootprints } from './building-footprints';
import type { CampusBuilding } from './types';

describe('duplicate OSM building outlines', () => {
  it('draws each outline once while retaining names and courtyard openings', () => {
    const raw = campusData.buildings as CampusBuilding[];
    const buildings = uniqueBuildingFootprints(raw);

    expect(buildings.length).toBe(raw.length - 7);
    const engineering = buildings.find((b) => b.id === 'way/23937510');
    expect(engineering?.umdCode).toBe('CHE');
    expect(engineering?.holes).toHaveLength(1);
    expect(buildings.some((b) => b.id === 'relation/20447085')).toBe(false);

    const outlines = buildings.map((b) =>
      b.footprint.map(([lng, lat]) => `${lng},${lat}`).sort().join(';'),
    );
    expect(new Set(outlines).size).toBe(outlines.length);
  });

  it('merges the surveyed duplicates without losing the searchable building identities', () => {
    const raw = campusData.buildings as CampusBuilding[];
    const buildings = uniqueBuildingFootprints(raw);
    expect(buildings.some((b) => b.id === 'way/697457105')).toBe(false);
    expect(buildings.find((b) => b.id === 'way/476961971')?.name)
      .toBe('Edward St. John Learning and Teaching Center');
    expect(buildings.some((b) => b.id === 'relation/20447092')).toBe(false);
    const commons = buildings.find((b) => b.id === 'relation/9681950');
    expect(commons?.name).toBe('South Campus Commons 1');
    expect(commons?.height).toBe(18.93);
    expect(commons?.footprint).toHaveLength(70);
    expect(commons?.holes?.[0]).toHaveLength(36);
    expect(uniqueBuildingFootprints(buildings)).toEqual(buildings);
  });

  it('retains neighboring buildings and separately named overlapping records', () => {
    const square = (lng: number): [number, number][] => [
      [lng, 39], [lng + 0.001, 39], [lng + 0.001, 39.001], [lng, 39.001],
    ];
    const buildings: CampusBuilding[] = [
      { id: 'named', name: 'Named Hall', footprint: square(-77), height: 12 },
      { id: 'neighbor', footprint: square(-76.999), height: 12 },
      { id: 'separate-name', name: 'Other Hall', footprint: square(-76.99999), height: 12 },
    ];
    expect(uniqueBuildingFootprints(buildings)).toHaveLength(3);
  });
});

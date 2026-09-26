import { describe, expect, it } from 'vitest';
import { getMapBuilding } from '@/lib/mapPlaces';
import type { BuildingEntry, ParkingLot } from '@/types/campus';
import { placeMatchesSearch, searchMapBuildings } from './utils';

describe('named 3D map search', () => {
  it('finds modeled buildings missing from the room inventory', () => {
    const morrill = searchMapBuildings('Morrill', [], [], []);
    expect(morrill.map((place) => place.id)).toContain('way/24306090');
    expect(getMapBuilding(morrill[0].id)?.lat).toBeCloseTo(38.984314, 4);
    expect(getMapBuilding('way/23546215')?.name).toBe('Worcester Hall');
  });

  it('keeps room buildings and residence halls in their richer results', () => {
    const mckeldin = { code: 'MCK', name: 'McKeldin Library' } as BuildingEntry;
    expect(searchMapBuildings('McKeldin', [mckeldin], [], [])).toHaveLength(0);
    expect(searchMapBuildings('Anne Arundel Hall', [], [], [])).toHaveLength(0);
  });

  it('puts the stadium itself before the garage and maintenance buildings', () => {
    const results = searchMapBuildings('stadium', [], [], []);
    expect(results[0]?.name).toBe('SECU Stadium');
    expect(results.map((place) => place.name)).toContain('Stadium Drive Garage');
  });

  it('routes a full garage name to its parking entry without a duplicate map result', () => {
    const mowatt = { id: 'Mowatt Lane Garage', name: 'Mowatt Lane Garage' } as ParkingLot;
    expect(placeMatchesSearch(mowatt.name, 'Mowatt Lane Parking Garage')).toBe(true);
    expect(searchMapBuildings('Mowatt Lane Parking Garage', [], [], [mowatt])).toHaveLength(0);
    expect(placeMatchesSearch(mowatt.name, 'Mowatt Lane')).toBe(true);
  });
});

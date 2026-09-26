import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildingMatchesQuery,
  matchRoom,
  normalizeSearchText,
  resolveBuildingSelection,
  roomSelectionId,
} from '../browse/utils';
import type { BuildingEntry, RoomEntry } from '../../types/campus';
import { mobileSelectionScreenY, mobileSheetSnapPoints } from '../shell/layout';

const room: RoomEntry = {
  id: '1100/A',
  name: 'Room 1100',
  buildingCode: 'MCK',
  status: 'available',
  events: [{ date: '2026-10-14', event_name: 'CMSC 131 Lecture' }],
};
const building: BuildingEntry = {
  id: 'MCK',
  code: 'MCK',
  name: 'Theodore R. McKeldin Library',
  lat: 38.986,
  lng: -76.945,
  kind: 'library',
  totalRooms: 1,
  availableRooms: 1,
  status: 'available',
  rooms: [room],
};

describe('map search and selection contracts', () => {
  it('resolves both building-code and canonical room selections, including room IDs with slashes', () => {
    expect(resolveBuildingSelection([building], { kind: 'building', id: 'MCK' })).toEqual({ building, room: null });
    expect(resolveBuildingSelection([building], { kind: 'room', id: roomSelectionId('MCK', room.id) })).toEqual({ building, room });
    expect(resolveBuildingSelection([building], { kind: 'room', id: room.id })).toEqual({ building, room });
    expect(resolveBuildingSelection([building], { kind: 'building', id: 'MISSING' })).toBeNull();
  });

  it('matches building names and codes and limits event search to the active day', () => {
    expect(buildingMatchesQuery(building, normalizeSearchText('mckeldin libraries'))).toBe(true);
    expect(buildingMatchesQuery(building, normalizeSearchText('MCK'))).toBe(true);
    expect(matchRoom(room, building, normalizeSearchText('CMSC 131'), '2026-10-14')?.matchedEventName).toBe('CMSC 131 Lecture');
    expect(matchRoom(room, building, normalizeSearchText('CMSC 131'), '2026-10-15')).toBeNull();
  });
});

describe('phone map and detail sheet framing', () => {
  it.each([667, 844])('keeps a selected building centered in the visible map at %ipx height', (height) => {
    const detailTop = 1 - mobileSheetSnapPoints(height)[1];
    const anchor = mobileSelectionScreenY(height);
    expect(anchor).toBeGreaterThan(0);
    expect(anchor).toBeLessThan(detailTop);
    expect(anchor).toBeCloseTo(detailTop / 2);
  });
  it.each([667, 844])('keeps a selected building visible above its compact sheet at %ipx height', (height) => {
    const detailTop = 1 - mobileSheetSnapPoints(height, true)[0];
    expect(detailTop).toBeGreaterThan(0.4);
    expect(mobileSelectionScreenY(height, true)).toBeCloseTo(detailTop * 0.68);
  });
  it.each([667, 844])('fits a short place sheet without hiding the map at %ipx height', (height) => {
    const [peek, middle] = mobileSheetSnapPoints(height, true, 'map');
    expect(peek * height).toBeCloseTo(340, 0);
    expect(middle).toBeGreaterThan(peek);
    expect(mobileSelectionScreenY(height, true, 'map')).toBeCloseTo((1 - peek) * 0.55);
  });
  it.each([667, 844])('fits residence actions on a narrow phone at %ipx height', (height) => {
    const [peek] = mobileSheetSnapPoints(height, true, 'residence');
    expect(peek * height).toBeCloseTo(350, 0);
    expect(mobileSelectionScreenY(height, true, 'residence')).toBeCloseTo((1 - peek) * 0.55);
  });
});

describe('map interaction state', () => {
  afterEach(() => vi.unstubAllGlobals());

  async function loadStore() {
    const saved = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => saved.set(key, value),
    });
    vi.stubGlobal('window', { location: { search: '' } });
    const { useCampusStore } = await import('../../lib/store');
    return useCampusStore;
  }

  it('keeps a manual night override until automatic solar mode is restored', async () => {
    const useCampusStore = await loadStore();
    useCampusStore.getState().setTimePreference('night');
    expect(useCampusStore.getState()).toMatchObject({ darkMode: true, darkModeAuto: false });
    useCampusStore.getState().setTimePreference('day');
    expect(useCampusStore.getState()).toMatchObject({ darkMode: false, darkModeAuto: false });
    useCampusStore.getState().setTimePreference('auto');
    const { computeSunPosition } = await import('../../lib/solar');
    expect(useCampusStore.getState()).toMatchObject({
      darkMode: computeSunPosition(new Date()).elevation < -1,
      darkModeAuto: true,
    });
    expect(localStorage.getItem('timePreference')).toBe('auto');
    useCampusStore.getState().setDarkModeAuto(true);
    expect(useCampusStore.getState()).toMatchObject({ darkMode: true, darkModeAuto: true });
  });

  it('retains map selection origin and clears associated state on deselection', async () => {
    const useCampusStore = await loadStore();
    useCampusStore.getState().select({ kind: 'building', id: 'MCK' }, { source: 'map' });
    expect(useCampusStore.getState()).toMatchObject({
      selected: { kind: 'building', id: 'MCK' },
      selectionSource: 'map',
    });
    useCampusStore.getState().clearSelection();
    expect(useCampusStore.getState()).toMatchObject({ selected: null, selectionSource: null });
  });

  it('reveals building details when a marker is picked from the full desktop map', async () => {
    const useCampusStore = await loadStore();
    useCampusStore.getState().setBrowsePanelHidden(true);
    useCampusStore.getState().select({ kind: 'building', id: 'MCK' }, { source: 'map' });
    expect(useCampusStore.getState()).toMatchObject({
      selected: { kind: 'building', id: 'MCK' },
      browsePanelHidden: false,
    });
    useCampusStore.getState().clearSelection();
  });
});

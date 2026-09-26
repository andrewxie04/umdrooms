import places from './map-places.generated.json';

export interface MapBuildingPlace {
  id: string;
  name: string;
  code?: string;
  lat: number;
  lng: number;
}

export const MAP_BUILDINGS: MapBuildingPlace[] = places;
const byId = new Map(MAP_BUILDINGS.map((place) => [place.id, place]));
const byCode = new Map<string, MapBuildingPlace>();
for (const place of MAP_BUILDINGS) {
  if (place.code && !byCode.has(place.code.toUpperCase())) {
    byCode.set(place.code.toUpperCase(), place);
  }
}

export function getMapBuilding(id: string): MapBuildingPlace | undefined {
  return byId.get(id);
}

export function getMapBuildingByCode(code: string): MapBuildingPlace | undefined {
  return byCode.get(code.toUpperCase());
}

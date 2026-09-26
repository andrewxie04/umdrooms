import data from './residence-halls.generated.json';

export interface ResidenceHall {
  id: string;
  name: string;
  lat: number;
  lng: number;
  community: string;
  communitySlug: string;
}

/** Official Resident Life hall names, located using native map footprints. */
export const RESIDENCE_HALLS: ResidenceHall[] = data;

/** Residential Facilities publishes an individual detail page for each hall. */
export function residenceHallDetailsUrl(hall: ResidenceHall): string {
  const slug = hall.name.toLowerCase()
    .replace(/[.'’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `https://drf.umd.edu/facilities/residence-halls-communities/${slug}`;
}

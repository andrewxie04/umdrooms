/** Public reference ledger. Photographs are inspected, not redistributed as textures.
 * Coordinates below are interpreted from public wayfinding diagrams, not a survey.
 * Keep uncertainties explicit; do not invent room numbers or claim measured accuracy.
 */
export const IRIBE_REFERENCES = [
  { title: 'UMD Arboretum — Reisse Park', url: 'https://arboretum.umd.edu/reisse-park', evidence: 'Rooftop planting palette, wooden deck, and waterfall fountain; official photos show the tall glass wind screens and curved planter seating.' },
  { title: 'UMD CS — room-specific furniture plans', url: 'https://www.cs.umd.edu/meeting-event-request', evidence: 'Gannon fanned desk banks; 60-inch round tables and six-chair clusters in 1207, 2107, 2207 and 1116; gallery photograph documents walnut tables, upholstered navy chairs, gray ceiling and suspended angular lights.' },
  { title: 'UMD Iribe — auditorium interior and learning spaces', url: 'https://iribe.umd.edu/innovation', evidence: 'Antonov photograph: shared desks, dark swivel seating, wood acoustic panels, angular warm lighting and three projection screens; 298-seat capacity.' },
  { title: 'UMD Residential Facilities — Iribe floor plans', url: 'https://drf.umd.edu/about-us/learning-day/2026', evidence: 'Ground, first, second and fifth-floor wayfinding; room numbers and adjacencies.' },
  { title: 'UMD Computer Science / HDR — building guide', url: 'https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf', evidence: 'Ground, levels 1, 2, 4 and roof plan spreads; Level 4 north-wing offices and shared workrooms; photographed furniture, stairs, garden and labs.' },
  { title: 'HDR — Iribe Center', url: 'https://www.hdrinc.com/portfolio/brendan-iribe-center-computer-science-and-engineering', evidence: 'Double-height lobby, sculptural stair, exposed ceiling, irregular suspended linear lighting, glazing and auditorium.' },
  { title: 'UMD — Opening a Door to Tomorrow', url: 'https://cmns.umd.edu/news-events/news/opening-door-tomorrow', evidence: 'Glass-walled labs, circular collaborative classroom tables, 5,300-square-foot Sandbox.' },
] as const;

export const INTERIOR_FIDELITY = {
  verified: ['Floor naming', 'Named public-room adjacencies', 'Lobby material palette', 'Atrium stair wrapping a wood-clad core', 'Yellow lounge seating', 'Exposed black ceilings and suspended strip lights', 'Glazed lab fronts', 'Circular teaching tables', 'Roof garden'],
  estimated: ['Metric dimensions interpreted from undimensioned diagrams', 'Furniture positions between photographed viewpoints', 'Ceiling service routes', 'Office finishes and equipment not shown in photographs', 'Auditorium tier heights and row allocation', 'Gannon furniture finishes where no public interior photograph is available'],
  incomplete: ['Complete Level 3 room plan', 'Remaining Level 4 west-wing offices and central service rooms', 'Room 4105 furnishings', 'Full Level 5 room plan', 'Nonpublic room interiors', 'Reisse Gallery photographic prints'],
};

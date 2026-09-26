/** Short landscape phones need a side panel; a bottom sheet leaves too little
 * height for both the map and the search field. */
export const LANDSCAPE_SIDE_QUERY =
  '(min-width: 500px) and (max-height: 500px) and (orientation: landscape)';

/** A wide tablet can show the browser and map together without a full-width sheet. */
export const WIDE_SIDE_QUERY = '(min-width: 900px) and (min-height: 501px)';

export const SIDE_PANEL_QUERY = `${WIDE_SIDE_QUERY}, ${LANDSCAPE_SIDE_QUERY}`;

/** Keep the camera's selection anchor in sync with the detail drawer. */
export type BriefDetailKind = 'map' | 'residence' | null;

/** Small but reachable sheet stop for exploring the 3D map on a phone. */
export function mobileMapPeek(viewportHeight: number): number {
  return Math.min(0.2, Math.max(0.12, 112 / viewportHeight));
}

export function mobileSheetSnapPoints(viewportHeight: number, compactDetail = false, briefKind: BriefDetailKind = null): [number, number, number] {
  const compactPeek = Math.min(0.58, Math.max(0.45, 380 / viewportHeight));
  // Leave room for the title and actions even when a building name wraps.
  const briefHeight = briefKind === 'residence' ? 350 : 340;
  const briefPeek = Math.min(0.65, Math.max(0.34, briefHeight / viewportHeight));
  if (briefKind) return [
    briefPeek,
    Math.min(0.78, Math.max(briefPeek + 0.08, 480 / viewportHeight)),
    0.92,
  ];
  // Short phones start at the map peek. Once someone opens Browse, give the
  // sheet enough height to expose a readable first result below the controls.
  if (!compactDetail && viewportHeight < 600) return [0.84, 0.90, 0.95];
  if (!compactDetail && viewportHeight < 720) return [
    Math.min(0.78, Math.max(0.72, 490 / viewportHeight)), 0.86, 0.92,
  ];
  // Taller phones can show both a useful map region and the first result.
  return [
    compactDetail
      ? compactPeek
      : Math.min(0.66, Math.max(0.56, 450 / viewportHeight)),
    compactDetail
      ? Math.min(0.68, Math.max(compactPeek + 0.08, 480 / viewportHeight))
      : Math.min(0.78, Math.max(0.62, 600 / viewportHeight)),
    0.92,
  ];
}

export function mobileSelectionScreenY(viewportHeight: number, compactDetail = false, briefKind: BriefDetailKind = null): number {
  const points = mobileSheetSnapPoints(viewportHeight, compactDetail, briefKind);
  const detailSheetFraction = compactDetail ? points[0] : points[1];
  const exposedMap = 1 - detailSheetFraction;
  // The target is a ground point; the building's facade and roof project
  // above it at a pitched camera angle. Put the ground point lower so the
  // *building* sits midway between the controls and the detail sheet.
  return exposedMap * (briefKind ? 0.55 : compactDetail ? 0.68 : 0.5);
}

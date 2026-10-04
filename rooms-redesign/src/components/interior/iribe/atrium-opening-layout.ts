import { ATRIUM_OPENING_SAMPLED_SOURCE } from './atrium-opening-trace';
import { firstGuidePlan } from './first-guide-layout';
import type { Point, Polygon } from './layout';

/** The source resolves an open broad guard and an open upper-flight edge.
 * Rendering a slab requires two estimated closure segments: along the core's
 * cab face, and across the stair mouth. They are not verified slab boundaries.
 * The source guard is kept separately so neither closure acquires a railing. */
// Tiny split-path joins remain in the provenance trace. Collapse them only in
// rendered contours, avoiding submillimeter panels and overlapping guard posts.
function renderedRun(run:readonly (readonly [number,number])[]):Point[]{
 const points:Point[]=[];
 for(const p of run){
  const mapped=firstGuidePlan(p[0],p[1]),last=points.at(-1);
  if(!last||Math.hypot(mapped[0]-last[0],mapped[1]-last[1])>.00035)points.push(mapped);
 }
 return points;
}
export const ATRIUM_SOURCE_OPENING_GUARD:Point[]=renderedRun(ATRIUM_OPENING_SAMPLED_SOURCE.voidFacing[0]);
const north=renderedRun(ATRIUM_OPENING_SAMPLED_SOURCE.upperNorthFlightFacing[0]);
export const ATRIUM_SOURCE_SLAB_MASK:Polygon=[...ATRIUM_SOURCE_OPENING_GUARD,...[...north].reverse()];

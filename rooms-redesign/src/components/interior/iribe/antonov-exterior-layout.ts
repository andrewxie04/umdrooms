import { firstGuidePlan } from './first-guide-layout';
import { ANTONOV_NATIVE_OUTDOOR_FLIGHTS } from './antonov-shell-runtime-source';
import { pointInPolygon, type Point, type Polygon } from './layout';
import type { Position } from './circulation';

// Cross-sections follow the visible riser lines on HDR / UMD guide page index 8.
// Original PDF points, outside the front seating wall. Nick Seitz's 2019 photos
// independently show this as an OPEN outdoor stair with gates and a parapet.
// Grade and landing elevations are NOT published. 0 / 2.8 / 5.6 / 8.4 m are
// explicit model estimates; this stair is not a verified garden/foyer connection.
type Section=readonly [Point,Point];
const world=(section:Section):Section=>section.map(p=>firstGuidePlan(...p)) as unknown as Section;
const center=(s:Section):Point=>[(s[0][0]+s[1][0])/2,(s[0][1]+s[1][1])/2];
const strip=(a:Section,b:Section):Polygon=>[a[0],a[1],b[1],b[0]];
export const ANTONOV_EXTERIOR_TOP=8.4;
export interface ExteriorStairPiece { polygon:Polygon; height:number; rise:number; from:Section; to:Section; }
const flights=ANTONOV_NATIVE_OUTDOOR_FLIGHTS.map(f=>f.sections.map(s=>world([s.outerSidePt,s.masonrySidePt])));
const apron=world([[250.3,263.7],[266.1,252.0]]);
const top=world([[233.4,125.2],[248.0,128.4]]);
const envelopeSections=[apron,...flights.flat(),top];
// Finite projected opening in the fitted adjoining slab/ceiling. The native
// flights stay separate from the estimated apron, landing bridges and top.
export const ANTONOV_EXTERIOR_ENVELOPE:Polygon=[...envelopeSections.map(s=>s[0]),...envelopeSections.map(s=>s[1]).reverse()];
export const ANTONOV_EXTERIOR_PIECES:ExteriorStairPiece[]=[];
export const ANTONOV_EXTERIOR_ROUTE:Position[]=[];
function add(from:Section,to:Section,height:number,rise=0){
 ANTONOV_EXTERIOR_PIECES.push({polygon:strip(from,to),height,rise,from,to});
 const a=center(from),b=center(to);
 ANTONOV_EXTERIOR_ROUTE.push([(a[0]+b[0])/2,height,(a[1]+b[1])/2]);
}
add(apron,flights[0][0],0);
for(const [i,flight] of flights.entries()){
 const rise=2.8/(flight.length-1);
 for(let j=0;j<flight.length-1;j++)add(flight[j],flight[j+1],i*2.8+(j+1)*rise,rise);
 if(i<2)add(flight.at(-1)!,flights[i+1][0],(i+1)*2.8);
}
add(flights[2].at(-1)!,top,ANTONOV_EXTERIOR_TOP);
export const ANTONOV_EXTERIOR_ENTRY=center(apron);
// Apply the same horizontal polygons/elevations to rendering and navigation.
export function antonovExteriorHeight(point:Point):number|null {
 const pieces=ANTONOV_EXTERIOR_PIECES.filter(piece=>pointInPolygon(point,piece.polygon));
 return pieces.length?Math.max(...pieces.map(piece=>piece.height)):null;
}

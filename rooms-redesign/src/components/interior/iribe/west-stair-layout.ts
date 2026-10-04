import { WEST_STAIR_FRAME, FLOOR_HEIGHT, type FloorId, type Point, type Polygon } from './layout';
import type { Flight } from './circulation';

// HDR pages 12–13: west enclosed switchback, beside the elevator. Coordinates
// below use the joined 8× PDF crop at (510,282), then the existing west-wing
// registration. Ground, Level 1 and Level 2 HDR sheets show the same west core;
// Level 5 wayfinding independently marks it. Repeat its vertical circulation
// between G and 5, with the unverified Level 3 landing explicitly estimated.
// Shaft dimensions, floor heights and landing registration are not surveyed.
const {at,u,v,width,length,shaft}=WEST_STAIR_FRAME;
const landingDepth=1.55,turnZ=1.55,flightEnd=length-landingDepth;
const path:Point[]=[at(width*.75,flightEnd),at(width*.75,turnZ),at(width*.75,.75),at(width*.25,.75),at(width*.25,turnZ),at(width*.25,flightEnd)];
const flightWidth=Math.min(1.35,width/2-.22);
const opening:Polygon=[[.1,.1],[width-.1,.1],[width-.1,flightEnd],[.1,flightEnd]].map(([x,z])=>at(x,z));
const doorZ=length-.77;
export const WEST_STAIR_FLOORS:readonly FloorId[]=['G','1','2','3','4','5'];
export const WEST_STAIRS=WEST_STAIR_FLOORS.slice(0,-1).map((lower,i)=>{
 const upper=WEST_STAIR_FLOORS[i+1],middle=(FLOOR_HEIGHT[lower]+FLOOR_HEIGHT[upper])/2;
 const heights=[FLOOR_HEIGHT[lower],middle,middle,middle,middle,FLOOR_HEIGHT[upper]];
 const flights:Flight[]=path.slice(0,-1).map((p,j)=>({from:[p[0],heights[j],p[1]],to:[path[j+1][0],heights[j+1],path[j+1][1]],width:flightWidth,lower,upper}));
 // Stand in the open doorway approach. The old .8 m offset placed the
 // starting body inside the verified Ground/Level 1/Level 2 column clearance.
 return {lower,upper,at,u,v,width,length,angle:-Math.atan2(u[1],u[0]),shaft,opening,flights,flightWidth,flightEnd,turnZ,doorZ,door:at(0,doorZ),entry:at(-.5,doorZ),landing:at(width*.25,doorZ)};
});
// Keep the original Level 4 reference frame for the adjoining traced rooms.
export const WEST_STAIR=WEST_STAIRS.find(s=>s.lower==='4')!;
export const westStairForFloor=(floor:FloorId)=>WEST_STAIRS.find(s=>s.lower===floor)??WEST_STAIRS.find(s=>s.upper===floor);

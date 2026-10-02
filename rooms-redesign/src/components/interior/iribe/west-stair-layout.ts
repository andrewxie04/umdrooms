import { westFourthPlan, FLOOR_HEIGHT, type Point, type Polygon } from './layout';
import type { Flight } from './circulation';

// HDR pages 12–13: west enclosed switchback, beside the elevator. Coordinates
// below use the joined 8× PDF crop at (510,282), then the existing west-wing
// registration. Level 5 wayfinding independently marks this stair/elevator
// location. Shaft dimensions and upper landing are interpreted, not surveyed.
const source=(x:number,y:number)=>westFourthPlan(300+x*.375,396+y*.375);
const a=source(122,227),b=source(243,108),end=source(408,491);
const width=Math.hypot(b[0]-a[0],b[1]-a[1]);
const u:Point=[(b[0]-a[0])/width,(b[1]-a[1])/width];
let v:Point=[-u[1],u[0]];
if((end[0]-a[0])*v[0]+(end[1]-a[1])*v[1]<0)v=[-v[0],-v[1]];
const length=(end[0]-a[0])*v[0]+(end[1]-a[1])*v[1];
const at=(x:number,z:number):Point=>[a[0]+u[0]*x+v[0]*z,a[1]+u[1]*x+v[1]*z];
const shaft:Polygon=[[0,0],[width,0],[width,length],[0,length]].map(([x,z])=>at(x,z));
const landingDepth=1.55,turnZ=.8,flightEnd=length-landingDepth;
const path:Point[]=[at(width*.75,flightEnd),at(width*.75,turnZ),at(width*.25,turnZ),at(width*.25,flightEnd)];
const heights=[FLOOR_HEIGHT['4'],(FLOOR_HEIGHT['4']+FLOOR_HEIGHT['5'])/2,(FLOOR_HEIGHT['4']+FLOOR_HEIGHT['5'])/2,FLOOR_HEIGHT['5']];
const flightWidth=Math.min(1.35,width/2-.22);
const flights:Flight[]=path.slice(0,-1).map((p,i)=>({from:[p[0],heights[i],p[1]],to:[path[i+1][0],heights[i+1],path[i+1][1]],width:flightWidth,lower:'4',upper:'5'}));
const opening:Polygon=[[.1,.1],[width-.1,.1],[width-.1,flightEnd],[.1,flightEnd]].map(([x,z])=>at(x,z));
const doorZ=length-.77;
export const WEST_STAIR={lower:'4' as const,upper:'5' as const,at,u,v,width,length,angle:-Math.atan2(u[1],u[0]),shaft,opening,flights,flightWidth,flightEnd,turnZ,doorZ,door:at(0,doorZ),entry:at(-.8,doorZ),landing:at(width*.25,doorZ)};

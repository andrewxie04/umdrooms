import { COMMUNICATING_STAIRS } from './communicating-layout';
import { amphitheaterHeight } from './amphitheater';
import { roofTerrainHeight } from './roof-layout';
import { antonovHeight, gannonHeight } from './auditorium';
import { footprintForFloor, ATRIUM_VOID, atriumPoint, FLOOR_HEIGHT, FAMILY_TERRACE, pointInPolygon, plan, type FloorId, type Point, type Polygon } from './layout';

export type Position = readonly [number, number, number];
export interface Flight { from:Position; to:Position; width:number; lower:FloorId; upper:FloorId; }
export const FLOOR_ORDER:FloorId[]=['G','1','2','3','4','5','R'];
// Enclosed north stair aligns with the north stair symbol on UMD's first-floor
// wayfinding sheet. Metric rise/run is estimated, not a construction drawing.
export const STAIR_CENTER=plan(536,865);
const [cx,cz]=STAIR_CENTER;
export const STAIR_HOLE:Polygon=[[cx-1.65,cz-3.8],[cx+1.65,cz-3.8],[cx+1.65,cz+3.5],[cx-1.65,cz+3.5]];
export const stairEntry=(floor:FloorId):Point=>floor==='G'?[cx-.77,cz+3.5]:[cx+.77,cz+3.5];
export const ENCLOSED_FLIGHTS:Flight[]=FLOOR_ORDER.slice(0,-1).flatMap((lower,i)=>{
 const upper=FLOOR_ORDER[i+1],y=FLOOR_HEIGHT[lower],top=FLOOR_HEIGHT[upper],mid=(y+top)/2;
 const path:Position[]=[[cx-.77,y,cz+3.5],[cx-.77,mid,cz-2.8],[cx+.77,mid,cz-2.8],[cx+.77,top,cz+3.5]];
 return path.slice(0,-1).map((from,j)=>({from,to:path[j+1],width:1.35,lower,upper}));
});

// Two straight flights flank a curved intermediate landing. The former
// continuous helix did not match the stairs drawn in HDR's ground/Level 1 plans.
const atriumPosition=(x:number,y:number,z:number):Position=>{const p=atriumPoint(x,z);return [p[0],y,p[1]];};
const intermediate=FLOOR_HEIGHT['1']/2;
const atriumPath:Position[]=[atriumPosition(-3.7,0,-5.1),atriumPosition(-3.7,intermediate,.3)];
for(let i=1;i<=24;i++){
 const a=Math.PI-i/24*Math.PI;
 atriumPath.push(atriumPosition(Math.cos(a)*3.7,intermediate,.3+Math.sin(a)*3.7));
}
atriumPath.push(atriumPosition(3.7,intermediate,-3.4),atriumPosition(3,intermediate,-3.4),atriumPosition(-2.2,FLOOR_HEIGHT['1'],-3.4));
export const ATRIUM_FLIGHTS:Flight[]=atriumPath.slice(0,-1).map((from,i)=>({from,to:atriumPath[i+1],width:1.8,lower:'G',upper:'1'}));
export const ATRIUM_LANDING:Flight={from:atriumPath[atriumPath.length-1],to:atriumPosition(-5.5,FLOOR_HEIGHT['1'],-3.4),width:1.8,lower:'G',upper:'1'};
export const FLIGHTS=[...ENCLOSED_FLIGHTS,...ATRIUM_FLIGHTS,ATRIUM_LANDING,...COMMUNICATING_STAIRS.flatMap(stair=>[...stair.flights,stair.landing])];

export function flightHeight(point:Point,flight:Flight):number|null {
 const [x,y,z]=flight.from,[bx,by,bz]=flight.to,dx=bx-x,dz=bz-z,len2=dx*dx+dz*dz;
 const t=((point[0]-x)*dx+(point[1]-z)*dz)/len2;
 if(t<-.025||t>1.025)return null;
 const clamped=Math.max(0,Math.min(1,t));
 if(Math.hypot(point[0]-x-clamped*dx,point[1]-z-clamped*dz)>flight.width/2)return null;
 return y+clamped*(by-y);
}

export function floorAtHeight(y:number):FloorId {
 return FLOOR_ORDER.reduce((best,f)=>Math.abs(FLOOR_HEIGHT[f]-y)<Math.abs(FLOOR_HEIGHT[best]-y)?f:best,'G');
}

export function floorAtPosition(position:Position):FloorId {
 const [x,y,z]=position;
 if(antonovHeight([x,z])!==null)return 'G';
 return floorAtHeight(y);
}
/** Find nearby support, not a free-flight surface. Cap ascent/descent to a step. */
export function supportHeight(point:Point,current:number):number|null {
 const candidates:number[]=[];
 for(const f of FLOOR_ORDER){
  const footprint=footprintForFloor(f);
  if((pointInPolygon(point,footprint)||(f==='1'&&pointInPolygon(point,FAMILY_TERRACE))) && (f==='G'||!pointInPolygon(point,STAIR_HOLE)) && (f!=='1'||!pointInPolygon(point,ATRIUM_VOID)) && !COMMUNICATING_STAIRS.some(stair=>stair.upper===f&&pointInPolygon(point,stair.void))) candidates.push(FLOOR_HEIGHT[f]+(f==='R'?roofTerrainHeight(point):f==='G'?(amphitheaterHeight(point)??0):0));
 }
 const gannon=gannonHeight(point);if(gannon!==null)candidates.push(gannon);
 const auditorium=antonovHeight(point);if(auditorium!==null)candidates.push(auditorium);
 for(const flight of FLIGHTS){const h=flightHeight(point,flight);if(h!==null)candidates.push(h);}
 return candidates.filter(h=>h<=current+.32&&h>=current-.38).sort((a,b)=>b-a)[0]??null;
}

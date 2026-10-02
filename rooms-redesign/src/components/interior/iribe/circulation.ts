import { ATRIUM_VOID, groundPlan, FLOOR_HEIGHT, GROUND_FOOTPRINT, MAIN_FOOTPRINT, pointInPolygon, plan, type FloorId, type Point, type Polygon } from './layout';

export type Position = readonly [number, number, number];
export interface Flight { from:Position; to:Position; width:number; lower:FloorId; upper:FloorId; }
export const FLOOR_ORDER:FloorId[]=['G','1','2','3','4','5','R'];
// Enclosed north stair aligns with the north stair symbol on UMD's first-floor
// wayfinding sheet. Metric rise/run is estimated, not a construction drawing.
export const STAIR_CENTER=plan(536,865);
const [cx,cz]=STAIR_CENTER;
export const STAIR_HOLE:Polygon=[[cx-1.65,cz-3.8],[cx+1.65,cz-3.8],[cx+1.65,cz+2.7],[cx-1.65,cz+2.7]];
export const stairEntry=(floor:FloorId):Point=>floor==='G'?[cx-.77,cz+3.5]:[cx+.77,cz+3.5];
export const ENCLOSED_FLIGHTS:Flight[]=FLOOR_ORDER.slice(0,-1).flatMap((lower,i)=>{
 const upper=FLOOR_ORDER[i+1],y=FLOOR_HEIGHT[lower],top=FLOOR_HEIGHT[upper],mid=(y+top)/2;
 const path:Position[]=[[cx-.77,y,cz+3.5],[cx-.77,mid,cz-2.8],[cx+.77,mid,cz-2.8],[cx+.77,top,cz+3.5]];
 return path.slice(0,-1).map((from,j)=>({from,to:path[j+1],width:1.35,lower,upper}));
});

const core=groundPlan(1080,810);
export const ATRIUM_FLIGHTS:Flight[]=Array.from({length:44},(_,i)=>{
 const a=-Math.PI*.8+i/44*Math.PI*1.5,b=-Math.PI*.8+(i+1)/44*Math.PI*1.5;
 return {from:[core[0]+Math.cos(a)*2.6,i/44*6.5,core[1]+Math.sin(a)*2.6],to:[core[0]+Math.cos(b)*2.6,(i+1)/44*6.5,core[1]+Math.sin(b)*2.6],width:1.8,lower:'G',upper:'1'};
});
export const FLIGHTS=[...ENCLOSED_FLIGHTS,...ATRIUM_FLIGHTS];

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

/** Find nearby support, not a free-flight surface. Cap ascent/descent to a step. */
export function supportHeight(point:Point,current:number):number|null {
 const candidates:number[]=[];
 for(const f of FLOOR_ORDER){
  const footprint=f==='G'?GROUND_FOOTPRINT:MAIN_FOOTPRINT;
  if(pointInPolygon(point,footprint) && (f==='G'||!pointInPolygon(point,STAIR_HOLE)) && (f!=='1'||!pointInPolygon(point,ATRIUM_VOID))) candidates.push(FLOOR_HEIGHT[f]);
 }
 for(const flight of FLIGHTS){const h=flightHeight(point,flight);if(h!==null)candidates.push(h);}
 return candidates.filter(h=>h<=current+.32&&h>=current-.38).sort((a,b)=>b-a)[0]??null;
}

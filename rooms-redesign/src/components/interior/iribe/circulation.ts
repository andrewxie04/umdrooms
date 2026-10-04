import { NORTH_FLIGHTS, northStairEntry } from './north-stair-layout';
import { NORTH_STAIR_CENTER, NORTH_STAIR_OPENING } from './north-stair-source-layout';
import { SOUTH_STAIR_OPENING, SOUTH_STAIR_ROUTE, SOUTH_STAIR_TOP_SUPPORT } from './lobby-south-stair-layout';
import { AMPH_DROP } from './layout';
import { CANOPY_APRON } from './lobby-canopy-layout';
import { SOUTH_APRON } from './lobby-south-layout';
import { atriumLowerFlight, atriumUpperFlight } from './atrium-stair-layout';
import { atriumMiddleLanding } from './atrium-middle-stair-layout';
import { WEST_STAIRS, westStairForFloor } from './west-stair-layout';
import { COMMUNICATING_STAIRS } from './communicating-layout';
import { amphitheaterHeight } from './amphitheater';
import { roofTerrainHeight } from './roof-layout';
import { antonovHeight, gannonHeight, GANNON_FOOTPRINT } from './auditorium';
import { antonovExteriorHeight } from './antonov-exterior-layout';
import { insideLift, ATRIUM_LIFT_APRON } from './lift-layout';
import { COURTYARD_APRON } from './lobby-entrance-layout';
import { footprintForFloor, ATRIUM_VOID, FLOOR_HEIGHT, FAMILY_TERRACE, pointInPolygon, distanceToSegment, type FloorId, type Point, type Polygon } from './layout';

export type Position = readonly [number, number, number];
export interface Flight { from:Position; to:Position; width:number; lower:FloorId; upper:FloorId; polygon?:Polygon; sections?:readonly {a:Point;b:Point;height:number}[]; route?:readonly Position[]; }
export const FLOOR_ORDER:FloorId[]=['G','1','2','3','4','5','R'];
// Shared native plan frame replaces the separately fitted shaft that crossed
// a Level 4 office. Physical rises and inferred upper continuity are estimates.
export const STAIR_CENTER=NORTH_STAIR_CENTER;
export const STAIR_HOLE=NORTH_STAIR_OPENING;
export const stairEntry=northStairEntry;
export const ENCLOSED_FLIGHTS:Flight[]=NORTH_FLIGHTS;

// Two straight flights flank a curved intermediate landing. The former
// continuous helix did not match the stairs drawn in HDR's ground/Level 1 plans.
const intermediate=FLOOR_HEIGHT['1']/2;
const lower=atriumLowerFlight(intermediate);
const upper=atriumUpperFlight(intermediate,FLOOR_HEIGHT['1']-intermediate);
export const ATRIUM_MIDDLE_LANDING=atriumMiddleLanding(lower.sections.at(-1)!,upper.sections[0],intermediate);
export const ATRIUM_FLIGHTS:Flight[]=[
 {from:[lower.from[0],0,lower.from[1]],to:[lower.to[0],intermediate,lower.to[1]],width:lower.width,polygon:lower.polygon,sections:lower.sections,lower:'G',upper:'1'},
 {...ATRIUM_MIDDLE_LANDING,lower:'G',upper:'1'},
 {from:[upper.from[0],intermediate,upper.from[1]],to:[upper.to[0],FLOOR_HEIGHT['1'],upper.to[1]],width:upper.width,polygon:upper.polygon,sections:upper.sections,lower:'G',upper:'1'},
];
const last=upper.sections.at(-1)!,previous=upper.sections.at(-2)!,before:Point=[(previous.a[0]+previous.b[0])/2,(previous.a[1]+previous.b[1])/2],dx=upper.to[0]-before[0],dz=upper.to[1]-before[1],length=Math.hypot(dx,dz);
export const ATRIUM_LANDING:Flight={from:ATRIUM_FLIGHTS.at(-1)!.to,to:[upper.to[0]+dx/length*1.7,FLOOR_HEIGHT['1'],upper.to[1]+dz/length*1.7],width:Math.hypot(last.a[0]-last.b[0],last.a[1]-last.b[1]),lower:'G',upper:'1'};
export const ATRIUM_LANDING_POLYGON:Polygon=[last.a,last.b,[last.b[0]+dx/length*1.7,last.b[1]+dz/length*1.7],[last.a[0]+dx/length*1.7,last.a[1]+dz/length*1.7]];
export const FLIGHTS=[...SOUTH_STAIR_ROUTE,SOUTH_STAIR_TOP_SUPPORT,...WEST_STAIRS.flatMap(stair=>stair.flights),...ENCLOSED_FLIGHTS,...ATRIUM_FLIGHTS,ATRIUM_LANDING,...COMMUNICATING_STAIRS.flatMap(stair=>[...stair.flights,stair.landing])];

export function flightHeight(point:Point,flight:Flight):number|null {
 if(flight.polygon&&!flight.sections&&flight.from[1]===flight.to[1])return pointInPolygon(point,flight.polygon)||flight.polygon.some((p,i)=>distanceToSegment(point,p,flight.polygon![(i+1)%flight.polygon!.length])<.025)?flight.from[1]:null;
 if(flight.sections&&flight.polygon){
  if(!pointInPolygon(point,flight.polygon)&&!flight.polygon.some((p,i)=>distanceToSegment(point,p,flight.polygon![(i+1)%flight.polygon!.length])<.025))return null;
  // Invert each lofted tread band. Height stays constant along its interpolated
  // cross-section even where the stair fans, rather than following a fitted axis.
  for(let i=0;i<flight.sections.length-1;i++){
   const a=flight.sections[i],b=flight.sections[i+1],quad:Polygon=[a.a,a.b,b.b,b.a];
   if(!pointInPolygon(point,quad)&&!quad.some((p,j)=>distanceToSegment(point,p,quad[(j+1)%4])<.025))continue;
   const ex=a.b[0]-a.a[0],ez=a.b[1]-a.a[1],rx=b.a[0]-a.a[0],rz=b.a[1]-a.a[1],fx=b.b[0]-b.a[0]-ex,fz=b.b[1]-b.a[1]-ez;
   let t=.5,u=.5;
   for(let j=0;j<6;j++){
    const px=a.a[0]+u*ex+t*rx+t*u*fx-point[0],pz=a.a[1]+u*ez+t*rz+t*u*fz-point[1];
    const tx=rx+u*fx,tz=rz+u*fz,ux=ex+t*fx,uz=ez+t*fz,det=tx*uz-tz*ux;
    if(Math.abs(det)<1e-10)break;
    t-=(px*uz-pz*ux)/det;u-=(tx*pz-tz*px)/det;
   }
   if(t>=-.15&&t<=1.15&&u>=-.03&&u<=1.03)return a.height+Math.max(0,Math.min(1,t))*(b.height-a.height);
  }
  return null;
 }
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
 if(antonovExteriorHeight([x,z])!==null)return 'G';
 if(antonovHeight([x,z])!==null)return 'G';
 return floorAtHeight(y);
}
/** Find nearby support, not a free-flight surface. Cap ascent/descent to a step. */
export function supportHeight(point:Point,current:number):number|null {
 const candidates:number[]=[];
 if(pointInPolygon(point,COURTYARD_APRON))candidates.push(0);
 if(pointInPolygon(point,SOUTH_APRON))candidates.push(0);
 if(pointInPolygon(point,CANOPY_APRON))candidates.push(-AMPH_DROP);
 for(const f of FLOOR_ORDER)if(insideLift(f,point,0))candidates.push(FLOOR_HEIGHT[f]);
 if(pointInPolygon(point,ATRIUM_LIFT_APRON))candidates.push(FLOOR_HEIGHT['1']);
 for(const f of FLOOR_ORDER){
  const footprint=footprintForFloor(f),westStair=westStairForFloor(f);
  if((pointInPolygon(point,footprint)||(f==='1'&&pointInPolygon(point,FAMILY_TERRACE))) && (f!=='G'||!pointInPolygon(point,GANNON_FOOTPRINT)) && (f==='G'||!pointInPolygon(point,STAIR_HOLE)) && (f==='G'||!westStair||!pointInPolygon(point,westStair.opening)) && (f!=='1'||!pointInPolygon(point,ATRIUM_VOID)&&!pointInPolygon(point,SOUTH_STAIR_OPENING)) && !COMMUNICATING_STAIRS.some(stair=>stair.upper===f&&pointInPolygon(point,stair.void))) candidates.push(FLOOR_HEIGHT[f]+(f==='R'?roofTerrainHeight(point):f==='G'?(amphitheaterHeight(point)??0):0));
 }
 const gannon=gannonHeight(point);if(gannon!==null)candidates.push(gannon);
 const auditorium=antonovHeight(point);if(auditorium!==null)candidates.push(auditorium);
 const exterior=antonovExteriorHeight(point);if(exterior!==null)candidates.push(exterior);
 for(const flight of FLIGHTS){const h=flightHeight(point,flight);if(h!==null)candidates.push(h);}
 return candidates.filter(h=>h<=current+.32&&h>=current-.38).sort((a,b)=>b-a)[0]??null;
}

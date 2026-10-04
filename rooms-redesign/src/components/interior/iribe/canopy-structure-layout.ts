import { groundGuidePlan } from './ground-guide-layout';
import { GROUND_COLUMN_TRACE } from './ground-column-trace';
import { CANOPY_STRUCTURE_SOURCE } from './canopy-structure-source';
import { LOBBY_CANOPY_DOOR_PAIRS } from './lobby-canopy-door-trace';
import type { Point, Polygon } from './layout';

const path=(id:number)=>CANOPY_STRUCTURE_SOURCE.find(p=>p.pathIndex===id)!;
const native=(id:number,end:1|2):Point=>path(id).items[0][end];
const mapped=(p:Point)=>groundGuidePlan(...p);
const upper=native(52672,2),northEast=native(52670,1),eastStart=native(52669,2),southEast=native(52664,1);
const leaves=LOBBY_CANOPY_DOOR_PAIRS.flatMap(p=>p.leaves);
const a=leaves[0].hinge,b=leaves.at(-1)!.hinge;
const facadeAtY=(y:number):Point=>[a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]),y];
/** Three outer native overhead edges, with an estimated closure along the
 * extended canopy-door facade. Different native cap endpoints stay distinct. */
export const CANOPY_SOFFIT_OUTLINE:Polygon=[upper,northEast,eastStart,southEast,facadeAtY(southEast[1])].map(mapped);
const pavingEast=native(14797,2),pavingWest=native(14804,2);
/** Retain the native lower paving endpoints. Estimated western closures join
 * the extended door facade so no unsupported gap separates plaza and sill.
 * Top/east boundaries and filled planting interruptions remain estimates. */
export const CANOPY_PAVING:Polygon=[facadeAtY(upper[1]),upper,northEast,eastStart,pavingEast,pavingWest,facadeAtY(pavingWest[1])].map(mapped);
export const CANOPY_PAVING_LIMIT=[mapped(eastStart),mapped(pavingEast)] as const;
export const CANOPY_SOFFIT_HEIGHT=6.28;
const origin=mapped([0,0]),unit=mapped([1,0]),scale=Math.hypot(unit[0]-origin[0],unit[1]-origin[1]);
const directionStart=mapped([0,0]),directionEnd=mapped([0,1]);
const v:Point=[(directionEnd[0]-directionStart[0])/scale,(directionEnd[1]-directionStart[1])/scale];
/** Native Ground markers locate the estimated bases. Photographs establish
 * inclined silver supports; exact lean, top attachment and base level remain
 * unmeasured. Two rows splay apart by an estimated 1.4 m at the soffit. */
export const CANOPY_COLUMNS=GROUND_COLUMN_TRACE.filter(c=>c.sourceBuilding==='outside'&&c.zone==='east-canopy').map(c=>{
 const sign=c.center[1]<450?-1:1;
 const center=mapped(c.center),offset:Point=[v[0]*1.4*sign,v[1]*1.4*sign];
 return {id:c.id,center,radius:c.markerRadiusPt*scale,top:[center[0]+offset[0],center[1]+offset[1]] as Point};
});
export type CanopyColumn=typeof CANOPY_COLUMNS[number];
export function canopyColumnSection(c:CanopyColumn,y:number,base:number){
 const rise=CANOPY_SOFFIT_HEIGHT-base,dx=c.top[0]-c.center[0],dz=c.top[1]-c.center[1],lean=Math.hypot(dx,dz),t=(y-base)/rise;
 return {center:[c.center[0]+dx*t,c.center[1]+dz*t] as Point,direction:[dx/lean,dz/lean] as Point,lean,cosine:rise/Math.hypot(rise,lean),sine:lean/Math.hypot(rise,lean)};
}

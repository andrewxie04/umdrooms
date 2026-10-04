import { firstGuidePlan } from './first-guide-layout';
import { groundGuidePlan } from './ground-guide-layout';
import { secondGuidePlan } from './second-guide-layout';
import { fourthGuidePlan } from './fourth-guide-layout';
import { NORTH_STAIR_SOURCE_PATHS, NORTH_STAIR_MASONRY_PATHS, NORTH_STAIR_UPPER_TREAD_PATHS, NORTH_STAIR_LOWER_TREAD_PATHS } from './north-stair-source';
import type { FloorId, Point, Polygon } from './layout';

// Original Level 1 wall inside corners. Axes are one orthogonal consumer frame;
// the complete rebates/paint remain in the native records below. Metric scale,
// wall heights, inferred floor continuity and step rise allocation are estimates.
const origin=firstGuidePlan(279.00018310546875,363.0132141113281);
const corner=firstGuidePlan(275.586181640625,389.70721435546875);
const width=Math.hypot(corner[0]-origin[0],corner[1]-origin[1]);
const u:Point=[(corner[0]-origin[0])/width,(corner[1]-origin[1])/width];
const right=firstGuidePlan(328.24249267578125,368.18609619140625);
let v:Point=[-u[1],u[0]];
if((right[0]-origin[0])*v[0]+(right[1]-origin[1])*v[1]<0)v=[-v[0],-v[1]];
const at=(x:number,z:number):Point=>[origin[0]+u[0]*x+v[0]*z,origin[1]+u[1]*x+v[1]*z];
const uv=(p:Point):Point=>[(p[0]-origin[0])*u[0]+(p[1]-origin[1])*u[1],(p[0]-origin[0])*v[0]+(p[1]-origin[1])*v[1]];
export const NORTH_STAIR_FRAME={origin,u,v,at,uv,width,length:(right[0]-origin[0])*v[0]+(right[1]-origin[1])*v[1]};
export const NORTH_STAIR_CENTER=firstGuidePlan(303.5,380);
const row=(id:number)=>{
 const item=NORTH_STAIR_SOURCE_PATHS.find(p=>p.page===8&&p.path===id)!.items[0];
 const ends=[firstGuidePlan(...item[1]),firstGuidePlan(...item[2])].sort((a,b)=>uv(a)[0]-uv(b)[0]);
 return {a:ends[0],b:ends[1],ref:{page:8,path:id,item:0},native:[item[1],item[2]]};
};
export const NORTH_STAIR_UPPER_ROWS=NORTH_STAIR_UPPER_TREAD_PATHS.map(row).sort((a,b)=>uv(a.a)[1]-uv(b.a)[1]);
export const NORTH_STAIR_LOWER_ROWS=NORTH_STAIR_LOWER_TREAD_PATHS.map(row).sort((a,b)=>uv(a.a)[1]-uv(b.a)[1]);
export const northSourcePage=(floor:FloorId):6|8|10|12=>floor==='G'?6:floor==='1'?8:floor==='2'?10:12;
export const northSourceMap=(page:6|8|10|12)=>(page===6?groundGuidePlan:page===8?firstGuidePlan:page===10?secondGuidePlan:fourthGuidePlan);
export function northMasonryPaths(floor:FloorId){
 const page=northSourcePage(floor),ids=NORTH_STAIR_MASONRY_PATHS[page],map=northSourceMap(page);
 return NORTH_STAIR_SOURCE_PATHS.filter(p=>p.page===page&&(ids as readonly number[]).includes(p.path)).map(p=>({...p,world:p.items.map(c=>[map(...c[1]),map(...c[2])] as const)}));
}
// Native source jamb corners. They delimit the plan aperture, not surveyed
// hardware dimensions. Ground has a west doorway; upper plans have east doors.
export const northStairDoor=(floor:FloorId):Point=>floor==='G'?groundGuidePlan((288.5111083984375+302.0343933105469)/2,(390.902099609375+392.63720703125)/2):firstGuidePlan((313.84149169921875+324.0155029296875)/2,(394.7732849121094+397.04010009765625)/2);
export const NORTH_STAIR_OPENING:Polygon=[
 at(.45,.18),at(width-.43,.18),at(width-.43,uv(NORTH_STAIR_LOWER_ROWS.at(-1)!.a)[1]),
 at(width/2,uv(NORTH_STAIR_LOWER_ROWS.at(-1)!.a)[1]),at(width/2,uv(NORTH_STAIR_UPPER_ROWS.at(-1)!.a)[1]),at(.45,uv(NORTH_STAIR_UPPER_ROWS.at(-1)!.a)[1]),
];

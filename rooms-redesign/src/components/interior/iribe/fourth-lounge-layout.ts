import { fourthGuidePlan } from './fourth-guide-layout';
import type { Point, Polygon } from './layout';

/** Furniture symbols read from original HDR/UMD Level 4 page 12, x487–555,
 * y419–513. These are approximate raster readings, not native vector traces
 * or a current furniture inventory. They share the reviewed facade frame.
 * The former generic table spanned the south corridor instead of following
 * the drawn north table, facade counter and three separate round tables. */
const p=(x:number,y:number):Point=>fourthGuidePlan(x,y);
const chairs=(table:Point,source:readonly Point[])=>source.map(([x,y])=>{
 const point=p(x,y);
 return {point,angle:Math.atan2(point[0]-table[0],point[1]-table[1])};
});
const group=(outline:Polygon,source:readonly Point[])=>{
 const polygon=outline.map(([x,y])=>p(x,y)),center:Point=[polygon.reduce((s,q)=>s+q[0],0)/polygon.length,polygon.reduce((s,q)=>s+q[1],0)/polygon.length];
 return {polygon,center,chairs:chairs(center,source)};
};

export const FOURTH_LOUNGE_TABLE=group(
 [[501.62,435.46],[530.46,439.23],[529.54,446],[500.69,442.15]],
 [[504.77,433.85],[509.15,434.38],[513.69,435.23],[518.77,436],[523.46,436.31],[527.92,437.08],
  [503.85,444.92],[508.15,445.92],[512.69,446.54],[517.08,447.23],[521.69,447.62],[526.23,447.85]],
);
export const FOURTH_LOUNGE_COUNTER=group(
 [[546.92,439.92],[550,440.31],[546.92,465.46],[543.69,465.08]],
 [[544.38,443],[543.77,447.46],[543,452.62],[542.38,457.08],[541.85,461.92]],
);
export const FOURTH_LOUNGE_ROUND_TABLES=[
 {source:[510.77,461.46] as Point,radiusPt:3.3,seats:[[506.54,457.38],[515.92,458.54],[505.92,465.23],[514.92,466.15]] as Point[]},
 {source:[528.77,487.85] as Point,radiusPt:3.65,seats:[[525.23,483.77],[532.69,484.31],[524.85,491.46],[531.92,492.15]] as Point[]},
 {source:[527.23,501.92] as Point,radiusPt:3.1,seats:[[531.85,501.15],[524.31,505.62]] as Point[]},
].map(({source,radiusPt,seats})=>{
 const center=p(...source),unit=p(source[0]+radiusPt,source[1]);
 return {center,radius:Math.hypot(unit[0]-center[0],unit[1]-center[1]),chairs:chairs(center,seats)};
});

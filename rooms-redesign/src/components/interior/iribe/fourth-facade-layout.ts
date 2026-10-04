import { FOURTH_FACADE_SOURCE } from './fourth-facade-trace';
import { registeredClosedGlazingBaseline } from './first-facade-layout';
import { fourthGuidePlan } from './fourth-guide-layout';
import type { Point, Polygon } from './layout';

/** All 196 independently retained Level 4 spans under its twenty-column fit.
 * The short cubic uses its native endpoint chord; native lateral transitions
 * and mullion/corner gaps use the documented interpreted baseline joins. */
export const FOURTH_SOURCE_FOOTPRINT=registeredClosedGlazingBaseline(FOURTH_FACADE_SOURCE,11,fourthGuidePlan);

const distance=(a:Point,b:Point)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function facadeProjection(p:Point){
 let best={point:p,edge:0,t:0,distance:Infinity};
 FOURTH_SOURCE_FOOTPRINT.forEach((a,i)=>{
  const b=FOURTH_SOURCE_FOOTPRINT[(i+1)%FOURTH_SOURCE_FOOTPRINT.length],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz))),point:Point=[a[0]+t*dx,a[1]+t*dz],d=distance(point,p);
  if(d<best.distance)best={point,edge:i,t,distance:d};
 });
 return best;
}
/** Follow the short facade run between two room partition/window junctions.
 * Connecting its endpoints with a chord would cut across the curved envelope.
 * Room partition raster coordinates remain estimates; native facade vertices
 * are inserted unchanged between the two projected junctions. */
export function fourthFacadeRoom(outline:Polygon,sourceExteriorEdges:readonly number[]){
 const exteriorSet=new Set(sourceExteriorEdges),polygon:Point[]=[],exteriorEdges:number[]=[];
 const n=FOURTH_SOURCE_FOOTPRINT.length;
 for(let i=0;i<outline.length;i++){
  const a=outline[i],b=outline[(i+1)%outline.length];
  if(!exteriorSet.has(i)){polygon.push(a);continue;}
  const start=facadeProjection(a),end=facadeProjection(b),forward:Point[]=[start.point],backward:Point[]=[start.point];
  const from=start.edge+start.t,to=end.edge+end.t,wrap=(k:number)=>FOURTH_SOURCE_FOOTPRINT[(k%n+n)%n];
  const forwardEnd=to<from?to+n:to;
  for(let k=Math.floor(from)+1;k<forwardEnd-1e-10;k++)forward.push(wrap(k));
  forward.push(end.point);
  const backwardEnd=to>from?to-n:to;
  for(let k=Math.ceil(from)-1;k>backwardEnd+1e-10;k--)backward.push(wrap(k));
  backward.push(end.point);
  const length=(p:Point[])=>p.slice(1).reduce((s,q,j)=>s+distance(p[j],q),0),run=length(forward)<=length(backward)?forward:backward;
  run.slice(0,-1).forEach((p,j)=>{if(j===0||distance(run[j-1],p)>1e-8){exteriorEdges.push(polygon.length);polygon.push(p);}});
 }
 return {polygon,exteriorEdges};
}

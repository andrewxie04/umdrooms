import { ATRIUM_MIDDLE_OUTER_SOURCE, ATRIUM_MIDDLE_INNER_SOURCE } from './atrium-middle-stair-trace';
import { sampleAtriumOpeningSegment, type AtriumOpeningSourceSegment } from './atrium-opening-trace';
import { groundGuidePlan } from './ground-guide-layout';
import type { Point, Polygon } from './layout';

const distance=(a:Point,b:Point)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const sample=(source:readonly AtriumOpeningSourceSegment[]):Point[]=>source.flatMap(s=>sampleAtriumOpeningSegment(s).map(p=>groundGuidePlan(...p)));
const clean=(points:readonly Point[]):Point[]=>points.filter((p,i)=>!i||distance(p,points[i-1])>.00035);
function closestSegment(points:readonly Point[],p:Point){
 let best={index:0,distance:Infinity};
 for(let i=0;i<points.length-1;i++){
  const a=points[i],b=points[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz;
  const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l));
  const d=Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);
  if(d<best.distance)best={index:i,distance:d};
 }
 return best.index;
}
const startAt=(points:Point[],p:Point)=>clean([p,...points.slice(closestSegment(points,p)+1)]);
const endAt=(points:Point[],p:Point)=>clean([...points.slice(0,closestSegment(points,p)+1),p]);
function along(points:readonly Point[],t:number):Point {
 const lengths=points.slice(1).map((p,i)=>distance(points[i],p)),total=lengths.reduce((sum,v)=>sum+v,0);
 let remaining=total*t;
 for(let i=0;i<lengths.length;i++){
  if(remaining<=lengths[i]||i===lengths.length-1){
   const u=lengths[i]?remaining/lengths[i]:0,a=points[i],b=points[i+1];
   return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];
  }
  remaining-=lengths[i];
 }
 return points[0];
}

/** Ground's complete intermediate plan outline, with open interfaces to the
 * two source flights. Source cross-sections trim the projected outline at
 * those interfaces; the short joins and the flat elevation are interpretations.
 * Level 1's different/partial projected cubic is comparison evidence only. */
export function atriumMiddleLanding(lower:{a:Point;b:Point},upper:{a:Point;b:Point},height:number){
 const outer=clean(endAt(startAt(sample(ATRIUM_MIDDLE_OUTER_SOURCE),lower.a),upper.b));
 const inner=clean(endAt(startAt(sample(ATRIUM_MIDDLE_INNER_SOURCE),lower.b),upper.a));
 const polygon:Polygon=[...outer,...inner.slice().reverse()];
 // An interior walking route follows both boundaries through the curve and
 // three straight returns. This is a navigation aid, not a surveyed centerline.
 const pairs:readonly [readonly Point[],readonly Point[]][]=[
  [startAt(sample(ATRIUM_MIDDLE_OUTER_SOURCE.slice(0,1)),lower.a),startAt(sample(ATRIUM_MIDDLE_INNER_SOURCE.slice(0,1)),lower.b)],
  [sample(ATRIUM_MIDDLE_OUTER_SOURCE.slice(1,2)),sample(ATRIUM_MIDDLE_INNER_SOURCE.slice(1,3))],
  [sample(ATRIUM_MIDDLE_OUTER_SOURCE.slice(2,3)),sample(ATRIUM_MIDDLE_INNER_SOURCE.slice(3,4))],
  [sample(ATRIUM_MIDDLE_OUTER_SOURCE.slice(3,4)),sample(ATRIUM_MIDDLE_INNER_SOURCE.slice(4,5))],
  [endAt(sample(ATRIUM_MIDDLE_OUTER_SOURCE.slice(4)),upper.b),endAt(sample(ATRIUM_MIDDLE_INNER_SOURCE.slice(5)),upper.a)],
 ];
 const route=clean(pairs.flatMap(([a,b])=>{
  const count=Math.max(1,Math.ceil(Math.max(a.slice(1).reduce((sum,p,i)=>sum+distance(a[i],p),0),b.slice(1).reduce((sum,p,i)=>sum+distance(b[i],p),0))/.3));
  return Array.from({length:count+1},(_,i)=>{const p=along(a,i/count),q=along(b,i/count);return [(p[0]+q[0])/2,(p[1]+q[1])/2] as Point;});
 })).map(p=>[p[0],height,p[1]] as const);
 return {outer,inner,polygon,route,from:route[0],to:route.at(-1)!,width:Math.min(distance(lower.a,lower.b),distance(upper.a,upper.b))};
}

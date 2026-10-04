import { CANOPY_BENCH_SOURCE } from './canopy-bench-source';
import { groundGuidePlan } from './ground-guide-layout';
import type { Point, Polygon } from './layout';

function circleCenter(points:readonly Point[]):Point{
 const mean:Point=[points.reduce((s,p)=>s+p[0],0)/points.length,points.reduce((s,p)=>s+p[1],0)/points.length];
 let xx=0,xz=0,zz=0,xr=0,zr=0;
 for(const p of points){const x=p[0]-mean[0],z=p[1]-mean[1],r=x*x+z*z;xx+=x*x;xz+=x*z;zz+=z*z;xr+=x*r/2;zr+=z*r/2;}
 const det=xx*zz-xz*xz;
 return [mean[0]+(xr*zz-zr*xz)/det,mean[1]+(zr*xx-xr*xz)/det];
}
/** Native polygon edges define the occupied seat. The fitted circle center is
 * used only to orient radial slats and hardware, never to replace that outline.
 * Sub-millimeter source gaps are bridged at their midpoint for triangulation;
 * both original endpoints remain intact in the separate source records. */
export const CANOPY_BENCHES=CANOPY_BENCH_SOURCE.map(source=>{
 const inner=source.segments.slice(0,source.innerCount),outer=source.segments.slice(source.innerCount+1,source.innerCount+1+source.outerCount);
 const center=groundGuidePlan(...circleCenter(inner.flatMap(s=>s.points)));
 const mapped=(segments:readonly typeof source.segments[number][]):Polygon=>segments.flatMap(s=>s.points.map(p=>groundGuidePlan(...p)));
 const innerEdge=mapped(inner),outerEdge=mapped(outer);
 const polygon:Polygon=source.segments.map((s,i)=>{const previous=source.segments[(i+source.segments.length-1)%source.segments.length].points[1],next=s.points[0];return groundGuidePlan((previous[0]+next[0])/2,(previous[1]+next[1])/2);});
 const opening=source.segments.filter((_,i)=>i===source.innerCount||i===source.segments.length-1).map(s=>groundGuidePlan((s.points[0][0]+s.points[1][0])/2,(s.points[0][1]+s.points[1][1])/2));
 const openingMid:Point=[(opening[0][0]+opening[1][0])/2,(opening[0][1]+opening[1][1])/2],length=Math.hypot(openingMid[0]-center[0],openingMid[1]-center[1]);
 return {id:source.id,center,polygon,innerEdge,outerEdge,openingDirection:[(openingMid[0]-center[0])/length,(openingMid[1]-center[1])/length] as Point};
});
export const CANOPY_BENCH_HEIGHT=.46;
export const CANOPY_BENCH_THICKNESS=.055;

const signedArea=(polygon:Polygon)=>polygon.reduce((s,p,i)=>{const q=polygon[(i+1)%polygon.length];return s+p[0]*q[1]-q[0]*p[1];},0)/2;
function removeCollinear(polygon:Polygon):Polygon{
 // Clipping a concave C against a wedge can leave an out-and-back edge along
 // a clipping ray. Remove its collinear vertex, including numerical remnants,
 // so triangulation receives one simple occupied strip rather than a spike.
 let p=polygon;
 while(p.length>=3){
  const next=p.filter((b,i)=>{const a=p[(i+p.length-1)%p.length],c=p[(i+1)%p.length],ux=b[0]-a[0],uz=b[1]-a[1],vx=c[0]-b[0],vz=c[1]-b[1];return Math.abs(ux*vz-uz*vx)>1e-9*Math.max(1,Math.hypot(ux,uz)*Math.hypot(vx,vz));});
  if(next.length===p.length)break;p=next;
 }
 return p;
}
function clip(polygon:Polygon,center:Point,angle:number,sign:number):Polygon{
 const dx=Math.cos(angle),dz=Math.sin(angle),side=(p:Point)=>sign*(dx*(p[1]-center[1])-dz*(p[0]-center[0]));
 const result:Point[]=[];
 polygon.forEach((a,i)=>{
  const b=polygon[(i+1)%polygon.length],sa=side(a),sb=side(b);
  if(sa>=0)result.push(a);
  if((sa>=0)!==(sb>=0)){const t=sa/(sa-sb);result.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
 });
 return result.filter((p,i)=>Math.hypot(p[0]-result[(i+result.length-1)%result.length][0],p[1]-result[(i+result.length-1)%result.length][1])>1e-7);
}
/** Clip slats against the actual source outline. Estimated 65 mm outer pitch
 * and a narrow gap provide real geometry rather than painted surface stripes. */
export function canopyBenchSlats(bench:typeof CANOPY_BENCHES[number]):Polygon[]{
 const radius=Math.max(...bench.outerEdge.map(p=>Math.hypot(p[0]-bench.center[0],p[1]-bench.center[1]))),count=Math.ceil(2*Math.PI*radius/.065),step=2*Math.PI/count;
 const slats:Polygon[]=[];
 for(let i=0;i<count;i++){
  const a=i*step,p=removeCollinear(clip(clip(bench.polygon,bench.center,a+step*.06,1),bench.center,a+step*.94,-1));
  if(p.length>=3&&Math.abs(signedArea(p))>.0001)slats.push(p);
 }
 return slats;
}

import { FIRST_WEST_FACADE_SOURCE, FIRST_WEST_SOUTH_INTERFACE_SOURCE } from './first-facade-trace';
import { firstGuidePlan } from './first-guide-layout';
import type { Point, Polygon } from './layout';

type Pane={readonly page:number;readonly points:readonly [Point,Point];readonly reversed?:boolean};
const canonical=(pane:Pane,continuationPage:number):readonly [Point,Point]=>{
 const shift=pane.page===continuationPage?576:0,[a,b]=pane.reversed?[pane.points[1],pane.points[0]]:pane.points;
 return [[a[0]-shift,a[1]],[b[0]-shift,b[1]]];
};
const distance=(a:Point,b:Point)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function join(a:readonly [Point,Point],b:readonly [Point,Point]):Point{
 const u:Point=[a[1][0]-a[0][0],a[1][1]-a[0][1]],v:Point=[b[1][0]-b[0][0],b[1][1]-b[0][1]];
 const det=u[0]*v[1]-u[1]*v[0];
 if(Math.abs(det)>1e-5){
  const dx=b[0][0]-a[0][0],dy=b[0][1]-a[0][1],t=(dx*v[1]-dy*v[0])/det;
  const p:Point=[a[0][0]+t*u[0],a[0][1]+t*u[1]];
  // Extend only through the drawn mullion/corner gaps. Rounded CAD panes can
  // be almost parallel; their distant line intersection is not the facade.
  if(distance(p,a[1])<2&&distance(p,b[0])<2)return p;
 }
 return [(a[1][0]+b[0][0])/2,(a[1][1]+b[0][1])/2];
}
/** One continuous glass baseline, retaining the source's changing pane angles.
 * The joins span mullion gaps; no arbitrary offset or fitted circular arc. */
export function registeredGlazingBaseline(source:readonly Pane[],southSource:Pane,continuationPage:number,register:(x:number,y:number)=>Point):Polygon{
 const panes=source.map(p=>canonical(p,continuationPage)),south=canonical(southSource,continuationPage);
 return [join(south,panes[0]),...panes.slice(1).map((pane,i)=>join(panes[i],pane)),panes.at(-1)![1]].map(p=>register(...p));
}
/** Closed source perimeter. Join only adjacent native pane baselines, applying
 * the same registration to every corner and curved facade segment. */
export function registeredClosedGlazingBaseline(source:readonly Pane[],continuationPage:number,register:(x:number,y:number)=>Point):Polygon{
 const panes=source.map(p=>canonical(p,continuationPage));
 return panes.map((pane,i)=>join(panes[(i+panes.length-1)%panes.length],pane)).map(p=>register(...p));
}
export const FIRST_WEST_FACADE=registeredGlazingBaseline(FIRST_WEST_FACADE_SOURCE,FIRST_WEST_SOUTH_INTERFACE_SOURCE,7,firstGuidePlan);

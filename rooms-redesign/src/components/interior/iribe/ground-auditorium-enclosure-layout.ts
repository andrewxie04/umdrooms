import {
 GROUND_AUDITORIUM_ENCLOSURE_NATIVE_MASKS,
 GROUND_AUDITORIUM_ENCLOSURE_RUNTIME_RUNS,
 GROUND_AUDITORIUM_ENCLOSURE_DOOR_INTERFACES,
 type GroundAuditoriumCommand,
} from './ground-auditorium-enclosure-source';
import { groundGuidePlan } from './ground-guide-layout';
import type { Point, Polygon } from './layout';

/** Ground lobby-facing auditorium/support masonry, separate from the smaller
 * Gannon furnished room and the outer stair parapet. Extrude these paint-union
 * masks, retaining holes; do not close a convex hull across the door interfaces.
 * Mapping uses the existing Ground column registration without a new fit. */
export const GROUND_AUDITORIUM_ENCLOSURE_SOLIDS:readonly {
 readonly outer:Polygon;readonly holes:Polygon[];
}[]=GROUND_AUDITORIUM_ENCLOSURE_NATIVE_MASKS.map(({outer,holes})=>({
 outer:outer.map(p=>groundGuidePlan(...p)),
 holes:holes.map(ring=>ring.map(p=>groundGuidePlan(...p))),
}));

/** Parent-selected provisional section, not derived from a plan or survey.
 * Brick finish is photo-informed; black plan paint establishes opaque topology. */
export const GROUND_AUDITORIUM_ENCLOSURE_SECTION={baseY:0,topY:6.3,evidence:'estimated'} as const;

const distance=(a:Point,b:Point)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
export function groundAuditoriumCommandPoint(c:GroundAuditoriumCommand,t:number):Point{
 if(c[0]==='re')throw new Error('Rectangle is not a directed auditorium face');
 if(c[0]==='l')return [c[1][0]+(c[2][0]-c[1][0])*t,c[1][1]+(c[2][1]-c[1][1])*t];
 const u=1-t;return [0,1].map(i=>u*u*u*c[1][i]+3*u*u*t*c[2][i]+3*u*t*t*c[3][i]+t*t*t*c[4][i]) as unknown as Point;
}

/** Convex-control-hull bound in original PDF points. De Casteljau subdivision
 * retains endpoints and gives at most 0.002 pt deviation from each chord.
 * Reversing travel does not rewrite the source command or its native controls. */
function sampled(c:GroundAuditoriumCommand):Point[]{
 if(c[0]==='re')throw new Error('Rectangle is not a directed auditorium face');
 if(c[0]==='l')return [c[1],c[2]];
 const out:Point[]=[c[1]],mid=(a:Point,b:Point):Point=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
 const segmentDistance=(p:Point,a:Point,b:Point)=>{
  const dx=b[0]-a[0],dz=b[1]-a[1],length=dx*dx+dz*dz;
  const t=length?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/length)):0;
  return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);
 };
 const visit=(p:readonly [Point,Point,Point,Point],depth=0)=>{
  if(Math.max(segmentDistance(p[1],p[0],p[3]),segmentDistance(p[2],p[0],p[3]))<=.002){out.push(p[3]);return;}
  if(depth>=20)throw new Error('Auditorium face sampling exceeded its error bound');
  const a=mid(p[0],p[1]),b=mid(p[1],p[2]),c=mid(p[2],p[3]),d=mid(a,b),e=mid(b,c),f=mid(d,e);
  visit([p[0],a,d,f],depth+1);visit([f,e,c,p[3]],depth+1);
 };
 visit([c[1],c[2],c[3],c[4]]);return out;
}

/** Faces remain OPEN independent native runs. Every edge owns one original
 * path/item; gaps are reported, never bridged into a wall or door closure.
 * normal points to the named face side: outward toward stair/lobby, inward
 * toward the auditorium/support rooms. It is a plan normal, not a section. */
export const GROUND_AUDITORIUM_ENCLOSURE_FACES=GROUND_AUDITORIUM_ENCLOSURE_RUNTIME_RUNS.map(run=>{
 const edges:{a:Point;b:Point;nativeA:Point;nativeB:Point;normal:Point;pathIndex:number;itemIndex:number}[]=[];
 const gaps:{from:Point;to:Point;nativeGapPt:number;worldGap:number}[]=[];
 let last:Point|undefined;
 for(const item of run.items){
  const points=sampled(item.command);if(item.reversed)points.reverse();
  if(last&&distance(last,points[0])>1e-8)gaps.push({from:groundGuidePlan(...last),to:groundGuidePlan(...points[0]),nativeGapPt:distance(last,points[0]),worldGap:distance(groundGuidePlan(...last),groundGuidePlan(...points[0]))});
  for(let i=0;i<points.length-1;i++){
   const nativeA=points[i],nativeB=points[i+1],a=groundGuidePlan(...nativeA),b=groundGuidePlan(...nativeB),length=distance(a,b);
   if(length<1e-12)continue;
   const sign=run.normalSide==='left'?1:-1;
   edges.push({a,b,nativeA,nativeB,normal:[-(b[1]-a[1])/length*sign,(b[0]-a[0])/length*sign],pathIndex:item.pathIndex,itemIndex:item.itemIndex});
  }
  last=points.at(-1)!;
 }
 return {id:run.id,owner:run.owner,normalSide:run.normalSide,edges,gaps};
});

/** These drawn doors border the stair/support interfaces, not the Gannon room.
 * Their symbols are preserved; the selected masks do not span their apertures.
 * Plan-symbol pose does not establish actual hardware, elevation or access. */
export const GROUND_AUDITORIUM_ENCLOSURE_DOORS=GROUND_AUDITORIUM_ENCLOSURE_DOOR_INTERFACES.map(door=>({
 id:door.id,owner:door.owner,leafPaths:door.leafPaths,swingPaths:door.swingPaths,
 leaves:door.drawnOpenings.map(leaf=>({
  hinge:groundGuidePlan(leaf.hinge[0],leaf.hinge[1]),openTip:groundGuidePlan(leaf.openTip[0],leaf.openTip[1]),closedTip:groundGuidePlan(leaf.closedTip[0],leaf.closedTip[1]),
 })),
}));

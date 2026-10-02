import { createProjection } from '../../map3d/scene/projection';
import { uniqueBuildingFootprints } from '../../map3d/scene/building-footprints';
import type { CampusData } from '../../map3d/scene/types';
import { GROUND_FOOTPRINT, MAIN_FOOTPRINT, FAMILY_TERRACE, distanceToSegment, groundPlan, pointInPolygon, type Point } from './layout';

export const SURROUNDINGS_CENTER:[number,number]=[-76.93625,38.98925];
export const SURROUNDINGS_RADIUS=425;
// Four identifiable corners match the public ground-floor diagram to the
// existing mapped outline. The fit is approximate (maximum residual ~3.2 m):
// the wayfinding sheet is not a measured survey. Preserve handedness and use
// one horizontal similarity transform, never independently stretch streets.
export const SITE_ANCHORS = [
 {geo:[-76.936701,38.98949],plan:[550,240]},
 {geo:[-76.9368699,38.9893487],plan:[390,413]},
 {geo:[-76.9364468,38.9889687],plan:[895,970]},
 {geo:[-76.9360562,38.98962],plan:[1360,39]},
] as const;
export const siteProjection=createProjection({center:SURROUNDINGS_CENTER} as CampusData);
const pairs=SITE_ANCHORS.map(a=>{const p=siteProjection.toLocal(a.geo[0],a.geo[1]);return {from:[p.x,p.z] as Point,to:groundPlan(a.plan[0],a.plan[1])};});
const mean=(which:'from'|'to'):Point=>[pairs.reduce((s,p)=>s+p[which][0],0)/pairs.length,pairs.reduce((s,p)=>s+p[which][1],0)/pairs.length];
const source=mean('from'),target=mean('to');
let denominator=0,dot=0,cross=0;
for(const p of pairs){const x=p.from[0]-source[0],z=p.from[1]-source[1],tx=p.to[0]-target[0],tz=p.to[1]-target[1];denominator+=x*x+z*z;dot+=x*tx+z*tz;cross+=x*tz-z*tx;}
export const SITE_A=dot/denominator,SITE_B=cross/denominator;
export const SITE_SCALE=Math.hypot(SITE_A,SITE_B);
export const SITE_OFFSET:Point=[target[0]-SITE_A*source[0]+SITE_B*source[1],target[1]-SITE_B*source[0]-SITE_A*source[1]];
export const campusToInterior=([x,z]:Point):Point=>[SITE_A*x-SITE_B*z+SITE_OFFSET[0],SITE_B*x+SITE_A*z+SITE_OFFSET[1]];
export const geoToInterior=([lng,lat]:readonly[number,number]):Point=>{const p=siteProjection.toLocal(lng,lat);return campusToInterior([p.x,p.z]);};
export function outsideInterior(p:Point,margin=0):boolean {
 return [GROUND_FOOTPRINT,MAIN_FOOTPRINT,FAMILY_TERRACE].every(r=>!pointInPolygon(p,r)&&r.every((a,i)=>distanceToSegment(p,a,r[(i+1)%r.length])>=margin));
}
const projected=(geo:readonly[number,number]):Point=>{const p=siteProjection.toLocal(...geo);return [p.x,p.z];};
function nearby(ring:readonly (readonly[number,number])[],closed=false):boolean {
 const points=ring.map(projected);
 return points.some(p=>Math.hypot(...p)<=SURROUNDINGS_RADIUS)||points.slice(0,closed?undefined:-1).some((a,i)=>distanceToSegment([0,0],a,points[(i+1)%points.length])<=SURROUNDINGS_RADIUS)||(closed&&pointInPolygon([0,0],points));
}
/** Clip the mapped lines away from the fitted building envelope. The external
 * context must never draw a raised road through the lowered amphitheater. */
function exteriorRuns(line:[number,number][],margin:number):[number,number][][] {
 const runs:[number,number][][]=[];let run:[number,number][]=[],previous:[number,number]|null=null;
 const append=(p:[number,number])=>{const last=run[run.length-1];if(!last||last[0]!==p[0]||last[1]!==p[1])run.push(p);};
 const finish=()=>{if(previous&&run.length)append(previous);if(run.length>1)runs.push(run);run=[];previous=null;};
 for(let i=0;i<line.length-1;i++){
  const a=line[i],b=line[i+1],pa=projected(a),pb=projected(b),steps=Math.max(1,Math.ceil(Math.hypot(pb[0]-pa[0],pb[1]-pa[1])/1.5));
  for(let j=0;j<=steps;j++){
   if(i&&j===0)continue;
   const t=j/steps,p:[number,number]=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
   if(outsideInterior(geoToInterior(p),margin)){
    // Sample to locate cuts, but retain only original bends and cut endpoints.
    // Densifying every untouched street adds thousands of redundant triangles.
    if(!run.length||j===steps)append(p);previous=p;
   }else finish();
  }
 }
 finish();return runs;
}
export function selectSurroundings(data:CampusData,trees:CampusData['trees']=data.trees):CampusData {
 return {...data,center:SURROUNDINGS_CENTER,
  buildings:uniqueBuildingFootprints(data.buildings).filter(b=>b.umdCode!=='IRB'&&b.id!=='way/698370196'&&nearby(b.footprint,true)&&b.footprint.every(p=>outsideInterior(geoToInterior(p),.5))),
  roads:data.roads.filter(r=>nearby(r.line)).flatMap(r=>exteriorRuns(r.line,Math.max(2.4,r.width)*SITE_SCALE/2+.3).map(line=>({...r,line}))),
  areas:data.areas.filter(a=>nearby(a.polygon,true)),
  waterways:data.waterways.filter(w=>nearby(w.line)).flatMap(w=>exteriorRuns(w.line,w.width*SITE_SCALE/2+.3).map(line=>({...w,line}))),
  trees:trees.filter(p=>Math.hypot(...projected([p[0],p[1]]))<=SURROUNDINGS_RADIUS&&outsideInterior(geoToInterior([p[0],p[1]]),(p[3]??3.7)*SITE_SCALE+1)),
 };
}

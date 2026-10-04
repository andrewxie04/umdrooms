import { GANNON_RUNTIME_RUNS, GANNON_RUNTIME_PAIRS, type GannonRuntimeCommand } from './gannon-ground-runtime-source';
import { groundGuidePlan } from './ground-guide-layout';
import type { Point, Polygon } from './layout';

/** Original command travel: fractions always refer to the native curve,
 * independently of reversed traversal. No interpolation of cubic endpoints. */
export function gannonCommandPoint(item:GannonRuntimeCommand,t:number):Point{
 const c=item.command;
 if(c[0]==='re')throw new Error('Unexpected rectangle in Gannon boundary subset');
 if(c[0]==='l')return [c[1][0]+(c[2][0]-c[1][0])*t,c[1][1]+(c[2][1]-c[1][1])*t];
 const s=1-t;
 return [s*s*s*c[1][0]+3*s*s*t*c[2][0]+3*s*t*t*c[3][0]+t*t*t*c[4][0],s*s*s*c[1][1]+3*s*s*t*c[2][1]+3*s*t*t*c[3][1]+t*t*t*c[4][1]];
}
const distance=(a:Point,b:Point)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function points(item:GannonRuntimeCommand):Point[]{
 const t0=item.t0??0,t1=item.t1??1,steps=item.command[0]==='c'?8:1;
 return Array.from({length:steps+1},(_,i)=>gannonCommandPoint(item,item.reversed?t1-(t1-t0)*i/steps:t0+(t1-t0)*i/steps));
}
const append=(out:Point[],p:Point)=>{if(!out.length||distance(out[out.length-1],p)>1e-8)out.push(p);};
export const GANNON_NATIVE_RUNS=GANNON_RUNTIME_RUNS.map(run=>{
 const outline:Point[]=[];for(const item of run.items)for(const p of points(item))append(outline,p);
 return {id:run.id,outline};
});
/** Derived floor ring: joins preserve native ends and explicitly bridge the
 * two door gaps. It is not a single closed native PDF path. Eight chords per
 * retained cubic approximate the source curve; metric scale remains estimated. */
export const GANNON_NATIVE_FOOTPRINT:Polygon=(()=>{
 const ring:Point[]=[];for(const run of GANNON_NATIVE_RUNS)for(const p of run.outline)append(ring,p);
 if(distance(ring[0],ring.at(-1)!)<1e-8)ring.pop();return ring;
})();
export const GANNON_WORLD_FOOTPRINT:Polygon=GANNON_NATIVE_FOOTPRINT.map(p=>groundGuidePlan(...p));
const thresholdPairs=[['upper-east-frame-return','middle-east-jamb-room-face'],['middle-east-jamb-room-face','lower-east-jamb-room-face']] as const;
export const GANNON_PAIR_THRESHOLDS=thresholdPairs.map(([before,after],i)=>{
 const a=groundGuidePlan(...GANNON_NATIVE_RUNS.find(r=>r.id===before)!.outline.at(-1)!),b=groundGuidePlan(...GANNON_NATIVE_RUNS.find(r=>r.id===after)!.outline[0]);
 return {id:GANNON_RUNTIME_PAIRS[i].id,a,b,center:[(a[0]+b[0])/2,(a[1]+b[1])/2] as Point,width:distance(a,b)};
});
export const GANNON_OPEN_EDGES=GANNON_PAIR_THRESHOLDS.map(({a,b})=>{
 const i=GANNON_WORLD_FOOTPRINT.findIndex((p,j)=>distance(p,a)<1e-8&&distance(GANNON_WORLD_FOOTPRINT[(j+1)%GANNON_WORLD_FOOTPRINT.length],b)<1e-8);
 if(i<0)throw new Error('Missing native Gannon door threshold');return i;
});
const stepMouth=GANNON_NATIVE_RUNS.find(r=>r.id==='southeast-step-mouth')!.outline;
export const GANNON_STEP_EDGE=GANNON_WORLD_FOOTPRINT.findIndex((p,i)=>distance(p,groundGuidePlan(...stepMouth[0]))<1e-8&&distance(GANNON_WORLD_FOOTPRINT[(i+1)%GANNON_WORLD_FOOTPRINT.length],groundGuidePlan(...stepMouth.at(-1)!))<1e-8);
export const GANNON_DOOR_LEAVES=GANNON_RUNTIME_PAIRS.flatMap(pair=>pair.leaves.map(leaf=>{
 // Three sides traverse in order; the fourth native line points back from
 // the hinge. Orient each side for the ring and midpoint its tiny endpoint
 // gap. This changes derived joins only; all raw commands stay unchanged.
 const edges=leaf.outline.map(item=>{const p=points(item);return {a:p[0],b:p.at(-1)!};});
 for(let i=1;i<edges.length;i++)if(distance(edges[i-1].b,edges[i].b)<distance(edges[i-1].b,edges[i].a))edges[i]={a:edges[i].b,b:edges[i].a};
 let maxJoinGapPt=0;
 const outline=edges.map((edge,i):Point=>{const before=edges[(i+edges.length-1)%edges.length].b;maxJoinGapPt=Math.max(maxJoinGapPt,distance(before,edge.a));return [(before[0]+edge.a[0])/2,(before[1]+edge.a[1])/2];});
 return {id:`${pair.id}-${leaf.id}`,maxJoinGapPt,outline:outline.map(p=>groundGuidePlan(...p))};
}));

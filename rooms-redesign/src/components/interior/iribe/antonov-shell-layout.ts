import { ANTONOV_SHELL_RUNS, type AntonovRuntimeCommand } from './antonov-shell-runtime-source';
import { firstGuidePlan } from './first-guide-layout';
import type { Point, Polygon } from './layout';

function at({command}:AntonovRuntimeCommand,t:number):Point {
 if(command[0]==='re')throw new Error('Unexpected rectangle in Antonov face run');
 if(command[0]==='l')return [command[1][0]+(command[2][0]-command[1][0])*t,command[1][1]+(command[2][1]-command[1][1])*t];
 const u=1-t;return [0,1].map(i=>u*u*u*command[1][i]+3*u*u*t*command[2][i]+3*u*t*t*command[3][i]+t*t*t*command[4][i]) as unknown as Point;
}
export interface AntonovShellEdge {a:Point;b:Point;runId:string;join:boolean;}
const native:Point[]=[],edges:AntonovShellEdge[]=[];
function append(point:Point,runId:string,join=false){
 if(native.length){const a=native.at(-1)!;if(Math.hypot(point[0]-a[0],point[1]-a[1])<1e-8)return;edges.push({a:firstGuidePlan(...a),b:firstGuidePlan(...point),runId,join});}
 native.push(point);
}
// The source is a set of interrupted room-face runs. Straight joins close its
// floor mask; they are explicit consumer interpretations, not source commands.
// Native door gaps stay separate from solid wall faces.
for(const run of ANTONOV_SHELL_RUNS)for(const item of run.commands){
 const from=item.ref.t0??0,to=item.ref.t1??1,start=item.ref.reverse?to:from,end=item.ref.reverse?from:to;
 append(at(item,start),run.id,true);
 const subdivide=(a:number,b:number,depth=0)=>{
  const pa=at(item,a),pb=at(item,b),dx=pb[0]-pa[0],dy=pb[1]-pa[1],length=Math.hypot(dx,dy);
  const error=Math.max(...[.25,.5,.75].map(t=>{const p=at(item,a+(b-a)*t);return length?Math.abs(dx*(p[1]-pa[1])-dy*(p[0]-pa[0]))/length:Math.hypot(p[0]-pa[0],p[1]-pa[1]);}));
  if(item.command[0]==='c'&&error>.005&&depth<10){const middle=(a+b)/2;subdivide(a,middle,depth+1);subdivide(middle,b,depth+1);}
  else append(pb,run.id);
 };
 subdivide(start,end);
}
append(native[0],ANTONOV_SHELL_RUNS[0].id,true);
if(Math.hypot(native.at(-1)![0]-native[0][0],native.at(-1)![1]-native[0][1])<1e-8)native.pop();
export const ANTONOV_NATIVE_FOOTPRINT:Polygon=native;
export const ANTONOV_WORLD_FOOTPRINT:Polygon=native.map(p=>firstGuidePlan(...p));
export const ANTONOV_SHELL_EDGES:readonly AntonovShellEdge[]=edges;
export const ANTONOV_THRESHOLD_EDGE=edges.findIndex(e=>e.join&&e.runId==='northeast-outer-jamb');
const threshold=edges[ANTONOV_THRESHOLD_EDGE];
export const ANTONOV_SOURCE_DOOR:Point=[(threshold.a[0]+threshold.b[0])/2,(threshold.a[1]+threshold.b[1])/2];
export const ANTONOV_SOURCE_DOOR_WIDTH=Math.hypot(threshold.b[0]-threshold.a[0],threshold.b[1]-threshold.a[1]);
export const ANTONOV_GARDEN_FACE:Polygon=edges.filter(e=>/^(northeast-to-east-return|east-|southeast-room-curve|southeast-late-mask-room-face|south-tip-return|south-room-facet)/.test(e.runId)).map(e=>e.a);

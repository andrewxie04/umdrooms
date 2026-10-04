import { groundGuidePlan } from './ground-guide-layout';
import { GROUND_NORTH_CORNER_INNER_CHAIN, GROUND_NORTH_CORNER_SOURCE_PATHS } from './ground-north-corner-trace';
import type { Point, Polygon } from './layout';

const sourceLine=(pathIndex:number,itemIndex=0)=>{
 const command=GROUND_NORTH_CORNER_SOURCE_PATHS.find(p=>p.pathIndex===pathIndex)!.items.find(i=>i.itemIndex===itemIndex)!.command;
 if(command[0]!=='l')throw new Error(`North corner ${pathIndex}:${itemIndex} is not a line`);
 return {a:command[1],b:command[2]};
};
const native=GROUND_NORTH_CORNER_INNER_CHAIN.map(ref=>{
 const line=sourceLine(ref.pathIndex,ref.itemIndex);return ref.reversed?{a:line.b,b:line.a}:line;
});
const mapped=(p:Point)=>groundGuidePlan(...p);
const intersection=(a:{a:Point;b:Point},b:{a:Point;b:Point}):Point=>{
 const u:Point=[a.b[0]-a.a[0],a.b[1]-a.a[1]],v:Point=[b.b[0]-b.a[0],b.b[1]-b.a[1]],d:Point=[b.a[0]-a.a[0],b.a[1]-a.a[1]],cross=(p:Point,q:Point)=>p[0]*q[1]-p[1]*q[0];
 const t=cross(d,v)/cross(u,v);return [a.a[0]+t*u[0],a.a[1]+t*u[1]];
};
/** Both native inner faces are preserved for the rendered panes. The miter
 * and 6 cm wall attachment are derived closures, not original PDF vertices. */
const corner=intersection(native[0],native[1]),attachment=intersection(native[0],sourceLine(52198,22));
export const NORTH_CORNER_GLAZING=native.map((p,i)=>({path:GROUND_NORTH_CORNER_INNER_CHAIN[i].pathIndex,a:mapped(p.a),b:mapped(p.b)}));
export const NORTH_CORNER_WALL_JOIN={a:mapped(attachment),b:mapped(native[0].a)};
/** Reverse the native traversal to match the Ground perimeter winding. */
export const NORTH_CORNER_SHELL_CHAIN:Polygon=[native[3].b,native[3].a,native[2].b,native[2].a,native[1].b,corner,attachment].map(mapped);
const same=(a:Point,b:Point)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-7;
export const northCornerShellEdge=(a:Point,b:Point)=>NORTH_CORNER_SHELL_CHAIN.slice(0,-1).some((p,i)=>same(a,p)&&same(b,NORTH_CORNER_SHELL_CHAIN[i+1]));

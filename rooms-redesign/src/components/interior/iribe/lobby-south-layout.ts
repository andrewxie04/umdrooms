import { groundGuidePlan } from './ground-guide-layout';
import { LOBBY_SOUTH_DOOR_PAIRS, LOBBY_SOUTH_DOOR_ADJACENT_STAIR_DOORS } from './lobby-south-door-trace';
import { SOUTH_SOURCE_PANES, SOUTH_SOURCE_SHELL_CHAIN, SOUTH_WALL_UNION } from './lobby-south-solids';
import type { Point, Polygon } from './layout';

const mapped=(p:Point)=>groundGuidePlan(...p);
export const SOUTH_DOOR_PAIRS=LOBBY_SOUTH_DOOR_PAIRS.map(pair=>({id:pair.id,row:pair.row,leaves:pair.leaves.map(leaf=>({...leaf,hinge:mapped(leaf.hinge),openTip:mapped(leaf.openTip),closedTip:mapped(leaf.closedTip)}))}));
export const SOUTH_LEAVES=SOUTH_DOOR_PAIRS.flatMap(pair=>pair.leaves);
export const SOUTH_STAIR_LEAVES=LOBBY_SOUTH_DOOR_ADJACENT_STAIR_DOORS.map(leaf=>({...leaf,hinge:mapped(leaf.hinge),openTip:mapped(leaf.openTip),closedTip:mapped(leaf.closedTip)}));
export const SOUTH_GLAZING=SOUTH_SOURCE_PANES.map(pane=>({...pane,a:mapped(pane.a),b:mapped(pane.b)}));
export const SOUTH_SOLIDS=SOUTH_WALL_UNION.map(s=>({outer:s.outer.map(mapped),holes:s.holes.map(h=>h.map(mapped))}));
export const SOUTH_SHELL_CHAIN:Polygon=SOUTH_SOURCE_SHELL_CHAIN.map(mapped);
const origin=mapped([0,0]),next=mapped([0,1]),length=Math.hypot(next[0]-origin[0],next[1]-origin[1]);
/** Source page +Y is the exterior direction for both rows of leaves. */
export const SOUTH_OUTWARD:Point=[(next[0]-origin[0])/length,(next[1]-origin[1])/length];
export const southOffset=(p:Point,d:number):Point=>[p[0]+SOUTH_OUTWARD[0]*d,p[1]+SOUTH_OUTWARD[1]*d];
export const southPairCenter=(index:number):Point=>{
 const leaves=SOUTH_DOOR_PAIRS[index].leaves;
 return [(leaves[0].hinge[0]+leaves[1].hinge[0])/2,(leaves[0].hinge[1]+leaves[1].hinge[1])/2];
};
const left=SOUTH_GLAZING.find(p=>p.id==='vestibule-page-left-exterior')!.a,right=SOUTH_GLAZING.find(p=>p.id==='stair-page-right-far')!.b;
/** Finite level landing includes the adjacent exterior stair door. Its 4 m
 * extent and shared Ground datum are estimates, not surveyed paving/grade. */
export const SOUTH_APRON:Polygon=[left,right,southOffset(right,4),southOffset(left,4)];
export const SOUTH_VIEW_TARGET=southPairCenter(2);
export const SOUTH_APPROACH=southOffset(southPairCenter(0),-1.4);
const same=(a:Point,b:Point)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-7;
export const southShellEdge=(a:Point,b:Point)=>SOUTH_SHELL_CHAIN.slice(0,-1).some((p,i)=>same(a,p)&&same(b,SOUTH_SHELL_CHAIN[i+1]));

import { groundGuidePlan } from './ground-guide-layout';
import { LOBBY_CANOPY_DOOR_JAMBS, LOBBY_CANOPY_DOOR_PAIRS, LOBBY_CANOPY_DOOR_SOURCE_PATHS } from './lobby-canopy-door-trace';
import type { Point, Polygon } from './layout';
import { CANOPY_PAVING } from './canopy-structure-layout';

const mapped=(p:Point)=>groundGuidePlan(...p);
const path=(id:number)=>LOBBY_CANOPY_DOOR_SOURCE_PATHS.find(p=>p.pathIndex===id)!;
const line=(id:number)=>{
 const command=path(id).items[0].command;
 if(command[0]!=='l')throw new Error(`Canopy source ${id} is not a line`);
 return {a:mapped(command[1]),b:mapped(command[2])};
};
export const CANOPY_DOOR_PAIRS=LOBBY_CANOPY_DOOR_PAIRS.map(pair=>({
 id:pair.id,threshold:pair.threshold.baseline.map(mapped),
 leaves:pair.leaves.map(leaf=>({...leaf,hinge:mapped(leaf.hinge),openTip:mapped(leaf.openTip),closedTip:mapped(leaf.closedTip)})),
}));
export const CANOPY_LEAVES=CANOPY_DOOR_PAIRS.flatMap(pair=>pair.leaves);
export const CANOPY_JAMB_SOLIDS=LOBBY_CANOPY_DOOR_JAMBS.flatMap(jamb=>jamb.fillSourcePathIndices.map(id=>({
 path:id,polygon:path(id).items.map(item=>mapped(item.command[1])),
})));
/** Native lobby-side long edge of each adjacent glass pane. */
export const CANOPY_GLAZING=[line(49168),line(49281)];
const upper=CANOPY_LEAVES[0].hinge,lower=CANOPY_LEAVES.at(-1)!.hinge;
/** Ground perimeter proceeds from the south toward the north. Only this
 * source-backed section replaces the fitted east facade. */
export const CANOPY_SHELL_CHAIN:Polygon=[CANOPY_GLAZING[1].a,lower,upper,CANOPY_GLAZING[0].a];
const length=Math.hypot(lower[0]-upper[0],lower[1]-upper[1]);
const u:Point=[(lower[0]-upper[0])/length,(lower[1]-upper[1])/length];
/** The open leaf tips establish which normal points toward the canopy. */
const tip=CANOPY_LEAVES[0].openTip,n:Point=[-u[1],u[0]];
const sign=(tip[0]-upper[0])*n[0]+(tip[1]-upper[1])*n[1]>0?1:-1;
export const CANOPY_OUTWARD:Point=[n[0]*sign,n[1]*sign];
export const canopyOffset=(p:Point,d:number):Point=>[p[0]+CANOPY_OUTWARD[0]*d,p[1]+CANOPY_OUTWARD[1]*d];
/** Finite, level plaza under the native canopy projection. Its native lower
 * paving edges are retained; grade and remaining paving closures are estimates. */
export const CANOPY_APRON:Polygon=CANOPY_PAVING;
export const canopyPairCenter=(index:number):Point=>{
 const pair=CANOPY_DOOR_PAIRS[index];return [(pair.leaves[0].hinge[0]+pair.leaves[1].hinge[0])/2,(pair.leaves[0].hinge[1]+pair.leaves[1].hinge[1])/2];
};
export const CANOPY_VIEW_TARGET=canopyPairCenter(1);
export const CANOPY_APPROACH=canopyOffset(CANOPY_VIEW_TARGET,-1.6);
const same=(a:Point,b:Point)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-7;
export const canopyShellEdge=(a:Point,b:Point)=>CANOPY_SHELL_CHAIN.slice(0,-1).some((p,i)=>same(a,p)&&same(b,CANOPY_SHELL_CHAIN[i+1]));

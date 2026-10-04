import { groundGuidePlan } from './ground-guide-layout';
import { COURTYARD_SOURCE_GLAZING, COURTYARD_SOURCE_LEAVES, COURTYARD_SOURCE_RIGHT_CORNER, COURTYARD_SOURCE_SIDE_FACES, COURTYARD_SOURCE_SOLIDS } from './lobby-courtyard-trace';
import type { Point, Polygon } from './layout';

const mapped=(p:Point)=>groundGuidePlan(...p);
export const COURTYARD_SIDE_FACES=COURTYARD_SOURCE_SIDE_FACES.map(w=>({a:mapped(w.a),b:mapped(w.b)}));
const [left,right]=COURTYARD_SIDE_FACES;
export const COURTYARD_SOLIDS=COURTYARD_SOURCE_SOLIDS.map(s=>({path:s.path,polygon:s.polygon.map(mapped)}));
export const COURTYARD_GLAZING=COURTYARD_SOURCE_GLAZING.map(g=>({...g,a:mapped(g.a),b:mapped(g.b)}));
export const COURTYARD_RIGHT_CORNER={a:mapped(COURTYARD_SOURCE_RIGHT_CORNER.a),b:mapped(COURTYARD_SOURCE_RIGHT_CORNER.b)};
const rightBody=COURTYARD_SOLIDS[2].polygon,leftBody=COURTYARD_SOLIDS[0].polygon;
/** Follow the source's exterior wall faces into the adjacent interior glass
 * baselines. The long inner side strokes end beyond the facade junctions;
 * joining glass to those ends would cut through the two adjacent columns. */
export const COURTYARD_SHELL_CHAIN:Polygon=[
 COURTYARD_RIGHT_CORNER.a,COURTYARD_RIGHT_CORNER.b,COURTYARD_GLAZING[1].b,
 rightBody[0],...rightBody.slice(11).reverse(),rightBody[10],
 leftBody[1],leftBody[0],...leftBody.slice(9).reverse(),
 COURTYARD_GLAZING[2].a,COURTYARD_GLAZING.at(-1)!.b,
];
export const COURTYARD_LEAVES=COURTYARD_SOURCE_LEAVES.map(leaf=>({...leaf,hinge:mapped(leaf.hinge),openTip:mapped(leaf.openTip),closedTip:mapped(leaf.closedTip)}));
export const COURTYARD_DOOR_ROWS=(['outer','inner'] as const).map(row=>{
 const leaves=COURTYARD_LEAVES.filter(leaf=>leaf.row===row);
 return {id:row,leaves,a:leaves[0].hinge,b:leaves[3].hinge,pairs:[[leaves[0].hinge,leaves[1].hinge],[leaves[2].hinge,leaves[3].hinge]] as const};
});
const dx=left.a[0]-left.b[0],dz=left.a[1]-left.b[1],length=Math.hypot(dx,dz);
/** Courtyard toward lobby; the axis follows the native vestibule sides. */
export const COURTYARD_INWARD:Point=[dx/length,dz/length];
export const courtyardOffset=(p:Point,distance:number):Point=>[p[0]+COURTYARD_INWARD[0]*distance,p[1]+COURTYARD_INWARD[1]*distance];
/** The guide shows continuous paving. This finite 4 m walkthrough apron is
 * an estimated extent, not a traced boundary of the whole courtyard. */
export const COURTYARD_APRON:Polygon=[left.b,right.a,courtyardOffset(right.a,-4),courtyardOffset(left.b,-4)];
export const COURTYARD_APPROACH:Point=courtyardOffset(COURTYARD_DOOR_ROWS[1].pairs[0].reduce<Point>((s,p)=>[s[0]+p[0]/2,s[1]+p[1]/2],[0,0]),1.4);
const outerPair=COURTYARD_DOOR_ROWS[0].pairs[0];
export const COURTYARD_VIEW_TARGET:Point=[(outerPair[0][0]+outerPair[1][0])/2,(outerPair[0][1]+outerPair[1][1])/2];
const same=(a:Point,b:Point)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-7;
/** These source edges receive solid fills, source pane rows and door frames. */
export function courtyardShellEdge(a:Point,b:Point){
 return COURTYARD_SHELL_CHAIN.slice(0,-1).some((p,i)=>same(a,p)&&same(b,COURTYARD_SHELL_CHAIN[i+1]));
}

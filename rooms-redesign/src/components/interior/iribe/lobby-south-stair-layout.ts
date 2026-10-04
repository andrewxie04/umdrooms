import { GROUND_SOUTH_STAIR_ROWS } from './ground-south-stair-trace';
import { SOUTH_FIRST_DOOR, SOUTH_FIRST_NORTH_ROWS, SOUTH_FIRST_RETURN_ROWS, SOUTH_FIRST_WALLS } from './lobby-south-stair-source';
import { groundGuidePlan } from './ground-guide-layout';
import { firstGuidePlan } from './first-guide-layout';
import { FLOOR_HEIGHT, type Point, type Polygon } from './layout';
import type { Flight, Position } from './circulation';

const center=(s:{a:Point;b:Point}):Point=>[(s.a[0]+s.b[0])/2,(s.a[1]+s.b[1])/2];
const atHeight=(p:Point,y:number):Position=>[p[0],y,p[1]];
const rise=FLOOR_HEIGHT['1'];
const counts=[GROUND_SOUTH_STAIR_ROWS.length-1,SOUTH_FIRST_RETURN_ROWS.length-1,SOUTH_FIRST_NORTH_ROWS.length-1];
const riser=rise/counts.reduce((a,b)=>a+b,0);
export const SOUTH_STAIR_HEIGHTS=[0,counts[0]*riser,(counts[0]+counts[1])*riser,rise] as const;
function flight(rows:readonly {a:Point;b:Point}[],map:(x:number,y:number)=>Point,base:number,top:number):Flight{
 const sections=rows.map((r,i)=>({a:map(...r.a),b:map(...r.b),height:base+(top-base)*i/(rows.length-1)}));
 const a=center(sections[0]),end=center(sections.at(-1)!);
 return {from:atHeight(a,base),to:atHeight(end,top),width:Math.min(...sections.map(s=>Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1]))),sections,polygon:[...sections.map(s=>s.a),...sections.map(s=>s.b).reverse()],lower:'G',upper:'1'};
}
/** Three flights are an explicitly provisional vertical interpretation: the
 * Ground north run is cut, Level 1 south run is cut and its north run is whole;
 * the Ground entry is west, Level 1 entry east. No dimensioned section exists.
 * Native plan rows stay unchanged; rise uses existing estimated floor heights. */
export const SOUTH_STAIR_RUNS=[
 flight(GROUND_SOUTH_STAIR_ROWS,groundGuidePlan,SOUTH_STAIR_HEIGHTS[0],SOUTH_STAIR_HEIGHTS[1]),
 flight([...SOUTH_FIRST_RETURN_ROWS].reverse(),firstGuidePlan,SOUTH_STAIR_HEIGHTS[1],SOUTH_STAIR_HEIGHTS[2]),
 flight(SOUTH_FIRST_NORTH_ROWS,firstGuidePlan,SOUTH_STAIR_HEIGHTS[2],SOUTH_STAIR_HEIGHTS[3]),
];
const g=groundGuidePlan,f=firstGuidePlan;
const lowerEnd=SOUTH_STAIR_RUNS[0].sections!.at(-1)!,returnStart=SOUTH_STAIR_RUNS[1].sections![0];
/** Native apron edges plus explicit estimated joins across the two independent
 * drawing registrations. These closed deck polygons are not source shaft voids. */
export const SOUTH_EAST_TURN:Polygon=[lowerEnd.a,g(326.9826965332031,488.9685974121094),g(324.3174133300781,509.7703857421875),returnStart.b,returnStart.a,g(315.2033996582031,500),g(315.2033996582031,498.739013671875),lowerEnd.b];
const returnEnd=SOUTH_STAIR_RUNS[1].sections!.at(-1)!,upperStart=SOUTH_STAIR_RUNS[2].sections![0];
export const SOUTH_WEST_TURN:Polygon=[f(264.623291015625,486.26568603515625),upperStart.a,upperStart.b,f(277.1769104003906,495.56939697265625),f(277.1769104003906,496.8088073730469),returnEnd.a,returnEnd.b,f(262.09527587890625,505.9966735839844)];
function landing(a:Position,end:Position,polygon:Polygon,route:Position[]):Flight{return {from:a,to:end,width:1,polygon,route,lower:'G',upper:'1'};}
const eastHeight=SOUTH_STAIR_HEIGHTS[1],westHeight=SOUTH_STAIR_HEIGHTS[2];
export const SOUTH_STAIR_LANDINGS=[
 landing(SOUTH_STAIR_RUNS[0].to,SOUTH_STAIR_RUNS[1].from,SOUTH_EAST_TURN,[SOUTH_STAIR_RUNS[0].to,atHeight(g(321,494),eastHeight),atHeight(g(320,505),eastHeight),SOUTH_STAIR_RUNS[1].from]),
 landing(SOUTH_STAIR_RUNS[1].to,SOUTH_STAIR_RUNS[2].from,SOUTH_WEST_TURN,[SOUTH_STAIR_RUNS[1].to,atHeight(f(270,501.7),westHeight),atHeight(f(271,491),westHeight),SOUTH_STAIR_RUNS[2].from]),
];
export const SOUTH_STAIR_ROUTE=[SOUTH_STAIR_RUNS[0],SOUTH_STAIR_LANDINGS[0],SOUTH_STAIR_RUNS[1],SOUTH_STAIR_LANDINGS[1],SOUTH_STAIR_RUNS[2]];
/** Estimated slab mask follows native enclosure inner faces, stopping before
 * the eastern Level 1 arrival apron. It is not a measured architectural void. */
export const SOUTH_STAIR_OPENING:Polygon=[f(264.3473815917969,485.94989013671875),f(299.9706115722656,485.94989013671875),f(299.9706115722656,507.04388427734375),f(261.6523742675781,507.04388427734375)];
const upperEnd=SOUTH_STAIR_RUNS[2].sections!.at(-1)!;
export const SOUTH_STAIR_TOP_JOIN:Polygon=[upperEnd.a,f(299.9706115722656,SOUTH_FIRST_NORTH_ROWS.at(-1)!.a[1]),f(299.9706115722656,SOUTH_FIRST_NORTH_ROWS.at(-1)!.b[1]),upperEnd.b];
const topJoinEnd=center({a:SOUTH_STAIR_TOP_JOIN[1],b:SOUTH_STAIR_TOP_JOIN[2]});
export const SOUTH_STAIR_TOP_SUPPORT:Flight={from:SOUTH_STAIR_RUNS[2].to,to:atHeight(topJoinEnd,rise),width:1,polygon:SOUTH_STAIR_TOP_JOIN,lower:'G',upper:'1'};
export const SOUTH_STAIR_FIRST_WALLS=SOUTH_FIRST_WALLS.map(s=>({outer:s.outer.map(p=>f(...p)),holes:s.holes.map(h=>h.map(p=>f(...p)))}));
export const SOUTH_STAIR_FIRST_DOOR={hinge:f(...SOUTH_FIRST_DOOR.hinge),openTip:f(...SOUTH_FIRST_DOOR.openTip),closedTip:f(...SOUTH_FIRST_DOOR.closedTip)};
export const SOUTH_STAIR_GROUND_APPROACH=g(285,493.7);
export const SOUTH_STAIR_FIRST_APPROACH=f(308.65,479.5);
export const SOUTH_STAIR_FIRST_INNER=f(308.65,491);

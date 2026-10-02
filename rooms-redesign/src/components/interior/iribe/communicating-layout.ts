import { fourthPlan, ELEVATOR, FLOOR_HEIGHT, type FloorId, type Point, type Polygon } from './layout';
import type { Flight, Position } from './circulation';

// HDR Level 4, right-hand plan: a quarter-turn communicating stair around
// the two elevator shafts. The plan is undimensioned; rise uses the existing
// storey heights and run/width are estimates registered to the same diagram.
const source:Point[]=[[391,908],[355,908]];
for(let i=1;i<=16;i++){const angle=Math.PI/2+i/16*Math.PI/2;source.push([355+33*Math.cos(angle),875+33*Math.sin(angle)]);}
source.push([322,840]);
export const COMMUNICATING_PATH=source.map(([x,y])=>fourthPlan(x,y));
export const COMMUNICATING_WIDTH=1.35;
export const COMMUNICATING_CORE:Polygon=[[360,823],[405,829],[395,895],[355,889],[348,884],[349,873]].map(([x,y])=>fourthPlan(x,y));
export const COMMUNICATING_CORE_FACE=[fourthPlan(405,829),fourthPlan(395,895)] as const;
const lengths=COMMUNICATING_PATH.slice(1).map((p,i)=>Math.hypot(p[0]-COMMUNICATING_PATH[i][0],p[1]-COMMUNICATING_PATH[i][1]));
const total=lengths.reduce((a,b)=>a+b,0);let distance=0;
export const COMMUNICATING_POSITIONS:Position[]=COMMUNICATING_PATH.map((p,i)=>{if(i)distance+=lengths[i-1];return [p[0],FLOOR_HEIGHT['4']+(FLOOR_HEIGHT['5']-FLOOR_HEIGHT['4'])*distance/total,p[1]];});
export const COMMUNICATING_FLIGHTS:Flight[]=COMMUNICATING_POSITIONS.slice(1).map((to,i)=>({from:COMMUNICATING_POSITIONS[i],to,width:COMMUNICATING_WIDTH,lower:'4',upper:'5'}));
const end=COMMUNICATING_PATH.at(-1)!,previous=COMMUNICATING_PATH.at(-2)!,lastLength=lengths.at(-1)!;
export const COMMUNICATING_EXIT:Point=[end[0]+(end[0]-previous[0])/lastLength*.9,end[1]+(end[1]-previous[1])/lastLength*.9];
export const COMMUNICATING_LANDING:Flight={from:COMMUNICATING_POSITIONS.at(-1)!,to:[COMMUNICATING_EXIT[0],FLOOR_HEIGHT['5'],COMMUNICATING_EXIT[1]],width:COMMUNICATING_WIDTH,lower:'4',upper:'5'};
// Miter the ribbon at every turn. A slightly wider floor cut leaves clear
// headroom and accommodates the guard without narrowing the walking width.
export function communicatingEdges(half:number){return COMMUNICATING_PATH.map((p,i)=>{
 const a=COMMUNICATING_PATH[Math.max(0,i-1)],b=COMMUNICATING_PATH[Math.min(COMMUNICATING_PATH.length-1,i+1)];
 const before:Point=i?[(p[0]-a[0])/lengths[i-1],(p[1]-a[1])/lengths[i-1]]:[(b[0]-p[0])/lengths[0],(b[1]-p[1])/lengths[0]];
 const after:Point=i<lengths.length?[(b[0]-p[0])/lengths[i],(b[1]-p[1])/lengths[i]]:before;
 const nx=-before[1]-after[1],nz=before[0]+after[0],length=Math.hypot(nx,nz),ux=nx/length,uz=nz/length,scale=half/(ux*-after[1]+uz*after[0]);
 return [-1,1].map(sign=>[p[0]+ux*scale*sign,p[1]+uz*scale*sign] as Point);
});}
export const COMMUNICATING_EDGES=communicatingEdges(COMMUNICATING_WIDTH/2+.12);
export const COMMUNICATING_VOID:Polygon=[...COMMUNICATING_EDGES.map(e=>e[0]),...COMMUNICATING_EDGES.map(e=>e[1]).reverse()];

const first=COMMUNICATING_PATH[0],second=COMMUNICATING_PATH[1];
export const COMMUNICATING_ENTRY:Point=[first[0]-(second[0]-first[0])/lengths[0]*.9,first[1]-(second[1]-first[1])/lengths[0]*.9];


const fourthStair={lower:'4' as FloorId,upper:'5' as FloorId,path:COMMUNICATING_PATH,core:COMMUNICATING_CORE,face:COMMUNICATING_CORE_FACE,flights:COMMUNICATING_FLIGHTS,landing:COMMUNICATING_LANDING,edges:COMMUNICATING_EDGES,void:COMMUNICATING_VOID,entry:COMMUNICATING_ENTRY,exit:COMMUNICATING_EXIT,walkingEdges:communicatingEdges(COMMUNICATING_WIDTH/2)};
// The Level 2 guide shows the same quarter-turn topology. Register that pair
// to the elevator core on the Level 2 wayfinding sheet, whose schematic
// proportions differ from HDR's Level 4 drawing. This translation is estimated.
const center=COMMUNICATING_CORE.reduce<Point>((sum,p)=>[sum[0]+p[0]/COMMUNICATING_CORE.length,sum[1]+p[1]/COMMUNICATING_CORE.length],[0,0]);
const translate=(p:Point):Point=>[p[0]+ELEVATOR[0]-center[0],p[1]+ELEVATOR[1]-center[1]];
const translatePosition=(p:Position):Position=>{const q=translate([p[0],p[2]]);return [q[0],p[1]-FLOOR_HEIGHT['4']+FLOOR_HEIGHT['2'],q[1]];};
const translateFlight=(f:Flight):Flight=>({...f,from:translatePosition(f.from),to:translatePosition(f.to),lower:'2',upper:'3'});
const secondStair={lower:'2' as FloorId,upper:'3' as FloorId,path:COMMUNICATING_PATH.map(translate),core:COMMUNICATING_CORE.map(translate),face:COMMUNICATING_CORE_FACE.map(translate),flights:COMMUNICATING_FLIGHTS.map(translateFlight),landing:translateFlight(COMMUNICATING_LANDING),edges:COMMUNICATING_EDGES.map(edge=>edge.map(translate)),void:COMMUNICATING_VOID.map(translate),entry:translate(COMMUNICATING_ENTRY),exit:translate(COMMUNICATING_EXIT),walkingEdges:fourthStair.walkingEdges.map(edge=>edge.map(translate))};
export const COMMUNICATING_STAIRS=[secondStair,fourthStair];
export const communicatingStairForFloor=(floor:FloorId)=>COMMUNICATING_STAIRS.find(stair=>stair.lower===floor||stair.upper===floor);

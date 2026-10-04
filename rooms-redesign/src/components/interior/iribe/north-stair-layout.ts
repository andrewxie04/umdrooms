import { FLOOR_HEIGHT, type FloorId, type Point, type Polygon } from './layout';
import { NORTH_STAIR_FRAME, NORTH_STAIR_LOWER_ROWS, NORTH_STAIR_UPPER_ROWS, NORTH_STAIR_OPENING, northStairDoor } from './north-stair-source-layout';
import type { Flight, Position } from './circulation';
const {at,uv,width}=NORTH_STAIR_FRAME;
const midpoint=(r:{a:Point;b:Point}):Point=>[(r.a[0]+r.b[0])/2,(r.a[1]+r.b[1])/2];
const lowerEnd=NORTH_STAIR_LOWER_ROWS.at(-1)!,lowerTurn=NORTH_STAIR_LOWER_ROWS[0],upperTurn=NORTH_STAIR_UPPER_ROWS[0],upperEnd=NORTH_STAIR_UPPER_ROWS.at(-1)!;
export const NORTH_STAIR_MIDDLE_POLYGON:Polygon=[at(.5,.18),at(width-.5,.18),lowerTurn.b,lowerTurn.a,upperTurn.b,upperTurn.a];
const middlePoint=at(width/2,uv(midpoint(lowerTurn))[1]-.65);
const floors:readonly FloorId[]=['G','1','2','3','4','5','R'];
export const NORTH_STAIRS=floors.slice(0,-1).map((lower,i)=>{
 const upper=floors[i+1],bottom=FLOOR_HEIGHT[lower],top=FLOOR_HEIGHT[upper],middle=(bottom+top)/2;
 // Original rows delimit the plan projection. Vertical grades and additional
 // subdivisions needed for a usable estimated section are consumer estimates.
 const loft=(rows:readonly {a:Point;b:Point}[],low:number,high:number):Flight=>{
  const from=midpoint(rows[0]),to=midpoint(rows.at(-1)!),length=Math.hypot(to[0]-from[0],to[1]-from[1]);
  const native=rows.map(r=>({...r,height:low+(high-low)*Math.hypot(midpoint(r)[0]-from[0],midpoint(r)[1]-from[1])/length}));
  const sections:typeof native=[];
  for(let j=0;j<native.length-1;j++){
   const a=native[j],b=native[j+1],count=Math.max(1,Math.ceil(Math.abs(b.height-a.height)/.19));
   for(let k=0;k<count;k++){
    const t=k/count,lerp=(p:Point,q:Point):Point=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];
    sections.push({a:lerp(a.a,b.a),b:lerp(a.b,b.b),height:a.height+(b.height-a.height)*t});
   }
  }
  sections.push(native.at(-1)!);
  const polygon:Polygon=[...sections.map(r=>r.a),...sections.map(r=>r.b).reverse()];
  return {from:[from[0],low,from[1]],to:[to[0],high,to[1]],width:Math.hypot(rows[0].a[0]-rows[0].b[0],rows[0].a[1]-rows[0].b[1]),lower,upper,polygon,sections};
 };
 const first=loft([...NORTH_STAIR_LOWER_ROWS].reverse(),bottom,middle),last=loft(NORTH_STAIR_UPPER_ROWS,middle,top);
 const turn:Position=[middlePoint[0],middle,middlePoint[1]];
 const flats:Flight[]=[{from:first.to,to:turn,width:1.2,lower,upper,polygon:NORTH_STAIR_MIDDLE_POLYGON},{from:turn,to:last.from,width:1.2,lower,upper,polygon:NORTH_STAIR_MIDDLE_POLYGON}];
 return {lower,upper,first,last,flats,flights:[first,...flats,last],middle,opening:NORTH_STAIR_OPENING};
});
export const NORTH_FLIGHTS=NORTH_STAIRS.flatMap(s=>s.flights);
export const northStairForFloor=(floor:FloorId)=>NORTH_STAIRS.find(s=>s.lower===floor)??NORTH_STAIRS.find(s=>s.upper===floor);
export const northStairEntry=(floor:FloorId):Point=>{
 const p=northStairDoor(floor);return [p[0]+NORTH_STAIR_FRAME.u[0]*.6,p[1]+NORTH_STAIR_FRAME.u[1]*.6];
};
export const NORTH_STAIR_FLOOR_LANDINGS:readonly Polygon[]=[
 [upperEnd.a,upperEnd.b,at(uv(upperEnd.b)[0],NORTH_STAIR_FRAME.length+.15),at(uv(upperEnd.a)[0],NORTH_STAIR_FRAME.length+.15)],
 [lowerEnd.a,lowerEnd.b,at(uv(lowerEnd.b)[0],NORTH_STAIR_FRAME.length+.15),at(uv(lowerEnd.a)[0],NORTH_STAIR_FRAME.length+.15)],
];

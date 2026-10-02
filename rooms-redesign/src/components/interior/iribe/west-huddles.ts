import { westFourthPlan, type InteriorRoom, type Point } from './layout';
import type { RoofBuilder } from './roof';

// Table and chair symbols on the joined HDR Level 4 crop. These are furniture
// centers; physical sizes and the neutral finish palette are estimates.
const plans:Readonly<Record<string,{table:Point;chairs:readonly Point[]}>>={
 '4-west-huddle-1':{table:[636,549],chairs:[[636,536],[625,550],[646,557]]},
 '4-west-huddle-2':{table:[606,591],chairs:[[607,578],[595,591],[616,600]]},
 '4-west-huddle-3':{table:[576,635],chairs:[[577,622],[565,634],[586,644]]},
};
export function westHuddleFurniture(room:InteriorRoom){
 const p=plans[room.id];
 const table=westFourthPlan(...p.table);
 // Unoccupied chairs are tucked under the table edge, preserving the small
 // room's perimeter aisle. The plan fixes their directions, not a chair pose.
 const chairs=p.chairs.map(p=>{const q=westFourthPlan(...p),dx=q[0]-table[0],dz=q[1]-table[1],length=Math.hypot(dx,dz);return [table[0]+dx/length*.44,table[1]+dz/length*.44] as Point;});
 return {table,radius:.30,chairs};
}
interface Builder extends RoofBuilder {chair(x:number,z:number,angle:number,m:RoofBuilder['palette']['white']):void;}
export function buildWestHuddle(room:InteriorRoom,b:Builder){
 const {table:[x,z],radius,chairs}=westHuddleFurniture(room),m=b.palette;
 b.cylinder(x,.75,z,radius,.06,m.white);b.cylinder(x,.37,z,.04,.74,m.metal);b.cylinder(x,.035,z,.24,.04,m.metal);
 for(let i=0;i<16;i++){
  const a=i*Math.PI/8,c=(i+1)*Math.PI/8;
  b.barriers.push({a:[x+Math.cos(a)*radius,z+Math.sin(a)*radius],b:[x+Math.cos(c)*radius,z+Math.sin(c)*radius],minY:0,maxY:.78});
 }
 for(const p of chairs)b.chair(p[0],p[1],Math.atan2(p[0]-x,p[1]-z),m.black);
 b.surface(room.polygon,3.15,m.white);b.box(x,3.08,z,.9,.04,.12,m.light);
}

import { ceilingGeometry } from './ceiling';
import * as THREE from 'three';
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
 if(room.id==='4-west-huddle-4'){
  const table=westFourthPlan(535,685),a=westFourthPlan(548,669),c=westFourthPlan(521,705),length=Math.hypot(c[0]-a[0],c[1]-a[1]);
  const u:Point=[(c[0]-a[0])/length,(c[1]-a[1])/length];
  const at=(along:number,across:number):Point=>[table[0]+u[0]*along-u[1]*across,table[1]+u[1]*along+u[0]*across];
  const halfLength=.78,halfWidth=.35,corner=.16,outline:Point[]=[];
  for(let quadrant=0;quadrant<4;quadrant++){
   const angle=quadrant*Math.PI/2,xc=Math.cos(angle+Math.PI/4)>0?halfLength-corner:-halfLength+corner,zc=Math.sin(angle+Math.PI/4)>0?halfWidth-corner:-halfWidth+corner;
   for(let i=0;i<=4;i++){const t=angle+i*Math.PI/8;outline.push(at(xc+Math.cos(t)*corner,zc+Math.sin(t)*corner));}
  }
  // Preserve the drawn six-seat arrangement with unoccupied chairs tucked in.
  const chairAngles:number[]=[];
  const chairs=[[550,664],[520,706],[529,668],[519,681],[551,686],[543,699]].map(([x,y],i)=>{
   const p=westFourthPlan(x,y),dx=p[0]-table[0],dz=p[1]-table[1],along=dx*u[0]+dz*u[1],across=-dx*u[1]+dz*u[0];
   const sign=Math.sign(i<2?along:across);
   chairAngles.push(i<2?Math.atan2(u[0]*sign,u[1]*sign):Math.atan2(-u[1]*sign,u[0]*sign));
   return i<2?at(sign*.99,0):at(along,sign*.55);
  });
  return {table,radius:.35,chairs,chairAngles,outline,legs:[at(-.46,0),at(.46,0)]};
 }
 const p=plans[room.id];
 const table=westFourthPlan(...p.table);
 // Unoccupied chairs are tucked under the table edge, preserving the small
 // room's perimeter aisle. The plan fixes their directions, not a chair pose.
 const chairs=p.chairs.map(p=>{const q=westFourthPlan(...p),dx=q[0]-table[0],dz=q[1]-table[1],length=Math.hypot(dx,dz);return [table[0]+dx/length*.44,table[1]+dz/length*.44] as Point;});
 return {table,radius:.30,chairs};
}
interface Builder extends RoofBuilder {chair(x:number,z:number,angle:number,m:RoofBuilder['palette']['white']):void;}
export function buildWestHuddle(room:InteriorRoom,b:Builder){
 const furniture=westHuddleFurniture(room),{table:[x,z],radius,chairs}=furniture,m=b.palette;
 if(furniture.outline){
  const shape=new THREE.Shape(furniture.outline.map(([x,z])=>new THREE.Vector2(x,-z)));
  const top=new THREE.ExtrudeGeometry(shape,{depth:.06,bevelEnabled:false});top.rotateX(-Math.PI/2);top.translate(0,.72,0);b.put(top,m.white);
  furniture.outline.forEach((a,i)=>b.barriers.push({a,b:furniture.outline[(i+1)%furniture.outline.length],minY:0,maxY:.78}));
  for(const p of furniture.legs){b.cylinder(p[0],.37,p[1],.045,.74,m.metal);b.cylinder(p[0],.035,p[1],.22,.04,m.metal);}
 }else{
 b.cylinder(x,.75,z,radius,.06,m.white);b.cylinder(x,.37,z,.04,.74,m.metal);b.cylinder(x,.035,z,.24,.04,m.metal);
 for(let i=0;i<16;i++){
  const a=i*Math.PI/8,c=(i+1)*Math.PI/8;
  b.barriers.push({a:[x+Math.cos(a)*radius,z+Math.sin(a)*radius],b:[x+Math.cos(c)*radius,z+Math.sin(c)*radius],minY:0,maxY:.78});
 }
 }
 chairs.forEach((p,i)=>b.chair(p[0],p[1],furniture.chairAngles?.[i]??Math.atan2(p[0]-x,p[1]-z),m.black));
 // The ceiling faces down so its underside is visible with the shared one-sided material.
 b.put(ceilingGeometry(room.polygon,3.15),m.white);
 b.box(x,3.08,z,.9,.04,.12,m.light);
}

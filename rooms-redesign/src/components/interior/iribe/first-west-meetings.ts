import * as THREE from 'three';
import { buildWestSupport } from './west-support';
import { ceilingGeometry } from './ceiling';
import { firstWestPlan, type InteriorRoom, type Point } from './layout';
import type { RoofBuilder } from './roof';

// HDR Level 1 furniture symbols: round table with three chairs, an oval
// six-seat table, and six paired worktable modules with twelve side chairs.
// Sizes and neutral finishes are estimates; unoccupied chairs are tucked in.
export function firstWestMeetingFurniture(room:InteriorRoom){
 const small=room.id==='1-west-meeting-a',six=room.id==='1-west-meeting-b';
 const center=firstWestPlan(...(small?[278,379]:six?[433,374]:[373,487]) as [number,number]);
 const a=firstWestPlan(...(six?[445,350]:[327,438]) as [number,number]),b=firstWestPlan(...(six?[417,398]:[418,532]) as [number,number]);
 const len=Math.hypot(b[0]-a[0],b[1]-a[1]),u:Point=[(b[0]-a[0])/len,(b[1]-a[1])/len];
 const at=(x:number,z:number):Point=>[center[0]+u[0]*x-u[1]*z,center[1]+u[1]*x+u[0]*z];
 const length=small?.6:six?2.1:4.5,width=small?.6:six?.85:1.3;
 const chairPoints:Point[]=small?[[264,379],[291,367],[284,393]].map(([x,y])=>{
  const p=firstWestPlan(x,y),dx=p[0]-center[0],dz=p[1]-center[1],d=Math.hypot(dx,dz);return [center[0]+dx/d*.44,center[1]+dz/d*.44];
 }):six?[at(-1.35,0),at(1.35,0),...[-.5,.5].flatMap(x=>[-1,1].map(s=>at(x,s*.72)))]:Array.from({length:6},(_,i)=>(i-2.5)*.70).flatMap(x=>[-1,1].map(s=>at(x,s*.96)));
 const angles=chairPoints.map((p,i)=>small?Math.atan2(p[0]-center[0],p[1]-center[1]):six&&i<2?Math.atan2(u[0]*(i?1:-1),u[1]*(i?1:-1)):Math.atan2(-u[1]*(i%2?1:-1),u[0]*(i%2?1:-1)));
 const outline:Point[]=small?Array.from({length:24},(_,i)=>[center[0]+Math.cos(i*Math.PI/12)*.3,center[1]+Math.sin(i*Math.PI/12)*.3]):[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z])=>at(x*length/2,z*width/2));
 return {center,u,at,length,width,small,six,chairPoints,angles,outline,angle:-Math.atan2(u[1],u[0])};
}
export function firstWestMeetingCounter(room:InteriorRoom){
 if(room.id!=='1-west-meeting-b')return;
 const a=firstWestPlan(375,356),b=firstWestPlan(412,318),length=Math.hypot(b[0]-a[0],b[1]-a[1]),u:Point=[(b[0]-a[0])/length,(b[1]-a[1])/length];
 return {a,b,length,u,center:[(a[0]+b[0])/2,(a[1]+b[1])/2] as Point,angle:-Math.atan2(u[1],u[0]),depth:.5,sink:true};
}
interface Builder extends RoofBuilder {chair(x:number,z:number,angle:number,m:THREE.Material):void;}
export function buildFirstWestMeeting(room:InteriorRoom,b:Builder){
 const f=firstWestMeetingFurniture(room),m=b.palette;
 if(f.small)b.cylinder(f.center[0],.75,f.center[1],.3,.06,m.white);
 else if(f.six){
  const shape=new THREE.Shape(),l=f.length/2,w=f.width/2,r=.32;
  shape.moveTo(-l+r,-w);shape.lineTo(l-r,-w);shape.quadraticCurveTo(l,-w,l,-w+r);shape.lineTo(l,w-r);shape.quadraticCurveTo(l,w,l-r,w);shape.lineTo(-l+r,w);shape.quadraticCurveTo(-l,w,-l,w-r);shape.lineTo(-l,-w+r);shape.quadraticCurveTo(-l,-w,-l+r,-w);
  const g=new THREE.ExtrudeGeometry(shape,{depth:.06,bevelEnabled:false,curveSegments:6});g.rotateX(-Math.PI/2);g.rotateY(f.angle);g.translate(f.center[0],.72,f.center[1]);b.put(g,m.white);
 }else{
  for(let i=0;i<6;i++)for(const side of [-1,1]){const p=f.at((i-2.5)*.75,side*.325);b.box(p[0],.75,p[1],.74,.06,.64,m.white,f.angle);}
 }
 for(const along of f.small?[0]:f.six?[-.7,.7]:[-1.8,0,1.8]){
  const p=f.at(along,0);b.cylinder(p[0],.37,p[1],.045,.74,m.metal);b.cylinder(p[0],.035,p[1],.24,.045,m.metal);
 }
 f.outline.forEach((a,i)=>b.barriers.push({a,b:f.outline[(i+1)%f.outline.length],minY:0,maxY:.78}));
 f.chairPoints.forEach((p,i)=>b.chair(p[0],p[1],f.angles[i],m.black));
 const counter=firstWestMeetingCounter(room);if(counter)buildWestSupport(room.id,b,counter);
 b.put(ceilingGeometry(room.polygon,3.15),m.white);
 b.box(f.center[0],3.08,f.center[1],f.small?.9:f.length,.04,.12,m.light,f.angle);
}

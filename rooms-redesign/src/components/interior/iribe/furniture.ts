import { distanceToSegment, pointInPolygon, type InteriorRoom, type Point } from './layout';

/** Furniture is fitted to the traced room, not its axis-aligned bounding box.
 * Dimensions and placement are interpretations of the UMD/HDR photographs.
 */
export function clearInside(room: InteriorRoom, point: Point, radius: number) {
 return pointInPolygon(point, room.polygon) && room.polygon.every((a,i) => distanceToSegment(point,a,room.polygon[(i+1)%room.polygon.length]) >= radius);
}
export function roomFrame(room: InteriorRoom,rotation=0) {
 const edge=room.polygon.reduce((best,a,i)=>{
  const b=room.polygon[(i+1)%room.polygon.length], c=room.polygon[best],d=room.polygon[(best+1)%room.polygon.length];
  return Math.hypot(b[0]-a[0],b[1]-a[1])>Math.hypot(d[0]-c[0],d[1]-c[1])?i:best;
 },0);
 const a=room.polygon[edge],b=room.polygon[(edge+1)%room.polygon.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
 const ox=(b[0]-a[0])/length,oz=(b[1]-a[1])/length;
 const u:Point=[ox*Math.cos(rotation)-oz*Math.sin(rotation),ox*Math.sin(rotation)+oz*Math.cos(rotation)],v:Point=[-u[1],u[0]];
 const dot=(p:Point,q:Point)=>p[0]*q[0]+p[1]*q[1];
 const us=room.polygon.map(p=>dot(p,u)),vs=room.polygon.map(p=>dot(p,v));
 return {minU:Math.min(...us),maxU:Math.max(...us),minV:Math.min(...vs),maxV:Math.max(...vs),angle:-Math.atan2(u[1],u[0]),u,v,at:(x:number,z:number):Point=>[u[0]*x+v[0]*z,u[1]*x+v[1]*z]};
}
export function teachingTables(room: InteriorRoom): Point[] {
 const radius=1.32,spacing=room.id==='1116'?3.1:3.8;
 let best:Point[]=[];
 for(let rotation=0;rotation<(room.id==='1116'?Math.PI/3:.01);rotation+=Math.PI/36){
 const f=roomFrame(room,rotation);
 for(let du=0;du<spacing;du+=.32)for(let dv=0;dv<spacing;dv+=.32){
  const points:Point[]=[];
  let row=0;
  const staggered=room.id==='1116';
  for(let v=f.minV+radius+dv;v<f.maxV-radius;v+=spacing*(staggered?Math.sqrt(3)/2:1),row++)for(let u=f.minU+radius+du+(staggered&&row%2?spacing/2:0);u<f.maxU-radius;u+=spacing){
   const p=f.at(u,v);
   if(clearInside(room,p,radius+.12)&&Math.hypot(p[0]-room.door[0],p[1]-room.door[1])>radius+1.1)points.push(p);
  }
  if(points.length>best.length)best=points;
 }
 }
 // UMD room-specific plans show nine 60-inch tables with six chairs in
 // 1207/2107/2207, and sixteen six-seat tables in 1116.
 return best.slice(0,room.id==='1116'?16:9);
}
export interface MeetingTable { center:Point; length:number; width:number; angle:number; u:Point; v:Point; }
export function meetingTable(room: InteriorRoom):MeetingTable|null {
 const f=roomFrame(room);
 for(let length=Math.min(6,f.maxU-f.minU-2.4);length>=1.2;length-=.3){
  for(let du=-.5;du<=.5;du+=.5)for(let dv=-.5;dv<=.5;dv+=.5){
   const midU=(f.minU+f.maxU)/2+du,midV=(f.minV+f.maxV)/2+dv;
   const center=f.at(midU,midV),width=.95;
   const corners=[[-1,-1],[-1,1],[1,-1],[1,1]].map(([x,z])=>f.at(midU+x*(length/2+.35),midV+z*(width/2+.7)));
   if(corners.every(p=>clearInside(room,p,.18)) && Math.hypot(center[0]-room.door[0],center[1]-room.door[1])>1.25)return {center,length,width,angle:f.angle,u:f.u,v:f.v};
  }
 }
 return null;
}

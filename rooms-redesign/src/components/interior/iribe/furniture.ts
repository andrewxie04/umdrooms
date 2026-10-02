import { distanceToSegment, pointInPolygon, FIRST_CLASSROOM_TABLES, type InteriorRoom, type Point } from './layout';
import { structuralColumns } from './structure';

// Published UMIACS occupancies for standalone rooms that can be fitted as a
// meeting table. Arrangement and dimensions are estimates, not furniture plans.
// 5105 (24 people) needs a room-specific furniture reference before replacing
// its placeholder; do not squeeze 24 chairs around an undersized table.
export const MEETING_CAPACITIES:Readonly<Record<string,number>>={1119:6,1127:12,2137:12,2143:6,4137:12,4237:12,4145:6,5107:12,5111:6,5137:18,5161:12,5165:16,5237:12};

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
 if(room.id==='1207')return FIRST_CLASSROOM_TABLES;
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
export interface MeetingSeat {point:Point;angle:number;}
export function meetingSeats(room:InteriorRoom,table:MeetingTable):MeetingSeat[]{
 const capacity=MEETING_CAPACITIES[room.id],ends=capacity!==undefined;
 const count=ends?(capacity-2)/2:room.id==='6217'?5:Math.max(2,Math.floor(table.length/.85));
 const pitch=ends?Math.min(.78,(table.length-.5)/(count-1||1)):.85;
 const {center,u,v,width,length}=table,seats:MeetingSeat[]=[];
 const seat=(along:number,across:number,dx:number,dz:number)=>seats.push({point:[center[0]+u[0]*along+v[0]*across,center[1]+u[1]*along+v[1]*across],angle:Math.atan2(dx,dz)});
 for(let i=0;i<count;i++)for(const side of [-1,1])seat((i-(count-1)/2)*pitch,side*(width/2+(ends?.25:.35)),v[0]*side,v[1]*side);
 if(ends)for(const side of [-1,1])seat(side*(length/2+.4),0,u[0]*side,u[1]*side);
 return seats;
}
export function meetingTable(room: InteriorRoom):MeetingTable|null {
 const f=roomFrame(room);
 const capacity=MEETING_CAPACITIES[room.id];
 const preferred=capacity?Math.max(1.9,((capacity-2)/2-1)*.7+.6):6;
 const minimum=capacity?Math.max(1.7,((capacity-2)/2-1)*.6+.5):1.2;
 for(let length=Math.min(preferred,f.maxU-f.minU-2.4);length>=minimum;length-=.15){
  for(let du=-.5;du<=.5001;du+=capacity?.2:.5)for(let dv=-.5;dv<=.5001;dv+=capacity?.2:.5){
   const midU=(f.minU+f.maxU)/2+du,midV=(f.minV+f.maxV)/2+dv;
   const center=f.at(midU,midV),width=capacity?.8:.95;
   const corners=[[-1,-1],[-1,1],[1,-1],[1,1]].map(([x,z])=>f.at(midU+x*(length/2+.35),midV+z*(width/2+.7)));
   if(!corners.every(p=>clearInside(room,p,.18)) || Math.hypot(center[0]-room.door[0],center[1]-room.door[1])<=1.25)continue;
   const table={center,length,width,angle:f.angle,u:f.u,v:f.v};
   if(capacity){
    const seats=meetingSeats(room,table),columns=structuralColumns(room.floor);
    if(seats.some(({point})=>!clearInside(room,point,.88)||Math.hypot(point[0]-room.door[0],point[1]-room.door[1])<1.1||columns.some(p=>Math.hypot(p[0]-point[0],p[1]-point[1])<.85)))continue;
   }
   return table;
  }
 }
 return null;
}

import { pointInPolygon, type InteriorRoom, type Point } from './layout';
import type { RoofBuilder } from './roof';

export const FIRST_OFFICE_TYPES:Readonly<Record<string,'wraparound'|'meeting'|'desk-meeting'>>={
 '1-north-office-1':'wraparound','1-north-office-2':'wraparound','1-north-office-3':'wraparound','1-north-office-4':'desk-meeting',
 '1-east-office-1':'meeting','1-east-office-2':'wraparound','1-east-office-3':'wraparound','1214':'desk-meeting',
};
export function firstOfficeFrame(room:InteriorRoom){
 const [a,b]=room.polygon,length=Math.hypot(b[0]-a[0],b[1]-a[1]),u:Point=[(b[0]-a[0])/length,(b[1]-a[1])/length];
 const center:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2];
 const sign=pointInPolygon([center[0]-u[1]*.5,center[1]+u[0]*.5],room.polygon)?1:-1,n:Point=[-u[1]*sign,u[0]*sign];
 return {length,u,n,angle:-Math.atan2(u[1],u[0]),at:(x:number,z:number):Point=>[center[0]+u[0]*x+n[0]*z,center[1]+u[1]*x+n[1]*z]};
}
export function firstOfficeFurniture(room:InteriorRoom){
 const kind=FIRST_OFFICE_TYPES[room.id],f=firstOfficeFrame(room);
 const surfaces:{x:number;z:number;w:number;d:number}[]=[],chairs:{point:Point;angle:number}[]=[];
 let round:{point:Point;radius:number}|undefined;
 const seat=(x:number,z:number,back:Point)=>chairs.push({point:f.at(x,z),angle:Math.atan2(back[0],back[1])});
 if(kind==='wraparound'||kind==='desk-meeting'){
  // The plan places the return against one side wall, leaving access along
  // the opposite side. A centered U desk would trap its task chair.
  const side=room.id==='1-north-office-2'||room.id==='1-east-office-3'||kind==='desk-meeting'?1:-1;
  const width=Math.min(1.8,f.length-1.02),offset=side*(f.length/2-width/2-.22);
  surfaces.push({x:offset,z:.48,w:width,d:.48},{x:offset+side*(width/2-.2),z:1.24,w:.4,d:1.06},{x:offset,z:2,w:width,d:.58});
  seat(offset,1.22,[-f.n[0],-f.n[1]]);
  if(kind==='wraparound')for(const x of [-.36,.36])seat(offset+x,2.6,f.n);
 }
 if(kind==='meeting'||kind==='desk-meeting'){
  const z=kind==='meeting'?1.35:3.4,count=kind==='meeting'?3:2,x=kind==='meeting'?0:.25;
  round={point:f.at(x,z),radius:.4};
  for(let i=0;i<count;i++){const a=i*Math.PI*2/count;seat(x+Math.sin(a)*.68,z+Math.cos(a)*.68,[f.u[0]*Math.sin(a)+f.n[0]*Math.cos(a),f.u[1]*Math.sin(a)+f.n[1]*Math.cos(a)]);}
 }
 return {kind,frame:f,surfaces,chairs,round};
}

interface OfficeBuilder extends RoofBuilder {chair(x:number,z:number,angle:number,m:RoofBuilder['palette']['white'],casters?:boolean):void;}
export function buildFirstOffice(room:InteriorRoom,b:OfficeBuilder){
 if(!FIRST_OFFICE_TYPES[room.id])return false;
 const {kind,frame:f,surfaces,chairs,round}=firstOfficeFurniture(room),m=b.palette;
 for(const desk of surfaces){
  const p=f.at(desk.x,desk.z);
  b.box(p[0],.75,p[1],desk.w,.06,desk.d,m.white,f.angle);
  for(const side of [-1,1]){const q=f.at(desk.x+side*(desk.w/2-.055),desk.z);b.box(q[0],.365,q[1],.045,.73,desk.d-.06,m.metal,f.angle);}
  const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z])=>f.at(desk.x+x*desk.w/2,desk.z+z*desk.d/2));
  corners.forEach((a,i)=>b.barriers.push({a,b:corners[(i+1)%4],minY:0,maxY:.78}));
 }
 for(const [i,chair] of chairs.entries())b.chair(chair.point[0],chair.point[1],chair.angle,m.black,kind!=='meeting'&&i===0);
 if(round){
  const [x,z]=round.point;b.cylinder(x,.75,z,round.radius,.06,m.white);b.cylinder(x,.37,z,.045,.74,m.metal);b.cylinder(x,.035,z,.27,.04,m.metal);
  for(let i=0;i<16;i++){const a=i*Math.PI/8,c=(i+1)*Math.PI/8;b.barriers.push({a:[x+Math.cos(a)*round.radius,z+Math.sin(a)*round.radius],b:[x+Math.cos(c)*round.radius,z+Math.sin(c)*round.radius],minY:0,maxY:.78});}
 }
 // Desk/chair topology is documented. Finishes and these light dimensions
 // remain neutral estimates; no personal belongings are fabricated.
 const lamp=f.at(0,2);b.box(lamp[0],3.08,lamp[1],1.8,.04,.12,m.light,f.angle+Math.PI/2);
 b.surface(room.polygon,3.15,m.white);
 return true;
}

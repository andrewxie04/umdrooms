import * as THREE from 'three';
import { fourthCorePlan, firstCorePlan, secondCorePoint, pointInPolygon, ROOMS, type InteriorRoom, type Point } from './layout';
import { fourthGuidePlan } from './fourth-guide-layout';
import { EAST_RESTROOM_SOURCE } from './restroom-east-source';
import type { RoofBuilder } from './roof';

const p=fourthCorePlan;
/** Fixture counts and partitions follow the HDR drawing. Ceramic, tile and
 * partition finishes are neutral estimates because no interior photos verify them. */
export interface RestroomPlan {
 back:Point[];stalls:number;depth:number;sinks:Point[];sinkCount:number;urinals?:Point[];
 stallRatios?:number[];stallDepths?:number[];
 /** Doorway approach, which can differ from the bay/toilet centre. */
 stallDoorCenters?:number[];
 /** Toilet bowl centres in the row's along/depth coordinates. */
 stallToilets?:Point[];
 sourcePartitions?:{a:Point;b:Point}[];sourceLeaves?:{a:Point;b:Point}[];
 sourceCounter?:Point[];sourceBasins?:Point[];
}
const first=firstCorePlan;
export const RESTROOM_PLANS:Record<string,RestroomPlan>={
 '1218':{back:[first(467,340),first(815,380)],stalls:6,depth:1.65,stallRatios:[54,56,58,58,59,87],stallDepths:[1.65,1.65,1.65,1.65,2,2.15],sinks:[first(609,169),first(849,197)],sinkCount:5},
 '1219':{back:[first(626,406),first(827,431)],stalls:3,depth:1.65,stallRatios:[58,58,90],stallDepths:[1.65,2,2.15],sinks:[first(551,591),first(799,622)],sinkCount:5,urinals:[first(484,393),first(541,400),first(597,407)]},
 '4-restroom-west':{back:[p(811,270),p(1042,288)],stalls:6,depth:1.65,sinks:[p(905,148),p(1050,165)],sinkCount:5},
 '4-restroom-east':{back:[p(913,318),p(1039,332)],stalls:3,depth:1.65,sinks:[p(880,428),p(1018,445)],sinkCount:5,urinals:[p(827,306),p(862,310),p(897,314)]},
};
// The independent Level 2 reference confirms the same six/three-stall layout.
for(const [id,source] of [['2-restroom-west','1218'],['2-restroom-east','1219']]){
 const data=RESTROOM_PLANS[source];RESTROOM_PLANS[id]={...data,back:data.back.map(secondCorePoint),sinks:data.sinks.map(secondCorePoint),urinals:data.urinals?.map(secondCorePoint)};
}
// Level 1 now uses the unified architectural registration, whose restroom
// depth is smaller than the older wayfinding fit. Keep the wider end bays and
// shorten their estimated depth to preserve the aisle in front of the sinks.
RESTROOM_PLANS['1218'].stallDepths=[1.65,1.65,1.65,1.65,1.8,1.85];
RESTROOM_PLANS['1219'].stallDepths=[1.65,1.8,1.85];
// Original guide page 12: retain the thin partition/leaf centre-lines and
// counter front under the common Level 4 registration. The north and south
// room walls are older raster estimates; only source parts hidden behind
// those walls are clipped at the room boundary. No visible front is moved.
{
 const source=EAST_RESTROOM_SOURCE,room=ROOMS.find(r=>r.id==='4-restroom-east')!,data=RESTROOM_PLANS[room.id];
 const map=(p:Point)=>fourthGuidePlan(...p),dividers=source.dividers.map(d=>({a:map(d.back),b:map(d.front)}));
 const origin=dividers[0].a,next=dividers[1].a,length=Math.hypot(next[0]-origin[0],next[1]-origin[1]),u:Point=[(next[0]-origin[0])/length,(next[1]-origin[1])/length];
 let v:Point=[-u[1],u[0]];
 if((dividers[0].b[0]-origin[0])*v[0]+(dividers[0].b[1]-origin[1])*v[1]<0)v=[-v[0],-v[1]];
 const local=(p:Point):Point=>[(p[0]-origin[0])*u[0]+(p[1]-origin[1])*u[1],(p[0]-origin[0])*v[0]+(p[1]-origin[1])*v[1]];
 const fronts=source.fronts.map(s=>({a:map(s.a),b:map(s.b)})),end=local(fronts.at(-1)!.b)[0];
 data.back=[origin,[origin[0]+u[0]*end,origin[1]+u[1]*end]];
 const breaks=[0,...dividers.slice(1).map(d=>local(d.a)[0]),end];
 data.stallRatios=breaks.slice(1).map((x,i)=>x-breaks[i]);
 const openings=Array.from({length:3},(_,i)=>{const a=fronts[2*i].b,b=fronts[2*i+1].a;return local([(a[0]+b[0])/2,(a[1]+b[1])/2]);});
 data.stallDoorCenters=openings.map(p=>p[0]);data.stallDepths=openings.map(p=>p[1]);
 data.stallToilets=source.toilets.map(t=>local(map(t.center)));
 const clipBack=(back:Point,front:Point):Point=>{
  if(pointInPolygon(back,room.polygon))return back;
  const dx=front[0]-back[0],dz=front[1]-back[1];let first=Infinity;
  room.polygon.forEach((a,i)=>{const b=room.polygon[(i+1)%room.polygon.length],ex=b[0]-a[0],ez=b[1]-a[1],det=dx*ez-dz*ex;if(Math.abs(det)<1e-10)return;
   const ax=a[0]-back[0],az=a[1]-back[1],t=(ax*ez-az*ex)/det,s=(ax*dz-az*dx)/det;if(t>=0&&t<=1&&s>=0&&s<=1)first=Math.min(first,t);
  });
  return Number.isFinite(first)?[back[0]+dx*first,back[1]+dz*first]:back;
 };
 data.sourcePartitions=[...dividers.map(d=>({a:clipBack(d.a,d.b),b:d.b})),...fronts];
 data.sourceLeaves=source.leaves.map(s=>({a:map(s.a),b:map(s.b)}));
 // The middle outward-swinging leaf is shown at 90 degrees in the guide.
 // Render it fully open against the front partition (180 degrees), retaining
 // its source hinge and length. Its drawn 90-degree pose obstructs the aisle
 // beside the older, narrower estimated room wall; keep both in the handoff.
 const middle=data.sourceLeaves[1],leafLength=Math.hypot(middle.b[0]-middle.a[0],middle.b[1]-middle.a[1]);
 middle.b=[middle.a[0]+u[0]*leafLength,middle.a[1]+u[1]*leafLength];
 const counterFront=source.counter.front.map(map),counterBack=source.counter.back.map(map);
 let counter=[counterBack[0],counterBack[1],counterFront[1],counterFront[0]];
 // The native counter continues into the raster-estimated wall thickness.
 // Clip its hidden rear/right portions, retaining the visible source front.
 for(const edge of [1,2]){
  const a=room.polygon[edge],b=room.polygon[edge+1],cross=(p:Point)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
  const center:Point=room.polygon.reduce<Point>((p,q)=>[p[0]+q[0]/room.polygon.length,p[1]+q[1]/room.polygon.length],[0,0]),sign=Math.sign(cross(center)),clipped:Point[]=[];
  counter.forEach((p,i)=>{const previous=counter[(i+counter.length-1)%counter.length],d=cross(p)*sign,old=cross(previous)*sign;
   if((d>=0)!==(old>=0)){const t=old/(old-d);clipped.push([previous[0]+(p[0]-previous[0])*t,previous[1]+(p[1]-previous[1])*t]);}
   if(d>=0)clipped.push(p);
  });counter=clipped;
 }
 data.sinks=[counter[0],counter[1]];data.sourceCounter=counter;
 data.sourceBasins=source.basins.map(s=>map(s.center));
}
export function restroomStalls(data:RestroomPlan,length:number){
 const ratios=data.stallRatios??Array.from({length:data.stalls},()=>1),sum=ratios.reduce((a,b)=>a+b,0);let start=0;
 return ratios.map((ratio,i)=>{const end=start+ratio/sum*length,stall={start,end,center:data.stallDoorCenters?.[i]??(start+end)/2,depth:data.stallDepths?.[i]??data.depth};start=end;return stall;});
}
export function restroomFrame(room:InteriorRoom,a:Point,end:Point){
 const length=Math.hypot(end[0]-a[0],end[1]-a[1]),ux=(end[0]-a[0])/length,uz=(end[1]-a[1])/length;
 let vx=-uz,vz=ux;
 if(!pointInPolygon([(a[0]+end[0])/2+vx*.75,(a[1]+end[1])/2+vz*.75],room.polygon)){vx=-vx;vz=-vz;}
 return {length,angle:-Math.atan2(uz,ux),at:(x:number,z:number):Point=>[a[0]+ux*x+vx*z,a[1]+uz*x+vz*z],ux,uz,vx,vz};
}
export function buildRestroom(room:InteriorRoom,b:RoofBuilder){
 const data=RESTROOM_PLANS[room.id as keyof typeof RESTROOM_PLANS];if(!data)return;
 const make=(color:number,roughness=.6,metalness=0)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness,side:THREE.DoubleSide});b.materials.push(m);return m;};
 const ceramic=make(0xe9ebe8,.22),partition=make(0x8c9795,.65),counter=make(0xc4c7c0,.45),mirror=make(0xc5d0d1,.12,.25),tile=make(0xffffff,.8),ceiling=make(0xd7dad4,.9);
 const pixels=new Uint8Array(64*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){
  const n=(x+y*64)*4,joint=x<1||y<1,shade=joint?133:173+Math.sin(x*2+y*9)*2;
  pixels[n]=shade;pixels[n+1]=shade+2;pixels[n+2]=shade;pixels[n+3]=255;
 }
 const texture=new THREE.DataTexture(pixels,64,64);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(2,2);texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.anisotropy=4;texture.needsUpdate=true;tile.map=texture;b.textures.push(texture);
 b.surface(room.polygon,.015,tile);b.surface(room.polygon,3.05,ceiling);
 const row=restroomFrame(room,data.back[0],data.back[1]),stalls=restroomStalls(data,row.length);
 const rect=(f:ReturnType<typeof restroomFrame>,x:number,z:number,w:number,d:number,top:number)=>{
  const corners=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([a,c])=>f.at(x+a,z+c));
  corners.forEach((a,i)=>b.barriers.push({a,b:corners[(i+1)%4],minY:0,maxY:top}));
 };
 const box=(f:ReturnType<typeof restroomFrame>,x:number,y:number,z:number,w:number,h:number,d:number,m:THREE.Material)=>{const q=f.at(x,z);b.box(q[0],y,q[1],w,h,d,m,f.angle);};
 const tube=(a:THREE.Vector3,end:THREE.Vector3,r:number)=>{
  const g=new THREE.CylinderGeometry(r,r,a.distanceTo(end),10);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),end.clone().sub(a).normalize()));g.translate(...a.clone().add(end).multiplyScalar(.5).toArray());b.put(g,b.palette.metal);
 };
 const toilet=(x:number,depth=.61)=>{
  const shifted={...row,at:(along:number,z:number)=>row.at(along,z+depth-.61)},q=shifted.at(x,.61),rotation=Math.atan2(row.vx,row.vz);
  const profile=[[.09,.1],[.11,.2],[.18,.29],[.215,.39],[.21,.42],[.155,.42],[.13,.32],[.08,.28]].map(([r,y])=>new THREE.Vector2(r,y));
  const bowl=new THREE.LatheGeometry(profile,24);bowl.scale(.86,1,1.28);bowl.rotateY(rotation);bowl.translate(q[0],0,q[1]);b.put(bowl,ceramic);
  const seat=new THREE.TorusGeometry(.185,.025,8,28);seat.rotateX(Math.PI/2);seat.scale(.9,1,1.28);seat.rotateY(rotation);seat.translate(q[0],.435,q[1]);b.put(seat,ceramic);
  box(shifted,x,.23,.43,.24,.28,.3,ceramic);
  const pipe=shifted.at(x,.22),back=shifted.at(x,.07);
  tube(new THREE.Vector3(pipe[0],.39,pipe[1]),new THREE.Vector3(pipe[0],1.01,pipe[1]),.019);
  tube(new THREE.Vector3(pipe[0],1.01,pipe[1]),new THREE.Vector3(back[0],1.01,back[1]),.019);
  box(shifted,x+.055,1,.22,.1,.025,.025,b.palette.metal);
  rect(shifted,x,.61,.42,.68,.47);
 };
 if(data.sourcePartitions){
  for(const s of data.sourcePartitions)b.wall(s.a,s.b,1.74,partition,true,.16,.045);
  for(const s of data.sourceLeaves!)b.wall(s.a,s.b,1.68,partition,true,.19,.035);
  for(const [x,z] of data.stallToilets!)toilet(x,z);
 }else{
 for(let i=0;i<=stalls.length;i++){
  const x=i===stalls.length?row.length:stalls[i].start,depth=Math.max(stalls[i-1]?.depth??0,stalls[i]?.depth??0),a=row.at(x,0),end=row.at(x,depth);
  b.wall(a,end,1.74,partition,true,.16,.045);
  for(const z of [.18,depth-.08]){const q=row.at(x,z);b.cylinder(q[0],.09,q[1],.016,.18,b.palette.metal);}
 }
 for(const stall of stalls){
  const x=stall.center,halfGap=Math.min(.37,(stall.end-stall.start)/2-.08),front=stall.depth;
  b.wall(row.at(stall.start,front),row.at(x-halfGap,front),1.74,partition,true,.16,.045);
  b.wall(row.at(x+halfGap,front),row.at(stall.end,front),1.74,partition,true,.16,.045);
  // Open leaf rests beside the divider and leaves the actual opening walkable.
  b.wall(row.at(stall.end-.055,front),row.at(stall.end-.055,front-.7),1.68,partition,true,.19,.035);
  toilet(x);
 }
 }
 const sinks=restroomFrame(room,data.sinks[0],data.sinks[1]);
 if(data.sourceCounter){
  b.surface(data.sourceCounter,.895,counter);
  data.sourceCounter.forEach((a,i)=>{const end=data.sourceCounter![(i+1)%data.sourceCounter!.length];b.wall(a,end,.09,counter,false,.805,.01);b.barriers.push({a,b:end,minY:0,maxY:.92});});
 }else{box(sinks,sinks.length/2,.85,.29,sinks.length,.09,.58,counter);rect(sinks,sinks.length/2,.29,sinks.length,.58,.92);}
 box(sinks,sinks.length/2,.39,.17,sinks.length-.08,.75,.28,partition);
 box(sinks,sinks.length/2,1.53,.025,sinks.length-.08,.84,.022,mirror);
 for(let i=0;i<data.sinkCount;i++){
  const x=(i+.5)*sinks.length/data.sinkCount,q=data.sourceBasins?.[i]??sinks.at(x,.32);
  const rim=new THREE.TorusGeometry(.155,.02,8,24);rim.rotateX(Math.PI/2);rim.scale(1,1,.72);rim.rotateY(sinks.angle);rim.translate(q[0],.905,q[1]);b.put(rim,ceramic);
  const recess=new THREE.CircleGeometry(.14,24);recess.rotateX(-Math.PI/2);recess.scale(1,1,.72);recess.rotateY(sinks.angle);recess.translate(q[0],.9,q[1]);b.put(recess,partition);
  const along=data.sourceBasins?(q[0]-data.sinks[0][0])*sinks.ux+(q[1]-data.sinks[0][1])*sinks.uz:x;
  const tap=sinks.at(along,.09),spout=sinks.at(along,.23);
  tube(new THREE.Vector3(tap[0],.9,tap[1]),new THREE.Vector3(tap[0],1.07,tap[1]),.013);
  tube(new THREE.Vector3(tap[0],1.07,tap[1]),new THREE.Vector3(spout[0],1.07,spout[1]),.013);
 }
 if(data.urinals)for(const q of data.urinals){
  // Fixtures face the open aisle on the other side of the shared plumbing wall.
  const f=restroomFrame(room,q,[q[0]+row.ux,q[1]+row.uz]);
  box(f,0,.66,.19,.31,.55,.24,ceramic);box(f,0,.48,.31,.34,.12,.24,ceramic);box(f,0,.79,.325,.23,.27,.012,partition);rect(f,0,.22,.37,.4,.96);
 }
 const center=room.polygon.reduce<Point>((a,p)=>[a[0]+p[0]/room.polygon.length,a[1]+p[1]/room.polygon.length],[0,0]);
 b.box(center[0],3.015,center[1],2.3,.045,.13,b.palette.light,row.angle);
}

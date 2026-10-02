import * as THREE from 'three';
import { fourthCorePlan, pointInPolygon, type InteriorRoom, type Point } from './layout';
import type { RoofBuilder } from './roof';

const p=fourthCorePlan;
/** Fixture counts and partitions follow the HDR drawing. Ceramic, tile and
 * partition finishes are neutral estimates because no interior photos verify them. */
export const RESTROOM_PLANS={
 '4-restroom-west':{back:[p(811,270),p(1042,288)],stalls:6,depth:1.65,sinks:[p(905,148),p(1050,165)],sinkCount:5},
 '4-restroom-east':{back:[p(913,318),p(1039,332)],stalls:3,depth:1.65,sinks:[p(880,428),p(1018,445)],sinkCount:5,urinals:[p(827,306),p(862,310),p(897,314)]},
} satisfies Record<string,{back:Point[];stalls:number;depth:number;sinks:Point[];sinkCount:number;urinals?:Point[]}>;
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
 const row=restroomFrame(room,data.back[0],data.back[1]),width=row.length/data.stalls;
 const rect=(f:ReturnType<typeof restroomFrame>,x:number,z:number,w:number,d:number,top:number)=>{
  const corners=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([a,c])=>f.at(x+a,z+c));
  corners.forEach((a,i)=>b.barriers.push({a,b:corners[(i+1)%4],minY:0,maxY:top}));
 };
 const box=(f:ReturnType<typeof restroomFrame>,x:number,y:number,z:number,w:number,h:number,d:number,m:THREE.Material)=>{const q=f.at(x,z);b.box(q[0],y,q[1],w,h,d,m,f.angle);};
 const tube=(a:THREE.Vector3,end:THREE.Vector3,r:number)=>{
  const g=new THREE.CylinderGeometry(r,r,a.distanceTo(end),10);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),end.clone().sub(a).normalize()));g.translate(...a.clone().add(end).multiplyScalar(.5).toArray());b.put(g,b.palette.metal);
 };
 const toilet=(x:number)=>{
  const q=row.at(x,.61),rotation=Math.atan2(row.vx,row.vz);
  const profile=[[.09,.1],[.11,.2],[.18,.29],[.215,.39],[.21,.42],[.155,.42],[.13,.32],[.08,.28]].map(([r,y])=>new THREE.Vector2(r,y));
  const bowl=new THREE.LatheGeometry(profile,24);bowl.scale(.86,1,1.28);bowl.rotateY(rotation);bowl.translate(q[0],0,q[1]);b.put(bowl,ceramic);
  const seat=new THREE.TorusGeometry(.185,.025,8,28);seat.rotateX(Math.PI/2);seat.scale(.9,1,1.28);seat.rotateY(rotation);seat.translate(q[0],.435,q[1]);b.put(seat,ceramic);
  box(row,x,.23,.43,.24,.28,.3,ceramic);
  const pipe=row.at(x,.22),back=row.at(x,.07);
  tube(new THREE.Vector3(pipe[0],.39,pipe[1]),new THREE.Vector3(pipe[0],1.01,pipe[1]),.019);
  tube(new THREE.Vector3(pipe[0],1.01,pipe[1]),new THREE.Vector3(back[0],1.01,back[1]),.019);
  box(row,x+.055,1,.22,.1,.025,.025,b.palette.metal);
  rect(row,x,.61,.42,.68,.47);
 };
 for(let i=0;i<=data.stalls;i++){
  const x=i*width,a=row.at(x,0),end=row.at(x,data.depth);
  b.wall(a,end,1.74,partition,true,.16,.045);
  for(const z of [.18,data.depth-.08]){const q=row.at(x,z);b.cylinder(q[0],.09,q[1],.016,.18,b.palette.metal);}
 }
 for(let i=0;i<data.stalls;i++){
  const x=(i+.5)*width,halfGap=Math.min(.37,width/2-.08),front=data.depth;
  b.wall(row.at(i*width,front),row.at(x-halfGap,front),1.74,partition,true,.16,.045);
  b.wall(row.at(x+halfGap,front),row.at((i+1)*width,front),1.74,partition,true,.16,.045);
  // Open leaf rests beside the divider and leaves the actual opening walkable.
  b.wall(row.at((i+1)*width-.055,front),row.at((i+1)*width-.055,front-.7),1.68,partition,true,.19,.035);
  toilet(x);
 }
 const sinks=restroomFrame(room,data.sinks[0],data.sinks[1]);
 box(sinks,sinks.length/2,.85,.29,sinks.length,.09,.58,counter);rect(sinks,sinks.length/2,.29,sinks.length,.58,.92);
 box(sinks,sinks.length/2,.39,.17,sinks.length-.08,.75,.28,partition);
 box(sinks,sinks.length/2,1.53,.025,sinks.length-.08,.84,.022,mirror);
 for(let i=0;i<data.sinkCount;i++){
  const x=(i+.5)*sinks.length/data.sinkCount,q=sinks.at(x,.32);
  const rim=new THREE.TorusGeometry(.155,.02,8,24);rim.rotateX(Math.PI/2);rim.scale(1,1,.72);rim.rotateY(sinks.angle);rim.translate(q[0],.905,q[1]);b.put(rim,ceramic);
  const recess=new THREE.CircleGeometry(.14,24);recess.rotateX(-Math.PI/2);recess.scale(1,1,.72);recess.rotateY(sinks.angle);recess.translate(q[0],.9,q[1]);b.put(recess,partition);
  const tap=sinks.at(x,.09),spout=sinks.at(x,.23);
  tube(new THREE.Vector3(tap[0],.9,tap[1]),new THREE.Vector3(tap[0],1.07,tap[1]),.013);
  tube(new THREE.Vector3(tap[0],1.07,tap[1]),new THREE.Vector3(spout[0],1.07,spout[1]),.013);
 }
 if('urinals' in data)for(const q of data.urinals){
  // Fixtures face the open aisle on the other side of the shared plumbing wall.
  const f=restroomFrame(room,q,[q[0]+row.ux,q[1]+row.uz]);
  box(f,0,.66,.19,.31,.55,.24,ceramic);box(f,0,.48,.31,.34,.12,.24,ceramic);box(f,0,.79,.325,.23,.27,.012,partition);rect(f,0,.22,.37,.4,.96);
 }
 const center=room.polygon.reduce<Point>((a,p)=>[a[0]+p[0]/room.polygon.length,a[1]+p[1]/room.polygon.length],[0,0]);
 b.box(center[0],3.015,center[1],2.3,.045,.13,b.palette.light,row.angle);
}

import * as THREE from 'three';
import { hatcheryPlan, HATCHERY_ROOMS, type Point } from './layout';
import type { RoofBuilder } from './roof';

export interface HatcheryItem {room:string;kind:'desk'|'bank'|'board'|'meeting'|'windowbar'|'round';at:Point;width:number;depth:number;turn?:number;seats?:number;}
// Furniture zones follow the HDR plan; the official Hatchery photograph
// supplies desk, chair and rolling-board details. Exact positions are estimated.
export const HATCHERY_ITEMS:HatcheryItem[]=[
 {room:'2237',kind:'desk',at:[472,510],width:1.5,depth:.72,turn:.12},
 {room:'2237',kind:'desk',at:[568,521],width:1.5,depth:.72,turn:.12},
 {room:'2237',kind:'desk',at:[388,646],width:1.5,depth:.72,turn:-Math.PI/2},
 {room:'2237',kind:'desk',at:[383,742],width:1.5,depth:.72,turn:-Math.PI/2},
 {room:'2237',kind:'desk',at:[511,799],width:1.5,depth:.72,turn:Math.PI},
 {room:'2237',kind:'bank',at:[551,654],width:1.8,depth:1.3,seats:2},
 {room:'2237',kind:'board',at:[657,772],width:1.35,depth:.45},
 {room:'2237',kind:'board',at:[698,570],width:1.1,depth:.45,turn:Math.PI/2},
 {room:'hatchery-west-workroom',kind:'desk',at:[212,470],width:1.5,depth:.72,turn:.12},
 {room:'hatchery-west-workroom',kind:'desk',at:[305,590],width:1.5,depth:.72,turn:Math.PI/2},
 {room:'hatchery-west-workroom',kind:'desk',at:[298,760],width:1.5,depth:.72,turn:Math.PI/2},
 {room:'hatchery-west-workroom',kind:'bank',at:[196,654],width:1.8,depth:1.3,seats:2},
 {room:'north-collaboration',kind:'meeting',at:[868,604],width:4.6,depth:1.25,seats:6},
 {room:'north-collaboration',kind:'windowbar',at:[1098,690],width:3.3,depth:.55,turn:Math.PI/2,seats:5},
 {room:'north-collaboration',kind:'round',at:[835,766],width:1.2,depth:1.2,seats:4},
 {room:'north-collaboration',kind:'round',at:[1090,298],width:.8,depth:.8,seats:2},
 {room:'north-collaboration',kind:'round',at:[1077,420],width:1.1,depth:1.1,seats:4},
 {room:'north-collaboration',kind:'round',at:[978,977],width:1.1,depth:1.1,seats:4},
 {room:'north-collaboration',kind:'round',at:[954,1090],width:.8,depth:.8,seats:2},
];
const origin=hatcheryPlan(0,0),along=hatcheryPlan(1,0),length=Math.hypot(along[0]-origin[0],along[1]-origin[1]);
const U:Point=[(along[0]-origin[0])/length,(along[1]-origin[1])/length],V:Point=[-U[1],U[0]];
export function hatcheryItemFrame(item:HatcheryItem){
 const p=hatcheryPlan(...item.at),c=Math.cos(item.turn??0),s=Math.sin(item.turn??0),u:Point=[U[0]*c+V[0]*s,U[1]*c+V[1]*s],v:Point=[-U[0]*s+V[0]*c,-U[1]*s+V[1]*c];
 return {angle:-Math.atan2(u[1],u[0]),u,v,at:(x:number,z:number):Point=>[p[0]+u[0]*x+v[0]*z,p[1]+u[1]*x+v[1]*z]};
}
export const hatcheryItemFootprint=(item:HatcheryItem)=>{const f=hatcheryItemFrame(item);return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z])=>f.at(x*item.width/2,z*item.depth/2));};
export function buildHatchery(roomId:string,b:RoofBuilder){
 const {palette:m}=b,material=(color:number,roughness=.6)=>{const mat=new THREE.MeshStandardMaterial({color,roughness});b.materials.push(mat);return mat;};
 const vinyl=material(0x303536),wood=material(0x96683f),red=material(0xaa302e),blue=material(0x43717e),green=material(0x91aa39),board=material(0xf1f3ec,.24);
 const room=HATCHERY_ROOMS.find(room=>room.id===roomId);
 if(room){
  b.surface(room.polygon,.012,vinyl);
  // Suspended linear lights above the exposed ceiling structure visible in the photo.
  const center=room.polygon.reduce<Point>((sum,p)=>[sum[0]+p[0]/room.polygon.length,sum[1]+p[1]/room.polygon.length],[0,0]);
  for(const offset of [-1.7,1.7]){
   b.box(center[0]+V[0]*offset,3.55,center[1]+V[1]*offset,3.1,.06,.1,m.light,-Math.atan2(U[1],U[0]));
   for(const side of [-1,1])b.cylinder(center[0]+V[0]*offset+U[0]*side*1.2,3.91,center[1]+V[1]*offset+U[1]*side*1.2,.009,.65,m.metal);
  }
 }
 const block=(points:Point[],height:number)=>points.forEach((a,i)=>b.barriers.push({a,b:points[(i+1)%points.length],minY:0,maxY:height}));
 for(const item of HATCHERY_ITEMS.filter(item=>item.room===roomId)){
  const f=hatcheryItemFrame(item),box=(x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material)=>{const p=f.at(x,z);b.box(p[0],y,p[1],w,h,d,mat,f.angle);};
  const cylinder=(x:number,y:number,z:number,r:number,h:number,mat:THREE.Material)=>{const p=f.at(x,z);b.cylinder(p[0],y,p[1],r,h,mat);};
  const chair=(x:number,z:number,side=1,seatColor:THREE.Material=wood,height=.47,turn=0)=>{
   const p=f.at(x,z),rotation=f.angle+(side===1?0:Math.PI)+turn;
   b.box(p[0],height,p[1],.46,.06,.44,seatColor,rotation);
   // Curved timber back and four splayed caster legs, as in the workspace photo.
   const profile=new THREE.Shape();profile.moveTo(-.235,-.16);profile.quadraticCurveTo(-.29,.03,-.225,.24);profile.lineTo(.225,.24);profile.quadraticCurveTo(.29,.03,.235,-.16);profile.closePath();
   const back=new THREE.ExtrudeGeometry(profile,{depth:.025,bevelEnabled:false,curveSegments:5});back.rotateX(-.14);back.rotateY(rotation);back.translate(p[0]+Math.sin(rotation)*.18,height+.23,p[1]+Math.cos(rotation)*.18);b.put(back,seatColor);
   for(const dx of [-1,1])for(const dz of [-1,1]){
    const a=new THREE.Vector3(p[0]+f.u[0]*dx*.15+f.v[0]*dz*.13,height-.03,p[1]+f.u[1]*dx*.15+f.v[1]*dz*.13);
    const end=new THREE.Vector3(p[0]+f.u[0]*dx*.29+f.v[0]*dz*.27,.1,p[1]+f.u[1]*dx*.29+f.v[1]*dz*.27);
    const leg=new THREE.CylinderGeometry(.017,.017,a.distanceTo(end),8);leg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),end.clone().sub(a).normalize()));leg.translate(...a.add(end).multiplyScalar(.5).toArray());b.put(leg,m.metal);
    const q=f.at(x+dx*.29,z+dz*.27);b.cylinder(q[0],.065,q[1],.04,.07,m.black);
   }
   const outline=Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2;return [p[0]+Math.cos(a)*.28,p[1]+Math.sin(a)*.28] as Point;});block(outline,height+.5);
  };
  block(hatcheryItemFootprint(item),item.kind==='board'?1.8:item.kind==='windowbar'?1.05:.8);
  if(item.kind==='board'){
   box(0,1.09,0,item.width,1.32,.035,board);
   for(const side of [-1,1]){
    box(side*(item.width/2-.08),.54,0,.025,.98,.025,m.metal);box(side*(item.width/2-.08),.13,0,.08,.045,.43,red);
    for(const z of [-.19,.19])cylinder(side*(item.width/2-.08),.07,z,.04,.07,m.black);
   }
   box(0,.41,.055,item.width,.035,.12,red);
   // Abstract planning marks keep private writing and company data out of textures.
   for(let i=0;i<5;i++)box(-item.width*.27+(i%2)*.32,1.5-i*.16,.02,item.width*(i%2?.28:.42),.009,.004,i%2?red:blue);
   continue;
  }
  const top=item.kind==='windowbar'?1.04:.76;
  if(item.kind==='round'){
   cylinder(0,top,0,item.width/2,.065,m.white);cylinder(0,.37,0,.045,.74,m.metal);cylinder(0,.045,0,.32,.05,m.metal);
   for(const side of [-1,1]){chair(0,side*(item.width/2+.35),side,green);if(item.seats===4)chair(side*(item.width/2+.35),0,1,green,.47,side*Math.PI/2);}
   continue;
  }
  box(0,top,0,item.width,.065,item.depth,m.oak);
  for(const side of [-1,1]){
   box(side*(item.width/2-.15),top/2,0,.065,top,item.depth-.08,m.metal);
   box(side*(item.width/2-.15),.04,0,.4,.035,item.depth-.05,m.metal);
  }
  box(0,.48,-item.depth*.22,item.width-.2,.045,.035,m.metal);
  if(item.kind==='desk'){
   box(0,1.03,-.1,.53,.34,.035,m.black);box(0,1.03,-.077,.47,.27,.012,blue);box(0,.84,-.1,.035,.13,.035,m.metal);
   box(-.36,.805,.1,.3,.025,.22,m.black);box(0,.805,.2,.38,.02,.12,m.black);chair(0,item.depth/2+.24);
  }else if(item.kind==='windowbar'){
   for(let i=0;i<item.seats!;i++)chair(((i+.5)/item.seats!-.5)*item.width,.64,1,green,.72);
  }else{
   for(const side of [-1,1])for(let i=0;i<item.seats!;i++)chair(((i+.5)/item.seats!-.5)*item.width,side*(item.depth/2+.22),side,item.kind==='meeting'?green:wood);
  }
 }
}

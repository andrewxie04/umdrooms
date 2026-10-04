import * as THREE from 'three';
import { liftLanding, type LiftCar, type LiftLandingLayout } from './lift-layout';
import { type FloorId, type Point } from './layout';
import type { RoofBuilder } from './roof';
import type { Barrier } from './model';
import { verticalTimberFinish } from './finishes';

export interface LiftLandingModel { layout:LiftLandingLayout; doors:THREE.Group; setDoorProgress(car:LiftCar,progress:number):void; }
/** Shaft/cab outline follows the public plan. Cab lining, sill, ceiling and
 * door hardware are explicitly estimated until cab photographs are available. */
export function buildLiftLanding(floor:FloorId,b:RoofBuilder):LiftLandingModel|null {
 const layout=liftLanding(floor);if(!layout)return null;
 const {wall,box,surface,palette:m}=b;
 const timber=new THREE.MeshStandardMaterial({color:floor==='G'||floor==='1'?0xb2844c:0xa27849,roughness:.65});
 if(floor==='G'||floor==='1'){const grain=verticalTimberFinish();b.textures.push(grain);timber.map=grain;}
 const backing=new THREE.MeshStandardMaterial({color:0x4b392c,roughness:.86});
 const lining=new THREE.MeshStandardMaterial({color:0xc2c3bc,roughness:.46,metalness:.12,side:THREE.DoubleSide});lining.name='Estimated lift cab lining';
 const sill=new THREE.MeshStandardMaterial({color:0x9ca2a1,roughness:.33,metalness:.75});
 const cabFloor=new THREE.MeshStandardMaterial({color:0x767771,roughness:.61});
 const doorMetal=new THREE.MeshStandardMaterial({color:0xa5abaa,roughness:.36,metalness:.8});doorMetal.name='Lift sliding doors';
 b.materials.push(timber,backing,lining,sill,cabFloor,doorMetal);
 const h=floor==='G'?6.5:4.2;
 surface(layout.core,h,timber);
 const clad=(a:Point,end:Point,base=0,height=h,collision=true)=>{
  wall(a,end,height,backing,collision,base);
  const length=Math.hypot(end[0]-a[0],end[1]-a[1]),count=Math.max(1,Math.round(length/.075)),angle=-Math.atan2(end[1]-a[1],end[0]-a[0]);
  const ux=(end[0]-a[0])/length,uz=(end[1]-a[1])/length;
  let nx=uz,nz=-ux;
  const mid:Point=[(a[0]+end[0])/2,(a[1]+end[1])/2];
  // Determine the outside from the core centroid, including the curved back.
  const center=layout.core.reduce<Point>((s,p)=>[s[0]+p[0]/layout.core.length,s[1]+p[1]/layout.core.length],[0,0]);
  if(nx*(mid[0]-center[0])+nz*(mid[1]-center[1])<0){nx=-nx;nz=-nz;}
  for(let j=0;j<count;j++){const t=(j+.5)/count;box(a[0]+(end[0]-a[0])*t+nx*.08,base+height/2,a[1]+(end[1]-a[1])*t+nz*.08,length/count*.58,height,.055,timber,angle);}
  const reveal=floor==='G'?3.22:2.05;
  if(reveal>=base&&reveal<base+height)wall(a,end,.022,m.black,false,reveal,.08);
 };
 // The last/front edge is split around both shaft entrances below.
 const same=(a:Point,b:Point)=>Math.hypot(a[0]-b[0],a[1]-b[1])<.00001;
 const faceEdge=layout.core.findIndex((a,i)=>same(a,layout.face[0])&&same(layout.core[(i+1)%layout.core.length],layout.face[1]));
 layout.core.forEach((a,i)=>{if(i!==(faceEdge<0?layout.core.length-1:faceEdge))clad(a,layout.core[(i+1)%layout.core.length]);});
 const [faceA,faceB]=layout.face;
 const u=layout.cabs[0].u,out=layout.cabs[0].outward;
 const ordered=[...layout.cabs].sort((a,b)=>(a.door[0]-b.door[0])*u[0]+(a.door[1]-b.door[1])*u[1]);
 let start=faceA;
 const doors=new THREE.Group();doors.name=`Central lift doors ${floor}`;
 const leaves=new Map<LiftCar,{mesh:THREE.Mesh;barrier:Barrier;sign:number}[]>();
 for(const c of ordered){
  const left=c.at(-c.opening/2,0),right=c.at(c.opening/2,0),angle=-Math.atan2(c.u[1],c.u[0]);
  clad(start,left);start=right;
  wall(left,right,.11,backing,false,2.4);
  clad(left,right,2.51,h-2.51,false);
  // Cabin walls, floor and ceiling are separate from the shaft's wood shell.
  // Cab detail is conservative and carries an estimated finish disclosure.
  for(let i=1;i<4;i++)wall(c.polygon[i],c.polygon[(i+1)%4],2.62,lining,true,0,.09);
  surface(c.polygon,.012,cabFloor);surface(c.polygon,2.62,lining);
  box(c.door[0]-out[0]*.08,.018,c.door[1]-out[1]*.08,c.opening,.036,.18,sill,angle);
  for(const p of [left,right])box(p[0],1.23,p[1],.07,2.46,.15,doorMetal,angle);
  box(c.door[0],2.45,c.door[1],c.opening+.16,.08,.15,doorMetal,angle);
  const atLeft=c.at(-c.opening/2,.012),atRight=c.at(c.opening/2,.012);
  const pair=[-1,1].map(sign=>{
   const g=new THREE.BoxGeometry(c.opening/2-.005,2.37,.045);g.rotateY(angle);
   const mesh=new THREE.Mesh(g,doorMetal);mesh.userData.interiorLayer='shell';doors.add(mesh);
   const barrier:Barrier={a:atLeft,b:atRight,minY:0,maxY:2.4};b.barriers.push(barrier);
   return {mesh,barrier,sign};
  });leaves.set(c.car,pair);
 }
 clad(start,faceB);
 if(faceEdge<0){clad(layout.core[0],faceA);clad(faceB,layout.core.at(-1)!);}
 return {layout,doors,setDoorProgress(car,progress){
  const c=layout.cabs[car],p=THREE.MathUtils.clamp(progress,0,1);
  for(const {mesh,barrier,sign} of leaves.get(car)!){
   const center=sign*(c.opening/4+p*(c.opening/2+.015)),at=c.at(center,.012);
   mesh.position.set(at[0],1.195,at[1]);
   barrier.a=c.at(center-c.opening/4,.012);barrier.b=c.at(center+c.opening/4,.012);
  }
 }};
}

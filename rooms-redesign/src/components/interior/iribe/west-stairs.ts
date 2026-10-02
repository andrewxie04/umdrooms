import * as THREE from 'three';
import { WEST_STAIR as s } from './west-stair-layout';
import { FLOOR_HEIGHT, type FloorId, type Point, type Polygon } from './layout';
import type { RoofBuilder } from './roof';

export function buildWestStair(floor:FloorId,b:RoofBuilder){
 if(floor!==s.lower&&floor!==s.upper)return;
 const m=b.palette,ceiling=floor===s.lower?FLOOR_HEIGHT[s.upper]-FLOOR_HEIGHT[s.lower]:4.2;
 const concrete=new THREE.MeshStandardMaterial({color:0xb7b9b6,roughness:.92,side:THREE.DoubleSide});b.materials.push(concrete);
 const wall=(a:Point,end:Point)=>b.wall(a,end,ceiling,m.white);
 for(let i=0;i<3;i++)wall(s.shaft[i],s.shaft[i+1]);
 const half=.575,left=s.at(0,s.doorZ-half),right=s.at(0,s.doorZ+half);
 wall(s.shaft[3],right);wall(left,s.shaft[0]);b.wall(left,right,ceiling-2.5,m.white,false,2.5);
 for(const z of [s.doorZ-half,s.doorZ+half]){const p=s.at(0,z);b.box(p[0],1.25,p[1],.16,2.5,.055,m.metal,s.angle);}
 // The doorway opens onto a full-width level landing on each storey.
 const rect=(x0:number,z0:number,x1:number,z1:number):Polygon=>[s.at(x0,z0),s.at(x1,z0),s.at(x1,z1),s.at(x0,z1)];
 const rail=(x:number,z0:number,z1:number,y0:number,y1:number)=>{
  const a=s.at(x,z0),c=s.at(x,z1),len=Math.hypot(c[0]-a[0],c[1]-a[1]);
  const start=new THREE.Vector3(a[0],y0+1.02,a[1]),end=new THREE.Vector3(c[0],y1+1.02,c[1]);
  const g=new THREE.CylinderGeometry(.025,.025,start.distanceTo(end),8);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),end.clone().sub(start).normalize()));g.translate(...start.add(end).multiplyScalar(.5).toArray());b.put(g,m.metal);
  const count=Math.ceil(len/.45);
  for(let i=0;i<count;i++){
   const t=i/count,q=(i+1)/count,y=y0+(y1-y0)*t,ny=y0+(y1-y0)*q,p=s.at(x,z0+(z1-z0)*t),next=s.at(x,z0+(z1-z0)*q);
   b.box(p[0],y+.51,p[1],.035,1.02,.035,m.metal);
   b.barriers.push({a:p,b:next,minY:Math.min(y,ny)-.17,maxY:Math.max(y,ny)+1.05});
  }
 };
 if(floor===s.lower){
  const rise=FLOOR_HEIGHT[s.upper]-FLOOR_HEIGHT[s.lower],halfRise=rise/2;
  const landing=rect(.08,.08,s.width-.08,s.turnZ);
  b.surface(landing,halfRise,concrete);b.surface(landing,halfRise-.18,concrete);
  landing.forEach((a,i)=>b.wall(a,landing[(i+1)%4],.18,concrete,false,halfRise-.18,.02));
  for(const [center,start,end] of [[s.width*.75,0,halfRise],[s.width*.25,rise,halfRise]]){
   const count=Math.ceil(halfRise/.17),step=(s.flightEnd-s.turnZ)/count;
   for(let i=0;i<count;i++){
    const z0=s.flightEnd-i*step,z1=z0-step,y=start+(end-start)*(end>start?i+1:i)/count;
    const p=rect(center-s.flightWidth/2,z1,center+s.flightWidth/2,z0);
    b.surface(p,y,concrete);b.surface(p,y-.18,concrete);p.forEach((a,j)=>b.wall(a,p[(j+1)%4],.18,concrete,false,y-.18,.015));
   }
   for(const side of [-1,1])rail(center+side*s.flightWidth/2,s.flightEnd,s.turnZ,start,end);
  }
 }else{
  // Guard the unused descending edge, leaving the ascending-flight exit clear.
  const a=s.at(s.width/2,s.flightEnd),c=s.at(s.width-.1,s.flightEnd);
  b.wall(a,c,1.05,m.metal,true,0,.035);
 }
 for(const z of [s.turnZ,s.length-.7]){
  const p=s.at(s.width/2,z);b.box(p[0],ceiling-.14,p[1],1.15,.06,.14,m.light,s.angle);
 }
}

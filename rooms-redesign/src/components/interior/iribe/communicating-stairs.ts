import * as THREE from 'three';
import { communicatingStairForFloor } from './communicating-layout';
import { FLOOR_HEIGHT, type FloorId, type Point, type Polygon } from './layout';
import type { RoofBuilder } from './roof';

export function buildCommunicatingStair(floor:FloorId,b:RoofBuilder){
 const stair=communicatingStairForFloor(floor);if(!stair)return;
 const {core:COMMUNICATING_CORE,face:COMMUNICATING_CORE_FACE,edges:COMMUNICATING_EDGES,flights:COMMUNICATING_FLIGHTS,void:COMMUNICATING_VOID}=stair;
 const {box,wall,surface,put,palette:m}=b;
 const structure=new THREE.MeshStandardMaterial({color:0xe5e5df,roughness:.75,side:THREE.DoubleSide});
 const timber=new THREE.MeshStandardMaterial({color:0xa7733a,roughness:.7});
 b.materials.push(structure,timber);
 const coreHeight=floor===stair.lower?FLOOR_HEIGHT[stair.upper]-FLOOR_HEIGHT[stair.lower]:4.2;
 surface(COMMUNICATING_CORE,coreHeight,timber);
 COMMUNICATING_CORE.forEach((a,i)=>{
  const end=COMMUNICATING_CORE[(i+1)%COMMUNICATING_CORE.length];wall(a,end,coreHeight,timber);
 });
 // Two elevator-door panels on the straight face shown in the plan.
 const [a,end]=COMMUNICATING_CORE_FACE,dx=end[0]-a[0],dz=end[1]-a[1],length=Math.hypot(dx,dz),angle=-Math.atan2(dz,dx);
 for(const t of [.26,.74]){
  const x=a[0]+dx*t,z=a[1]+dz*t,nx=dz/length,nz=-dx/length;
  box(x+nx*.09,1.2,z+nz*.09,1.65,2.4,.035,m.metal,angle);
  box(x+nx*.115,1.2,z+nz*.115,.012,2.4,.015,m.black,angle);
 }
 // Thin metal pickets and handrails follow the continuous stair curve.
 // Exact upper-floor guard detailing is not resolved by the public plan.
 const rail=(a:Point,end:Point,ay:number,by:number)=>{
  const length=Math.hypot(end[0]-a[0],end[1]-a[1]),steps=Math.max(1,Math.ceil(length/.38));
  const start=new THREE.Vector3(a[0],ay+1.05,a[1]),finish=new THREE.Vector3(end[0],by+1.05,end[1]);
  const g=new THREE.CylinderGeometry(.027,.027,start.distanceTo(finish),8);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),finish.clone().sub(start).normalize()));g.translate(...start.add(finish).multiplyScalar(.5).toArray());put(g,m.metal);
  for(let i=0;i<steps;i++){
   const t=i/steps,u=(i+1)/steps,p:Point=[a[0]+(end[0]-a[0])*t,a[1]+(end[1]-a[1])*t],q:Point=[a[0]+(end[0]-a[0])*u,a[1]+(end[1]-a[1])*u],y=ay+(by-ay)*t;
   box(p[0],y+.52,p[1],.035,1.04,.035,m.metal);
   b.barriers.push({a:p,b:q,minY:Math.min(y,ay+(by-ay)*u)-.2,maxY:Math.max(y,ay+(by-ay)*u)+1.08});
  }
 };
 if(floor===stair.lower){
  const edges=stair.walkingEdges,base=FLOOR_HEIGHT[stair.lower];
  COMMUNICATING_FLIGHTS.forEach((flight,i)=>{
   const rise=flight.to[1]-flight.from[1],steps=Math.max(1,Math.ceil(rise/.17));
   const at=(side:number,t:number):Point=>[edges[i][side][0]+(edges[i+1][side][0]-edges[i][side][0])*t,edges[i][side][1]+(edges[i+1][side][1]-edges[i][side][1])*t];
   for(let j=0;j<steps;j++){
    const y=flight.from[1]-base+rise*(j+1)/steps,poly:Polygon=[at(0,j/steps),at(0,(j+1)/steps),at(1,(j+1)/steps),at(1,j/steps)];
    surface(poly,y,structure);surface(poly,y-.19,structure);
    poly.forEach((p,k)=>wall(p,poly[(k+1)%4],.19,structure,false,y-.19,.012));
   }
   for(const side of [0,1])rail(edges[i][side],edges[i+1][side],flight.from[1]-base,flight.to[1]-base);
  });
 }else{
  // Leave the upper arrival edge open; guard every other edge of the cut.
  const exitEdge=COMMUNICATING_EDGES.length-1;
  COMMUNICATING_VOID.forEach((p,i)=>{if(i!==exitEdge)rail(p,COMMUNICATING_VOID[(i+1)%COMMUNICATING_VOID.length],0,0);});
 }
}

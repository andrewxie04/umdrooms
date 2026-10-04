import * as THREE from 'three';
import { buildOpenGlassLeaves } from './lobby-entrance';
import { SOUTH_STAIR_FIRST_DOOR, SOUTH_STAIR_FIRST_WALLS, SOUTH_STAIR_LANDINGS, SOUTH_STAIR_RUNS, SOUTH_STAIR_TOP_JOIN } from './lobby-south-stair-layout';
import type { Position } from './circulation';
import type { FloorId, Point, Polygon } from './layout';
import type { RoofBuilder } from './roof';

/** Source plan geometry with estimated vertical stack, finishes and hardware.
 * Built in static shell batches so changing the nearest storey cannot hide a
 * flight mid-walk. No animation loop, extra texture or photographic overlay. */
export function buildSouthStair(floor:FloorId,b:RoofBuilder,concrete:THREE.Material){
 const m=b.palette;
 if(floor==='1'){
  for(const s of SOUTH_STAIR_FIRST_WALLS){
   const shape=new THREE.Shape(s.outer.map(([x,z])=>new THREE.Vector2(x,-z)));
   for(const hole of s.holes)shape.holes.push(new THREE.Path(hole.map(([x,z])=>new THREE.Vector2(x,-z))));
   const geo=new THREE.ExtrudeGeometry(shape,{depth:4.2,bevelEnabled:false});geo.rotateX(-Math.PI/2);b.put(geo,m.white);
   for(const ring of [s.outer,...s.holes])ring.forEach((a,i)=>b.barriers.push({a,b:ring[(i+1)%ring.length],minY:0,maxY:4.2}));
  }
  const door=SOUTH_STAIR_FIRST_DOOR;
  b.wall(door.hinge,door.closedTip,1.8,m.white,true,2.4,.1);
  b.wall(door.hinge,door.closedTip,.07,m.metal,false,2.4,.075);
  buildOpenGlassLeaves(b,[door],2.4);
  return;
 }
 if(floor!=='G')return;
 const deck=(p:Polygon,y:number)=>{
  b.surface(p,y,concrete);b.surface(p,y-.16,concrete);
  p.forEach((a,i)=>b.wall(a,p[(i+1)%p.length],.16,concrete,false,y-.16,.012));
 };
 const rail=(a:Point,end:Point,ay:number,by:number)=>{
  const start=new THREE.Vector3(a[0],ay+1.02,a[1]),finish=new THREE.Vector3(end[0],by+1.02,end[1]);
  const length=start.distanceTo(finish),geo=new THREE.CylinderGeometry(.024,.024,length,8);
  geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),finish.clone().sub(start).normalize()));geo.translate(...start.add(finish).multiplyScalar(.5).toArray());b.put(geo,m.metal);
  const count=Math.max(1,Math.ceil(Math.hypot(end[0]-a[0],end[1]-a[1])/.44));
  for(let i=0;i<count;i++){
   const t=i/count,u=(i+1)/count,p:Point=[a[0]+(end[0]-a[0])*t,a[1]+(end[1]-a[1])*t],q:Point=[a[0]+(end[0]-a[0])*u,a[1]+(end[1]-a[1])*u],h=ay+(by-ay)*t,next=ay+(by-ay)*u;
   b.box(p[0],h+.51,p[1],.03,1.02,.03,m.metal);
   b.barriers.push({a:p,b:q,minY:Math.min(h,next)-.16,maxY:Math.max(h,next)+1.05});
  }
 };
 const quad=(points:readonly Position[],outward:Position)=>{
  const vertices=points.map(p=>new THREE.Vector3(...p));
  const normal=vertices[1].clone().sub(vertices[0]).cross(vertices[2].clone().sub(vertices[0]));
  const index=normal.dot(new THREE.Vector3(...outward))>=0?[0,1,2,0,2,3]:[0,2,1,0,3,2];
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(points.flatMap(p=>[p[0],-p[2]]),2));geometry.setIndex(index);geometry.computeVertexNormals();b.put(geometry,concrete);
 };
 for(const run of SOUTH_STAIR_RUNS){
  const rows=run.sections!;
  for(let i=0;i<rows.length-1;i++){
   const a=rows[i],end=rows[i+1];
   b.surface([a.a,a.b,end.b,end.a],end.height,concrete);
   // A continuous sloping soffit and full risers close the old 16 mm gaps.
   // Avoid adjacent full boxes, whose overlapping end faces would z-fight.
   quad([[a.a[0],a.height-.16,a.a[1]],[end.a[0],end.height-.16,end.a[1]],[end.b[0],end.height-.16,end.b[1]],[a.b[0],a.height-.16,a.b[1]]],[0,-1,0]);
   b.wall(a.a,a.b,end.height-a.height,concrete,false,a.height,.012);
   for(const side of ['a','b'] as const){
    const p=a[side],q=end[side],middle:Point=[(a.a[0]+a.b[0])/2,(a.a[1]+a.b[1])/2];
    quad([[p[0],a.height-.16,p[1]],[q[0],end.height-.16,q[1]],[q[0],end.height,q[1]],[p[0],end.height,p[1]]],[p[0]-middle[0],0,p[1]-middle[1]]);
   }
   rail(a.a,end.a,a.height,end.height);rail(a.b,end.b,a.height,end.height);
  }
  for(const row of [rows[0],rows.at(-1)!])b.wall(row.a,row.b,.16,concrete,false,row.height-.16,.012);
 }
 SOUTH_STAIR_LANDINGS.forEach((landing,index)=>{
  const p=landing.polygon!,height=landing.from[1];deck(p,height);
  const mouths=index===0?[3,7]:[1,5];
  p.forEach((a,i)=>{if(!mouths.includes(i))rail(a,p[(i+1)%p.length],height,height);});
 });
 deck(SOUTH_STAIR_TOP_JOIN,SOUTH_STAIR_RUNS[2].to[1]);
}

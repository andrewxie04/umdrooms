import * as THREE from 'three';
import type { Polygon } from './layout';
import type { RoofBuilder } from './roof';

/** Native plan wall solids supplied by the source consumer. The photograph
 * supports full-height brick at the lounge; 6.3 m is the estimated Ground
 * ceiling, not a documented auditorium section. */
export function buildGroundAuditoriumEnclosure(b:RoofBuilder,brick:THREE.Material,solids:readonly {outer:Polygon;holes:Polygon[]}[]){
 const height=6.3;
 for(const {outer,holes} of solids){
  const shape=new THREE.Shape(outer.map(([x,z])=>new THREE.Vector2(x,-z)));
  for(const hole of holes)shape.holes.push(new THREE.Path(hole.map(([x,z])=>new THREE.Vector2(x,-z))));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});geometry.rotateX(-Math.PI/2);
  // Follow each native boundary's length so brick courses remain continuous
  // around the curve instead of switching between world X and Z projections.
  const edges=[outer,...holes].flatMap(ring=>{
   let phase=0;
   return ring.map((a,i)=>{
    const end=ring[(i+1)%ring.length],dx=end[0]-a[0],dz=end[1]-a[1],length=Math.hypot(dx,dz),edge={a,dx,dz,length,phase};
    phase+=length;return edge;
   });
  });
  const positions=geometry.getAttribute('position'),normals=geometry.getAttribute('normal'),uv=geometry.getAttribute('uv');
  for(let i=0;i<positions.count;i++){
   if(Math.abs(normals.getY(i))>=.5){uv.setXY(i,positions.getX(i)/.48,positions.getZ(i)/.48);continue;}
   const x=positions.getX(i),z=positions.getZ(i);
   let nearest=Infinity,along=0;
   for(const edge of edges){
    if(edge.length<1e-8)continue;
    const t=THREE.MathUtils.clamp(((x-edge.a[0])*edge.dx+(z-edge.a[1])*edge.dz)/(edge.length*edge.length),0,1);
    const error=Math.hypot(x-edge.a[0]-edge.dx*t,z-edge.a[1]-edge.dz*t);
    if(error<nearest){nearest=error;along=edge.phase+edge.length*t;}
   }
   uv.setXY(i,along/.48,positions.getY(i)/.15);
  }
  b.put(geometry,brick);
  for(const ring of [outer,...holes])ring.forEach((a,i)=>b.barriers.push({a,b:ring[(i+1)%ring.length],minY:0,maxY:height}));
 }
}

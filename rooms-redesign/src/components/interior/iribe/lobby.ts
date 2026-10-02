import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { groundPlan, type Point, type Polygon } from './layout';
import type { RoofBuilder } from './roof';

export const LOBBY_GROUPS=([
 [1110,675,0],[1215,655,.8],[1305,705,-.65],[1190,760,2],
] as const).map(([x,z,angle])=>({center:groundPlan(x,z),angle}));
type Builder=RoofBuilder&{contact(x:number,z:number,r:number):void};
/** Curved modular seating and four-star lounge chairs in UMD's lobby photo.
 * Group placement is estimated between the photographed views and plan marks. */
export function buildLobbySeating(b:Builder){
 const make=(color:number)=>{const m=new THREE.MeshStandardMaterial({color,roughness:.9,side:THREE.DoubleSide});b.materials.push(m);return m;};
 const yellow=make(0xd5aa28),blue=make(0x285872),teal=make(0x2f7d8a);
 const roundedArc=(inner:number,outer:number,extent:number):Polygon=>{
  const points:Point[]=[],radius=(outer-inner)/2,middle=(outer+inner)/2;
  for(let i=0;i<=32;i++){const a=-extent+i/32*extent*2;points.push([Math.sin(a)*outer,Math.cos(a)*outer]);}
  // Semicircular end caps make upholstered ends, not sharp annular wedges.
  const x=Math.sin(extent)*middle,z=Math.cos(extent)*middle;
  for(let i=1;i<=12;i++){const a=extent+i/12*Math.PI;points.push([x+Math.sin(a)*radius,z+Math.cos(a)*radius]);}
  for(let i=1;i<=32;i++){const a=extent-i/32*extent*2;points.push([Math.sin(a)*inner,Math.cos(a)*inner]);}
  const lx=Math.sin(-extent)*middle,lz=Math.cos(-extent)*middle;
  for(let i=1;i<12;i++){const a=Math.PI-extent+i/12*Math.PI;points.push([lx+Math.sin(a)*radius,lz+Math.cos(a)*radius]);}
  return points;
 };
 const seat=roundedArc(1.1,1.92,.93),back=roundedArc(1.71,1.95,.88);
 for(const {center:[cx,cz],angle} of LOBBY_GROUPS){
  const local=(x:number,z:number):Point=>[cx+Math.cos(angle)*x+Math.sin(angle)*z,cz-Math.sin(angle)*x+Math.cos(angle)*z];
  const volume=(poly:Polygon,y:number,h:number)=>{
   const shape=new THREE.Shape(poly.map(([x,z])=>new THREE.Vector2(x,-z)));
   const g=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.04,bevelThickness:.035,curveSegments:8});
   g.rotateX(-Math.PI/2);g.rotateY(angle);g.translate(cx,y,cz);
   // Smooth the fabric across the sampled arc and cushion bevels. UV seams
   // are unnecessary for these untextured upholstery materials.
   g.deleteAttribute('normal');g.deleteAttribute('uv');const smooth=mergeVertices(g);g.dispose();smooth.computeVertexNormals();smooth.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(smooth.getAttribute('position').count*2),2));b.put(smooth,yellow);
  };
  volume(seat,.11,.32);volume(back,.45,.38);
  const footprint=seat.map(([x,z])=>local(x,z));footprint.forEach((a,i)=>b.barriers.push({a,b:footprint[(i+1)%footprint.length],minY:0,maxY:.91}));
  const shadow=local(0,1.4);b.contact(shadow[0],shadow[1],1.9);
  for(const a of [-.65,0,.65]){const p=local(Math.sin(a)*1.5,Math.cos(a)*1.5);b.cylinder(p[0],.055,p[1],.06,.11,b.palette.black);}
  b.cylinder(cx,.5,cz,.54,.045,b.palette.white);b.cylinder(cx,.255,cz,.04,.46,b.palette.metal);b.cylinder(cx,.035,cz,.29,.04,b.palette.metal);
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2,end=(i+1)/16*Math.PI*2;b.barriers.push({a:[cx+Math.cos(a)*.54,cz+Math.sin(a)*.54],b:[cx+Math.cos(end)*.54,cz+Math.sin(end)*.54],minY:0,maxY:.53});}
  b.contact(cx,cz,.68);
  for(const [x,z,color] of [[-.95,-.85,blue],[.95,-.85,teal]] as const){
   const p=local(x,z),rotation=angle+Math.atan2(x,z);
   b.cylinder(p[0],.44,p[1],.335,.09,color);
   const shell=new THREE.CylinderGeometry(.38,.34,.44,24,1,true,-1.35,2.7);shell.rotateY(rotation);shell.translate(p[0],.66,p[1]);b.put(shell,color);
   b.cylinder(p[0],.215,p[1],.035,.35,b.palette.metal);
   for(const turn of [Math.PI/4,-Math.PI/4])b.box(p[0],.065,p[1],.025,.035,.66,b.palette.metal,rotation+turn);
   for(let i=0;i<16;i++){const a=i/16*Math.PI*2,end=(i+1)/16*Math.PI*2;b.barriers.push({a:[p[0]+Math.cos(a)*.38,p[1]+Math.sin(a)*.38],b:[p[0]+Math.cos(end)*.38,p[1]+Math.sin(end)*.38],minY:0,maxY:.9});}
   b.contact(p[0],p[1],.58);
  }
 }
}

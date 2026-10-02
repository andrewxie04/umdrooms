import * as THREE from 'three';
import { ATRIUM_FLIGHTS, ATRIUM_LANDING, type Position } from './circulation';
import { ATRIUM_VOID, atriumPoint, type Point, type Polygon } from './layout';
import type { RoofBuilder } from './roof';

// Rounded wood enclosure follows the plan's broad curved back and flat
// elevator-door face. Placement and dimensions are interpreted, not surveyed.
const coreCurve=new THREE.CatmullRomCurve3([
 [-1.45,-1.9],[1.55,-1.9],[1.95,-1.5],[1.95,1.5],[1.55,1.9],[-1.45,1.9],[-2,1.35],[-2,-1.3],
].map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal');
export const ATRIUM_CORE:Polygon=coreCurve.getPoints(64).slice(0,-1).map(p=>atriumPoint(p.x,p.z));

export function buildAtrium(floor:'G'|'1',b:RoofBuilder){
 const {box,wall,surface,put,palette:m}=b;
 const structure=new THREE.MeshStandardMaterial({color:0xeeeae1,roughness:.75,side:THREE.DoubleSide});b.materials.push(structure);
 const wood=new THREE.MeshStandardMaterial({color:0xa7733a,roughness:.65});b.materials.push(wood);
 const woodBacking=new THREE.MeshStandardMaterial({color:0x543d2c,roughness:.8});b.materials.push(woodBacking);
 const coreHeight=floor==='G'?6.5:4.15;
 surface(ATRIUM_CORE,coreHeight,m.oak);
 ATRIUM_CORE.forEach((a,i)=>{
  const end=ATRIUM_CORE[(i+1)%ATRIUM_CORE.length],length=Math.hypot(end[0]-a[0],end[1]-a[1]);
  wall(a,end,coreHeight,woodBacking);
  const count=Math.max(1,Math.round(length/.075)),angle=-Math.atan2(end[1]-a[1],end[0]-a[0]);
  for(let j=0;j<count;j++){const t=(j+.5)/count;box(a[0]+(end[0]-a[0])*t+(end[1]-a[1])/length*.085,coreHeight/2,a[1]+(end[1]-a[1])*t-(end[0]-a[0])/length*.085,.04,coreHeight,.06,wood,angle);}
 });
 // Two metal elevator doors on the flat face of the enclosure.
 for(const z of [-.85,.85]){
  const p=atriumPoint(2.045,z);box(p[0],1.22,p[1],.055,2.44,1.52,m.white);
  box(p[0]+.035,1.14,p[1],.03,2.28,1.35,m.metal);box(p[0]+.054,1.14,p[1],.012,2.28,.012,m.black);
 }
 const call=atriumPoint(2.12,0);box(call[0],1.15,call[1],.025,.22,.11,m.black);
 // Perforated metal guards: a single mipmapped material for every panel.
 const pixels=new Uint8Array(64*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){
  const i=(y*64+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=245;
  pixels[i+3]=Math.hypot(x-31.5,y-31.5)<11?0:255;
 }
 const map=new THREE.DataTexture(pixels,64,64);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.generateMipmaps=true;map.minFilter=THREE.LinearMipmapLinearFilter;map.magFilter=THREE.LinearFilter;map.anisotropy=4;map.needsUpdate=true;b.textures.push(map);
 const perforated=new THREE.MeshStandardMaterial({map,alphaTest:.4,side:THREE.DoubleSide,roughness:.7});b.materials.push(perforated);
 const panel=(a:Position,end:Position,low:number,high:number,mat:THREE.Material,repeat=false)=>{
  const length=Math.hypot(end[0]-a[0],end[2]-a[2]),h=high-low;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([
   a[0],a[1]+low,a[2],end[0],end[1]+low,end[2],end[0],end[1]+high,end[2],a[0],a[1]+high,a[2],
  ],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,repeat?length/.035:1,0,repeat?length/.035:1,repeat?h/.035:1,0,repeat?h/.035:1],2));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();put(g,mat);
 };
 const rail=(a:Position,end:Position,collision=true)=>{
  panel(a,end,-.22,.12,structure);panel(a,end,.12,1.05,perforated,true);
  const start=new THREE.Vector3(a[0],a[1]+1.065,a[2]),finish=new THREE.Vector3(end[0],end[1]+1.065,end[2]);
  const g=new THREE.CylinderGeometry(.027,.027,start.distanceTo(finish),10);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),finish.clone().sub(start).normalize()));g.translate(...start.add(finish).multiplyScalar(.5).toArray());put(g,m.white);
  for(const p of [a,end])box(p[0],p[1]+.57,p[2],.03,1,.03,m.white);
  if(collision)b.barriers.push({a:[a[0],a[2]],b:[end[0],end[2]],minY:Math.min(a[1],end[1])-.22,maxY:Math.max(a[1],end[1])+1.08});
 };
 if(floor==='G'){
  // Stop the drawn bridge at the slab edge; its walking segment continues
  // onto the floor, avoiding two coplanar white surfaces at the connection.
  const edge=atriumPoint(-4.7,-3.4);
  const flights=[...ATRIUM_FLIGHTS,{...ATRIUM_LANDING,to:[edge[0],ATRIUM_LANDING.to[1],edge[1]] as Position}],path=[flights[0].from,...flights.map(f=>f.to)],half=flights[0].width/2;
  // Miter adjacent edges so the curved landing and its guards have no cracks.
  const sides=path.map((p,i)=>{
   const prev=path[Math.max(0,i-1)],next=path[Math.min(path.length-1,i+1)];
   const direction=(a:Position,end:Position):Point=>{const l=Math.hypot(end[0]-a[0],end[2]-a[2]);return [(end[0]-a[0])/l,(end[2]-a[2])/l];};
   const before=direction(i?prev:p,i?p:next),after=direction(i===path.length-1?prev:p,i===path.length-1?p:next);
   const nx=-before[1]-after[1],nz=before[0]+after[0],l=Math.hypot(nx,nz),ux=nx/l,uz=nz/l;
   const extent=half/Math.max(.5,ux*(-after[1])+uz*after[0]);
   return [-1,1].map(sign=>[p[0]+ux*extent*sign,p[1],p[2]+uz*extent*sign] as Position);
  });
  flights.forEach((flight,i)=>{
   const {from:a,to:end,width}=flight,length=Math.hypot(end[0]-a[0],end[2]-a[2]),rise=end[1]-a[1],angle=-Math.atan2(end[2]-a[2],end[0]-a[0]);
   if(rise===0){
    const poly:Polygon=[[sides[i][0][0],sides[i][0][2]],[sides[i+1][0][0],sides[i+1][0][2]],[sides[i+1][1][0],sides[i+1][1][2]],[sides[i][1][0],sides[i][1][2]]];
    surface(poly,a[1],structure);surface(poly,a[1]-.22,structure);
   }else{
    const steps=Math.ceil(rise/.175);
    for(let j=0;j<steps;j++){
     const t=(j+.5)/steps;box(a[0]+(end[0]-a[0])*t,a[1]+rise*(j+1)/steps-.11,a[2]+(end[2]-a[2])*t,length/steps+.012,.22,width,m.white,angle);
    }
    const corners=[sides[i][0],sides[i+1][0],sides[i+1][1],sides[i][1]];
    const underside=new THREE.BufferGeometry();underside.setAttribute('position',new THREE.Float32BufferAttribute(corners.flatMap(p=>[p[0],p[1]-.22,p[2]]),3));underside.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,1],2));underside.setIndex([0,1,2,0,2,3]);underside.computeVertexNormals();put(underside,structure);
   }
   // Subdivide sloping guards for collisions that permit walking underneath
   // the high end of a flight while blocking its low soffit.
   const count=Math.max(1,Math.ceil(length/.55));
   for(let side=0;side<2;side++){
    const p=sides[i][side],q=sides[i+1][side];
    for(let j=0;j<count;j++){
     const at=(t:number):Position=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t];
     rail(at(j/count),at((j+1)/count));
    }
   }
  });
 }else{
  // Guard the mezzanine opening, leaving the stair's upper landing open.
  ATRIUM_VOID.forEach((a,i)=>{
   const end=ATRIUM_VOID[(i+1)%ATRIUM_VOID.length];
   const pos=(p:Point):Position=>[p[0],0,p[1]];
   if(i===ATRIUM_VOID.length-1){
    rail(pos(a),pos(atriumPoint(-4.7,-2.46)));rail(pos(atriumPoint(-4.7,-4.34)),pos(end));
   }else rail(pos(a),pos(end));
  });
 }
 // A horizontal reveal separates the enclosure's floor-height panels.
 const revealY=floor==='G'?3.22:2.05;
 ATRIUM_CORE.forEach((a,i)=>wall(a,ATRIUM_CORE[(i+1)%ATRIUM_CORE.length],.022,m.black,false,revealY,.08));
}

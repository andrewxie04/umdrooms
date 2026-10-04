import * as THREE from 'three';
import { ANTONOV_SHELL_EDGES } from './antonov-shell-layout';
import { antonovHeight } from './auditorium';
import { ANTONOV_FOOTPRINT, pointInPolygon, type Point } from './layout';
import type { RoofBuilder } from './roof';

/** Original room-face runs; section, masonry thickness and photographed window
 * sill/head are provisional. The continuous opaque plan bands do not specify
 * the vertical glazing aperture. Source gaps do not imply a connected route.
 */
export function buildAntonovShell(b:RoofBuilder,timber:THREE.Material,brick:THREE.Material,glazing:THREE.Material){
 let distance=0;
 for(const edge of ANTONOV_SHELL_EDGES){
  const {a,b:end,runId,join}=edge,length=Math.hypot(end[0]-a[0],end[1]-a[1]);
  const textureStart=distance;distance+=length;
  if(length<.001)continue;
  const middle:Point=[(a[0]+end[0])/2,(a[1]+end[1])/2];
  // Keep the upper enclosure above the lower room/public Ground corridor.
  // Its 3.3 m interface remains an estimated section, not a plan elevation.
  const base=Math.max(0,Math.min(3.3,(antonovHeight(middle)??5.5)-.19)),top=10.5;
  let nx=-(end[1]-a[1])/length,nz=(end[0]-a[0])/length;
  if(pointInPolygon([middle[0]+nx*.02,middle[1]+nz*.02],ANTONOV_FOOTPRINT)){nx=-nx;nz=-nz;}
  const solid=(low:number,high:number)=>{
   if(high<=low)return;
   b.wall(a,end,high-low,timber,true,low,.14);
   const plane=new THREE.PlaneGeometry(length,high-low),uv=plane.getAttribute('uv');
   for(let i=0;i<uv.count;i++)uv.setXY(i,(textureStart+uv.getX(i)*length)/.48,(low+uv.getY(i)*(high-low))/.15);
   plane.rotateY(-Math.atan2(end[1]-a[1],end[0]-a[0]));plane.translate(middle[0]+nx*.086,(low+high)/2,middle[1]+nz*.086);b.put(plane,brick);
  };
  if(join&&runId==='northeast-outer-jamb'){
   solid(Math.max(base,5.5)+2.5,top);
   for(const p of [a,end])b.box(p[0],6.75,p[1],.045,2.5,.045,b.palette.metal);
  }else if(['east-middle-room-band','east-south-room-band','northeast-to-east-return'].includes(runId)){
   const sill=6.65,head=9.05;
   solid(base,sill);solid(head,top);
   b.wall(a,end,head-sill,glazing,true,sill,.035);
   for(const y of [sill,head])b.wall(a,end,.05,b.palette.metal,false,y,.08);
   // Source fragments retain the curved face. Frame spacing/height are estimates.
   if(length>.8)for(const p of [a,end])b.box(p[0],(sill+head)/2,p[1],.05,head-sill,.05,b.palette.metal);
  }else solid(base,top);
 }
}

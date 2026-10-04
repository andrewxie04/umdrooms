import * as THREE from 'three';
import { CANOPY_APRON, CANOPY_DOOR_PAIRS, CANOPY_GLAZING, CANOPY_JAMB_SOLIDS, CANOPY_LEAVES, CANOPY_OUTWARD } from './lobby-canopy-layout';
import { buildOpenGlassLeaves } from './lobby-entrance';
import type { RoofBuilder } from './roof';
import { AMPH_DROP } from './layout';

/** Native plan positions; vertical dimensions, frame sections and hardware
 * remain estimates. Leaves stay open in their original drawn pose. */
export function buildCanopyEntrance(b:RoofBuilder,paving:THREE.Material){
 const {wall,box,palette:m}=b,ceiling=6.3,base=-AMPH_DROP,height=ceiling-base,doorHeight=2.4;
 for(const solid of CANOPY_JAMB_SOLIDS){
  const shape=new THREE.Shape(solid.polygon.map(([x,z])=>new THREE.Vector2(x,-z)));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});geometry.rotateX(-Math.PI/2);geometry.translate(0,base,0);b.put(geometry,m.metal);
  solid.polygon.forEach((a,i)=>b.barriers.push({a,b:solid.polygon[(i+1)%solid.polygon.length],minY:base,maxY:ceiling}));
 }
 for(const pane of CANOPY_GLAZING){
  wall(pane.a,pane.b,height,m.glass,true,base,.035);
  for(const y of [base+.08,3.4,ceiling-.05])wall(pane.a,pane.b,.065,m.metal,false,y,.065);
  for(const p of [pane.a,pane.b])box(p[0],base+height/2,p[1],.05,height,.065,m.metal);
 }
 for(const pair of CANOPY_DOOR_PAIRS){
  const [a,end]=pair.leaves.map(l=>l.hinge);
  wall(a,end,height-doorHeight,m.glass,true,base+doorHeight,.035);
  for(const y of [base+doorHeight,3.4,ceiling-.05])wall(a,end,.065,m.metal,false,y,.065);
 }
 buildOpenGlassLeaves(b,CANOPY_LEAVES,doorHeight,base);
 // UMD's canopy photo shows brick paving; use the existing masonry finish.
 // The continuous paving extent, level threshold and joint scale are estimates.
 const shape=new THREE.Shape(CANOPY_APRON.map(([x,z])=>new THREE.Vector2(x,-z)));
 const pavement=new THREE.ShapeGeometry(shape);pavement.rotateX(-Math.PI/2);pavement.translate(0,base-.012,0);
 const vertices=pavement.getAttribute('position'),uv=pavement.getAttribute('uv'),[nx,nz]=CANOPY_OUTWARD;
 // Align the running bond to the entrance. Estimated 220 × 110 mm pavers;
 // the texture contains two units on each axis, rather than meter-wide bricks.
 for(let i=0;i<uv.count;i++){
  const x=vertices.getX(i),z=vertices.getZ(i);
  uv.setXY(i,(-nz*x+nx*z)/.44,(nx*x+nz*z)/.22);
 }
 b.put(pavement,paving);
}

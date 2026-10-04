import * as THREE from 'three';
import { buildOpenGlassLeaves } from './lobby-entrance';
import { SOUTH_APRON, SOUTH_DOOR_PAIRS, SOUTH_GLAZING, SOUTH_LEAVES, SOUTH_OUTWARD, SOUTH_SOLIDS, SOUTH_STAIR_LEAVES } from './lobby-south-layout';
import type { RoofBuilder } from './roof';

/** Original registered contours/leaf poses; heights, finishes, hardware and
 * landing extent remain estimated. The adjoining stair stack is provisional. */
export function buildSouthEntrance(b:RoofBuilder,paving:THREE.Material){
 const {wall,box,palette:m}=b,height=6.3,doorHeight=2.4;
 for(const solid of SOUTH_SOLIDS){
  const shape=new THREE.Shape(solid.outer.map(([x,z])=>new THREE.Vector2(x,-z)));
  for(const hole of solid.holes)shape.holes.push(new THREE.Path(hole.map(([x,z])=>new THREE.Vector2(x,-z))));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});geometry.rotateX(-Math.PI/2);b.put(geometry,m.white);
  for(const ring of [solid.outer,...solid.holes])ring.forEach((a,i)=>b.barriers.push({a,b:ring[(i+1)%ring.length],minY:0,maxY:height}));
 }
 for(const pane of SOUTH_GLAZING){
  wall(pane.a,pane.b,height,m.glass,true,0,.035);
  for(const y of [.08,3.4,height-.05])wall(pane.a,pane.b,.065,m.metal,false,y,.065);
  const angle=-Math.atan2(pane.b[1]-pane.a[1],pane.b[0]-pane.a[0]);
  for(const p of [pane.a,pane.b])box(p[0],height/2,p[1],.05,height,.065,m.metal,angle);
 }
 for(const pair of SOUTH_DOOR_PAIRS){
  const a=pair.leaves[0].hinge,end=pair.leaves[1].hinge;
  wall(a,end,height-doorHeight,m.glass,true,doorHeight,.035);
  for(const y of [doorHeight,3.4,height-.05])wall(a,end,.065,m.metal,false,y,.065);
  for(const p of [a,end])box(p[0],height/2,p[1],.055,height,.055,m.metal);
 }
 for(const leaf of SOUTH_STAIR_LEAVES){
  wall(leaf.hinge,leaf.closedTip,height-doorHeight,m.white,true,doorHeight,.1);
  wall(leaf.hinge,leaf.closedTip,.07,m.metal,false,doorHeight,.075);
 }
 buildOpenGlassLeaves(b,[...SOUTH_LEAVES,...SOUTH_STAIR_LEAVES],doorHeight);
 // Existing brick texture, projected in the facade frame at the same estimated
 // 220 x 110 mm running-bond scale as the canopy landing. No new texture/draw loop.
 const [a,end]=SOUTH_APRON,length=Math.hypot(end[0]-a[0],end[1]-a[1]),u=[(end[0]-a[0])/length,(end[1]-a[1])/length];
 const geometry=new THREE.ShapeGeometry(new THREE.Shape(SOUTH_APRON.map(([x,z])=>new THREE.Vector2(x,-z))));
 geometry.rotateX(-Math.PI/2);geometry.translate(0,-.012,0);
 const position=geometry.getAttribute('position'),uv=geometry.getAttribute('uv');
 for(let i=0;i<position.count;i++){
  const dx=position.getX(i)-a[0],dz=position.getZ(i)-a[1];
  uv.setXY(i,(dx*u[0]+dz*u[1])/.44,(dx*SOUTH_OUTWARD[0]+dz*SOUTH_OUTWARD[1])/.22);
 }
 b.put(geometry,paving);
}

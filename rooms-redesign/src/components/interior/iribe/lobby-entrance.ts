import * as THREE from 'three';
import { COURTYARD_APRON, COURTYARD_DOOR_ROWS, COURTYARD_GLAZING, COURTYARD_LEAVES, COURTYARD_RIGHT_CORNER, COURTYARD_SOLIDS } from './lobby-entrance-layout';
import type { RoofBuilder } from './roof';
import type { Point } from './layout';

/** Source leaves are held open for the walkthrough, as in the drawn swing
 * pose. Rendering and collision share the original endpoints. Heights, frame
 * profiles, hardware, finishes and apron extent are estimates. */
export function buildCourtyardEntrance(b:RoofBuilder){
 const {wall,box,surface,palette:m}=b;
 const height=6.3,doorHeight=2.4;
 const cladding=new THREE.MeshStandardMaterial({color:0x8f8370,roughness:.5,metalness:.35});
 cladding.name='Estimated courtyard vestibule cladding';b.materials.push(cladding);
 for(const solid of COURTYARD_SOLIDS){
  const shape=new THREE.Shape(solid.polygon.map(([x,z])=>new THREE.Vector2(x,-z)));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});
  geometry.rotateX(-Math.PI/2);b.put(geometry,cladding);
  solid.polygon.forEach((a,i)=>b.barriers.push({a,b:solid.polygon[(i+1)%solid.polygon.length],minY:0,maxY:height}));
 }
 wall(COURTYARD_RIGHT_CORNER.a,COURTYARD_RIGHT_CORNER.b,height,m.metal,true,0,.055);
 for(const side of ['right','left']){
  const panes=COURTYARD_GLAZING.filter(p=>p.side===side),a=panes[0].a,end=panes.at(-1)!.b;
  wall(a,end,height,m.glass,true,0,.035);
  for(const y of [.08,3.4,height-.05])wall(a,end,.065,m.metal,false,y,.065);
  for(const pane of panes){
   const angle=-Math.atan2(pane.b[1]-pane.a[1],pane.b[0]-pane.a[0]);
   for(const p of [pane.a,pane.b])box(p[0],height/2,p[1],.05,height,.065,m.metal,angle);
  }
 }
 for(const row of COURTYARD_DOOR_ROWS){
  // Source hinge spacing supplies two door pairs and their central fixed pane.
  const [first,second]=row.pairs;
  wall(first[1],second[0],doorHeight,m.glass,true,0,.035);
  wall(row.a,row.b,height-doorHeight,m.glass,true,doorHeight,.035);
  for(const y of [doorHeight,3.4])wall(row.a,row.b,.065,m.metal,false,y,.075);
  for(const leaf of row.leaves)box(leaf.hinge[0],height/2,leaf.hinge[1],.065,height,.065,m.metal);
 }
 buildOpenGlassLeaves(b,COURTYARD_LEAVES,doorHeight);
 const pixels=new Uint8Array(128*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<128;x++){
  const joint=y%32<2||(x+Math.floor(y/32)*32)%64<2,i=(y*128+x)*4;
  const noise=Math.sin(x*13+y*23)*3,value=joint?132:174+noise;
  pixels.set([value+5,value+1,value-5,255],i);
 }
 const map=new THREE.DataTexture(pixels,128,64);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(2.5,3);map.generateMipmaps=true;map.minFilter=THREE.LinearMipmapLinearFilter;map.magFilter=THREE.LinearFilter;map.anisotropy=4;map.needsUpdate=true;b.textures.push(map);
 const paving=new THREE.MeshStandardMaterial({map,roughness:.86});paving.name='Estimated courtyard entry paving';b.materials.push(paving);
 surface(COURTYARD_APRON,-.012,paving);
}

/** Shared static leaf geometry uses the native hinge/open endpoints. */
export function buildOpenGlassLeaves(b:RoofBuilder,leaves:readonly {hinge:Point;openTip:Point}[],doorHeight:number,base=0){
 const {wall,box,palette:m}=b;
 for(const leaf of leaves){
  const a=leaf.hinge,end=leaf.openTip,length=Math.hypot(end[0]-a[0],end[1]-a[1]);
  wall(a,end,doorHeight,m.glass,true,base,.035);
  const angle=-Math.atan2(end[1]-a[1],end[0]-a[0]);
  for(const y of [.045,doorHeight-.045])wall(a,end,.075,m.metal,false,base+y,.045);
  for(const p of [a,end])box(p[0],base+doorHeight/2,p[1],.047,doorHeight,.047,m.metal,angle);
  const at=(t:number):Point=>[a[0]+(end[0]-a[0])*t,a[1]+(end[1]-a[1])*t];
  // Simple push bars; the manufacturer and exact hardware are unknown.
  const p=at(.16),q=at(.84),nx=-(end[1]-a[1])/length,nz=(end[0]-a[0])/length;
  for(const sign of [-1,1])wall([p[0]+nx*.045*sign,p[1]+nz*.045*sign],[q[0]+nx*.045*sign,q[1]+nz*.045*sign],.022,m.metal,false,base+1.03,.026);
 }
}

import { CANOPY_SHELL_CHAIN, canopyShellEdge } from './lobby-canopy-layout';
import { AMPH_FACADE } from './layout';
import * as THREE from 'three';
import { AMPH_DEPTH, AMPH_DROP, AMPH_LOWER, AMPH_NORTH_RUN, AMPH_SOUTH_AISLE, AMPH_WIDTH, amphFacade, amphLocal, amphPoint, pointInPolygon, type Point, type Polygon } from './layout';
import type { RoofBuilder } from './roof';

export const AMPH_TIERS=5, AMPH_STEPS=10;
export const AMPH_NORTH_AISLE=7.25;
/** Negative elevations belong to the same ground floor, below the main lobby. */
export function amphitheaterHeight(p:Point):number|null {
 if(!pointInPolygon(p,AMPH_LOWER))return null;
 const [u,v]=amphLocal(p);
 if(u<AMPH_WIDTH){
  const n=v>=AMPH_DEPTH?AMPH_STEPS:AMPH_TIERS;
  return -AMPH_DROP*Math.min(n,Math.floor(u/AMPH_WIDTH*n)+1)/n;
 }
 if(u>=AMPH_NORTH_AISLE&&v<AMPH_NORTH_RUN)return -AMPH_DROP*Math.min(AMPH_STEPS,Math.floor(v/AMPH_NORTH_RUN*AMPH_STEPS)+1)/AMPH_STEPS;
 return -AMPH_DROP;
}
export function buildAmphitheater(b:RoofBuilder){
 const {wall,surface,box}=b;
 const mat=(color:number,roughness=.7)=>{const m=new THREE.MeshStandardMaterial({color,roughness});b.materials.push(m);return m;};
 const wood=mat(0x9a6033,.52),brick=mat(0xffffff,.88),paving=mat(0xffffff,.82),metal=mat(0x777f80,.42),warm=new THREE.MeshBasicMaterial({color:0xffd9a4});b.materials.push(warm);
 brick.name='Amphitheater enclosure brick';
 const brickPixels=new Uint8Array(128*64*4);
 for(let z=0;z<64;z++)for(let x=0;x<128;x++){
  const row=Math.floor(z/32),joint=z%32<2||(x+row*32)%64<2,i=(z*128+x)*4,n=Math.sin(x*13+z*23)*8;
  brickPixels.set(joint?[166,155,135,255]:[143+n,78+n,48+n,255],i);
 }
 const brickMap=new THREE.DataTexture(brickPixels,128,64);brickMap.colorSpace=THREE.SRGBColorSpace;brickMap.wrapS=brickMap.wrapT=THREE.RepeatWrapping;brickMap.generateMipmaps=true;brickMap.minFilter=THREE.LinearMipmapLinearFilter;brickMap.magFilter=THREE.LinearFilter;brickMap.anisotropy=4;brickMap.needsUpdate=true;b.textures.push(brickMap);brick.map=brickMap;
 const paverMap=brickMap.clone();paverMap.repeat.set(2.2,2.2);paverMap.needsUpdate=true;b.textures.push(paverMap);paving.map=paverMap;paving.color.setHex(0xbcae9c);
 const grain=new Uint8Array(256*64*4);
 for(let z=0;z<64;z++)for(let x=0;x<256;x++){const i=(z*256+x)*4,n=Math.sin(z*.9+Math.sin(x*.03))*.1+Math.sin(z*3+x*.015)*.06,j=z%16===0?.62:1;grain.set([180*(1+n)*j,120*(1+n)*j,73*(1+n)*j,255],i);}
 const woodMap=new THREE.DataTexture(grain,256,64);woodMap.colorSpace=THREE.SRGBColorSpace;woodMap.wrapS=woodMap.wrapT=THREE.RepeatWrapping;woodMap.repeat.set(.45,3);woodMap.generateMipmaps=true;woodMap.minFilter=THREE.LinearMipmapLinearFilter;woodMap.magFilter=THREE.LinearFilter;woodMap.anisotropy=4;woodMap.needsUpdate=true;b.textures.push(woodMap);wood.map=woodMap;wood.color.setHex(0xffffff);
 const patch=(u0:number,v0:number,u1:number,v1:number):Polygon=>[amphPoint(u0,v0),amphPoint(u1,v0),amphPoint(u1,v1),amphPoint(u0,v1)];
 // Partition the lower pavement around the timber areas: the last treads sit
 // at this same elevation and must not overlap a second coplanar surface.
 surface([amphPoint(AMPH_WIDTH,0),amphPoint(AMPH_NORTH_AISLE,0),amphPoint(AMPH_NORTH_AISLE,AMPH_NORTH_RUN),amphPoint(amphFacade(AMPH_NORTH_RUN),AMPH_NORTH_RUN),...AMPH_FACADE.filter(p=>amphLocal(p)[1]>AMPH_NORTH_RUN),amphPoint(AMPH_WIDTH,AMPH_DEPTH+AMPH_SOUTH_AISLE)],-AMPH_DROP,paving);
 // Five long seat terraces. The finer southern stair shares exactly the same
 // height function, so the camera never passes through a tread or walks on air.
 for(const [count,v0,v1] of [[AMPH_TIERS,0,AMPH_DEPTH],[AMPH_STEPS,AMPH_DEPTH,AMPH_DEPTH+AMPH_SOUTH_AISLE]])for(let i=0;i<count;i++){
  const u0=AMPH_WIDTH*i/count,u1=AMPH_WIDTH*(i+1)/count,top=-AMPH_DROP*(i+1)/count;
  surface(patch(u0,v0,u1,v1),top,wood);
  wall(amphPoint(u0,v0),amphPoint(u0,v1),AMPH_DROP/count,wood,true,top,.025);
  wall(amphPoint(u0+.016,v0+.035),amphPoint(u0+.016,v1-.035),.023,warm,false,top+.025,.013);
 }
 // The narrow return by the curtain wall connects the lower court to the lobby.
 for(let i=0;i<AMPH_STEPS;i++){
  const v0=AMPH_NORTH_RUN*i/AMPH_STEPS,v1=AMPH_NORTH_RUN*(i+1)/AMPH_STEPS,top=-AMPH_DROP*(i+1)/AMPH_STEPS;
  surface([amphPoint(AMPH_NORTH_AISLE,v0),amphPoint(amphFacade(v0),v0),amphPoint(amphFacade(v1),v1),amphPoint(AMPH_NORTH_AISLE,v1)],top,wood);
  wall(amphPoint(AMPH_NORTH_AISLE,v0),amphPoint(amphFacade(v0),v0),AMPH_DROP/AMPH_STEPS,wood,true,top,.025);
  wall(amphPoint(AMPH_NORTH_AISLE,v0+.018),amphPoint(amphFacade(v0)-.03,v0+.018),.02,warm,false,top+.025,.012);
  // Exposed stair cheek prevents entering a riser sideways below its tread.
  wall(amphPoint(AMPH_NORTH_AISLE,v0),amphPoint(AMPH_NORTH_AISLE,v1),top+AMPH_DROP,wood,true,-AMPH_DROP,.025);
 }
 // The north stair builder supplies the source masonry enclosure, with brick
 // on the lobby and seating-bank faces. A second photo-fitted wall here would
 // overlap it, cap its doorway and rise past the Ground ceiling.
 // The shared Ground structural trace supplies the two columns in the
 // sunken court. The old photo-fitted post would duplicate a source column.
 // Close the exposed cut along the south landing and north court. Collision
 // heights leave the steps accessible but prevent walking below the lobby slab.
 wall(amphPoint(0,AMPH_DEPTH+AMPH_SOUTH_AISLE),amphPoint(amphFacade(AMPH_DEPTH+AMPH_SOUTH_AISLE),AMPH_DEPTH+AMPH_SOUTH_AISLE),AMPH_DROP,paving,true,-AMPH_DROP,.025);
 wall(amphPoint(AMPH_WIDTH,0),amphPoint(AMPH_NORTH_AISLE,0),AMPH_DROP,brick,true,-AMPH_DROP,.025);
 // Continue the glazing below lobby level along the corrected envelope.
 // The canopy builder supplies its native adjoining panes and open doors.
 const canopyLow=Math.min(...CANOPY_SHELL_CHAIN.map(p=>amphLocal(p)[1])),canopyHigh=Math.max(...CANOPY_SHELL_CHAIN.map(p=>amphLocal(p)[1]));
 for(let i=0;i<AMPH_FACADE.length-1;i++){
  const a=AMPH_FACADE[i],end=AMPH_FACADE[i+1],v=(amphLocal(a)[1]+amphLocal(end)[1])/2;
  if(canopyShellEdge(a,end)||v>=canopyLow&&v<=canopyHigh)continue;
  wall(a,end,AMPH_DROP,b.palette.glass,true,-AMPH_DROP,.025);
  const length=Math.hypot(end[0]-a[0],end[1]-a[1]),count=Math.ceil(length/1.5);
  for(let j=0;j<=count;j++)box(a[0]+(end[0]-a[0])*j/count,-AMPH_DROP/2,a[1]+(end[1]-a[1])*j/count,.07,AMPH_DROP,.07,metal);
 }

}

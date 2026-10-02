import * as THREE from 'three';
import { AMPH_DEPTH, AMPH_DROP, AMPH_LOWER, AMPH_NORTH_RUN, AMPH_SOUTH_AISLE, AMPH_U, AMPH_V, AMPH_WIDTH, amphFacade, amphLocal, amphPoint, groundPlan, pointInPolygon, type Point, type Polygon } from './layout';
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
 const {wall,surface,box,cylinder,put}=b;
 const mat=(color:number,roughness=.7)=>{const m=new THREE.MeshStandardMaterial({color,roughness});b.materials.push(m);return m;};
 const wood=mat(0x9a6033,.52),brick=mat(0xffffff,.88),paving=mat(0xffffff,.82),metal=mat(0x777f80,.42),warm=new THREE.MeshBasicMaterial({color:0xffd9a4});b.materials.push(warm);
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
 surface([[AMPH_WIDTH,0],[AMPH_NORTH_AISLE,0],[AMPH_NORTH_AISLE,AMPH_NORTH_RUN],[amphFacade(AMPH_NORTH_RUN),AMPH_NORTH_RUN],[amphFacade(AMPH_DEPTH+AMPH_SOUTH_AISLE),AMPH_DEPTH+AMPH_SOUTH_AISLE],[AMPH_WIDTH,AMPH_DEPTH+AMPH_SOUTH_AISLE]].map(([u,v])=>amphPoint(u,v)),-AMPH_DROP,paving);
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
 // Brick facing of the enclosure at the end of the seating bank, as photographed.
 const wallA=amphPoint(-.65,-.045),wallB=amphPoint(6.85,-.045);
 const height=8.1,length=Math.hypot(wallB[0]-wallA[0],wallB[1]-wallA[1]);
 const face=new THREE.PlaneGeometry(length,height);const uv=face.getAttribute('uv');
 for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*length/.46,uv.getY(i)*height/.15);
 face.rotateY(Math.atan2(AMPH_V[0],AMPH_V[1]));face.translate((wallA[0]+wallB[0])/2,2.25,(wallA[1]+wallB[1])/2);brick.side=THREE.DoubleSide;
 wall(wallA,wallB,height,metal,true,-AMPH_DROP,.12);
 // Set the textured face slightly in front of its solid backing.
 face.translate(AMPH_V[0]*.065,0,AMPH_V[1]*.065);put(face,brick);
 const column=amphPoint(6.4,1.0);cylinder(column[0],2.25,column[1],.32,8.1,b.palette.white);
 for(let i=0;i<20;i++){const a=i*Math.PI/10,c=(i+1)*Math.PI/10;b.barriers.push({a:[column[0]+Math.cos(a)*.32,column[1]+Math.sin(a)*.32],b:[column[0]+Math.cos(c)*.32,column[1]+Math.sin(c)*.32],minY:-AMPH_DROP,maxY:6.3});}
 // Close the exposed cut along the south landing and north court. Collision
 // heights leave the steps accessible but prevent walking below the lobby slab.
 wall(amphPoint(0,AMPH_DEPTH+AMPH_SOUTH_AISLE),amphPoint(amphFacade(AMPH_DEPTH+AMPH_SOUTH_AISLE),AMPH_DEPTH+AMPH_SOUTH_AISLE),AMPH_DROP,paving,true,-AMPH_DROP,.025);
 wall(amphPoint(AMPH_WIDTH,0),amphPoint(AMPH_NORTH_AISLE,0),AMPH_DROP,brick,true,-AMPH_DROP,.025);
 // Lower panels continue the existing curtain wall below the main lobby datum.
 wall(amphPoint(amphFacade(0),0),amphPoint(amphFacade(AMPH_DEPTH+AMPH_SOUTH_AISLE),AMPH_DEPTH+AMPH_SOUTH_AISLE),AMPH_DROP,b.palette.glass,true,-AMPH_DROP,.025);
 const angle=-Math.atan2(AMPH_U[1],AMPH_U[0]);
 const facadeA=groundPlan(1375,969),facadeB=groundPlan(1625,160),panes=Math.ceil(Math.hypot(facadeB[0]-facadeA[0],facadeB[1]-facadeA[1])/1.5);
 for(let i=0;i<=panes;i++){const p:Point=[facadeA[0]+(facadeB[0]-facadeA[0])*i/panes,facadeA[1]+(facadeB[1]-facadeA[1])*i/panes],v=amphLocal(p)[1];if(v>=0&&v<=AMPH_DEPTH+AMPH_SOUTH_AISLE)box(p[0],-AMPH_DROP/2,p[1],.07,AMPH_DROP,.07,metal,angle);}
}

import { WEST_STAIR } from './west-stair-layout';
import { buildWestStair } from './west-stairs';
import { buildSeminarAV } from './seminar-av';
import { buildHatchery } from './hatchery';
import { createConferenceAVBuilder } from './conference-av';
import { structuralColumns } from './structure';
import { buildSupportStorage } from './support-rooms';
import { buildFirstOffice, FIRST_OFFICE_TYPES } from './first-offices';
import { buildSandbox } from './sandbox';
import { SANDBOX_STUDIOS } from './layout';
import { buildCommunicatingStair } from './communicating-stairs';
import { communicatingStairForFloor } from './communicating-layout';
import { buildFamilyGarden } from './family-garden';
import { FAMILY_GARDEN_DOOR } from './layout';
import * as THREE from 'three';
import { buildRoof } from './roof';
import { buildCafe } from './cafe';
import { buildLobbySeating, buildLobbyCeiling } from './lobby';
import { buildAtrium } from './atrium';
import { buildSmallArtifacts, buildDroneLab } from './labs';
import { buildRoboticsLab } from './robotics';
import { buildRestroom } from './restrooms';
import { buildAmphitheater } from './amphitheater';
import { AMPH_LOWER } from './layout';
import { GANNON_AISLES, GANNON_PLAN, AUD_AISLES, AUD_DEPTH, AUD_WIDTH, AUD_SCALE, ROW_START, ROW_PITCH, ROW_RISE, auditoriumSeats, auditoriumStrip, auditoriumSidePoint } from './auditorium';
import { clearInside, meetingTable, meetingSeats, roomFrame, teachingTables } from './furniture';
import { ENCLOSED_FLIGHTS, STAIR_CENTER, STAIR_HOLE } from './circulation';
import { FLOOR_HEIGHT } from './layout';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { footprintForFloor, fourthPlan, westFourthPlan, roomTitle, ROOF_GALLERY, ANTONOV_FOOTPRINT, ATRIUM_VOID, ROOMS, plan, groundPlan, type FloorId, type Point, type Polygon, type InteriorRoom, distanceToSegment, pointInPolygon } from './layout';

export interface Barrier {a:Point;b:Point;minY?:number;maxY?:number;}
export interface InteriorModel { group:THREE.Group; barriers:Barrier[]; footprint:Polygon; setDetailsVisible(visible:boolean):void; dispose():void; }

/** Keep the building shell visible from terraces/windows; cull distant furnishings.
 * Both sets share materials and retain per-material geometry batches. */
export function buildInteriorFloor(floor:FloorId):InteriorModel {
 const group=new THREE.Group(); const barriers:Barrier[]=[];
 const shellBatches=new Map<THREE.Material,THREE.BufferGeometry[]>();
 const detailBatches=new Map<THREE.Material,THREE.BufferGeometry[]>();
 let batches=shellBatches;
 const textures:THREE.Texture[]=[];
 const mat=(color:number,roughness=.75)=>new THREE.MeshStandardMaterial({color,roughness});
 const white=mat(0xeeeae1), concrete=mat(0xaaa99f), black=mat(0x20262a), oak=mat(0x946333), metal=mat(0x858f92,.35), blue=mat(0x26869b), yellow=mat(0xe1b924), lime=mat(0x86a544), red=mat(0xb93731);
 black.side=THREE.DoubleSide;
 const woodPixels=new Uint8Array(256*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<256;x++){
  const i=(y*256+x)*4,grain=Math.sin(y*1.8+Math.sin(x*.035)*.7)*5+Math.sin(y*.6+x*.004)*7;
  woodPixels[i]=180+grain;woodPixels[i+1]=137+grain;woodPixels[i+2]=88+grain;woodPixels[i+3]=255;
 }
 const woodMap=new THREE.DataTexture(woodPixels,256,64);woodMap.colorSpace=THREE.SRGBColorSpace;woodMap.needsUpdate=true;woodMap.magFilter=THREE.LinearFilter;textures.push(woodMap);oak.map=woodMap;oak.color.setHex(0xffffff);oak.roughness=.56;
 const glass=new THREE.MeshStandardMaterial({color:0xb9dbe0,transparent:true,opacity:.18,roughness:.2,depthWrite:false,side:THREE.DoubleSide});
 const gardenGlazing=glass.clone();gardenGlazing.color.setHex(0x66818a);gardenGlazing.opacity=.35;gardenGlazing.name='Auditorium garden glazing';
 const light=new THREE.MeshBasicMaterial({color:0xfff9e5});
 const screen=new THREE.MeshBasicMaterial({color:0xc4cbd0});
 const walnut=mat(0x71533b,.65);walnut.map=woodMap;const warmLight=new THREE.MeshBasicMaterial({color:0xffd8a0});
 const lobbySoffit=mat(0x9c9f9c,.5);lobbySoffit.side=THREE.DoubleSide;
 const galleryFabric=mat(0x283d47,.95),galleryCeiling=mat(0x737773);galleryCeiling.side=THREE.DoubleSide;
 const classroomFloor=mat(0x444b4c,.42), ceilingPanel=mat(0xd3d5d1);ceilingPanel.side=THREE.DoubleSide;
 const shadowPixels=new Uint8Array(64*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){
  const i=(y*64+x)*4,r=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5);
  shadowPixels[i+3]=Math.round(Math.pow(Math.max(0,1-r),1.5)*100);
 }
 const shadowMap=new THREE.DataTexture(shadowPixels,64,64);shadowMap.needsUpdate=true;shadowMap.magFilter=THREE.LinearFilter;textures.push(shadowMap);
 const contactShadow=new THREE.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
 const materials=[white,concrete,black,oak,metal,blue,yellow,lime,red,glass,gardenGlazing,light,screen,classroomFloor,ceilingPanel,contactShadow,walnut,warmLight,galleryFabric,galleryCeiling,lobbySoffit];
 const brick=mat(0xffffff,.87);brick.side=THREE.DoubleSide;materials.push(brick);
 const brickPixels=new Uint8Array(128*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<128;x++){
  const row=Math.floor(y/32),column=(x+(row%2)*32)%64,mortar=y%32<2||column<2,i=(y*128+x)*4;
  const noise=Math.sin(x*23+y*17)*5,shade=(Math.floor((x+(row%2)*32)/64)+row)%3*8;
  brickPixels[i]=mortar?161:125+noise+shade;brickPixels[i+1]=mortar?154:65+noise+shade;brickPixels[i+2]=mortar?137:42+noise+shade;brickPixels[i+3]=255;
 }
 const brickMap=new THREE.DataTexture(brickPixels,128,64);brickMap.colorSpace=THREE.SRGBColorSpace;brickMap.wrapS=brickMap.wrapT=THREE.RepeatWrapping;brickMap.generateMipmaps=true;brickMap.minFilter=THREE.LinearMipmapLinearFilter;brickMap.magFilter=THREE.LinearFilter;brickMap.anisotropy=4;brickMap.needsUpdate=true;brick.map=brickMap;textures.push(brickMap);
 const put=(geo:THREE.BufferGeometry,m:THREE.Material)=>{const list=batches.get(m)||[];const indexed=geo.index?geo:mergeVertices(geo);if(indexed!==geo)geo.dispose();list.push(indexed);batches.set(m,list);};
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,m:THREE.Material,angle=0)=>{const g=new THREE.BoxGeometry(w,h,d);g.rotateY(angle);g.translate(x,y,z);put(g,m);};
 const cylinder=(x:number,y:number,z:number,r:number,h:number,m:THREE.Material)=>{const g=new THREE.CylinderGeometry(r,r,h,32);g.translate(x,y,z);put(g,m);};
 const surface=(poly:Polygon,y:number,m:THREE.Material,holes:Polygon[]=[])=>{const shape=new THREE.Shape(poly.map(([x,z])=>new THREE.Vector2(x,-z)));for(const hole of holes)shape.holes.push(new THREE.Path(hole.map(([x,z])=>new THREE.Vector2(x,-z))));const geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);geo.translate(0,y,0);put(geo,m);};
 const wall=(a:Point,b:Point,h:number,m:THREE.Material,collision=true,base=0,thickness=.14)=>{const dx=b[0]-a[0],dz=b[1]-a[1];box((a[0]+b[0])/2,base+h/2,(a[1]+b[1])/2,Math.hypot(dx,dz),h,thickness,m,-Math.atan2(dz,dx));if(collision)barriers.push({a,b,minY:base,maxY:base+h});};
 const label=(text:string,x:number,y:number,z:number,angle=0,width=3)=>{
  const c=document.createElement('canvas');c.width=768;c.height=128;const ctx=c.getContext('2d')!;
  ctx.fillStyle='#283034';ctx.fillRect(0,0,768,128);ctx.fillStyle='#f4f0e5';ctx.font='500 38px Arial';ctx.textAlign='center';ctx.textBaseline='middle';if(text==='sandbox'){ctx.fillStyle='#ebe8df';ctx.fillRect(0,0,768,128);ctx.font='italic 600 88px Arial';const colors=['#df555e','#e6b532','#76a943','#26a69c','#3a9ab8','#8580ba','#b66fa8'];[...text].forEach((letter,i)=>{ctx.fillStyle=colors[i];ctx.fillText(letter,75+i*103,64);});}else ctx.fillText(text,384,64,730);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
  const material=new THREE.MeshBasicMaterial({map:texture});materials.push(material);
  const g=new THREE.PlaneGeometry(width,width/6);g.rotateY(angle);g.translate(x,y,z);const previous=batches;batches=detailBatches;put(g,material);batches=previous;
 };
 // Subtle poured-concrete grain and joints, generated locally (no photo downloads).
 const floorCanvas=document.createElement('canvas');floorCanvas.width=256;floorCanvas.height=256;
 const floorCtx=floorCanvas.getContext('2d')!;floorCtx.fillStyle='#b7b6ad';floorCtx.fillRect(0,0,256,256);
 let seed=41;for(let i=0;i<6000;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%256;seed=(seed*1664525+1013904223)>>>0;const z=seed%256;floorCtx.fillStyle=i%2?'rgba(255,255,255,.05)':'rgba(35,35,30,.035)';floorCtx.fillRect(x,z,1,1);}
 floorCtx.strokeStyle='rgba(70,70,60,.19)';floorCtx.lineWidth=1;floorCtx.strokeRect(0,0,256,256);
 const floorMap=new THREE.CanvasTexture(floorCanvas);floorMap.wrapS=floorMap.wrapT=THREE.RepeatWrapping;floorMap.repeat.set(.5,.5);floorMap.colorSpace=THREE.SRGBColorSpace;textures.push(floorMap);concrete.map=floorMap;concrete.color.setHex(0xffffff);
 const footprint=footprintForFloor(floor);
 const ceiling=floor==='G'?6.3:floor==='R'?3.45:4.2;
 const communicating=communicatingStairForFloor(floor);
 const slabHoles=floor==='G'?[AMPH_LOWER]:floor==='1'?[STAIR_HOLE,ATRIUM_VOID]:communicating?.upper===floor?[STAIR_HOLE,communicating.void]:[STAIR_HOLE];
 if(floor===WEST_STAIR.upper)slabHoles.push(WEST_STAIR.opening);
 surface(footprint,0,concrete,slabHoles);
 // A top-only floor disappears when seen through a lower window. Give upper
 // slabs an underside and edge thickness so furnishings cannot appear to float
 // outside the building. Keep 10 mm clear of the lower ceiling to avoid z-fighting.
 if(floor!=='G'){
  const underside=mat(0xb7b9b3,.8);underside.side=THREE.BackSide;underside.name='Floor slab underside';materials.push(underside);
  surface(footprint,-.19,underside,slabHoles);
  for(const ring of [footprint,...slabHoles])ring.forEach((a,i)=>wall(a,ring[(i+1)%ring.length],.19,concrete,false,-.19,.025));
 }

 const ceilingHoles=floor==='G'?[STAIR_HOLE,ATRIUM_VOID,ANTONOV_FOOTPRINT]:communicating?.lower===floor?[STAIR_HOLE,communicating.void]:[STAIR_HOLE];
 if(floor===WEST_STAIR.lower)ceilingHoles.push(WEST_STAIR.opening);
 if(floor!=='R') surface(footprint,ceiling,floor==='G'?lobbySoffit:black,ceilingHoles);

 // Solid stairwell walls enclose the switchback flights; the corridor entry
 // stays open across both the ascending and descending landings.
 {
  const [sx,sz] = STAIR_CENTER;
  wall([sx-1.85,sz+4.3],[sx-1.85,sz-3.8],ceiling,white);
  wall([sx-1.85,sz-3.8],[sx+1.85,sz-3.8],ceiling,white);
  wall([sx+1.85,sz-3.8],[sx+1.85,sz+4.3],ceiling,white);
 }
 batches=detailBatches;
 // Enclosed stair flights are modeled with individual treads and handrails.
 for(const flight of ENCLOSED_FLIGHTS.filter(f=>f.lower===floor)) {
  const [ax,ay,az]=flight.from,[bx,by,bz]=flight.to;
  const length=Math.hypot(bx-ax,bz-az),rise=by-ay;
  const steps=Math.max(1,Math.ceil(rise/.17));
  const angle=-Math.atan2(bz-az,bx-ax);
  for(let i=0;i<steps;i++){
   const t=(i+.5)/steps;
   box(ax+(bx-ax)*t,ay-FLOOR_HEIGHT[floor]+rise*(i+1)/steps-.07,az+(bz-az)*t,length/steps+.015,.14,flight.width,concrete,angle);
  }
  const dx=(bx-ax)/length,dz=(bz-az)/length;
  for(const side of [-1,1]){
   const ox=-dz*flight.width*.5*side,oz=dx*flight.width*.5*side;
   for(let i=0;i<=steps;i+=Math.max(1,Math.floor(steps/7))){const t=i/steps;box(ax+(bx-ax)*t+ox,ay-FLOOR_HEIGHT[floor]+rise*t+.52,az+(bz-az)*t+oz,.035,1.04,.035,metal);}
   const start=new THREE.Vector3(ax+ox,ay-FLOOR_HEIGHT[floor]+1.06,az+oz),end=new THREE.Vector3(bx+ox,by-FLOOR_HEIGHT[floor]+1.06,bz+oz);
   const rail=new THREE.CylinderGeometry(.03,.03,start.distanceTo(end),8);rail.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),end.clone().sub(start).normalize()));rail.translate(...start.add(end).multiplyScalar(.5).toArray());put(rail,metal);
  }
 }
 batches=shellBatches;
 // Curtain wall with individual panels and mullions, not opaque painted walls.
 for(let i=0;floor!=='R'&&i<footprint.length;i++) {
  const a=footprint[i],b=footprint[(i+1)%footprint.length];
  const count=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.5);
  const gardenDoor=floor==='1'&&distanceToSegment(FAMILY_GARDEN_DOOR,a,b)<.01;
  let parts:readonly (readonly [Point,Point])[]=[[a,b]];
  if(gardenDoor){
   const length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;
   const l:Point=[FAMILY_GARDEN_DOOR[0]-dx*.9,FAMILY_GARDEN_DOOR[1]-dz*.9],r:Point=[FAMILY_GARDEN_DOOR[0]+dx*.9,FAMILY_GARDEN_DOOR[1]+dz*.9];
   parts=[[a,l],[r,b]];wall(l,r,ceiling-2.5,glass,false,2.5);wall(l,r,.065,metal,false,2.47,.08);
  }
  for(const [start,end] of parts){wall(start,end,ceiling,glass);wall(start,end,.1,metal,false,.08);wall(start,end,.12,metal,false,ceiling*.54);}
  for(let j=0;j<=count;j++){const t=j/count,p:Point=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];if(gardenDoor&&Math.hypot(p[0]-FAMILY_GARDEN_DOOR[0],p[1]-FAMILY_GARDEN_DOOR[1])<.97)continue;box(p[0],ceiling/2,p[1],.07,ceiling,.07,metal);}
 }
 batches=detailBatches;
  const shell=new THREE.Shape();
  shell.moveTo(-.18,-.23);shell.quadraticCurveTo(-.26,-.20,-.24,.13);shell.quadraticCurveTo(-.23,.26,0,.26);shell.quadraticCurveTo(.23,.26,.24,.13);shell.quadraticCurveTo(.26,-.20,.18,-.23);shell.closePath();
  const grip=new THREE.Path();grip.moveTo(-.065,.15);grip.lineTo(.065,.15);grip.lineTo(.065,.185);grip.lineTo(-.065,.185);grip.closePath();shell.holes.push(grip);
  const rawBack=new THREE.ExtrudeGeometry(shell,{depth:.035,bevelEnabled:false,curveSegments:5});
 const chairBackTemplate=mergeVertices(rawBack);rawBack.dispose();
 function contact(x:number,z:number,r:number){const g=new THREE.PlaneGeometry(r*2,r*2);g.rotateX(-Math.PI/2);g.translate(x,.025,z);put(g,contactShadow);}
 function circleBarrier(x:number,z:number,r:number,base=0,height=1.1){
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,b=(i+1)/12*Math.PI*2;barriers.push({a:[x+Math.cos(a)*r,z+Math.sin(a)*r],b:[x+Math.cos(b)*r,z+Math.sin(b)*r],minY:base,maxY:base+height});}
 }
 function chair(x:number,z:number,angle:number,m:THREE.Material,swivel=false,base=0){
  box(x,base+.49,z,.46,.065,.45,m,angle);
  const back=chairBackTemplate.clone();
  back.rotateX(-.12);back.rotateY(angle);back.translate(x+Math.sin(angle)*.2,base+.77,z+Math.cos(angle)*.2);put(back,m);
  if(swivel){
   cylinder(x,base+.24,z,.037,.46,metal);
   for(let i=0;i<5;i++){const a=i/5*Math.PI*2;box(x+Math.sin(a)*.15,base+.095,z+Math.cos(a)*.15,.035,.035,.3,metal,a);cylinder(x+Math.sin(a)*.28,base+.06,z+Math.cos(a)*.28,.045,.055,black);}
  }else for(const dx of [-.16,.16])for(const dz of [-.15,.15])box(x+Math.cos(angle)*dx+Math.sin(angle)*dz,base+.24,z-Math.sin(angle)*dx+Math.cos(angle)*dz,.035,.46,.035,metal);
  circleBarrier(x,z,.26,base);if(base===0)contact(x,z,.55);
 }
 function table(x:number,z:number,r=.85,kind:THREE.Material=oak){cylinder(x,.76,z,r,.055,kind);cylinder(x,.36,z,.055,.72,metal);cylinder(x,.045,z,.36,.045,metal);circleBarrier(x,z,r);contact(x,z,r*1.22);}
 function tableSet(x:number,z:number,m=lime){table(x,z);for(let i=0;i<4;i++){const a=i*Math.PI/2;chair(x+Math.sin(a)*1.15,z+Math.cos(a)*1.15,a,m);}}
 function classroom(room:InteriorRoom){
  surface(room.polygon,.012,classroomFloor);
  surface(room.polygon,3.26,ceilingPanel);
  const f=roomFrame(room);
  // The white service grid and round supply ducts are visible in UMD's photos.
  for(let u=f.minU+1;u<f.maxU;u+=2.4){
   for(let v=f.minV+1;v<f.maxV;v+=2.4){
    const p=f.at(u,v);if(!clearInside(room,p,1.25))continue;
    box(p[0],3.19,p[1],2.4,.045,.045,white,f.angle);
    box(p[0],3.19,p[1],2.4,.045,.045,white,f.angle+Math.PI/2);
    const lamp=f.at(u,v+.55);
    box(lamp[0],3.10,lamp[1],1.7,.045,.09,light,f.angle);
    const vent=f.at(u+.72,v-.65);
    cylinder(vent[0],3.16,vent[1],.16,.1,white);
   }
  }
  for(const [x,z] of teachingTables(room)){
   table(x,z,.762);const seats=6;
   cylinder(x,.803,z,.08,.025,black);
   for(let i=0;i<seats;i++){const a=i/seats*Math.PI*2;chair(x+Math.sin(a)*1.04,z+Math.cos(a)*1.04,a,red,true);}
  }
 }
 function conference(room:InteriorRoom){
  const fitted=meetingTable(room);if(!fitted)return;
  const {center:[x,z],length,width,angle,u,v}=fitted;
  const gallery=room.id==='6217';
  if(gallery){
   // Two abutting walnut tables and upholstered four-legged chairs in UMD's
   // gallery photograph; keep the narrow seam between the table tops.
   for(const side of [-1,1])box(x+u[0]*side*length/4,.76,z+u[1]*side*length/4,length/2-.012,.065,width,walnut,angle);
   surface(room.polygon,3.45,galleryCeiling);
   for(const offset of [-length*.32,length*.32]){
    const lx=x+u[0]*offset,lz=z+u[1]*offset;
    box(lx,3.03,lz,width+1.5,.16,.11,black,angle+Math.PI/2);
    box(lx,2.94,lz,width+1.47,.022,.08,light,angle+Math.PI/2);
    for(const side of [-1,1])cylinder(lx+v[0]*side*.65,3.25,lz+v[1]*side*.65,.008,.4,black);
   }
   box(x,3.03,z,length*.65,.16,.11,black,angle);
   box(x,2.94,z,length*.65,.022,.08,light,angle);
  }else box(x,.76,z,length,.065,width,white,angle);
  for(const offset of [-length*.35,length*.35])box(x+u[0]*offset,.37,z+u[1]*offset,.08,.72,.6,metal,angle);
  const ends:Point[]=[[-length/2,-width/2],[length/2,-width/2],[length/2,width/2],[-length/2,width/2]].map(([a,b])=>[x+u[0]*a+v[0]*b,z+u[1]*a+v[1]*b]);
  for(let i=0;i<4;i++)barriers.push({a:ends[i],b:ends[(i+1)%4]});
  for(const {point:[cx,cz],angle:rotation} of meetingSeats(room,fitted)){
   if(gallery){
    const seat=new THREE.SphereGeometry(1,12,8);seat.scale(.255,.065,.235);seat.rotateY(rotation);seat.translate(cx,.48,cz);put(seat,galleryFabric);
    const back=new THREE.SphereGeometry(1,12,8);back.scale(.255,.26,.065);back.rotateX(-.12);back.rotateY(rotation);back.translate(cx+Math.sin(rotation)*.19,.73,cz+Math.cos(rotation)*.19);put(back,galleryFabric);
    for(const dx of [-.18,.18])for(const dz of [-.16,.16])box(cx+Math.cos(rotation)*dx+Math.sin(rotation)*dz,.24,cz-Math.sin(rotation)*dx+Math.cos(rotation)*dz,.024,.46,.024,black);
    circleBarrier(cx,cz,.26);contact(cx,cz,.55);
   }else chair(cx,cz,rotation,blue,true);
  }
 }
 function auditorium(room:InteriorRoom){
  const antonov=room.id==='0324',top=antonov?10.5:3.3;
  batches=shellBatches;surface(room.polygon,top,walnut);walnut.side=THREE.DoubleSide;
  const floorMaterial=classroomFloor;
  if(antonov){
   surface(auditoriumStrip(1100,ROW_START),.01,floorMaterial);
   const breaks=[-Infinity,...AUD_AISLES.flatMap(v=>[274+(v-.6)/AUD_SCALE,274+(v+.6)/AUD_SCALE]),Infinity];
   for(let step=0;step<40;step++)for(let band=0;band<breaks.length-1;band++){
    const lo=ROW_START+step*ROW_PITCH/4,hi=lo+ROW_PITCH/4;
    const poly=auditoriumStrip(lo,hi,breaks[band],breaks[band+1]);if(poly.length<3)continue;
    const height=(band===1||band===3)?(step+1)*ROW_RISE/4:(Math.floor(step/4)+1)*ROW_RISE;
    surface(poly,height,floorMaterial);
    const riser=(band===1||band===3)?ROW_RISE/4:ROW_RISE;
    poly.forEach((a,i)=>wall(a,poly[(i+1)%poly.length],riser,floorMaterial,true,height-riser,.025));
   }
   surface(auditoriumStrip(ROW_START+10*ROW_PITCH,1600),10*ROW_RISE,floorMaterial);
  }else {
   surface(auditoriumStrip(1300,1422,-Infinity,Infinity,GANNON_PLAN),.01,floorMaterial);
   const breaks=[-Infinity,...GANNON_AISLES.flatMap(v=>[225+(v-.6)/AUD_SCALE,225+(v+.6)/AUD_SCALE]),Infinity];
   for(let step=0;step<6;step++)for(let band=0;band<5;band++){
    const poly=auditoriumStrip(1422+step*12,1434+step*12,breaks[band],breaks[band+1],GANNON_PLAN);if(poly.length<3)continue;
    const stairs=band===1||band===3,height=stairs?(step+1)*.15:(Math.floor(step/2)+1)*.3,riser=stairs?.15:.3;
    surface(poly,height,floorMaterial);poly.forEach((a,i)=>wall(a,poly[(i+1)%poly.length],riser,floorMaterial,true,height-riser,.025));
   }
   surface(auditoriumStrip(1494,1600,-Infinity,Infinity,GANNON_PLAN),.9,floorMaterial);
   for(const x of [1435,1460,1485])for(const y of [140,225,310]){const p=groundPlan(x,y);cylinder(p[0],top-.03,p[1],.13,.025,light);}
  }
  batches=detailBatches;
  const seats=auditoriumSeats(room.id),tableAngle=-Math.atan2(AUD_WIDTH[1],AUD_WIDTH[0]);
  for(const seat of seats){
   const [x,z]=seat.point,y=seat.height,depth=seat.depth,width=seat.width,seatAngle=Math.atan2(depth[0],depth[1]);
   box(x,y+.48,z,.49,.09,.47,black,seatAngle);
   box(x+depth[0]*.22,y+.85,z+depth[1]*.22,.48,.62,.065,black,seatAngle);
   cylinder(x,y+.23,z,.04,.46,metal);box(x,y+.03,z,.4,.05,.3,metal,seatAngle);
   for(const side of [-1,1])box(x+width[0]*side*.29,y+.69,z+width[1]*side*.29,.04,.055,.4,black,seatAngle);
   circleBarrier(x,z,.29,y,1.18);
  }
  // Continuous shared desks, separated by two generous aisles.
  for(const row of [...new Set(seats.map(s=>s.row))].filter(r=>r>=0)){
   const line=seats.filter(s=>s.row===row);let group:typeof line=[];
   const flush=()=>{
    if(!group.length)return;
    const first=group[0],last=group[group.length-1],width=Math.hypot(last.point[0]-first.point[0],last.point[1]-first.point[1])+.67;
    const w=first.width,d=first.depth,tableAngle=-Math.atan2(w[1],w[0]);
    const x=(first.point[0]+last.point[0])/2-d[0]*.5,z=(first.point[1]+last.point[1])/2-d[1]*.5,y=first.height;
    box(x,y+.75,z,width,.065,.5,white,tableAngle);
    for(const offset of [-width*.43,width*.43])box(x+w[0]*offset,y+.36,z+w[1]*offset,.055,.72,.37,metal,tableAngle);
    const corners:Point[]=[[-width/2,-.25],[width/2,-.25],[width/2,.25],[-width/2,.25]].map(([a,b])=>[x+w[0]*a+d[0]*b,z+w[1]*a+d[1]*b]);
    corners.forEach((a,i)=>barriers.push({a,b:corners[(i+1)%4],minY:y,maxY:y+.8}));group=[];
   };
   for(const seat of line){if(group.length&&Math.hypot(seat.point[0]-group[group.length-1].point[0],seat.point[1]-group[group.length-1].point[1])>1.1)flush();group.push(seat);}flush();
  }
  const screenX=antonov?1218:1410,screenCenter=antonov?274:225;
  for(const offset of (antonov?[-5.5,0,5.5]:[-4,4])){
   const p=groundPlan(screenX,screenCenter+offset/AUD_SCALE);
   box(p[0],antonov?4:2.1,p[1],antonov?4.8:3.2,antonov?2.7:1.7,.09,black,tableAngle);
   box(p[0]+AUD_DEPTH[0]*.055,antonov?4:2.1,p[1]+AUD_DEPTH[1]*.055,antonov?4.65:3.05,antonov?2.55:1.55,.025,screen,tableAngle);
  }
  const podium=groundPlan(antonov?1216:1417,screenCenter);
  box(podium[0],.58,podium[1],.9,1.16,.65,walnut,tableAngle);
  box(podium[0],1.25,podium[1],.65,.35,.055,black,tableAngle);
  // Warm angular lighting follows the folded acoustic panels in the Antonov photo.
  if(antonov)for(let x=1240;x<1480;x+=32){
   for(const side of [-1,1]){
    const p=auditoriumSidePoint(x,side,2),q=auditoriumSidePoint(x+13,side,10),r=p,end=auditoriumSidePoint(x+26,side,2);
    const low=(Math.floor((x-ROW_START)/ROW_PITCH)+1)*ROW_RISE+.7;
    const corners=[[p[0],low-.3,p[1]],[p[0],low+3.8,p[1]],[end[0],low+3.8,end[1]],[end[0],low-.3,end[1]]];
    for(let i=0;i<4;i++){
     const points=[corners[i],corners[(i+1)%4],[q[0],low+1.8,q[1]]];
     const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));g.setIndex([0,1,2]);g.computeVertexNormals();put(g,walnut);
    }
    const lines:[[number,number,number],[number,number,number]][]=[[[p[0],low,p[1]],[q[0],low+1.8,q[1]]],[[q[0],low+1.8,q[1]],[r[0],low+3.5,r[1]]]];
    for(const [a,b] of lines){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),g=new THREE.CylinderGeometry(.035,.035,start.distanceTo(end),6);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),end.clone().sub(start).normalize()));g.translate(...start.add(end).multiplyScalar(.5).toArray());put(g,warmLight);}
   }
   for(const y of [175,275,375]){const p=groundPlan(x,y);cylinder(p[0],top-.035,p[1],.12,.025,warmLight);}
  }
 }
 function office(room:InteriorRoom){
  const edge=room.exteriorEdges?.[0]??0,a=room.polygon[edge],b=room.polygon[(edge+1)%room.polygon.length];
  const len=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/len,uz=(b[1]-a[1])/len;
  const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;let nx=-uz,nz=ux;
  if(!pointInPolygon([mx+nx*.3,mz+nz*.3],room.polygon)){nx=-nx;nz=-nz;}
  const angle=-Math.atan2(uz,ux),x=mx+nx*.95,z=mz+nz*.95,width=Math.min(1.5,len-.65);
  surface(room.polygon,.01,classroomFloor);surface(room.polygon,3.15,ceilingPanel);
  box(x,.75,z,width,.065,.7,white,angle);
  for(const side of [-1,1])box(x+ux*side*(width/2-.1),.36,z+uz*side*(width/2-.1),.05,.72,.55,metal,angle);
  const corners:Point[]=[[-width/2,-.35],[width/2,-.35],[width/2,.35],[-width/2,.35]].map(([u,v])=>[x+ux*u+nx*v,z+uz*u+nz*v]);
  corners.forEach((a,i)=>barriers.push({a,b:corners[(i+1)%4]}));
  box(x-nx*.15,1.04,z-nz*.15,.48,.32,.04,black,angle);box(x-nx*.15,.84,z-nz*.15,.04,.18,.04,metal);
  chair(x+nx*.78,z+nz*.78,Math.atan2(nx,nz),black,true);
  const meeting:Point=[mx+nx*3.4,mz+nz*3.4];
  if(room.officeMeeting&&clearInside(room,meeting,.93)&&Math.hypot(meeting[0]-room.door[0],meeting[1]-room.door[1])>1.5){
   const radius=room.officeMeetingRadius??.43,offset=room.officeMeetingRadius===undefined?.73:radius+.2;
   table(meeting[0],meeting[1],radius,white);
   for(const side of [-1,1]){
    chair(meeting[0]+ux*offset*side,meeting[1]+uz*offset*side,Math.atan2(ux*side,uz*side),blue);
    if(room.officeMeetingSeats===4)chair(meeting[0]+nx*offset*side,meeting[1]+nz*offset*side,Math.atan2(nx*side,nz*side),blue);
   }
  }
  box(mx+nx*2.4,3.09,mz+nz*2.4,1.8,.04,.13,light,angle+Math.PI/2);
 }
 function workroom(room:InteriorRoom){
  const f=roomFrame(room);surface(room.polygon,.01,classroomFloor);surface(room.polygon,3.2,ceilingPanel);
  const cu=(f.minU+f.maxU)/2,cv=(f.minV+f.maxV)/2;
  const banks=room.deskBanks??[{from:f.at(cu-1.35,cv),to:f.at(cu+1.35,cv),seatsPerSide:3}];
  for(const bank of banks){
   const {from,to,seatsPerSide}=bank,length=Math.hypot(to[0]-from[0],to[1]-from[1]);
   const ux=(to[0]-from[0])/length,uz=(to[1]-from[1])/length,vx=-uz,vz=ux,angle=-Math.atan2(uz,ux);
   const center:Point=[(from[0]+to[0])/2,(from[1]+to[1])/2];
   const at=(u:number,v:number):Point=>[center[0]+ux*u+vx*v,center[1]+uz*u+vz*v];
   box(center[0],.75,center[1],length,.065,1.25,white,angle);
   for(const offset of [-length/2+.18,length/2-.18]){const p=at(offset,0);box(p[0],.36,p[1],.06,.72,1.1,metal,angle);}
   const corners=[[-length/2,-.625],[length/2,-.625],[length/2,.625],[-length/2,.625]].map(([a,b])=>at(a,b));corners.forEach((a,i)=>barriers.push({a,b:corners[(i+1)%4],minY:0,maxY:.8}));
   // Paired workstations leave the circulation space between desk banks open.
   for(const side of [-1,1])for(let i=0;i<seatsPerSide;i++){
    const offset=((i+.5)/seatsPerSide-.5)*length,p=at(offset,side*1.05);
    if(clearInside(room,p,.4)&&Math.hypot(p[0]-room.door[0],p[1]-room.door[1])>1.1)chair(p[0],p[1],angle+(side===1?0:Math.PI),black,true);
    const screenPos=at(offset,side*.18);box(screenPos[0],1.02,screenPos[1],.44,.29,.04,black,angle);box(screenPos[0],.83,screenPos[1],.04,.16,.04,metal);
   }
   box(center[0],3.14,center[1],length-.15,.04,.13,light,angle);
  }
 }
 function resetZone(room:InteriorRoom){
  const fitted=meetingTable(room);if(!fitted)return;
  const {center:[x,z],u,v,angle}=fitted,length=Math.min(5.4,fitted.length),width=Math.min(1.1,fitted.width);
  box(x,.75,z,length,.065,width,white,angle);
  for(const offset of [-length*.38,length*.38])box(x+u[0]*offset,.36,z+u[1]*offset,.07,.72,.65,metal,angle);
  const corners:Point[]=[[-length/2,-width/2],[length/2,-width/2],[length/2,width/2],[-length/2,width/2]].map(([a,b])=>[x+u[0]*a+v[0]*b,z+u[1]*a+v[1]*b]);
  corners.forEach((a,i)=>barriers.push({a,b:corners[(i+1)%4]}));
  for(const side of [-1,1])for(let i=0;i<4;i++){
   const a=(i-1.5)*1.05,b=side*(width/2+.38),cx=x+u[0]*a+v[0]*b,cz=z+u[1]*a+v[1]*b;
   if(clearInside(room,[cx,cz],.4))chair(cx,cz,Math.atan2(v[0]*side,v[1]*side),side===1?lime:blue);
  }
  // Exposed services and broken linear pendant runs visible in HDR's reset-zone
  // photographs. Furniture positions remain approximate between viewpoints.
  for(const offset of [-2,0,2]){
   const cx=x+u[0]*offset,cz=z+u[1]*offset;
   box(cx,3.65,cz,2.6,.08,.1,light,angle+(offset===0?-.55:.55));
   cylinder(cx,3.94,cz,.007,.48,metal);
  }
 }
 function roomShell(room:InteriorRoom){
  const sandboxBuilder=()=>({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
  if(room.id==='1231'){batches=detailBatches;buildSandbox(room.id,sandboxBuilder());return;}
  if(room.id==='north-collaboration'){batches=detailBatches;buildHatchery(room.id,sandboxBuilder());return;}
  if(room.kind==='garden'||room.kind==='cafe'||room.id==='lobby-lounge'||room.id==='amphitheater')return;
  if(room.id==='north-reset-zone'){resetZone(room);return;}
  if(room.id==='west-reset-zone'){
   const center=westFourthPlan(270,96);table(center[0],center[1],.6,white);
   for(let i=0;i<4;i++){const a=i*Math.PI/2,p:Point=[center[0]+Math.sin(a)*.93,center[1]+Math.cos(a)*.93];if(clearInside(room,p,.3))chair(p[0],p[1],a,lime);}
   const angle=-Math.atan2(westFourthPlan(230,150)[1]-center[1],westFourthPlan(230,150)[0]-center[0]);
   for(const [x,y] of [[209,179],[186,208]]){const p=westFourthPlan(x,y);if(clearInside(room,p,.45))chair(p[0],p[1],angle,blue);}
   return;
  }
  batches=shellBatches;
  const wallHeight=room.id==='0324'?10.5:room.id==='0318'?3.3:room.kind==='classroom'?3.25:ceiling;
  const defaultWallMaterial=room.kind==='auditorium'?walnut:room.kind==='lab'?glass:white;
  const nearestEdge=(p:Point)=>room.polygon.reduce((best,a,i)=>distanceToSegment(p,a,room.polygon[(i+1)%room.polygon.length])<distanceToSegment(p,room.polygon[best],room.polygon[(best+1)%room.polygon.length])?i:best,0);
  const nearest=nearestEdge(room.door),doors=[room.door,...(room.additionalDoors??[])];
  room.polygon.forEach((a,i)=>{
   if(room.exteriorEdges?.includes(i))return;
   const wallMaterial=room.glazedEdges?.includes(i)?glass:room.timberEdges?.includes(i)?oak:['0102','0108','0116'].includes(room.id)&&(i===1||i===3)?white:defaultWallMaterial;
   const solidWall=(start:Point,end:Point,height:number,material:THREE.Material,collision=true,base=0)=>{
    wall(start,end,height,material,collision,base);
    if(room.id!=='0324')return;
    const length=Math.hypot(end[0]-start[0],end[1]-start[1]);if(length<.01)return;
    let nx=-(end[1]-start[1])/length,nz=(end[0]-start[0])/length;
    const mx=(start[0]+end[0])/2,mz=(start[1]+end[1])/2;
    if(pointInPolygon([mx+nx*.2,mz+nz*.2],room.polygon)){nx=-nx;nz=-nz;}
    const g=new THREE.PlaneGeometry(length,height),uv=g.getAttribute('uv');
    for(let v=0;v<uv.count;v++)uv.setXY(v,uv.getX(v)*length/.48,uv.getY(v)*height/.15+base/.15);
    g.rotateY(-Math.atan2(end[1]-start[1],end[0]-start[0]));g.translate(mx+nx*.078,base+height/2,mz+nz*.078);put(g,brick);
   };
   const shellWall=(start:Point,end:Point,height:number,material:THREE.Material,collision=true,base=0)=>{
    const length=Math.hypot(end[0]-start[0],end[1]-start[1]);
    if(room.id!=='0324'||![5,7,8,9].includes(i)||height<10||base!==0||length<3.4){solidWall(start,end,height,material,collision,base);return;}
    // The garden photos show broad glazed bays in this brick elevation.
    // Cut real openings in both wall faces, so the view works from the
    // auditorium as well as from the terrace. Bay widths remain estimated.
    const ux=(end[0]-start[0])/length,uz=(end[1]-start[1])/length;
    const l:Point=[start[0]+ux*.55,start[1]+uz*.55],r:Point=[end[0]-ux*.55,end[1]-uz*.55],sill=6.65,head=9.05;
    solidWall(start,l,height,material,collision);solidWall(r,end,height,material,collision);
    solidWall(l,r,sill,material,collision);solidWall(l,r,height-head,material,collision,head);
    wall(l,r,head-sill,gardenGlazing,true,sill,.03);
    for(const y of [sill,head])wall(l,r,.055,metal,false,y,.1);
    const panes=Math.max(2,Math.ceil((length-1.1)/1.4));
    for(let j=0;j<=panes;j++){const t=j/panes;box(l[0]+(r[0]-l[0])*t,(sill+head)/2,l[1]+(r[1]-l[1])*t,.05,head-sill,.05,metal);}
   };
   const b=room.polygon[(i+1)%room.polygon.length];
   const len=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/len,dz=(b[1]-a[1])/len,half=(room.doorWidth??1.6)/2;
   const openings=doors.filter(p=>nearestEdge(p)===i).map(p=>Math.max(half+.1,Math.min(len-half-.1,(p[0]-a[0])*dx+(p[1]-a[1])*dz))).sort((a,b)=>a-b);
   if(['0102','0108','0116'].includes(room.id)&&i===0){
    // The photographed lobby glass has tall metal frames above its doors.
    const count=Math.ceil(len/1.35);
    for(let j=0;j<=count;j++){
     const t=len*j/count,insideDoor=openings.some(center=>Math.abs(t-center)<half+.06);
     const height=insideDoor?wallHeight-2.5:wallHeight,base=insideDoor?2.5:0;
     box(a[0]+dx*t,base+height/2,a[1]+dz*t,.065,height,.065,metal);
    }
    for(const y of [2.5,5.15])wall(a,b,.08,metal,false,y,.075);
   }
   if(!openings.length){shellWall(a,b,wallHeight,room.id==='6217'&&i===1?glass:wallMaterial);return;}
   let cursor=a;
   for(const t of openings){
    const l:Point=[a[0]+dx*(t-half),a[1]+dz*(t-half)],r:Point=[a[0]+dx*(t+half),a[1]+dz*(t+half)];
    shellWall(cursor,l,wallHeight,wallMaterial);shellWall(l,r,wallHeight-2.5,wallMaterial,false,2.5);cursor=r;
    if(room.kind==='office'||room.kind==='workroom'||['0102','0108','0116'].includes(room.id)){
     for(const jamb of [l,r])box(jamb[0],1.25,jamb[1],.035,2.5,.18,metal,-Math.atan2(dz,dx));
     wall(l,r,.035,metal,false,2.48,.18);
    }

    if(room.listed!==false)for(const side of [-1,1])label(roomTitle(room),(l[0]+r[0])/2-dz*.085*side,2.85,(l[1]+r[1])/2+dx*.085*side,-Math.atan2(dz,dx)+(side===1?0:Math.PI),3.4);
   }
   shellWall(cursor,b,wallHeight,wallMaterial);
  });
  batches=detailBatches;
  const xs=room.polygon.map(p=>p[0]),zs=room.polygon.map(p=>p[1]);
  const x=(Math.min(...xs)+Math.max(...xs))/2,z=(Math.min(...zs)+Math.max(...zs))/2;
  if(SANDBOX_STUDIOS.includes(room))buildSandbox(room.id,sandboxBuilder());
  else if(room.id==='1213'||room.id==='1209')buildSupportStorage(room,sandboxBuilder());
  else if(room.id==='2237'||room.id==='hatchery-west-workroom')buildHatchery(room.id,sandboxBuilder());
  else if(FIRST_OFFICE_TYPES[room.id]){surface(room.polygon,.01,classroomFloor);buildFirstOffice(room,{...sandboxBuilder(),chair});}
  else if(room.kind==='office')office(room);
  else if(room.kind==='workroom')workroom(room);
  else if(room.kind==='restroom')buildRestroom(room,{box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
  else if(room.kind==='seminar')buildSeminarAV(room,sandboxBuilder());
  else if(room.kind==='classroom') classroom(room);
  else if(room.kind==='conference') conference(room);
  else if(room.id==='0116')buildRoboticsLab(room,{box,cylinder,put,palette:{white,oak,metal,glass,black,light},materials,barriers});
  else if(room.id==='0108')buildDroneLab(room,{box,cylinder,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
  else if(room.id==='0102')buildSmallArtifacts(room,{box,cylinder,put,palette:{white,oak,metal,glass,black,light},materials,barriers});
  else if(room.kind==='lab') {
   for(const dx of [-1.7,1.7])for(const dz of [-2.5,0,2.5]){box(x+dx,.84,z+dz,2,.1,1.1,oak);for(const offset of [-.8,.8])box(x+dx+offset,.4,z+dz,.07,.8,.8,metal);box(x+dx,1.2,z+dz, .8,.55,.12,screen);}
  } else if(room.kind==='auditorium') {
   auditorium(room);
  } else if(!(room.kind==='service'&&room.listed===false)&&clearInside(room,[x,z],1.45))tableSet(x,z);
  const hasDocumentedAV=room.kind==='conference'&&conferenceAV(room);
  if(room.kind==='classroom'||(room.kind==='conference'&&room.id!=='6217'&&!hasDocumentedAV)) {
   const candidates=room.polygon.map((a,i)=>({a,b:room.polygon[(i+1)%room.polygon.length],i})).filter(({a,b,i})=>Math.hypot(b[0]-a[0],b[1]-a[1])>(i===nearest?8:4));
   for(const {a,b,i} of candidates.slice(0,room.kind==='classroom'?4:1)){
    const len=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/len,dz=(b[1]-a[1])/len;
    const t=i===nearest?(Math.hypot(room.door[0]-a[0],room.door[1]-a[1])<len/2?.75:.25):.5;
    const mx=a[0]+(b[0]-a[0])*t,mz=a[1]+(b[1]-a[1])*t;
    const side=pointInPolygon([mx-dz*.2,mz+dx*.2],room.polygon)?1:-1;
    box(mx-dz*.11*side,2.1,mz+dx*.11*side,2.5,1.5,.07,black,-Math.atan2(dz,dx));
    box(mx-dz*.155*side,2.1,mz+dx*.155*side,2.38,1.38,.025,screen,-Math.atan2(dz,dx));
   }
  }
 }
 const conferenceAV=createConferenceAVBuilder({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
 ROOMS.filter(r=>r.floor===floor).forEach(roomShell);
 buildWestStair(floor,{box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
 if(floor==='4'){
  // The public upper-floor photos show exposed services over the corridors.
  // Their exact routing is estimated; these runs follow the traced circulation.
  for(const [start,end] of [
   [fourthPlan(650,801),fourthPlan(1040,852.48)],
   [fourthPlan(620,953),fourthPlan(1040,953)],
   [westFourthPlan(242,163),westFourthPlan(312,210)],
   [westFourthPlan(312,210),westFourthPlan(620,480)],
   [westFourthPlan(620,480),westFourthPlan(692,550)],
   [westFourthPlan(692,550),westFourthPlan(940,674)],
   [westFourthPlan(940,674),westFourthPlan(1045,710)],
   [westFourthPlan(1045,710),fourthPlan(650,801)],
  ]){
   const dx=end[0]-start[0],dz=end[1]-start[1],length=Math.hypot(dx,dz),ux=dx/length,uz=dz/length,angle=-Math.atan2(dz,dx);
   const a=new THREE.Vector3(start[0]-uz*.4,3.88,start[1]+ux*.4),b=new THREE.Vector3(end[0]-uz*.4,3.88,end[1]+ux*.4);
   const duct=new THREE.CylinderGeometry(.12,.12,a.distanceTo(b),12);duct.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()));duct.translate(...a.clone().add(b).multiplyScalar(.5).toArray());put(duct,metal);
   for(let distance=1;distance<length;distance+=2.8){
    const x=start[0]+ux*distance,z=start[1]+uz*distance,tilt=(Math.floor(distance/2.8)%2?1:-1)*.55;
    box(x,3.39,z,1.5,.06,.09,light,angle+tilt);
    cylinder(x,3.76,z,.009,.68,metal);
    box(x+uz*.27,3.93,z-ux*.27,2.8,.06,.24,black,angle);
   }
  }
 }

 if(floor==='R'){
  batches=shellBatches;
  buildRoof({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
  batches=detailBatches;
  const [px,pz]=ROOF_GALLERY.polygon.reduce<Point>((s,p)=>[s[0]+p[0]/4,s[1]+p[1]/4],[0,0]);box(px,3.12,pz,.04,.48,.04,metal);box(px,2.84,pz,.48,.19,.4,white);box(px,2.84,pz-.205,.15,.1,.015,black);
 }
 batches=shellBatches;
 // White structural columns follow the public circulation edges.
 for(const [x,z] of structuralColumns(floor)) {
  cylinder(x,ceiling/2,z,.3,ceiling,white);
  for(let i=0;i<16;i++) {
   const a=i/16*Math.PI*2,b=(i+1)/16*Math.PI*2;
   barriers.push({a:[x+Math.cos(a)*.3,z+Math.sin(a)*.3],b:[x+Math.cos(b)*.3,z+Math.sin(b)*.3],minY:0,maxY:ceiling});
  }
 }
 if(communicating)buildCommunicatingStair(floor,{box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
 if(floor==='1')buildFamilyGarden({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
 if(floor==='G'||floor==='1')buildAtrium(floor,{box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
 // Public atrium furniture and material cues from HDR photographs.
 if(floor==='G') {
  buildAmphitheater({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
  buildLobbyCeiling({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
  batches=detailBatches;
  buildLobbySeating({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers,contact});
  for(const [px,py] of [[950,755],[1000,720],[1040,670]]){const [x,z]=groundPlan(px,py);box(x,1.05,z,2.8,.1,1.05,white);box(x-1.3,.52,z,.14,1.05,1.05,white);box(x+1.3,.52,z,.14,1.05,1.05,white);for(const dx of [-.85,0,.85]){cylinder(x+dx,.73,z+.9,.23,.08,yellow);cylinder(x+dx,.35,z+.9,.035,.7,metal);}}
  buildCafe({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers,chair,table});
 }
 batches=detailBatches;
 // Irregular suspended luminous strips, spaced along the curved building spine.
 const spine:Point[]=[plan(633,580),plan(640,900),plan(642,1130),plan(630,1310),plan(470,1510),plan(379,1660)];
 for(let i=0;floor!=='R'&&i<spine.length-1;i++){const a=spine[i],b=spine[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let j=0;j<len;j+=3){const t=j/len,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(pointInPolygon([x,z],footprint)){if(floor==='G'){if(!pointInPolygon([x,z],ATRIUM_VOID))cylinder(x,ceiling-.012,z,.105,.025,light);}else box(x,ceiling-.4,z,3.3,.055,.09,light,(j%2?1:-1)*.7);}}}
 chairBackTemplate.dispose();
 const details:THREE.Mesh[]=[];
 for(const batch of [shellBatches,detailBatches])for(const [m,geometries] of batch){const merged=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());if(!merged)continue;const mesh=new THREE.Mesh(merged,m);mesh.castShadow=false;mesh.receiveShadow=true;mesh.userData.interiorLayer=batch===shellBatches?'shell':'detail';if(batch===detailBatches)details.push(mesh);group.add(mesh);}
 return {group,barriers,footprint,setDetailsVisible(visible){details.forEach(mesh=>{mesh.visible=visible;});},dispose(){group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}

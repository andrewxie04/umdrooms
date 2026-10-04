import { buildGroundAuditoriumEnclosure } from './ground-auditorium-enclosure';
import { GROUND_AUDITORIUM_ENCLOSURE_SOLIDS } from './ground-auditorium-enclosure-layout';
import { buildNorthStair } from './north-stairs';
import { ANTONOV_EXTERIOR_ENVELOPE } from './antonov-exterior-layout';
import { buildAntonovShell } from './antonov-shell';
import { buildSouthStair } from './lobby-south-stair';
import { SOUTH_STAIR_OPENING } from './lobby-south-stair-layout';
import { GROUND_LOBBY_SLAB } from './layout';
import { buildCanopyEntrance } from './lobby-canopy';
import { buildCanopyStructure } from './canopy-structure';
import { buildCanopyBenches } from './canopy-benches';
import { buildSouthEntrance } from './lobby-south';
import { buildGroundNorthCorner } from './ground-north-corner';
import { northCornerShellEdge } from './ground-north-corner-layout';
import { southShellEdge } from './lobby-south-layout';
import { canopyShellEdge } from './lobby-canopy-layout';
import { concreteFinish, soffitFinish } from './finishes';
import { buildCourtyardEntrance } from './lobby-entrance';
import { courtyardShellEdge } from './lobby-entrance-layout';
import { buildLiftLanding, type LiftLandingModel } from './lifts';
import { buildAntonovExterior } from './antonov-exterior';
import { buildAuditoriumChairs, buildAntonovCeiling } from './auditorium-details';
import { buildFirstWestOffice, firstWestOfficeDesk } from './first-west-offices';
import { buildFirstWestMeeting } from './first-west-meetings';
import { buildImdLab } from './imd-lab';
import { buildWestSupport } from './west-support';
import { buildWestHuddle } from './west-huddles';
import { FOURTH_LOUNGE_TABLE, FOURTH_LOUNGE_COUNTER, FOURTH_LOUNGE_ROUND_TABLES } from './fourth-lounge-layout';
import { FIFTH_SERVICE_SHAFT } from './layout';
import { buildWestLift } from './west-core';
import { westStairForFloor } from './west-stair-layout';
import { buildWestStair } from './west-stairs';
import { buildSeminarAV } from './seminar-av';
import { buildHatchery } from './hatchery';
import { createConferenceAVBuilder } from './conference-av';
import { structuralColumnLayout } from './structure';
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
import { buildAmphitheater, amphitheaterHeight } from './amphitheater';
import { audCoordinates, antonovWayfinding, ANTONOV_TABLES, antonovHeight, antonovFloorPieces, GANNON_FRONT_HEIGHT, AUD_DEPTH, AUD_WIDTH, AUD_SCALE, auditoriumSeats, auditoriumSidePoint } from './auditorium';
import { GANNON_WORLD_FOOTPRINT, GANNON_DOOR_LEAVES, GANNON_PAIR_THRESHOLDS } from './gannon-ground-layout';
import { GANNON_FLOOR_PIECES, GANNON_TABLES } from './gannon-seating-layout';
import { GANNON_CEILING_PIECES, gannonWallSections, gannonCeilingHeight } from './gannon-section';
import { groundGuidePlan } from './ground-guide-layout';
import { officeFurniture, clearInside, meetingTable, meetingSeats, roomFrame, teachingTables } from './furniture';
import { STAIR_HOLE } from './circulation';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { footprintForFloor, fourthPlan, westFourthPlan, roomTitle, ROOF_GALLERY, ANTONOV_FOOTPRINT, ATRIUM_VOID, ROOMS, plan, groundPlan, type FloorId, type Point, type Polygon, type InteriorRoom, distanceToSegment, pointInPolygon } from './layout';

export interface Barrier {a:Point;b:Point;minY?:number;maxY?:number;}
export interface InteriorModel { group:THREE.Group; barriers:Barrier[]; footprint:Polygon; lift:LiftLandingModel|null; setDetailsVisible(visible:boolean):void; dispose():void; }

/** Keep the building shell visible from terraces/windows; cull distant furnishings.
 * Both sets share materials and retain per-material geometry batches. */
export function buildInteriorFloor(floor:FloorId):InteriorModel {
 const group=new THREE.Group(); const barriers:Barrier[]=[];
 const shellBatches=new Map<THREE.Material,THREE.BufferGeometry[]>();
 const detailBatches=new Map<THREE.Material,THREE.BufferGeometry[]>();
 let batches=shellBatches;
 const textures:THREE.Texture[]=[];
 const mat=(color:number,roughness=.75)=>new THREE.MeshStandardMaterial({color,roughness});
 const white=mat(0xe9e9e4), concrete=mat(0xffffff,floor==='G'?.72:.56), black=mat(0x171a1c), oak=mat(0x946333), metal=mat(0x939b9d,.32), blue=mat(0x24576b), yellow=mat(0xd9ae1a), lime=mat(0x789746), red=mat(0xa83c35);
 metal.metalness=.7;
 black.side=THREE.DoubleSide;
 const woodPixels=new Uint8Array(256*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<256;x++){
  const i=(y*256+x)*4,grain=Math.sin(y*1.8+Math.sin(x*.035)*.7)*5+Math.sin(y*.6+x*.004)*7;
  woodPixels[i]=164+grain*.65;woodPixels[i+1]=123+grain*.65;woodPixels[i+2]=82+grain*.65;woodPixels[i+3]=255;
 }
 const woodMap=new THREE.DataTexture(woodPixels,256,64);woodMap.colorSpace=THREE.SRGBColorSpace;woodMap.needsUpdate=true;woodMap.magFilter=THREE.LinearFilter;woodMap.generateMipmaps=true;woodMap.minFilter=THREE.LinearMipmapLinearFilter;woodMap.anisotropy=4;textures.push(woodMap);oak.map=woodMap;oak.color.setHex(0xffffff);oak.roughness=.62;
 const glass=new THREE.MeshStandardMaterial({color:0xd1dddb,transparent:true,opacity:.12,roughness:.14,depthWrite:false,side:THREE.DoubleSide});
 const gardenGlazing=glass.clone();gardenGlazing.color.setHex(0x66818a);gardenGlazing.opacity=.35;gardenGlazing.name='Auditorium garden glazing';
 const light=new THREE.MeshBasicMaterial({color:0xfff9e5});
 const screen=new THREE.MeshBasicMaterial({color:0xc4cbd0});
 const walnut=mat(0x71533b,.65);walnut.map=woodMap;const warmLight=new THREE.MeshBasicMaterial({color:0xffd8a0});
 const auditoriumTimber=walnut.clone();auditoriumTimber.color.setHex(0xbda084);auditoriumTimber.name='Antonov acoustic timber';
 const lobbySoffit=mat(0xa8b0b2,.42);lobbySoffit.metalness=.32;lobbySoffit.side=THREE.DoubleSide;
 if(floor==='G'){
  const finish=soffitFinish(true);textures.push(finish.map,finish.bumpMap);
  lobbySoffit.color.setHex(0xffffff);lobbySoffit.map=finish.map;lobbySoffit.bumpMap=finish.bumpMap;lobbySoffit.bumpScale=.002;
 }
 const galleryFabric=mat(0x283d47,.95),galleryCeiling=mat(0x737773);galleryCeiling.side=THREE.DoubleSide;
 const classroomFloor=mat(0x444b4c,.42), ceilingPanel=mat(0xd3d5d1);ceilingPanel.side=THREE.DoubleSide;
 const shadowPixels=new Uint8Array(64*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){
  const i=(y*64+x)*4,r=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5);
  shadowPixels[i+3]=Math.round(Math.pow(Math.max(0,1-r),1.5)*100);
 }
 const shadowMap=new THREE.DataTexture(shadowPixels,64,64);shadowMap.needsUpdate=true;shadowMap.magFilter=THREE.LinearFilter;textures.push(shadowMap);
 const contactShadow=new THREE.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
 const materials=[white,concrete,black,oak,metal,blue,yellow,lime,red,glass,gardenGlazing,light,screen,classroomFloor,ceilingPanel,contactShadow,walnut,auditoriumTimber,warmLight,galleryFabric,galleryCeiling,lobbySoffit];
 const brick=mat(0xffffff,.87);brick.side=THREE.DoubleSide;brick.name='Iribe brick masonry';materials.push(brick);
 const brickPixels=new Uint8Array(128*64*4),brickHeight=new Uint8Array(brickPixels.length);
 for(let y=0;y<64;y++)for(let x=0;x<128;x++){
  const row=Math.floor(y/32),column=(x+(row%2)*32)%64,mortar=y%32<2||column<2,i=(y*128+x)*4;
  // UMD's lounge photograph has earth-brown masonry with subdued joints.
  // These colors are photo-informed estimates, not calibrated material data.
  const noise=Math.sin(x*23+y*17)*6,shade=(Math.floor((x+(row%2)*32)/64)+row)%3*6;
  brickPixels[i]=mortar?109:133+noise+shade;brickPixels[i+1]=mortar?104:82+noise*.6+shade*.6;brickPixels[i+2]=mortar?93:53+noise*.5+shade*.4;brickPixels[i+3]=255;
  brickHeight[i]=brickHeight[i+1]=brickHeight[i+2]=mortar?70:202+noise;brickHeight[i+3]=255;
 }
 const brickMap=new THREE.DataTexture(brickPixels,128,64);brickMap.colorSpace=THREE.SRGBColorSpace;brickMap.wrapS=brickMap.wrapT=THREE.RepeatWrapping;brickMap.generateMipmaps=true;brickMap.minFilter=THREE.LinearMipmapLinearFilter;brickMap.magFilter=THREE.LinearFilter;brickMap.anisotropy=4;brickMap.needsUpdate=true;brick.map=brickMap;textures.push(brickMap);
 // Texture.clone shares its Source. Replacing the clone's image would also
 // replace the color pixels with gray height data on every masonry surface.
 const brickBump=new THREE.DataTexture(brickHeight,128,64);brickBump.wrapS=brickBump.wrapT=THREE.RepeatWrapping;brickBump.generateMipmaps=true;brickBump.minFilter=THREE.LinearMipmapLinearFilter;brickBump.magFilter=THREE.LinearFilter;brickBump.anisotropy=4;brickBump.needsUpdate=true;brick.bumpMap=brickBump;brick.bumpScale=.004;textures.push(brickBump);
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
 const floorFinish=concreteFinish(floor==='G');textures.push(floorFinish.map,floorFinish.bumpMap);
 concrete.map=floorFinish.map;concrete.bumpMap=floorFinish.bumpMap;concrete.bumpScale=.003;
 if(floorFinish.roughnessMap){textures.push(floorFinish.roughnessMap);concrete.roughnessMap=floorFinish.roughnessMap;}
 const footprint=footprintForFloor(floor);
 const ceiling=floor==='G'?6.3:floor==='R'?3.45:4.2;
 const communicating=communicatingStairForFloor(floor);
 const westStair=westStairForFloor(floor);
 const slabHoles=floor==='G'?[GANNON_WORLD_FOOTPRINT]:floor==='1'?[STAIR_HOLE,ATRIUM_VOID,SOUTH_STAIR_OPENING]:communicating?.upper===floor?[STAIR_HOLE,communicating.void]:[STAIR_HOLE];
 if(westStair&&floor!=='G')slabHoles.push(westStair.opening);
 surface(floor==='G'?GROUND_LOBBY_SLAB:footprint,0,concrete,slabHoles);
 // A top-only floor disappears when seen through a lower window. Give upper
 // slabs an underside and edge thickness so furnishings cannot appear to float
 // outside the building. Keep 10 mm clear of the lower ceiling to avoid z-fighting.
 if(floor!=='G'){
  const underside=mat(0xb7b9b3,.8);underside.side=THREE.BackSide;underside.name='Floor slab underside';materials.push(underside);
  surface(footprint,-.19,underside,slabHoles);
  for(const ring of [footprint,...slabHoles])ring.forEach((a,i)=>wall(a,ring[(i+1)%ring.length],.19,concrete,false,-.19,.025));
 }

 const ceilingHoles=floor==='G'?[STAIR_HOLE,ATRIUM_VOID,ANTONOV_FOOTPRINT,ANTONOV_EXTERIOR_ENVELOPE,SOUTH_STAIR_OPENING]:communicating?.lower===floor?[STAIR_HOLE,communicating.void]:[STAIR_HOLE];
 if(westStair&&floor===westStair.lower)ceilingHoles.push(westStair.opening);
 if(floor!=='R') surface(footprint,ceiling,floor==='G'?lobbySoffit:black,ceilingHoles);

 // The native Ground curve closes the auditorium below its upper volume.
 // Without it, lounge sightlines pass through the exposed seating tiers.
 if(floor==='G')buildGroundAuditoriumEnclosure({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers},brick,GROUND_AUDITORIUM_ENCLOSURE_SOLIDS);

 batches=detailBatches;
 buildNorthStair(floor,{box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers},brick);
 batches=shellBatches;
 // Curtain wall with individual panels and mullions, not opaque painted walls.
 for(let i=0;floor!=='R'&&i<footprint.length;i++) {
  const a=footprint[i],b=footprint[(i+1)%footprint.length];
  if(floor==='G'){
   if(courtyardShellEdge(a,b)||canopyShellEdge(a,b)||southShellEdge(a,b)||northCornerShellEdge(a,b))continue;
   const [ax,ay]=audCoordinates(a),[bx,by]=audCoordinates(b);
   // The standalone auditorium's curved front is masonry beside an outdoor
   // stair, as the plan and exterior photographs show. A curtain wall around
   // this part of the schematic ground outline would enclose the stair.
   if(Math.min(ax,bx)>1130&&Math.max(ay,by)<500)continue;
  }
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
  batches=shellBatches;
  if(antonov){surface(room.polygon,top,walnut);buildAntonovShell({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers},auditoriumTimber,brick,gardenGlazing);}
  else for(const piece of GANNON_CEILING_PIECES)surface(piece.polygon,piece.height,walnut);
  walnut.side=THREE.DoubleSide;
  const floorMaterial=classroomFloor;
  if(antonov){
   for(const {polygon,height,riser} of antonovFloorPieces()){
    surface(polygon,height||.01,floorMaterial);
    if(riser)polygon.forEach((a,i)=>wall(a,polygon[(i+1)%polygon.length],riser,floorMaterial,true,height-riser,.025));
   }
  }else {
   for(const {polygon,height,riser} of GANNON_FLOOR_PIECES){
    surface(polygon,height+.005,floorMaterial);
    if(riser)polygon.forEach((a,i)=>wall(a,polygon[(i+1)%polygon.length],riser,floorMaterial,true,height-riser,.025));
   }
   // Estimated downlight layout; attach to the provisional lower ceiling,
   // rather than leaving fixtures inside the upper auditorium standing space.
   for(const x of [354,373,397])for(const y of [112,154,192]){const p=groundGuidePlan(x,y);cylinder(p[0],gannonCeilingHeight(p)-.03,p[1],.13,.025,light);}
   // Native east doors are drawn open into the public corridor. Their plan
   // outlines are verified; panel height, finish and hardware are estimates.
   for(const leaf of GANNON_DOOR_LEAVES){
    surface(leaf.outline,2.5,walnut);
    leaf.outline.forEach((a,i)=>wall(a,leaf.outline[(i+1)%leaf.outline.length],2.5,walnut,true,0,.025));
   }
   for(const {a,b,center} of GANNON_PAIR_THRESHOLDS){
    wall(a,b,top-2.5,walnut,true,2.5);
    for(const jamb of [a,b])box(jamb[0],1.25,jamb[1],.035,2.5,.035,metal);
    label(roomTitle(room),center[0],2.86,center[1],-Math.atan2(b[1]-a[1],b[0]-a[0]),1.6);
   }
  }
  batches=detailBatches;
  const seats=auditoriumSeats(room.id),tableAngle=-Math.atan2(AUD_WIDTH[1],AUD_WIDTH[0]);
  buildAuditoriumChairs(seats,{box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
  for(const seat of seats){
   circleBarrier(seat.point[0],seat.point[1],.29,seat.height,1.18);
  }
  for(const table of (antonov?ANTONOV_TABLES:GANNON_TABLES)){
   const [a,b,c]=table.polygon,u:Point=[b[0]-a[0],b[1]-a[1]],v:Point=[c[0]-b[0],c[1]-b[1]];
   const width=Math.hypot(...u),depth=Math.hypot(...v),angle=-Math.atan2(u[1],u[0]);
   box(table.center[0],table.height+.75,table.center[1],width,.065,depth,white,angle);
   for(const offset of [-.38,.38])box(table.center[0]+u[0]*offset,table.height+.36,table.center[1]+u[1]*offset,.055,.72,depth*.7,metal,angle);
   table.polygon.forEach((p,i)=>barriers.push({a:p,b:table.polygon[(i+1)%4],minY:table.height,maxY:table.height+.8}));
  }
  const screenX=1218,screenCenter=274;
  for(const offset of (antonov?[-5.5,0,5.5]:[-4,4])){
   const p=antonov?antonovWayfinding(screenX,screenCenter+offset/AUD_SCALE):groundGuidePlan(333,154+offset/.1536484);
   box(p[0],antonov?4:GANNON_FRONT_HEIGHT+2.1,p[1],antonov?4.8:3.2,antonov?2.7:1.7,.09,black,tableAngle);
   box(p[0]+AUD_DEPTH[0]*.055,antonov?4:GANNON_FRONT_HEIGHT+2.1,p[1]+AUD_DEPTH[1]*.055,antonov?4.65:3.05,antonov?2.55:1.55,.025,screen,tableAngle);
  }
  // Warm angular lighting follows the folded acoustic panels in the Antonov photo.
  if(antonov)for(let x=1240;x<1480;x+=32){
   for(const side of [-1,1]){
    const p=auditoriumSidePoint(x,side,2),q=auditoriumSidePoint(x+13,side,10),r=p,end=auditoriumSidePoint(x+26,side,2);
    const low=(antonovHeight(p)??0)+.7;
    const corners=[[p[0],low-.3,p[1]],[p[0],low+3.8,p[1]],[end[0],low+3.8,end[1]],[end[0],low-.3,end[1]]];
    for(let i=0;i<4;i++){
     const points=[corners[i],corners[(i+1)%4],[q[0],low+1.8,q[1]]];
     const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));g.setIndex([0,1,2]);g.computeVertexNormals();put(g,auditoriumTimber);
    }
    const lines:[[number,number,number],[number,number,number]][]=[[[p[0],low,p[1]],[q[0],low+1.8,q[1]]],[[q[0],low+1.8,q[1]],[r[0],low+3.5,r[1]]]];
    for(const [a,b] of lines){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),g=new THREE.CylinderGeometry(.035,.035,start.distanceTo(end),6);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),end.clone().sub(start).normalize()));g.translate(...start.add(end).multiplyScalar(.5).toArray());put(g,warmLight);}
   }
  }
  if(antonov)buildAntonovCeiling({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers},auditoriumTimber);
 }
 function office(room:InteriorRoom){
  const f=officeFurniture(room),{desk:[x,z],u:[ux,uz],n:[nx,nz],angle,width}=f;
  surface(room.polygon,.01,classroomFloor);surface(room.polygon,3.15,ceilingPanel);
  box(x,.75,z,width,.065,.7,white,angle);
  for(const side of [-1,1])box(x+ux*side*(width/2-.1),.36,z+uz*side*(width/2-.1),.05,.72,.55,metal,angle);
  const corners:Point[]=[[-width/2,-.35],[width/2,-.35],[width/2,.35],[-width/2,.35]].map(([u,v])=>[x+ux*u+nx*v,z+uz*u+nz*v]);
  corners.forEach((a,i)=>barriers.push({a,b:corners[(i+1)%4]}));
  box(x-nx*.15,1.04,z-nz*.15,.48,.32,.04,black,angle);box(x-nx*.15,.84,z-nz*.15,.04,.18,.04,metal);
  for(const seat of f.chairs)chair(seat.point[0],seat.point[1],seat.angle,seat.swivel?black:blue,seat.swivel);
  if(f.meeting)table(f.meeting.point[0],f.meeting.point[1],f.meeting.radius,white);
  const lamp=f.at(0,2.4);box(lamp[0],3.09,lamp[1],1.8,.04,.13,light,angle+Math.PI/2);
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
 function resetZone(){
  for(const fitted of [FOURTH_LOUNGE_TABLE,FOURTH_LOUNGE_COUNTER]){
   const [a,b,c]=fitted.polygon,dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),u:Point=[dx/length,dz/length],angle=-Math.atan2(dz,dx),width=Math.hypot(c[0]-b[0],c[1]-b[1]),[x,z]=fitted.center;
   const top=new THREE.ExtrudeGeometry(new THREE.Shape(fitted.polygon.map(([x,z])=>new THREE.Vector2(x,-z))),{depth:.06,bevelEnabled:false});
   top.rotateX(-Math.PI/2);top.translate(0,.70,0);put(top,white);
   for(const offset of [-length*.38,length*.38])box(x+u[0]*offset,.38,z+u[1]*offset,.07,.76,Math.max(.25,width-.15),metal,angle);
   fitted.polygon.forEach((a,i)=>barriers.push({a,b:fitted.polygon[(i+1)%4],minY:0,maxY:.8}));
   for(const [i,seat] of fitted.chairs.entries())chair(seat.point[0],seat.point[1],seat.angle,i%2?blue:lime);
  }
  for(const fitted of FOURTH_LOUNGE_ROUND_TABLES){
   table(fitted.center[0],fitted.center[1],fitted.radius,white);
   for(const [i,seat] of fitted.chairs.entries())chair(seat.point[0],seat.point[1],seat.angle,i%2?blue:lime);
  }
  // Exposed services and broken linear pendant runs visible in HDR's reset-zone
  // photographs. Furniture positions remain approximate between viewpoints.
  const {center:[x,z],polygon:[a,b]}=FOURTH_LOUNGE_TABLE,length=Math.hypot(b[0]-a[0],b[1]-a[1]),u:Point=[(b[0]-a[0])/length,(b[1]-a[1])/length],angle=-Math.atan2(u[1],u[0]);
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
  if(room.id==='north-reset-zone'){resetZone();return;}
  if(room.id==='west-reset-zone'){
   const center=westFourthPlan(270,96);table(center[0],center[1],.6,white);
   for(let i=0;i<4;i++){const a=i*Math.PI/2,p:Point=[center[0]+Math.sin(a)*.93,center[1]+Math.cos(a)*.93];if(clearInside(room,p,.3))chair(p[0],p[1],a,lime);}
   const angle=-Math.atan2(westFourthPlan(230,150)[1]-center[1],westFourthPlan(230,150)[0]-center[0]);
   for(const [x,y] of [[209,179],[186,208]]){const p=westFourthPlan(x,y);if(clearInside(room,p,.45))chair(p[0],p[1],angle,blue);}
   return;
  }
  batches=shellBatches;
  const roomBase=room.id==='0318'?GANNON_FRONT_HEIGHT:0;
  const wallHeight=room.id==='0324'?10.5:room.id==='0318'?3.3-roomBase:room.kind==='classroom'?3.25:ceiling;
  const defaultWallMaterial=room.id==='0324'?auditoriumTimber:room.kind==='auditorium'?walnut:room.kind==='lab'?glass:white;
  const nearestEdge=(p:Point)=>room.polygon.reduce((best,a,i)=>distanceToSegment(p,a,room.polygon[(i+1)%room.polygon.length])<distanceToSegment(p,room.polygon[best],room.polygon[(best+1)%room.polygon.length])?i:best,0);
  const nearest=nearestEdge(room.door),doors=[room.door,...(room.additionalDoors??[])];
  if(room.id!=='0324')room.polygon.forEach((a,i)=>{
   if(room.exteriorEdges?.includes(i))return;
   const wallMaterial=room.glazedEdges?.includes(i)?glass:room.timberEdges?.includes(i)?oak:['0102','0108','0110','0116'].includes(room.id)&&(i===1||i===3)?white:defaultWallMaterial;
   const solidWall=(start:Point,end:Point,height:number,material:THREE.Material,collision=true,base=0)=>{
    if(room.id==='0318'&&base===roomBase){
     for(const part of gannonWallSections(start,end))wall(part.a,part.b,part.top-base,material,collision,base);
     return;
    }
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
   const shellWall=(start:Point,end:Point,height:number,material:THREE.Material,collision=true,base=roomBase)=>{
    // These two east edges belong to the upper Antonov enclosure. Ground's
    // source shows Gannon's paired doors and the open corridor beneath that
    // projection, not an opaque wall through their thresholds. The interface
    // height is provisional until a measured auditorium section is available.
    if(room.id==='0324'&&[3,4].includes(i)&&base===0){solidWall(start,end,height-3.3,material,collision,3.3);return;}
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
   if(['0102','0108','0110','0116'].includes(room.id)&&i===0){
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
    if(room.kind==='office'||room.kind==='workroom'||['0102','0108','0110','0116'].includes(room.id)){
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
  else if(room.id==='4-west-support-counter'||room.id==='4-west-support-long')buildWestSupport(room.id,sandboxBuilder());
  else if(room.id==='1127'||room.id.startsWith('1-west-meeting-')){surface(room.polygon,.01,classroomFloor);buildFirstWestMeeting(room,{...sandboxBuilder(),chair});}
  else if(room.kind==='huddle')buildWestHuddle(room,{...sandboxBuilder(),chair});
  else if(firstWestOfficeDesk(room)){surface(room.polygon,.01,classroomFloor);buildFirstWestOffice(room,{...sandboxBuilder(),chair});}
  else if(room.kind==='office')office(room);
  else if(room.kind==='workroom')workroom(room);
  else if(room.kind==='restroom')buildRestroom(room,{box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
  else if(room.kind==='seminar')buildSeminarAV(room,sandboxBuilder());
  else if(room.kind==='classroom') classroom(room);
  else if(room.kind==='conference') conference(room);
  else if(room.id==='0110')buildImdLab(room,sandboxBuilder());
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
   const candidates=room.polygon.map((a,i)=>({a,b:room.polygon[(i+1)%room.polygon.length],i})).filter(({a,b,i})=>!room.exteriorEdges?.includes(i)&&!room.glazedEdges?.includes(i)&&Math.hypot(b[0]-a[0],b[1]-a[1])>(i===nearest?8:4));
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
 batches=shellBatches;
 if(floor==='5')FIFTH_SERVICE_SHAFT.forEach((a,i)=>wall(a,FIFTH_SERVICE_SHAFT[(i+1)%FIFTH_SERVICE_SHAFT.length],4.2,white));
 if(floor==='4')buildWestLift({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
 buildSouthStair(floor,{box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers},concrete);
 buildWestStair(floor,{box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
 batches=detailBatches;
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
 for(const {center:[x,z],radius} of structuralColumnLayout(floor)) {
  // Ground includes the sunken entrance court. Extend its source columns to
  // the local floor, rather than leaving their bases suspended at lobby level.
  const base=floor==='G'?(amphitheaterHeight([x,z])??0):0;
  cylinder(x,(ceiling+base)/2,z,radius,ceiling-base,white);
  for(let i=0;i<16;i++) {
   const a=i/16*Math.PI*2,b=(i+1)/16*Math.PI*2;
   barriers.push({a:[x+Math.cos(a)*radius,z+Math.sin(a)*radius],b:[x+Math.cos(b)*radius,z+Math.sin(b)*radius],minY:base,maxY:ceiling});
  }
 }
 if(communicating)buildCommunicatingStair(floor,{box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
 if(floor==='1')buildFamilyGarden({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
 if(floor==='G')buildAntonovExterior({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers},concrete,brick);
 if(floor==='G'||floor==='1')buildAtrium(floor,{box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
 const lift=buildLiftLanding(floor,{box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
 if(lift){for(const car of [0,1] as const)lift.setDoorProgress(car,0);group.add(lift.doors);}
 // Public atrium furniture and material cues from HDR photographs.
 if(floor==='G') {
  buildCanopyEntrance({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers},brick);
  buildCanopyStructure({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
  buildCanopyBenches({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
  buildSouthEntrance({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers},brick);
  buildGroundNorthCorner({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
  buildCourtyardEntrance({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
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
 // Keep the complete fixture clear of voids and the enclosed stair's own
 // lighting. Testing its enclosing radius also catches a strip whose center
 // is outside the shaft but whose end would pierce the wall.
 const lightExclusions=[...ceilingHoles,...(westStair?[westStair.shaft]:[]),...(lift?[lift.layout.core]:[])];
 for(let i=0;floor!=='R'&&i<spine.length-1;i++){
  const a=spine[i],b=spine[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
  for(let j=0;j<len;j+=3){
   const t=j/len,p:Point=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],radius=floor==='G'?.11:1.66;
   if(!pointInPolygon(p,footprint)||lightExclusions.some(hole=>pointInPolygon(p,hole)||hole.some((v,k)=>distanceToSegment(p,v,hole[(k+1)%hole.length])<radius)))continue;
   if(floor==='G')cylinder(p[0],ceiling-.012,p[1],.105,.025,light);
   else box(p[0],ceiling-.4,p[1],3.3,.055,.09,light,(j%2?1:-1)*.7);
  }
 }
 chairBackTemplate.dispose();
 const details:THREE.Mesh[]=[];
 for(const batch of [shellBatches,detailBatches])for(const [m,geometries] of batch){const merged=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());if(!merged)continue;const mesh=new THREE.Mesh(merged,m);mesh.castShadow=!m.transparent&&!(m instanceof THREE.MeshBasicMaterial);mesh.receiveShadow=true;mesh.userData.interiorLayer=batch===shellBatches?'shell':'detail';if(batch===detailBatches)details.push(mesh);group.add(mesh);}
 return {group,barriers,footprint,lift,setDetailsVisible(visible){details.forEach(mesh=>{mesh.visible=visible;});},dispose(){group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}

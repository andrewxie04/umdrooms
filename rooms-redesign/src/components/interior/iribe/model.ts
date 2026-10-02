import * as THREE from 'three';
import { buildRoof } from './roof';
import { GANNON_AISLES, GANNON_PLAN, AUD_AISLES, AUD_DEPTH, AUD_WIDTH, AUD_SCALE, ROW_START, ROW_PITCH, ROW_RISE, auditoriumSeats, auditoriumStrip, auditoriumSidePoint } from './auditorium';
import { clearInside, meetingTable, roomFrame, teachingTables } from './furniture';
import { ATRIUM_LANDING, ENCLOSED_FLIGHTS, STAIR_CENTER, STAIR_HOLE } from './circulation';
import { FLOOR_HEIGHT } from './layout';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { footprintForFloor, fourthPlan, roomTitle, ROOF_GALLERY, ANTONOV_FOOTPRINT, ATRIUM_VOID, ROOMS, plan, groundPlan, type FloorId, type Point, type Polygon, type InteriorRoom, distanceToSegment, pointInPolygon } from './layout';

export interface Barrier {a:Point;b:Point;minY?:number;maxY?:number;}
export interface InteriorModel { group:THREE.Group; barriers:Barrier[]; footprint:Polygon; dispose():void; }

/** Material batches keep draw calls low while adjacent floors remain visible. */
export function buildInteriorFloor(floor:FloorId):InteriorModel {
 const group=new THREE.Group(); const barriers:Barrier[]=[];
 const batches=new Map<THREE.Material,THREE.BufferGeometry[]>();
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
 const light=new THREE.MeshBasicMaterial({color:0xfff9e5});
 const screen=new THREE.MeshBasicMaterial({color:0xc4cbd0});
 const walnut=mat(0x71533b,.65);walnut.map=woodMap;const warmLight=new THREE.MeshBasicMaterial({color:0xffd8a0});
 const galleryFabric=mat(0x283d47,.95),galleryCeiling=mat(0x737773);galleryCeiling.side=THREE.DoubleSide;
 const classroomFloor=mat(0x444b4c,.42), ceilingPanel=mat(0xd3d5d1);ceilingPanel.side=THREE.DoubleSide;
 const shadowPixels=new Uint8Array(64*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){
  const i=(y*64+x)*4,r=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5);
  shadowPixels[i+3]=Math.round(Math.pow(Math.max(0,1-r),1.5)*100);
 }
 const shadowMap=new THREE.DataTexture(shadowPixels,64,64);shadowMap.needsUpdate=true;shadowMap.magFilter=THREE.LinearFilter;textures.push(shadowMap);
 const contactShadow=new THREE.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
 const materials=[white,concrete,black,oak,metal,blue,yellow,lime,red,glass,light,screen,classroomFloor,ceilingPanel,contactShadow,walnut,warmLight,galleryFabric,galleryCeiling];
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
  const g=new THREE.PlaneGeometry(width,width/6);g.rotateY(angle);g.translate(x,y,z);put(g,material);
 };
 // Subtle poured-concrete grain and joints, generated locally (no photo downloads).
 const floorCanvas=document.createElement('canvas');floorCanvas.width=256;floorCanvas.height=256;
 const floorCtx=floorCanvas.getContext('2d')!;floorCtx.fillStyle='#b7b6ad';floorCtx.fillRect(0,0,256,256);
 let seed=41;for(let i=0;i<6000;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%256;seed=(seed*1664525+1013904223)>>>0;const z=seed%256;floorCtx.fillStyle=i%2?'rgba(255,255,255,.05)':'rgba(35,35,30,.035)';floorCtx.fillRect(x,z,1,1);}
 floorCtx.strokeStyle='rgba(70,70,60,.19)';floorCtx.lineWidth=1;floorCtx.strokeRect(0,0,256,256);
 const floorMap=new THREE.CanvasTexture(floorCanvas);floorMap.wrapS=floorMap.wrapT=THREE.RepeatWrapping;floorMap.repeat.set(.5,.5);floorMap.colorSpace=THREE.SRGBColorSpace;textures.push(floorMap);concrete.map=floorMap;concrete.color.setHex(0xffffff);
 const footprint=footprintForFloor(floor);
 const ceiling=floor==='G'?6.3:floor==='R'?3.45:4.2;
 surface(footprint,0,concrete,floor==='G'?[]:floor==='1'?[STAIR_HOLE,ATRIUM_VOID]:[STAIR_HOLE]);
 if(floor!=='R') surface(footprint,ceiling,black,floor==='G'?[STAIR_HOLE,ATRIUM_VOID,ANTONOV_FOOTPRINT]:[STAIR_HOLE]);

 // Solid stairwell walls enclose the switchback flights; the corridor entry
 // stays open across both the ascending and descending landings.
 {
  const [sx,sz] = STAIR_CENTER;
  wall([sx-1.85,sz+4.3],[sx-1.85,sz-3.8],ceiling,white);
  wall([sx-1.85,sz-3.8],[sx+1.85,sz-3.8],ceiling,white);
  wall([sx+1.85,sz-3.8],[sx+1.85,sz+4.3],ceiling,white);
 }
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
 // The top landing joins the sculptural stair to the mezzanine floor.
 if (floor === 'G' || floor === '1') {
  const { from: a, to: b, width } = ATRIUM_LANDING;
  const length = Math.hypot(b[0]-a[0], b[2]-a[2]);
  const dx = (b[0]-a[0])/length, dz = (b[2]-a[2])/length;
  if (floor === 'G') box((a[0]+b[0])/2, a[1]-.1, (a[2]+b[2])/2, length, .2, width, white, -Math.atan2(dz,dx));
  for (const side of [-1,1]) {
   const start:Point = [a[0]-dz*width/2*side,a[2]+dx*width/2*side];
   const end:Point = [b[0]-dz*width/2*side,b[2]+dx*width/2*side];
   if (floor === '1') wall(start,end,1.1,white,true,0,.07);
  }
 }
 // Curtain wall with individual panels and mullions, not opaque painted walls.
 for(let i=0;floor!=='R'&&i<footprint.length;i++) {
  const a=footprint[i],b=footprint[(i+1)%footprint.length];
  const count=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.5);
  wall(a,b,ceiling,glass);
  wall(a,b,.1,metal,false,.08);
  wall(a,b,.12,metal,false,ceiling*.54);
  for(let j=0;j<=count;j++){const t=j/count;box(a[0]+(b[0]-a[0])*t,(ceiling)/2,a[1]+(b[1]-a[1])*t,.07,ceiling,.07,metal);}
 }
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
  const count=gallery?5:Math.max(2,Math.floor(length/.85));
  for(let i=0;i<count;i++)for(const side of [-1,1]){
   const along=(i-(count-1)/2)*.85,across=side*(width/2+.35);
   const cx=x+u[0]*along+v[0]*across,cz=z+u[1]*along+v[1]*across,rotation=Math.atan2(v[0]*side,v[1]*side);
   if(gallery){
    const seat=new THREE.SphereGeometry(1,12,8);seat.scale(.255,.065,.235);seat.rotateY(rotation);seat.translate(cx,.48,cz);put(seat,galleryFabric);
    const back=new THREE.SphereGeometry(1,12,8);back.scale(.255,.26,.065);back.rotateX(-.12);back.rotateY(rotation);back.translate(cx+Math.sin(rotation)*.19,.73,cz+Math.cos(rotation)*.19);put(back,galleryFabric);
    for(const dx of [-.18,.18])for(const dz of [-.16,.16])box(cx+Math.cos(rotation)*dx+Math.sin(rotation)*dz,.24,cz-Math.sin(rotation)*dx+Math.cos(rotation)*dz,.024,.46,.024,black);
    circleBarrier(cx,cz,.26);contact(cx,cz,.55);
   }else chair(cx,cz,rotation,blue,true);
  }
 }
 function sandbox(room:InteriorRoom){
  const f=roomFrame(room);let hasDemo=false;
  for(let u=f.minU+2.6;u<f.maxU-2;u+=4.5)for(let v=f.minV+2.5;v<f.maxV-2;v+=4.2){
   const [x,z]=f.at(u,v);if(!clearInside(room,[x,z],1.85)||Math.hypot(x-room.door[0],z-room.door[1])<3)continue;
   box(x,.91,z,2.5,.1,1.15,oak,f.angle);
   for(const a of [-1.1,1.1])for(const b of [-.44,.44]){const p=f.at(u+a,v+b);box(p[0],.43,p[1],.07,.86,.07,metal);}
   for(const side of [-1,1]){
    const p=f.at(u,v+side*.95);cylinder(p[0],.62,p[1],.23,.065,yellow);cylinder(p[0],.29,p[1],.035,.58,metal);circleBarrier(p[0],p[1],.23);
   }
   const corners=[[-1.25,-.575],[1.25,-.575],[1.25,.575],[-1.25,.575]].map(([a,b])=>f.at(u+a,v+b));
   corners.forEach((a,i)=>barriers.push({a,b:corners[(i+1)%4]}));
   // A small electronics demonstration on the workbench, like the LED cube
   // photographed in UMD's guide; this is geometry rather than a photo overlay.
   if(!hasDemo){box(x,1.19,z,.42,.44,.42,glass);
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let k=0;k<3;k++)box(x+(i-1)*.13,1.04+j*.13,z+(k-1)*.13,.025,.025,.025,light);hasDemo=true;
   }
  }
  const edge=room.polygon.map((a,i)=>({a,b:room.polygon[(i+1)%room.polygon.length]})).sort((a,b)=>distanceToSegment(room.door,b.a,b.b)-distanceToSegment(room.door,a.a,a.b))[0];
  const dx=edge.b[0]-edge.a[0],dz=edge.b[1]-edge.a[1],len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len;
  const mx=(edge.a[0]+edge.b[0])/2,mz=(edge.a[1]+edge.b[1])/2;
  const side=pointInPolygon([mx-uz*.5,mz+ux*.5],room.polygon)?1:-1,nx=-uz*side,nz=ux*side,angle=-Math.atan2(uz,ux);
  const cx=mx+nx*.42,cz=mz+nz*.42;
  for(let i=0;i<4;i++){
   const x=cx+ux*(i-1.5)*.78,z=cz+uz*(i-1.5)*.78;
   box(x,1.2,z,.76,2.4,.58,metal,angle);
   box(x+nx*.305,1.2,z+nz*.305,.65,2.2,.025,glass,angle);
   // Recessed openings with pale shelves behind the glazed doors.
   box(x+nx*.295,1.2,z+nz*.295,.62,2.16,.018,black,angle);
   for(let h=.35;h<2.3;h+=.45){box(x+nx*.32,h,z+nz*.32,.62,.035,.035,white,angle);box(x+nx*.32+ux*.14,h+.12,z+nz*.32+uz*.14,.22,.19,.025,h<1?yellow:blue,angle);}
  }
  label('sandbox',cx+nx*.34,2.78,cz+nz*.34,Math.atan2(nx,nz),3.6);
  const ca:Point=[cx-ux*1.58+nx*.34,cz-uz*1.58+nz*.34],cb:Point=[cx+ux*1.58+nx*.34,cz+uz*1.58+nz*.34];barriers.push({a:ca,b:cb});
 }
 function auditorium(room:InteriorRoom){
  const antonov=room.id==='0324',top=antonov?10.5:3.3;
  surface(room.polygon,top,walnut);walnut.side=THREE.DoubleSide;
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
   table(meeting[0],meeting[1],.43,white);
   for(const side of [-1,1])chair(meeting[0]+ux*.73*side,meeting[1]+uz*.73*side,Math.atan2(ux*side,uz*side),blue);
  }
  box(mx+nx*2.4,3.09,mz+nz*2.4,1.8,.04,.13,light,angle+Math.PI/2);
 }
 function workroom(room:InteriorRoom){
  const f=roomFrame(room);surface(room.polygon,.01,classroomFloor);surface(room.polygon,3.2,ceilingPanel);
  // Six work positions around the central bench, as drawn in the HDR plan.
  const cu=(f.minU+f.maxU)/2,cv=(f.minV+f.maxV)/2;
  const center=f.at(cu,cv);
  box(center[0],.75,center[1],2.7,.065,1.4,white,f.angle);
  for(const offset of [-1.1,1.1]){const p=f.at(cu+offset,cv);box(p[0],.36,p[1],.06,.72,1.15,metal,f.angle);}
  const corners=[[-1.35,-.7],[1.35,-.7],[1.35,.7],[-1.35,.7]].map(([a,b])=>f.at(cu+a,cv+b));corners.forEach((a,i)=>barriers.push({a,b:corners[(i+1)%4]}));
  for(const side of [-1,1])for(const offset of [-.9,0,.9]){
   const p=f.at(cu+offset,cv+side*1.1);if(clearInside(room,p,.4)&&Math.hypot(p[0]-room.door[0],p[1]-room.door[1])>1.1)chair(p[0],p[1],f.angle+(side===1?0:Math.PI),black,true);
   const screenPos=f.at(cu+offset,cv+side*.2);box(screenPos[0],1.02,screenPos[1],.44,.29,.04,black,f.angle);box(screenPos[0],.83,screenPos[1],.04,.16,.04,metal);
  }
  for(const side of [-1,1]){const p=f.at(cu,cv+side*1.3);box(p[0],3.14,p[1],2.6,.04,.13,light,f.angle);}
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
  if(room.kind==='garden')return;
  if(room.id==='north-reset-zone'){resetZone(room);return;}
  const wallHeight=room.id==='0324'?10.5:room.id==='0318'?3.3:room.kind==='classroom'?3.25:ceiling;
  const wallMaterial=room.kind==='auditorium'?walnut:room.kind==='lab'?glass:white;
  const nearestEdge=(p:Point)=>room.polygon.reduce((best,a,i)=>distanceToSegment(p,a,room.polygon[(i+1)%room.polygon.length])<distanceToSegment(p,room.polygon[best],room.polygon[(best+1)%room.polygon.length])?i:best,0);
  const nearest=nearestEdge(room.door),doors=[room.door,...(room.additionalDoors??[])];
  room.polygon.forEach((a,i)=>{
   if(room.exteriorEdges?.includes(i))return;
   const b=room.polygon[(i+1)%room.polygon.length];
   const len=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/len,dz=(b[1]-a[1])/len,half=(room.doorWidth??1.6)/2;
   const openings=doors.filter(p=>nearestEdge(p)===i).map(p=>Math.max(half+.1,Math.min(len-half-.1,(p[0]-a[0])*dx+(p[1]-a[1])*dz))).sort((a,b)=>a-b);
   if(!openings.length){wall(a,b,wallHeight,room.id==='6217'&&i===1?glass:wallMaterial);return;}
   let cursor=a;
   for(const t of openings){
    const l:Point=[a[0]+dx*(t-half),a[1]+dz*(t-half)],r:Point=[a[0]+dx*(t+half),a[1]+dz*(t+half)];
    wall(cursor,l,wallHeight,wallMaterial);wall(l,r,wallHeight-2.5,wallMaterial,false,2.5);cursor=r;
    if(room.kind==='office'||room.kind==='workroom'){
     for(const jamb of [l,r])box(jamb[0],1.25,jamb[1],.035,2.5,.18,metal,-Math.atan2(dz,dx));
     wall(l,r,.035,metal,false,2.48,.18);
    }

    if(room.listed!==false)for(const side of [-1,1])label(roomTitle(room),(l[0]+r[0])/2-dz*.085*side,2.85,(l[1]+r[1])/2+dx*.085*side,-Math.atan2(dz,dx)+(side===1?0:Math.PI),3.4);
   }
   wall(cursor,b,wallHeight,wallMaterial);
  });
  const xs=room.polygon.map(p=>p[0]),zs=room.polygon.map(p=>p[1]);
  const x=(Math.min(...xs)+Math.max(...xs))/2,z=(Math.min(...zs)+Math.max(...zs))/2;
  if(room.kind==='office')office(room);
  else if(room.kind==='workroom')workroom(room);
  else if(room.kind==='classroom') classroom(room);
  else if(room.kind==='conference') conference(room);
  else if(room.id==='1231') sandbox(room);
  else if(room.kind==='lab') {
   for(const dx of [-1.7,1.7])for(const dz of [-2.5,0,2.5]){box(x+dx,.84,z+dz,2,.1,1.1,oak);for(const offset of [-.8,.8])box(x+dx+offset,.4,z+dz,.07,.8,.8,metal);box(x+dx,1.2,z+dz, .8,.55,.12,screen);}
  } else if(room.kind==='auditorium') {
   auditorium(room);
  } else if(room.id!=='4105'&&clearInside(room,[x,z],1.45))tableSet(x,z);
  if(room.kind==='classroom'||(room.kind==='conference'&&room.id!=='6217')) {
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
 ROOMS.filter(r=>r.floor===floor).forEach(roomShell);
 if(floor==='4'){
  // The public upper-floor photos show exposed services over the corridors.
  // Their exact routing is estimated; these runs follow the traced circulation.
  for(const [start,end] of [
   [fourthPlan(650,801),fourthPlan(1040,852.48)],
   [fourthPlan(620,953),fourthPlan(1040,953)],
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
  buildRoof({box,cylinder,surface,wall,put,label,palette:{white,oak,metal,glass,black,light},materials,textures,barriers});
  const [px,pz]=ROOF_GALLERY.polygon.reduce<Point>((s,p)=>[s[0]+p[0]/4,s[1]+p[1]/4],[0,0]);box(px,3.12,pz,.04,.48,.04,metal);box(px,2.84,pz,.48,.19,.4,white);box(px,2.84,pz-.205,.15,.1,.015,black);
 }
 // White structural columns follow the public circulation edges.
 const columns=floor==='G' ? [[740,770],[905,840],[1180,897],[1180,655],[1100,610],[1400,620],[1460,435]] .map(([x,y])=>groundPlan(x,y)) : [[540,680],[745,680],[544,940],[772,940],[733,1195],[701,1390],[529,1535],[360,1600]].map(([x,y])=>plan(x,y));
 for(const [x,z] of floor==='R'?[]:columns) {
  if(floor==='G'&&pointInPolygon([x,z],ANTONOV_FOOTPRINT))continue;
  cylinder(x,ceiling/2,z,.3,ceiling,white);
  for(let i=0;i<16;i++) {
   const a=i/16*Math.PI*2,b=(i+1)/16*Math.PI*2;
   barriers.push({a:[x+Math.cos(a)*.3,z+Math.sin(a)*.3],b:[x+Math.cos(b)*.3,z+Math.sin(b)*.3]});
  }
 }
 // Wood-slatted elevator core and the wrapping white stair are the atrium's
 // defining form in HDR's photographed view.
 if(floor==='G'||floor==='1') {
  const [cx,cz]=groundPlan(1080,810);const h=floor==='G'?6.3:4.15;
  cylinder(cx,h/2,cz,1.6,h,oak);
  for(let i=0;i<96;i++){const a=i/96*Math.PI*2;box(cx+Math.cos(a)*1.61,h/2,cz+Math.sin(a)*1.61,.035,h,.07,black,a);}
  for(let i=0;i<44;i++) {
   const a=-Math.PI*.8 + i/44*Math.PI*1.5;
   const y=(i+1)/44*6.5;
   if(floor==='G'){box(cx+Math.cos(a)*2.6,y-.09,cz+Math.sin(a)*2.6,1.8,.18,.34,white,-a);box(cx+Math.cos(a)*3.5,y+.5,cz+Math.sin(a)*3.5,.065,1,.36,white,-a);}
  }
  for(let i=0;i<32;i++){const a=i/32*Math.PI*2,b=(i+1)/32*Math.PI*2;barriers.push({a:[cx+Math.cos(a)*1.65,cz+Math.sin(a)*1.65],b:[cx+Math.cos(b)*1.65,cz+Math.sin(b)*1.65]});}
 }
 // Public atrium furniture and material cues from HDR photographs.
 if(floor==='G') {
  for(const [px,py] of [[1100,680],[1180,650],[1230,735],[1140,760]]){
   const [x,z]=groundPlan(px,py);box(x,.35,z,2.7,.55,.85,yellow);box(x,.75,z+.28,2.7,.5,.27,yellow);table(x,z-1,.65,white);
  }
  for(const [px,py] of [[950,755],[1000,720],[1040,670]]){const [x,z]=groundPlan(px,py);box(x,1.05,z,2.8,.1,1.05,white);box(x-1.3,.52,z,.14,1.05,1.05,white);box(x+1.3,.52,z,.14,1.05,1.05,white);for(const dx of [-.85,0,.85]){cylinder(x+dx,.73,z+.9,.23,.08,yellow);cylinder(x+dx,.35,z+.9,.035,.7,metal);}}
  const [cx,cz]=groundPlan(851,687);box(cx,.7,cz,6,1.4,1.2,oak);label('BREAKPOINT',cx,2.3,cz,0,4);
 }
 // Irregular suspended luminous strips, spaced along the curved building spine.
 const spine:Point[]=[plan(633,580),plan(640,900),plan(642,1130),plan(630,1310),plan(470,1510),plan(379,1660)];
 for(let i=0;floor!=='R'&&i<spine.length-1;i++){const a=spine[i],b=spine[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let j=0;j<len;j+=3){const t=j/len,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(pointInPolygon([x,z],footprint))box(x,ceiling-.4,z,3.3,.055,.09,light,(j%2?1:-1)*.7);}}
 chairBackTemplate.dispose();
 for(const [m,geometries] of batches){const merged=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());if(!merged)continue;const mesh=new THREE.Mesh(merged,m);mesh.castShadow=false;mesh.receiveShadow=true;group.add(mesh);}
 return {group,barriers,footprint,dispose(){group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}

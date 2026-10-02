import * as THREE from 'three';
import { ENCLOSED_FLIGHTS, STAIR_HOLE } from './circulation';
import { FLOOR_HEIGHT } from './layout';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ATRIUM_VOID, MAIN_FOOTPRINT, GROUND_FOOTPRINT, ROOMS, plan, groundPlan, type FloorId, type Point, type Polygon, type InteriorRoom, distanceToSegment, pointInPolygon } from './layout';

export interface Barrier {a:Point;b:Point;}
export interface InteriorModel { group:THREE.Group; barriers:Barrier[]; footprint:Polygon; dispose():void; }

/** One resident floor at a time keeps the interior independent of campus GPU cost. */
export function buildInteriorFloor(floor:FloorId):InteriorModel {
 const group=new THREE.Group(); const barriers:Barrier[]=[];
 const batches=new Map<THREE.Material,THREE.BufferGeometry[]>();
 const textures:THREE.Texture[]=[];
 const mat=(color:number,roughness=.75)=>new THREE.MeshStandardMaterial({color,roughness});
 const white=mat(0xeeeae1), concrete=mat(0xaaa99f), black=mat(0x20262a), oak=mat(0x946333), metal=mat(0x858f92,.35), blue=mat(0x26869b), yellow=mat(0xe1b924), lime=mat(0x86a544), red=mat(0xb93731);
 black.side=THREE.DoubleSide;
 const glass=new THREE.MeshStandardMaterial({color:0xb9dbe0,transparent:true,opacity:.18,roughness:.2,depthWrite:false,side:THREE.DoubleSide});
 const light=new THREE.MeshBasicMaterial({color:0xfff9e5});
 const screen=new THREE.MeshBasicMaterial({color:0x19394a});
 const materials=[white,concrete,black,oak,metal,blue,yellow,lime,red,glass,light,screen];
 const put=(geo:THREE.BufferGeometry,m:THREE.Material)=>{const list=batches.get(m)||[];list.push(geo);batches.set(m,list);};
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,m:THREE.Material,angle=0)=>{const g=new THREE.BoxGeometry(w,h,d);g.rotateY(angle);g.translate(x,y,z);put(g,m);};
 const cylinder=(x:number,y:number,z:number,r:number,h:number,m:THREE.Material)=>{const g=new THREE.CylinderGeometry(r,r,h,16);g.translate(x,y,z);put(g,m);};
 const surface=(poly:Polygon,y:number,m:THREE.Material,holes:Polygon[]=[])=>{const shape=new THREE.Shape(poly.map(([x,z])=>new THREE.Vector2(x,-z)));for(const hole of holes)shape.holes.push(new THREE.Path(hole.map(([x,z])=>new THREE.Vector2(x,-z))));const geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);geo.translate(0,y,0);put(geo,m);};
 const wall=(a:Point,b:Point,h:number,m:THREE.Material,collision=true,base=0,thickness=.14)=>{const dx=b[0]-a[0],dz=b[1]-a[1];box((a[0]+b[0])/2,base+h/2,(a[1]+b[1])/2,Math.hypot(dx,dz),h,thickness,m,-Math.atan2(dz,dx));if(collision)barriers.push({a,b});};
 const label=(text:string,x:number,y:number,z:number,angle=0,width=3)=>{
  const c=document.createElement('canvas');c.width=768;c.height=128;const ctx=c.getContext('2d')!;
  ctx.fillStyle='#283034';ctx.fillRect(0,0,768,128);ctx.fillStyle='#f4f0e5';ctx.font='500 38px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,64,730);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
  const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});materials.push(material);
  const g=new THREE.PlaneGeometry(width,width/6);g.rotateY(angle);g.translate(x,y,z);put(g,material);
 };
 // Subtle poured-concrete grain and joints, generated locally (no photo downloads).
 const floorCanvas=document.createElement('canvas');floorCanvas.width=256;floorCanvas.height=256;
 const floorCtx=floorCanvas.getContext('2d')!;floorCtx.fillStyle='#b7b6ad';floorCtx.fillRect(0,0,256,256);
 let seed=41;for(let i=0;i<6000;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%256;seed=(seed*1664525+1013904223)>>>0;const z=seed%256;floorCtx.fillStyle=i%2?'rgba(255,255,255,.05)':'rgba(35,35,30,.035)';floorCtx.fillRect(x,z,1,1);}
 floorCtx.strokeStyle='rgba(70,70,60,.19)';floorCtx.lineWidth=1;floorCtx.strokeRect(0,0,256,256);
 const floorMap=new THREE.CanvasTexture(floorCanvas);floorMap.wrapS=floorMap.wrapT=THREE.RepeatWrapping;floorMap.repeat.set(.5,.5);floorMap.colorSpace=THREE.SRGBColorSpace;textures.push(floorMap);concrete.map=floorMap;concrete.color.setHex(0xffffff);
 const footprint=floor==='G'?GROUND_FOOTPRINT:MAIN_FOOTPRINT;
 const ceiling=floor==='G'?6.3:4.2;
 surface(footprint,0,concrete,floor==='G'?[]:floor==='1'?[STAIR_HOLE,ATRIUM_VOID]:[STAIR_HOLE]);
 if(floor!=='R') surface(footprint,ceiling,black,floor==='G'?[STAIR_HOLE,ATRIUM_VOID]:[STAIR_HOLE]);

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
 // Curtain wall with individual panels and mullions, not opaque painted walls.
 for(let i=0;i<footprint.length;i++) {
  const a=footprint[i],b=footprint[(i+1)%footprint.length];
  const count=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.5);
  wall(a,b,floor==='R'?1.2:ceiling,glass);
  wall(a,b,.1,metal,false,.08);
  if(floor!=='R')wall(a,b,.12,metal,false,ceiling*.54);
  for(let j=0;j<=count;j++){const t=j/count;box(a[0]+(b[0]-a[0])*t,(floor==='R'?1.2:ceiling)/2,a[1]+(b[1]-a[1])*t,.07,floor==='R'?1.2:ceiling,.07,metal);}
 }
 function chair(x:number,z:number,angle:number,m:THREE.Material){
  box(x,.49,z,.46,.08,.45,m,angle);
  box(x+Math.sin(angle)*.2,.8,z+Math.cos(angle)*.2,.46,.54,.065,m,angle);
  for(const dx of [-.16,.16])for(const dz of [-.15,.15])box(x+dx,.24,z+dz,.035,.46,.035,metal);
 }
 function table(x:number,z:number,r=.85,kind:THREE.Material=oak){cylinder(x,.76,z,r,.055,kind);cylinder(x,.36,z,.055,.72,metal);cylinder(x,.045,z,.36,.045,metal);}
 function tableSet(x:number,z:number,m=lime){table(x,z);for(let i=0;i<4;i++){const a=i*Math.PI/2;chair(x+Math.sin(a)*1.15,z+Math.cos(a)*1.15,a,m);}}
 function roomShell(room:InteriorRoom){
  const nearest=room.polygon.reduce((best,a,i)=>distanceToSegment(room.door,a,room.polygon[(i+1)%room.polygon.length])<distanceToSegment(room.door,room.polygon[best],room.polygon[(best+1)%room.polygon.length])?i:best,0);
  room.polygon.forEach((a,i)=>{
   const b=room.polygon[(i+1)%room.polygon.length];
   if(i!==nearest){wall(a,b,3.25,room.kind==='lab'?glass:white);return;}
   const len=Math.hypot(b[0]-a[0],b[1]-a[1]);const dx=(b[0]-a[0])/len,dz=(b[1]-a[1])/len;
   const t=Math.max(.9,Math.min(len-.9,(room.door[0]-a[0])*dx+(room.door[1]-a[1])*dz));
   const l:Point=[a[0]+dx*(t-.8),a[1]+dz*(t-.8)], r:Point=[a[0]+dx*(t+.8),a[1]+dz*(t+.8)];
   wall(a,l,3.25,white);wall(r,b,3.25,white);wall(l,r,.75,white,false,2.5);
   label(`${room.id}  ${room.name}`,(l[0]+r[0])/2,2.85,(l[1]+r[1])/2,Math.atan2(dx,dz),3.4);
  });
  const xs=room.polygon.map(p=>p[0]),zs=room.polygon.map(p=>p[1]);
  const x=(Math.min(...xs)+Math.max(...xs))/2,z=(Math.min(...zs)+Math.max(...zs))/2;
  if(room.kind==='classroom'||room.kind==='conference') {
   for(const dx of [-2.1,2.1])for(const dz of [-2.1,2.1])tableSet(x+dx,z+dz,room.kind==='classroom'?red:blue);
   box(x,2,z-4,3,.95,.12,screen);
  } else if(room.kind==='lab') {
   for(const dx of [-1.7,1.7])for(const dz of [-2.5,0,2.5]){box(x+dx,.84,z+dz,2,.1,1.1,oak);for(const offset of [-.8,.8])box(x+dx+offset,.4,z+dz,.07,.8,.8,metal);box(x+dx,1.2,z+dz, .8,.55,.12,screen);}
  } else if(room.kind==='auditorium') {
   // Tiered desktop rows and swivel seating. Seat count is refined separately.
   for(let row=0;row<7;row++)for(let col=0;col<6;col++) {chair(x+(col-2.5)*1.0,z+(row-3)*1.1,Math.PI,red);box(x+(col-2.5),.74,z+(row-3)*1.1+.4,.85,.05,.35,oak);}
  } else tableSet(x,z);
 }
 ROOMS.filter(r=>r.floor===floor).forEach(roomShell);
 // White structural columns follow the public circulation edges.
 const columns=floor==='G' ? [[740,770],[905,840],[1180,897],[1180,655],[1100,610],[1400,620],[1460,435]] .map(([x,y])=>groundPlan(x,y)) : [[540,680],[745,680],[544,940],[772,940],[733,1195],[701,1390],[529,1535],[360,1600]].map(([x,y])=>plan(x,y));
 for(const [x,z] of columns)cylinder(x,ceiling/2,z,.3,ceiling,white);
 // Wood-slatted elevator core and the wrapping white stair are the atrium's
 // defining form in HDR's photographed view. Stair locomotion is added next.
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
 for(let i=0;i<spine.length-1;i++){const a=spine[i],b=spine[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let j=0;j<len;j+=3){const t=j/len,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(pointInPolygon([x,z],footprint))box(x,ceiling-.4,z,3.3,.055,.09,light,(j%2?1:-1)*.7);}}
 for(const [m,geometries] of batches){const merged=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());if(!merged)continue;const mesh=new THREE.Mesh(merged,m);mesh.castShadow=false;mesh.receiveShadow=true;group.add(mesh);}
 return {group,barriers,footprint,dispose(){group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}

import * as THREE from 'three';
import { MAIN_FOOTPRINT, ROOF_PUBLIC_FOOTPRINT, plan, roofPlan, pointInPolygon, type Point, type Polygon } from './layout';
import { ROOF_BEDS, ROOF_LAWN, ROOF_POOL, ROOF_FACADE, ROOF_DOORS, ROOF_OUTDOOR, ROOF_FOYER } from './roof-layout';
import type { Barrier } from './model';

type Material=THREE.Material;
export interface RoofBuilder {
 box(x:number,y:number,z:number,w:number,h:number,d:number,m:Material,angle?:number):void;
 cylinder(x:number,y:number,z:number,r:number,h:number,m:Material):void;
 surface(p:Polygon,y:number,m:Material,holes?:Polygon[]):void;
 wall(a:Point,b:Point,h:number,m:Material,collision?:boolean,base?:number,thickness?:number):void;
 put(g:THREE.BufferGeometry,m:Material):void;
 label(text:string,x:number,y:number,z:number,angle?:number,width?:number):void;
 palette:{white:Material;oak:Material;metal:Material;glass:Material;black:Material;light:Material};
 materials:Material[];textures:THREE.Texture[];barriers:Barrier[];
}
export function buildRoof(b:RoofBuilder){
 const {box,cylinder,surface,wall,put,palette:m}=b;
 const material=(color:number,roughness=.8)=>{const mat=new THREE.MeshStandardMaterial({color,roughness});b.materials.push(mat);return mat;};
 const foyerCeiling=material(0x737773);foyerCeiling.side=THREE.DoubleSide;
 const deck=material(0xb2a18b),soil=material(0x453b30),grass=material(0x52723c),leaf=material(0x526d35),maple=material(0x795345),bark=material(0x615347),stone=material(0x77756d),water=material(0x34565d,.23),gravel=material(0x969a98);
 // Weathered boards: generated texture in world units, without photo overlays.
 const pixels=new Uint8Array(128*128*4);
 for(let z=0;z<128;z++)for(let x=0;x<128;x++){
  const i=(z*128+x)*4,board=Math.floor(x/10.67),joint=x%10.67<.8;
  const grain=Math.sin(x*3+Math.sin(z*.09))*.035+Math.sin(x*10+z*.025)*.018;
  const shade=joint?.55:1+grain+(board%3-1)*.025;
  pixels[i]=201*shade;pixels[i+1]=185*shade;pixels[i+2]=160*shade;pixels[i+3]=255;
 }
 const map=new THREE.DataTexture(pixels,128,128);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(.5,.5);map.needsUpdate=true;map.magFilter=THREE.LinearFilter;map.generateMipmaps=true;map.minFilter=THREE.LinearMipmapLinearFilter;map.anisotropy=4;deck.map=map;deck.color.setHex(0xffffff);b.textures.push(map);
 // Fine turf color variation stays in one texture and one material batch.
 const turfPixels=new Uint8Array(128*128*4);let turfSeed=5317;
 for(let i=0;i<128*128;i++){
  turfSeed=(Math.imul(turfSeed,1664525)+1013904223)>>>0;
  const shade=.85+(turfSeed/4294967296)*.3;
  turfPixels[i*4]=97*shade;turfPixels[i*4+1]=119*shade;turfPixels[i*4+2]=65*shade;turfPixels[i*4+3]=255;
 }
 const turf=new THREE.DataTexture(turfPixels,128,128);turf.colorSpace=THREE.SRGBColorSpace;turf.wrapS=turf.wrapT=THREE.RepeatWrapping;turf.repeat.set(2,2);turf.generateMipmaps=true;turf.minFilter=THREE.LinearMipmapLinearFilter;turf.magFilter=THREE.LinearFilter;turf.anisotropy=4;turf.needsUpdate=true;
 grass.map=turf;grass.color.setHex(0xffffff);b.textures.push(turf);
 surface(MAIN_FOOTPRINT,-.035,gravel);
 surface(ROOF_OUTDOOR,.008,deck);
 surface(ROOF_FOYER,3.45,foyerCeiling);
 const cladding=material(0x68747c,.58),windowTrim=material(0x754a35,.62);
 // Tall glazed wind screens surround the garden. The enclosed foyer has
 // full-height windows below its ceiling, rather than a low terrace railing.
 ROOF_PUBLIC_FOOTPRINT.forEach((a,i)=>{
  const end=ROOF_PUBLIC_FOOTPRINT[(i+1)%ROOF_PUBLIC_FOOTPRINT.length];
  if(i===2){wall(a,end,3.45,cladding);return;}
  const count=Math.ceil(Math.hypot(end[0]-a[0],end[1]-a[1])/1.55);
  for(let j=0;j<count;j++){
   const p:Point=[a[0]+(end[0]-a[0])*j/count,a[1]+(end[1]-a[1])*j/count],q:Point=[a[0]+(end[0]-a[0])*(j+1)/count,a[1]+(end[1]-a[1])*(j+1)/count];
   const h=pointInPolygon([(p[0]+q[0])/2,(p[1]+q[1])/2],ROOF_FOYER)?3.45:2.45;
   wall(p,q,h,m.glass);wall(p,q,.17,m.metal,false,h-.17,.17);wall(p,q,.13,m.metal,false,0,.15);box(p[0],h/2,p[1],.13,h,.13,m.metal);
  }
 });
 // The projecting gallery window sits in a metal-clad rooftop enclosure.
 // Derive wall breaks and open leaves from the same segments as the collision
 // geometry, including both terrace entrances shown on the architectural plan.
 ROOF_FACADE.slice(0,-1).forEach((a,i)=>{
  const end=ROOF_FACADE[i+1],dx=end[0]-a[0],dz=end[1]-a[1],len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len;
  let nx=-uz,nz=ux;
  if(pointInPolygon([(a[0]+end[0])/2+nx*.2,(a[1]+end[1])/2+nz*.2],ROOF_FOYER)){nx=-nx;nz=-nz;}
  const shifted=(p:Point,offset:number):Point=>[p[0]+nx*offset,p[1]+nz*offset];
  const clad=(p:Point,q:Point)=>{
   // Gallery walls are already part of its room shell; avoid duplicate faces.
   if(i!==2&&i!==4)wall(p,q,3.45,m.white);
   wall(shifted(p,.105),shifted(q,.105),4.2,cladding,false,0,.06);
   for(let y=.25;y<4.2;y+=.22)wall(shifted(p,.14),shifted(q,.14),.012,m.metal,false,y,.009);
  };
  if(i===3){
   wall(shifted(a,.14),shifted(end,.14),.26,windowTrim,false,3.22,.26);
   wall(shifted(a,.14),shifted(end,.14),.22,windowTrim,false,0,.26);
   for(const p of [a,end])box(p[0]+nx*.14,1.72,p[1]+nz*.14,.22,3.44,.22,windowTrim);
   const panes=Math.ceil(len/1.3);
   for(let j=1;j<panes;j++)box(a[0]+dx*j/panes,1.7,a[1]+dz*j/panes,.035,3.2,.035,m.metal);
   wall(a,end,.75,cladding,false,3.45,.16);return;
  }
  const door=ROOF_DOORS.find(d=>d.edge===i);
  if(!door){clad(a,end);return;}
  const l:Point=[door.center[0]-ux*door.width/2,door.center[1]-uz*door.width/2],r:Point=[door.center[0]+ux*door.width/2,door.center[1]+uz*door.width/2];
  clad(a,l);clad(r,end);wall(l,r,1.8,cladding,false,2.4,.16);
  wall(l,r,.08,m.metal,false,2.32,.1);
  for(const p of [l,r])box(p[0],1.2,p[1],.065,2.4,.065,m.metal);
  const open:Point=[l[0]-nx*door.width,l[1]-nz*door.width];
  wall(l,open,2.3,m.glass,true,0,.035);wall(l,open,.045,m.metal,false,0,.045);wall(l,open,.045,m.metal,false,2.28,.045);
  box(open[0],1.15,open[1],.055,2.3,.055,m.metal);box(open[0]+ux*.055,1.07,open[1]+uz*.055,.04,.34,.04,m.metal);
 });
 for(const [px,py] of [[574,875],[715,860],[585,804],[720,840]]){const [x,z]=plan(px,py);if(pointInPolygon([x,z],ROOF_FOYER))box(x,3.17,z,2.7,.06,.09,m.light,.65);}
 const sign=plan(637,855);b.label('REISSE PARK',sign[0],2.7,sign[1],Math.PI,3.1);
 const border=(poly:Polygon,h:number,thickness=.16)=>poly.forEach((p,i)=>wall(p,poly[(i+1)%poly.length],h,m.white,true,0,thickness));
 border(ROOF_LAWN,.15,.16);surface(ROOF_LAWN,.15,grass);
 border(ROOF_POOL,.43,.18);surface(ROOF_POOL,.25,water);
 ROOF_BEDS.forEach(poly=>{border(poly,.46,.18);surface(poly,.39,soil);});
 let seed=7907;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 // A shallow planted edge; the central lawn remains open, as in the reference.
 for(const bed of ROOF_BEDS){
  const xs=bed.map(p=>p[0]),zs=bed.map(p=>p[1]);
  for(let i=0;i<220;i++){
   const p:Point=[Math.min(...xs)+random()*(Math.max(...xs)-Math.min(...xs)),Math.min(...zs)+random()*(Math.max(...zs)-Math.min(...zs))];
   if(!pointInPolygon(p,bed))continue;
   const g=new THREE.IcosahedronGeometry(.12+random()*.13,0);g.scale(1,.5+random(),1);g.translate(p[0],.5,p[1]);put(g,i%3?leaf:maple);
  }
 }
 function tree(p:Point,height:number){
  cylinder(p[0],height/2+.4,p[1],.04,height,bark);
  for(let i=0;i<5;i++){
   const a=i*2.4,offset=.3+random()*.2;
   const tip=new THREE.Vector3(p[0]+Math.cos(a)*offset,height*.7+.4+random()*.4,p[1]+Math.sin(a)*offset);
   const start=new THREE.Vector3(p[0],height*.45+.4,p[1]);
   const branch=new THREE.CylinderGeometry(.012,.022,start.distanceTo(tip),6);branch.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),tip.clone().sub(start).normalize()));branch.translate(...start.add(tip).multiplyScalar(.5).toArray());put(branch,bark);
   const crown=new THREE.IcosahedronGeometry(.45,1);crown.scale(.9,1.25,.9);crown.translate(tip.x,tip.y,tip.z);put(crown,leaf);
  }
 }
 for(const bed of ROOF_BEDS)for(const index of [12,34,54]){
  const p=bed[index],center:Point=[bed.reduce((s,a)=>s+a[0],0)/bed.length,bed.reduce((s,a)=>s+a[1],0)/bed.length];
  const candidate:Point=[p[0]*.82+center[0]*.18,p[1]*.82+center[1]*.18];if(pointInPolygon(candidate,bed))tree(candidate,1.7+random()*.5);
 }
 // Closely spaced wooden slats follow the curved white planter edges.
 function bench(poly:Polygon,from:number,to:number,back=true){
  const center:Point=[poly.reduce((s,p)=>s+p[0],0)/poly.length,poly.reduce((s,p)=>s+p[1],0)/poly.length];
  for(let i=from;i<to;i++){
   const a=poly[i],c=poly[(i+1)%poly.length],length=Math.hypot(c[0]-a[0],c[1]-a[1]);
   const dx=(c[0]-a[0])/length,dz=(c[1]-a[1])/length;let nx=-dz,nz=dx;
   if(nx*(a[0]-center[0])+nz*(a[1]-center[1])<0){nx=-nx;nz=-nz;}
   const count=Math.ceil(length/.105),angle=-Math.atan2(dz,dx);
   for(let j=0;j<count;j++){
    const t=(j+.5)/count,x=a[0]+(c[0]-a[0])*t,z=a[1]+(c[1]-a[1])*t;
    box(x+nx*.13,.48,z+nz*.13,length/count*.78,.055,.49,m.oak,angle);
    if(back)box(x-nx*.08,.76,z-nz*.08,length/count*.78,.53,.06,m.oak,angle);
   }
   b.barriers.push({a:[a[0]+nx*.36,a[1]+nz*.36],b:[c[0]+nx*.36,c[1]+nz*.36],minY:0,maxY:1});
  }
 }
 bench(ROOF_BEDS[0],15,32);bench(ROOF_BEDS[1],4,20);bench(ROOF_POOL,8,24,false);
 // Rocks and a short cascade in the garden's stream basin.
 const poolCenter:Point=[ROOF_POOL.reduce((s,p)=>s+p[0],0)/ROOF_POOL.length,ROOF_POOL.reduce((s,p)=>s+p[1],0)/ROOF_POOL.length];
 for(let i=0;i<70;i++){
  const p=ROOF_POOL[Math.floor(random()*ROOF_POOL.length)],t=.25+random()*.75;
  const x=poolCenter[0]+(p[0]-poolCenter[0])*t,z=poolCenter[1]+(p[1]-poolCenter[1])*t;
  const g=new THREE.IcosahedronGeometry(.08+random()*.13,0);g.scale(1.4,.5,1);g.rotateY(random()*Math.PI);g.translate(x,.28,z);put(g,stone);
 }
 // Stepped rock shelves descend within the basin, beside the gallery glass.
 // Inset every shelf so the cascade cannot protrude through the white curb.
 const flowA=roofPlan(750,910),flowB=roofPlan(767,923),flowAngle=-Math.atan2(flowB[1]-flowA[1],flowB[0]-flowA[0]);
 for(let i=0;i<3;i++){
  const t=i/2,x=flowA[0]+(flowB[0]-flowA[0])*t,z=flowA[1]+(flowB[1]-flowA[1])*t,top=.66-i*.12;
  box(x,top-.08,z,.66,.16,.7,stone,flowAngle);box(x,top+.009,z,.49,.018,.53,water,flowAngle);
 }
 // Short bollard lights around the lawn, visible in both official roof photos.
 for(let i=0;i<ROOF_LAWN.length;i+=10){const [x,z]=ROOF_LAWN[i];cylinder(x,.48,z,.055,.72,m.metal);cylinder(x,.75,z,.057,.06,m.light);}
}

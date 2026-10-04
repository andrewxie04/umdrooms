import * as THREE from 'three';
import { upholsteryFinish } from './finishes';
import { antonovWayfindingCoordinates, antonovWayfinding, auditoriumStrip, auditoriumSidePoint, AUD_WIDTH, AUD_DEPTH, AUD_SCALE, type AuditoriumSeat } from './auditorium';
import { type Point } from './layout';
import type { RoofBuilder } from './roof';

// Visible in UMD's Antonov photograph. Metric sizes, bay spacing and equipment
// positions are estimates; the public sources do not include a reflected plan.
function roundedOutline(w:number,h:number,r:number){
 const s=new THREE.Shape();
 s.moveTo(-w+r,-h);s.lineTo(w-r,-h);s.quadraticCurveTo(w,-h,w,-h+r);
 s.lineTo(w,h-r);s.quadraticCurveTo(w,h,w-r,h);s.lineTo(-w+r,h);
 s.quadraticCurveTo(-w,h,-w,h-r);s.lineTo(-w,-h+r);s.quadraticCurveTo(-w,-h,-w+r,-h);
 return s;
}

export function buildAuditoriumChairs(seats:AuditoriumSeat[],b:RoofBuilder){
 const fabric=upholsteryFinish();b.textures.push(fabric);
 const cushion=new THREE.MeshStandardMaterial({color:0x252b2d,map:fabric,bumpMap:fabric,bumpScale:.001,roughness:.9});
 const frame=new THREE.MeshStandardMaterial({color:0x1c2428,roughness:.57});
 const meshPixels=new Uint8Array(256*256*4);
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){
  const i=(y*256+x)*4,wire=x%4===0||y%4===0,v=wire?255:0;meshPixels.set([v,v,v,255],i);
 }
 const meshMap=new THREE.DataTexture(meshPixels,256,256);meshMap.magFilter=THREE.NearestFilter;
 meshMap.minFilter=THREE.LinearMipmapLinearFilter;meshMap.generateMipmaps=true;meshMap.needsUpdate=true;
 b.textures.push(meshMap);
 const mesh=new THREE.MeshStandardMaterial({color:0x30383b,alphaMap:meshMap,alphaTest:.35,side:THREE.DoubleSide,roughness:.85});
 mesh.name='Auditorium woven chair back';b.materials.push(cushion,frame,mesh);
 const seat=new THREE.ExtrudeGeometry(roundedOutline(.245,.235,.07),{depth:.07,bevelEnabled:true,bevelSize:.015,bevelThickness:.012,bevelSegments:2,curveSegments:4});
 seat.rotateX(-Math.PI/2);seat.translate(0,.435,0);
 const shell=roundedOutline(.25,.29,.065);shell.holes.push(new THREE.Path(roundedOutline(.213,.248,.045).getPoints(4)));
 const back=new THREE.ExtrudeGeometry(shell,{depth:.032,bevelEnabled:true,bevelSize:.007,bevelThickness:.007,bevelSegments:1,curveSegments:4});
 const woven=new THREE.ShapeGeometry(roundedOutline(.216,.251,.045),4);
 for(const g of [back,woven]){
  const p=g.getAttribute('position'),uv=g.getAttribute('uv');
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
   p.setXYZ(i,x*(1-.08*Math.abs(y/.29)),y+.82,z+.23-x*x*.5+(y+.29)*.12);
   if(g===woven)uv.setXY(i,x/.432+.5,y/.502+.5);
  }
  g.computeVertexNormals();
 }
 for(const s of seats){
  const [x,z]=s.point,y=s.height,angle=Math.atan2(s.depth[0],s.depth[1]);
  for(const [g,m] of [[seat,cushion],[back,frame],[woven,mesh]] as const){const copy=g.clone();copy.rotateY(angle);copy.translate(x,y,z);b.put(copy,m);}
  b.cylinder(x,y+.225,z,.037,.45,b.palette.metal);
  b.box(x,y+.028,z,.39,.045,.29,b.palette.metal,angle);
  b.box(x,y+.414,z,.29,.055,.18,frame,angle);
  for(const side of [-1,1]){
   const ox=s.width[0]*side*.285,oz=s.width[1]*side*.285;
   b.box(x+ox,y+.69,z+oz,.045,.046,.36,frame,angle);
   b.box(x+ox+s.depth[0]*.07,y+.565,z+oz+s.depth[1]*.07,.026,.22,.028,frame,angle);
  }
 }
 seat.dispose();back.dispose();woven.dispose();
}

export const ANTONOV_CEILING_HEIGHT=10.44;
export function antonovCeilingHeight(x:number){
 if(x<1240||x>1496)return ANTONOV_CEILING_HEIGHT;
 const phase=(x-1240)%32;
 return ANTONOV_CEILING_HEIGHT-(phase<=8?phase/8*.38:(32-phase)/24*.38);
}

export function buildAntonovCeiling(b:RoofBuilder,timber:THREE.MeshStandardMaterial){
 const ceiling=timber.clone();ceiling.side=THREE.DoubleSide;ceiling.name='Antonov folded timber ceiling';b.materials.push(ceiling);
 if(ceiling.map){const grain=ceiling.map.clone();grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.needsUpdate=true;b.textures.push(grain);ceiling.map=grain;}
 const seam=new THREE.MeshStandardMaterial({color:0x3b3027,roughness:.8});
 const luminous=new THREE.MeshBasicMaterial({color:0xffe2b4});luminous.name='Antonov ceiling light strip';
 b.materials.push(seam,luminous);
 const breaks=[1100,1240];for(let x=1240;x<1496;x+=32)breaks.push(x+8,x+32);breaks.push(1600);
 for(let i=0;i<breaks.length-1;i++){
  const poly=auditoriumStrip(breaks[i],breaks[i+1]);if(poly.length<3)continue;
  const shape=new THREE.Shape(poly.map(([x,z])=>new THREE.Vector2(x,-z))),g=new THREE.ShapeGeometry(shape);
  g.rotateX(-Math.PI/2);const positions=g.getAttribute('position'),uv=g.getAttribute('uv');
  for(let j=0;j<positions.count;j++){
   const [x,y]=antonovWayfindingCoordinates([positions.getX(j),positions.getZ(j)]);
   positions.setY(j,antonovCeilingHeight(x));uv.setXY(j,x*AUD_SCALE/2.5,y*AUD_SCALE);
  }
  g.computeVertexNormals();b.put(g,ceiling);
 }
 const rod=(a:THREE.Vector3,end:THREE.Vector3,r:number,m:THREE.Material)=>{
  const g=new THREE.CylinderGeometry(r,r,a.distanceTo(end),6);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),end.clone().sub(a).normalize()));
  g.translate(...a.clone().add(end).multiplyScalar(.5).toArray());b.put(g,m);
 };
 for(let x=1240;x<1496;x+=32){
  const path:Point[]=[auditoriumSidePoint(x+8,-1,2),antonovWayfinding(x+13,274),auditoriumSidePoint(x+8,1,2)];
  for(let j=0;j<path.length-1;j++){
   const a=path[j],end=path[j+1],heightA=antonovCeilingHeight(antonovWayfindingCoordinates(a)[0]),heightB=antonovCeilingHeight(antonovWayfindingCoordinates(end)[0]);
   rod(new THREE.Vector3(a[0],heightA-.016,a[1]),new THREE.Vector3(end[0],heightB-.016,end[1]),.042,seam);
   rod(new THREE.Vector3(a[0],heightA-.05,a[1]),new THREE.Vector3(end[0],heightB-.05,end[1]),.017,luminous);
  }
  for(const y of [175,275,375]){const p=antonovWayfinding(x+22,y),height=antonovCeilingHeight(x+22);b.cylinder(p[0],height-.013,p[1],.115,.02,seam);b.cylinder(p[0],height-.027,p[1],.076,.018,luminous);}
 }
 // Two ceiling-mounted projectors are visible in the official interior photo.
 // Their inferred placement faces the presentation wall without blocking aisles.
 const lens=new THREE.MeshStandardMaterial({color:0x243445,roughness:.2,metalness:.5});b.materials.push(lens);
 const angle=-Math.atan2(AUD_WIDTH[1],AUD_WIDTH[0]);
 for(const y of [197,351]){
  const p=antonovWayfinding(1296,y),height=antonovCeilingHeight(1296);
  b.box(p[0],height-.37,p[1],.48,.18,.38,b.palette.white,angle);
  b.cylinder(p[0],height-.17,p[1],.025,.3,b.palette.metal);
  const face:Point=[p[0]-AUD_DEPTH[0]*.197,p[1]-AUD_DEPTH[1]*.197];
  const lensGeometry=new THREE.CylinderGeometry(.052,.052,.028,12);
  lensGeometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(AUD_DEPTH[0],0,AUD_DEPTH[1])));
  lensGeometry.translate(face[0],height-.37,face[1]);b.put(lensGeometry,lens);
  for(const offset of [-.13,-.08,-.03,.02,.07])b.box(p[0]+AUD_WIDTH[0]*offset,height-.371,p[1]+AUD_WIDTH[1]*offset,.018,.06,.391,seam,angle);
 }
}

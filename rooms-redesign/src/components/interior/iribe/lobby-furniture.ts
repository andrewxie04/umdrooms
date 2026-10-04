import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { upholsteryFinish } from './finishes';
import type { Point, Polygon } from './layout';
import type { RoofBuilder } from './roof';

export type LobbyFurnitureBuilder=RoofBuilder&{contact(x:number,z:number,r:number):void};

/** UMD's photograph supplies the upholstery, bucket lounge chairs and white
 * pedestal tables. Heights, edge radii and furniture hardware are estimates. */
export function createLobbyFurniture(b:LobbyFurnitureBuilder){
 const weave=upholsteryFinish();b.textures.push(weave);
 const cloth=(color:number)=>{
  const material=new THREE.MeshStandardMaterial({color,map:weave,bumpMap:weave,bumpScale:.0012,roughness:.92});
  b.materials.push(material);return material;
 };
 const gold=cloth(0xecb11c),baseGold=cloth(0xc8971c),chairCloth={blue:cloth(0x194f69),teal:cloth(0x176878),green:cloth(0x71993f)};
 const tableFinish=new THREE.MeshStandardMaterial({color:0xf2f1ed,roughness:.38});b.materials.push(tableFinish);
 const upholstered=(raw:THREE.BufferGeometry,material:THREE.Material)=>{
  raw.deleteAttribute('normal');raw.deleteAttribute('uv');
  const geometry=mergeVertices(raw);raw.dispose();geometry.computeVertexNormals();
  const position=geometry.getAttribute('position'),normal=geometry.getAttribute('normal'),uv=new Float32Array(position.count*2);
  for(let i=0;i<position.count;i++){
   uv[i*2]=position.getX(i)+position.getZ(i)*.4;
   uv[i*2+1]=Math.abs(normal.getY(i))>.65?position.getZ(i):position.getY(i);
  }
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));b.put(geometry,material);
 };
 const volume=(polygon:Polygon,y:number,height:number,material:THREE.Material,bevel=.018)=>{
  const shape=new THREE.Shape(polygon.map(([x,z])=>new THREE.Vector2(x,-z)));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel*.75});
  geometry.rotateX(-Math.PI/2);geometry.translate(0,y,0);upholstered(geometry,material);
 };
 const boundary=(polygon:Polygon,height:number)=>polygon.forEach((a,i)=>b.barriers.push({a,b:polygon[(i+1)%polygon.length],minY:0,maxY:height}));
 const circle=(center:Point,radius:number,height:number)=>boundary(Array.from({length:20},(_,i)=>[center[0]+Math.cos(i/20*Math.PI*2)*radius,center[1]+Math.sin(i/20*Math.PI*2)*radius] as Point),height);
 const sofa=(seat:Polygon,back:Polygon)=>{
  // Photographed modules have a rounded lower body and separate soft seat
  // cushion. Keep both within the same plan outline, with a fine shadow seam.
  volume(seat,.06,.20,baseGold,.04);
  volume(seat,.284,.14,gold,.047);
  if(back.length>=3)volume(back,.45,.37,gold,.025);
  boundary(seat,back.length>=3?.85:.47);
  const xs=seat.map(p=>p[0]),zs=seat.map(p=>p[1]);
  const cx=(Math.min(...xs)+Math.max(...xs))/2,cz=(Math.min(...zs)+Math.max(...zs))/2;
  b.contact(cx,cz,Math.max(.45,Math.hypot(Math.max(...xs)-Math.min(...xs),Math.max(...zs)-Math.min(...zs))*.4));
 };
 const chair=(center:Point,angle:number,color:keyof typeof chairCloth,width=.66,depth=.61)=>{
  // A softly squared seat and raised wraparound shell follow the photographed
  // chair silhouette. Their four-star bases have no invented caster wheels.
  const material=chairCloth[color],[cx,cz]=center;
  const local=(x:number,z:number):Point=>[cx+Math.cos(angle)*x+Math.sin(angle)*z,cz-Math.sin(angle)*x+Math.cos(angle)*z];
  const seat=new THREE.Shape();
  const w=width/2,d=depth/2,r=.09;
  seat.moveTo(-w+r,-d);seat.lineTo(w-r,-d);seat.quadraticCurveTo(w,-d,w,-d+r);
  seat.lineTo(w,d-r);seat.quadraticCurveTo(w,d,w-r,d);seat.lineTo(-w+r,d);
  seat.quadraticCurveTo(-w,d,-w,d-r);seat.lineTo(-w,-d+r);seat.quadraticCurveTo(-w,-d,-w+r,-d);
  const cushion=new THREE.ExtrudeGeometry(seat,{depth:.095,bevelEnabled:true,bevelSize:.023,bevelThickness:.018,bevelSegments:3,curveSegments:8});
  cushion.rotateX(-Math.PI/2);cushion.rotateY(angle);cushion.translate(cx,.405,cz);upholstered(cushion,material);
  // Back and arms form one continuous, tapered upholstered shell.
  const outer:Point[]=[],inner:Point[]=[];
  for(let i=0;i<=32;i++){
   const a=-1.65+i/32*3.3;
   outer.push([Math.sin(a)*(w+.055),Math.cos(a)*(d+.035)]);
   inner.push([Math.sin(a)*(w-.008),Math.cos(a)*(d-.033)]);
  }
  const shellPolygon=[...outer,...inner.reverse()];
  const shellShape=new THREE.Shape(shellPolygon.map(([x,z])=>new THREE.Vector2(x,-z)));
  const shell=new THREE.ExtrudeGeometry(shellShape,{depth:.47,bevelEnabled:true,bevelSize:.014,bevelThickness:.014,bevelSegments:3,curveSegments:8});
  shell.rotateX(-Math.PI/2);
  const positions=shell.getAttribute('position');
  for(let i=0;i<positions.count;i++){
   const turn=Math.atan2(positions.getX(i)/(w+.055),positions.getZ(i)/(d+.035));
   positions.setY(i,.43+positions.getY(i)*(1-.42*Math.min(1,Math.pow(turn/1.65,2))));
  }
  shell.rotateY(angle);shell.translate(cx,0,cz);upholstered(shell,material);
  b.cylinder(cx,.245,cz,.034,.39,b.palette.metal);
  for(const turn of [Math.PI/4,-Math.PI/4])b.box(cx,.055,cz,.027,.03,.71,b.palette.metal,angle+turn);
  const footprint=Array.from({length:24},(_,i)=>local(Math.sin(i/24*Math.PI*2)*(w+.065),Math.cos(i/24*Math.PI*2)*(d+.047)));
  boundary(footprint,.92);b.contact(cx,cz,.53);
 };
 const table=(center:Point,radius:number,height=.52)=>{
  const [x,z]=center;
  b.cylinder(x,height,z,radius,.035,tableFinish);
  b.cylinder(x,(height-.025)/2,z,.032,height-.045,b.palette.metal);
  b.cylinder(x,.029,z,Math.min(.27,radius*.6),.037,b.palette.metal);
  circle(center,radius,height+.03);b.contact(x,z,radius*1.18);
 };
 return {sofa,chair,table};
}

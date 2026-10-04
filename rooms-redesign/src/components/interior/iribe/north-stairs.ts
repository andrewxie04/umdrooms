import * as THREE from 'three';
import { AMPH_DROP, FLOOR_HEIGHT, type FloorId, type Point, type Polygon } from './layout';
import { NORTH_STAIR_FRAME, northSourcePage, northSourceMap, northStairDoor } from './north-stair-source-layout';
import { northStairForFloor, NORTH_STAIR_FLOOR_LANDINGS, NORTH_STAIR_MIDDLE_POLYGON } from './north-stair-layout';
import { NORTH_STAIR_OPAQUE_MASKS } from './north-stair-solids';
import type { RoofBuilder } from './roof';

/** Native plan paint and tread widths; repeated Levels 3/5/R, section, fixture
 * heights and finishes remain estimates pending reliable plans/sections. */
export function buildNorthStair(floor:FloorId,b:RoofBuilder,lobbyBrick?:THREE.Material){
 const stair=northStairForFloor(floor);if(!stair)return;
 const concrete=new THREE.MeshStandardMaterial({color:0xb2b6b3,roughness:.91,side:THREE.DoubleSide});b.materials.push(concrete);
 const ceiling=floor==='G'?6.3:floor==='R'?3.45:4.2,base=floor==='G'?-AMPH_DROP:0,page=northSourcePage(floor),map=northSourceMap(page);
 const mask=NORTH_STAIR_OPAQUE_MASKS.find(m=>m.page===page)!;
 for(const poly of mask.polygons){
  const convert=(p:readonly (readonly [number,number])[])=>p.map(v=>map(...v));
  const outer=convert(poly.outer),holes=poly.holes.map(convert);
  const shape=new THREE.Shape(outer.map(([x,z])=>new THREE.Vector2(x,-z)));
  for(const hole of holes)shape.holes.push(new THREE.Path(hole.map(([x,z])=>new THREE.Vector2(x,-z))));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:ceiling-base,bevelEnabled:false});geometry.rotateX(-Math.PI/2);geometry.translate(0,base,0);
  if(floor==='G'&&lobbyBrick){
   // The UMD lobby photograph shows this enclosure in brick. Use its native
   // masonry silhouette, including the face beside the sunken seating bank,
   // instead of a second fitted wall across it. Grade and finish sizes remain
   // estimates; the plans don't establish the interior stair finishes.
   const positions=geometry.getAttribute('position'),normals=geometry.getAttribute('normal'),uv=geometry.getAttribute('uv');
   for(let i=0;i<positions.count;i++){
    const vertical=Math.abs(normals.getY(i))<.5,along=Math.abs(normals.getX(i))>Math.abs(normals.getZ(i))?positions.getZ(i):positions.getX(i);
    uv.setXY(i,vertical?along/.48:positions.getX(i)/.48,vertical?positions.getY(i)/.15:positions.getZ(i)/.48);
   }
  }
  b.put(geometry,floor==='G'&&lobbyBrick?lobbyBrick:b.palette.white);
  for(const ring of [outer,...holes])ring.forEach((a,i)=>b.barriers.push({a,b:ring[(i+1)%ring.length],minY:base,maxY:ceiling}));
 }
 for(const landing of NORTH_STAIR_FLOOR_LANDINGS)b.surface(landing,0,concrete);
 if(floor===stair.lower){
  const rise=stair.middle-FLOOR_HEIGHT[floor];
  b.surface(NORTH_STAIR_MIDDLE_POLYGON,rise,concrete);b.surface(NORTH_STAIR_MIDDLE_POLYGON,rise-.14,concrete);
  NORTH_STAIR_MIDDLE_POLYGON.forEach((a,i)=>b.wall(a,NORTH_STAIR_MIDDLE_POLYGON[(i+1)%NORTH_STAIR_MIDDLE_POLYGON.length],.14,concrete,false,rise-.14,.02));
  for(const flight of [stair.first,stair.last]){
   const rows=flight.sections!;
   for(let i=0;i<rows.length-1;i++){
    const a=rows[i],c=rows[i+1],y=c.height-FLOOR_HEIGHT[floor],previous=a.height-FLOOR_HEIGHT[floor],quad:Polygon=[a.a,a.b,c.b,c.a];
    b.surface(quad,y,concrete);b.surface(quad,y-.14,concrete);
    b.wall(a.a,a.b,Math.max(.14,y-previous+.14),concrete,false,previous-.14,.015);
    for(const edge of ['a','b'] as const){
     const p=a[edge],q=c[edge],start=new THREE.Vector3(p[0],previous+1.02,p[1]),end=new THREE.Vector3(q[0],y+1.02,q[1]);
     const rail=new THREE.CylinderGeometry(.023,.023,start.distanceTo(end),6);rail.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),end.clone().sub(start).normalize()));rail.translate(...start.add(end).multiplyScalar(.5).toArray());b.put(rail,b.palette.metal);
     if(i%2===0)b.box(p[0],previous+.51,p[1],.035,1.02,.035,b.palette.metal);
     b.barriers.push({a:p,b:q,minY:previous-.14,maxY:y+1.05});
    }
   }
  }
 }
 const door=northStairDoor(floor),{u}=NORTH_STAIR_FRAME;
 const face:Point=[door[0]-u[0]*.14,door[1]-u[1]*.14];
 b.box(face[0],2.55,face[1],1.45,.12,.07,b.palette.metal,-Math.atan2(NORTH_STAIR_FRAME.v[1],NORTH_STAIR_FRAME.v[0]));
 const lamp=NORTH_STAIR_FRAME.at(.4,2.0);
 b.box(lamp[0],floor===stair.lower?riseHeight(stair.middle,FLOOR_HEIGHT[floor]):2.1,lamp[1],.08,.16,1.0,b.palette.light,-Math.atan2(NORTH_STAIR_FRAME.u[1],NORTH_STAIR_FRAME.u[0]));
}
const riseHeight=(middle:number,base:number)=>middle-base+1.75;

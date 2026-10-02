import { HATCHERY_COMMON, HATCHERY_ROOMS } from './layout';
import { HATCHERY_ITEMS, hatcheryItemFrame, hatcheryItemFootprint, buildHatchery } from './hatchery';
import { SANDBOX_COMMON, SANDBOX_STUDIOS, sandboxPlan, FIRST_RESTROOMS, SECOND_RESTROOMS } from './layout';
import { SANDBOX_STATIONS, sandboxStationFootprint, sandboxStationPoint } from './sandbox';
import { COMMUNICATING_STAIRS } from './communicating-layout';
import { FAMILY_BEDS,FAMILY_MAPLES } from './family-garden-layout';
import { FAMILY_GARDEN,FAMILY_GARDEN_DOOR,FAMILY_TERRACE,familyGardenPlan } from './layout';
import { amphitheaterHeight, AMPH_NORTH_AISLE } from './amphitheater';
import { AMPH_DEPTH, AMPH_DROP, AMPH_WIDTH, amphPoint } from './layout';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildInteriorFloor, type InteriorModel } from './model';
import { plan, fourthPlan, westFourthPlan, footprintForFloor, roofPlan, ROOF_GALLERY, ROOF_PUBLIC_FOOTPRINT, type Point, type FloorId } from './layout';
import { ROOF_BEDS, ROOF_LAWN, ROOF_POOL, ROOF_DOORS, ROOF_FACADE, ROOF_FOYER, ROOF_OUTDOOR } from './roof-layout';
import { ATRIUM_LANDING, ATRIUM_FLIGHTS, ENCLOSED_FLIGHTS, FLOOR_ORDER, type Flight, type Position } from './circulation';
import { GANNON_AISLES, gannonHeight, AUD_AISLES, AUD_SCALE, ROW_START, ROW_PITCH, auditoriumSeats, antonovHeight } from './auditorium';
import { walkStep3 } from './walk';
import { roomArrival } from './arrival';
import { labFrame, buildSmallArtifacts, DRONE_CAGE, DRONE_CAGE_AREA, DRONE_CAGE_HEIGHT, DRONE_CAGE_WIDTH, DRONE_CAGE_DEPTH, DRONE_CAMERAS, DRONE_GATE } from './labs';
import * as THREE from 'three';
import { buildRoboticsLab, ROBOT_STATIONS } from './robotics';
import { buildLobbySeating } from './lobby';
import { buildRestroom, RESTROOM_PLANS, restroomFrame, restroomStalls } from './restrooms';
import { ROOMS, FLOOR_HEIGHT, ANTONOV_FOOTPRINT, ENTRY, CAFE_LENGTH, cafePoint, groundPlan, pointInPolygon, distanceToSegment } from './layout';

const renderingErrors:string[]=[];
const models = new Map<FloorId, InteriorModel>();
beforeAll(() => {
 vi.spyOn(console,'error').mockImplementation((...args)=>renderingErrors.push(args.join(' '))); 
 vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, getContext: () => ({ fillRect() {}, fillText() {}, strokeRect() {} }) }) });
 for (const floor of FLOOR_ORDER) models.set(floor, buildInteriorFloor(floor));
});
afterAll(() => { models.forEach(model => model.dispose()); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
function follow(flights: Flight[], reverse = false) {
 const route = reverse ? [...flights].reverse().map(f => ({ ...f, from: f.to, to: f.from })) : flights;
 let position: Position = route[0].from;
 for (const flight of route) {
  const length = Math.hypot(flight.to[0] - flight.from[0], flight.to[2] - flight.from[2]);
  const count = Math.ceil(length / .04);
  for (let i = 0; i < count; i++) position = walkStep3(position, [(flight.to[0] - flight.from[0]) / count, (flight.to[2] - flight.from[2]) / count], floor => models.get(floor)!.barriers);
  expect(position[0]).toBeCloseTo(flight.to[0], 1);
  expect(position[2]).toBeCloseTo(flight.to[2], 1);
  expect(position[1]).toBeCloseTo(flight.to[1], 1);
 }
}
describe('continuous stair navigation', () => {
 for (const floor of FLOOR_ORDER.slice(0, -1)) {
  const flights = ENCLOSED_FLIGHTS.filter(f => f.lower === floor);
  it(`walks up from ${floor}`, () => follow(flights));
  it(`walks down to ${floor}`, () => follow(flights, true));
 }
 it('walks up the atrium stair', () => follow([...ATRIUM_FLIGHTS, ATRIUM_LANDING]));
 it('walks down the atrium stair', () => follow([...ATRIUM_FLIGHTS, ATRIUM_LANDING], true));
 it('connects the entrance through the atrium to the mezzanine corridor',()=>{
  const first=ATRIUM_FLIGHTS[0].from,end=ATRIUM_LANDING.to;
  const path:Position[]=[[ENTRY[0],-AMPH_DROP,ENTRY[1]]];
  for(const [u,v,h] of [[5.3,AMPH_DEPTH+.8,-AMPH_DROP],[-.8,AMPH_DEPTH+.8,0]]){const p=amphPoint(u,v);path.push([p[0],h,p[1]]);}
  path.push(first);
  const approach:Flight[]=path.slice(0,-1).map((from,i)=>({from,to:path[i+1],width:1.8,lower:'G',upper:'G'}));
  const exit:Flight={from:end,to:[end[0]-.8,end[1],end[2]],width:1.8,lower:'1',upper:'1'};
  follow([...approach,...ATRIUM_FLIGHTS,ATRIUM_LANDING,exit]);
  follow([...approach,...ATRIUM_FLIGHTS,ATRIUM_LANDING,exit],true);
 });
});

for(const stair of COMMUNICATING_STAIRS)describe(`Level ${stair.lower}–${stair.upper} communicating stair`,()=>{
 const {flights:COMMUNICATING_FLIGHTS,landing:COMMUNICATING_LANDING,path:COMMUNICATING_PATH,entry:COMMUNICATING_ENTRY,exit:COMMUNICATING_EXIT,void:COMMUNICATING_VOID,core:COMMUNICATING_CORE}=stair;
 const first=COMMUNICATING_FLIGHTS[0].from;
 const approach:Flight={from:[COMMUNICATING_ENTRY[0],FLOOR_HEIGHT[stair.lower],COMMUNICATING_ENTRY[1]],to:first,width:1.35,lower:stair.lower,upper:stair.upper};
 const route=[approach,...COMMUNICATING_FLIGHTS,COMMUNICATING_LANDING];
 it('walks from the lower corridor to the upper corridor',()=>follow(route));
 it('walks back down from the upper corridor',()=>follow(route,true));
 it('fits the new stair and core between the existing rooms',()=>{
  for(const floor of [stair.lower,stair.upper])for(const p of [...COMMUNICATING_PATH,...COMMUNICATING_CORE,COMMUNICATING_ENTRY,COMMUNICATING_EXIT]){
   expect(pointInPolygon(p,footprintForFloor(floor))).toBe(true);
   expect(ROOMS.some(r=>r.floor===floor&&pointInPolygon(p,r.polygon)),`room overlap at ${floor}/${p}`).toBe(false);
  }
 });
 it('cuts the ceiling and upper slab to provide headroom on the stair',()=>{
  const meshes:THREE.Object3D[]=[];
  for(const floor of [stair.lower,stair.upper]){const model=models.get(floor)!;model.group.position.y=FLOOR_HEIGHT[floor];model.group.updateMatrixWorld(true);model.group.traverse(o=>{if(o instanceof THREE.Mesh)meshes.push(o);});}
  try{
   for(const flight of COMMUNICATING_FLIGHTS){
    const x=(flight.from[0]+flight.to[0])/2,z=(flight.from[2]+flight.to[2])/2,y=(flight.from[1]+flight.to[1])/2;
    expect(pointInPolygon([x,z],COMMUNICATING_VOID)).toBe(true);
    const ray=new THREE.Raycaster(new THREE.Vector3(x,y+.2,z),new THREE.Vector3(0,1,0),0,1.7);
    expect(ray.intersectObjects(meshes,false),`ceiling at ${x}/${z}`).toHaveLength(0);
   }
  }finally{for(const floor of [stair.lower,stair.upper]){models.get(floor)!.group.position.y=0;models.get(floor)!.group.updateMatrixWorld(true);}}
 });
});

describe('rendered interior integrity',()=>{
 it('merges every furniture material without dropping geometry',()=>expect(renderingErrors).toEqual([]));
 it('places every room shortcut clear of walls and furniture',()=>{
  for(const room of ROOMS){
   const barriers=models.get(room.floor)!.barriers;
   const arrival=roomArrival(room,barriers);
   expect(arrival,`${room.floor}/${room.id}`).not.toBeNull();
   if(arrival){const h=arrival.height-FLOOR_HEIGHT[room.floor];expect(barriers.every(b=>h>=(b.maxY??Infinity)||h+1.65<=(b.minY??-Infinity)||distanceToSegment(arrival.point,b.a,b.b)>=.42)).toBe(true);}
  }
 });
});

describe('building visibility from other floors',()=>{
 function visibleMeshes(model:InteriorModel){const meshes:THREE.Object3D[]=[];model.group.updateMatrixWorld(true);model.group.traverseVisible(o=>{if(o instanceof THREE.Mesh)meshes.push(o);});return meshes;}
 for(const floor of FLOOR_ORDER.slice(1))it(`keeps the ${floor} slab visible with distant furniture hidden`,()=>{
  const model=models.get(floor)!,[x,z]=plan(625,600);
  try{
   model.setDetailsVisible(false);
   const ray=new THREE.Raycaster(new THREE.Vector3(x,-1,z),new THREE.Vector3(0,1,0),0,2);
   const hit=ray.intersectObjects(visibleMeshes(model),false)[0];
   expect(hit).toBeDefined();expect(hit.point.y).toBeCloseTo(-.19,3);
   expect(((hit.object as THREE.Mesh).material as THREE.Material).name).toBe('Floor slab underside');
  }finally{model.setDetailsVisible(true);}
 });
 it('keeps the auditorium roof and garden deck visible from upper windows',()=>{
  for(const [floor,point,y] of [['G',groundPlan(1360,300),10.5],['1',familyGardenPlan(545,707),0]] as const){
   const model=models.get(floor)!;
   try{
    model.setDetailsVisible(false);
    const ray=new THREE.Raycaster(new THREE.Vector3(point[0],y+.3,point[1]),new THREE.Vector3(0,-1,0),0,.5);
    const hit=ray.intersectObjects(visibleMeshes(model),false)[0];
    expect(hit,`${floor} outdoor surface`).toBeDefined();expect(hit.point.y).toBeCloseTo(y,2);
   }finally{model.setDetailsVisible(true);}
  }
 });
 it('culls and restores furnished detail without rebuilding geometry or collision',()=>{
  const model=models.get('4')!,objects=[...model.group.children],barriers=model.barriers;
  const triangleCount=(objects:THREE.Object3D[])=>objects.reduce((sum,o)=>sum+(o instanceof THREE.Mesh?(o.geometry.index?.count??o.geometry.getAttribute('position').count)/3:0),0);
  const fullCount=triangleCount(visibleMeshes(model));
  try{
   model.setDetailsVisible(false);
   expect(triangleCount(visibleMeshes(model))).toBeLessThan(fullCount*.5);
   expect(model.group.visible).toBe(true);expect(model.barriers).toBe(barriers);
   model.setDetailsVisible(true);
   expect(model.group.children).toEqual(objects);expect(triangleCount(visibleMeshes(model))).toBe(fullCount);
  }finally{model.setDetailsVisible(true);}
 });
});

describe('auditorium seating and circulation',()=>{
 it('fits the documented capacities within the plan outlines',()=>{
  for(const [id,count] of [['0324',298],['0318',100]] as const){
   const seats=auditoriumSeats(id),room=ROOMS.find(r=>r.id===id)!;
   expect(seats).toHaveLength(count);
   for(const seat of seats)expect(pointInPolygon(seat.point,room.polygon)).toBe(true);
  }
 });
 for(const aisle of AUD_AISLES)for(const reverse of [false,true])it(`walks ${reverse?'down':'up'} the ${aisle} m aisle without crossing the room below`,()=>{
  const y=274+aisle/AUD_SCALE;
  const start=groundPlan(reverse?ROW_START+10*ROW_PITCH+1:ROW_START-1,y);
  const end=groundPlan(reverse?ROW_START-1:ROW_START+10*ROW_PITCH+1,y);
  let position:Position=[start[0],reverse?5.5:0,start[1]];
  for(let i=0;i<1000;i++)position=walkStep3(position,[(end[0]-start[0])/1000,(end[1]-start[1])/1000],floor=>models.get(floor)!.barriers);
  expect(position[0]).toBeCloseTo(end[0],1);expect(position[2]).toBeCloseTo(end[1],1);expect(position[1]).toBeCloseTo(reverse?0:5.5,2);
  expect(pointInPolygon([position[0],position[2]],ANTONOV_FOOTPRINT)).toBe(true);
  expect(antonovHeight([position[0],position[2]])).toBeCloseTo(position[1]);
 });
});

describe('Gannon tiered aisles',()=>{
 for(const aisle of GANNON_AISLES)for(const reverse of [false,true])it(`walks ${reverse?'down':'up'} the ${aisle} m aisle below Antonov`,()=>{
  const y=225+aisle/AUD_SCALE,start=groundPlan(reverse?1495:1421,y),end=groundPlan(reverse?1421:1495,y);
  let position:Position=[start[0],reverse?.9:0,start[1]];
  for(let i=0;i<500;i++)position=walkStep3(position,[(end[0]-start[0])/500,(end[1]-start[1])/500],floor=>models.get(floor)!.barriers);
  expect(position[0]).toBeCloseTo(end[0],1);expect(position[2]).toBeCloseTo(end[1],1);expect(position[1]).toBeCloseTo(reverse?0:.9,2);
  expect(gannonHeight([position[0],position[2]])).toBeCloseTo(position[1]);
 });
 it('keeps seats on their platforms in both auditoriums',()=>{
  for(const id of ['0318','0324'])for(const seat of auditoriumSeats(id))expect((id==='0318'?gannonHeight:antonovHeight)(seat.point)).toBeCloseTo(seat.height);
 });
});


describe('rooftop circulation',()=>{
 function route(points:Point[]){
  let position:Position=[points[0][0],FLOOR_HEIGHT.R,points[0][1]];
  for(const end of points.slice(1)){
   const start=position,count=Math.ceil(Math.hypot(end[0]-start[0],end[1]-start[2])/.04);
   for(let i=0;i<count;i++)position=walkStep3(position,[(end[0]-start[0])/count,(end[1]-start[2])/count],f=>models.get(f)!.barriers);
   expect(position[0],`route to ${end}`).toBeCloseTo(end[0],1);
   expect(position[2],`route to ${end}`).toBeCloseTo(end[1],1);
  }
  return position;
 }
 it('keeps planting and the water feature within the roof outline',()=>{
  for(const polygon of [ROOF_LAWN,ROOF_POOL,...ROOF_BEDS])for(const point of polygon)expect(pointInPolygon(point,ROOF_PUBLIC_FOOTPRINT),`roof feature at ${point}`).toBe(true);
 });
 it('connects the stair landing to the foyer',()=>{
  const top=ENCLOSED_FLIGHTS.filter(f=>f.upper==='R').at(-1)!.to;
  route([[top[0],top[2]],plan(550,925),plan(578,925),plan(578,915)]);
 });
 for(const [index,side] of ['west','east'].entries())it(`walks through the ${side} terrace door onto the raised lawn and back`,()=>{
  const door=ROOF_DOORS[index],a=ROOF_FACADE[door.edge],b=ROOF_FACADE[door.edge+1],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  let nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
  if(pointInPolygon([door.center[0]+nx*.2,door.center[1]+nz*.2],ROOF_FOYER)){nx=-nx;nz=-nz;}
  const inside:Point=[door.center[0]-nx*1.4,door.center[1]-nz*1.4],outside:Point=[door.center[0]+nx*1.4,door.center[1]+nz*1.4];
  const pts:Point[]=index===0?[plan(578,915),plan(578,820),inside,door.center,outside,roofPlan(820,835),roofPlan(900,880)]:[plan(578,915),plan(722,900),inside,door.center,outside,roofPlan(700,977),roofPlan(820,970),roofPlan(900,900)];
  const end=route(pts);expect(end[1]).toBeCloseTo(FLOOR_HEIGHT.R+.15);
  let position=end;
  for(const target of pts.slice(0,-1).reverse()){
   const start=position;for(let i=0;i<400;i++)position=walkStep3(position,[(target[0]-start[0])/400,(target[1]-start[2])/400],f=>models.get(f)!.barriers);
   expect(position[0]).toBeCloseTo(target[0],1);expect(position[2]).toBeCloseTo(target[1],1);
  }
  expect(position[1]).toBeCloseTo(FLOOR_HEIGHT.R);
 });
 it('preserves the plan orientation and north stair alignment',()=>{
  const corner=roofPlan(1106,786),across=roofPlan(1088,1025),stair=roofPlan(575,750);
  expect(corner[0]).toBeCloseTo(plan(515,449)[0]);expect(corner[1]).toBeCloseTo(plan(515,449)[1]);
  expect(across[0]).toBeCloseTo(plan(740,449)[0]);expect(across[1]).toBeCloseTo(plan(740,449)[1]);
  expect(stair[0]).toBeCloseTo(plan(536,865)[0]);expect(stair[1]).toBeCloseTo(plan(536,865)[1]);
  const p=roofPlan(700,850),x=roofPlan(701,850),y=roofPlan(700,851);
  expect((x[0]-p[0])*(y[1]-p[1])-(x[1]-p[1])*(y[0]-p[0])).toBeGreaterThan(0);
 });
 it('keeps the pool and garden outside the gallery enclosure',()=>{
  for(const polygon of [ROOF_LAWN,ROOF_POOL,...ROOF_BEDS])for(const point of polygon)expect(pointInPolygon(point,ROOF_OUTDOOR),`outdoor feature at ${point}`).toBe(true);
 });
 it('prevents walking through the water-feature curb',()=>{
  const start=roofPlan(802,912),end=roofPlan(756,912);let position:Position=[start[0],FLOOR_HEIGHT.R,start[1]];
  for(let i=0;i<500;i++)position=walkStep3(position,[(end[0]-start[0])/500,(end[1]-start[1])/500],f=>models.get(f)!.barriers);
  expect(pointInPolygon([position[0],position[2]],ROOF_POOL)).toBe(false);
  expect(Math.hypot(position[0]-end[0],position[2]-end[1])).toBeGreaterThan(.4);
 });
 it('places the terrace shortcut on the raised lawn surface',()=>{
  const room=ROOMS.find(r=>r.id==='reisse-park')!,arrival=roomArrival(room,models.get('R')!.barriers)!;
  expect(pointInPolygon(arrival.point,ROOF_LAWN)).toBe(true);
  expect(arrival.height).toBeCloseTo(FLOOR_HEIGHT.R+.15);
 });
 it('reaches the gallery through its door',()=>{
  const door=ROOF_GALLERY.door;
  route([plan(578,915),[plan(578,791)[0],door[1]],door,[door[0]+.6,door[1]]]);
 });
});


describe('fourth-floor offices and corridors',()=>{
 for(const reverse of [false,true])it(`walks ${reverse?'back from':'to'} the far-west lounge along the office corridor`,()=>{
  let route:Point[]=[fourthPlan(650,801),...[[1045,710],[940,674],[692,550],[620,480],[312,210],[242,163]].map(([x,y])=>westFourthPlan(x,y))];
  if(reverse)route=[...route].reverse();
  let position:Position=[route[0][0],FLOOR_HEIGHT['4'],route[0][1]];
  for(const target of route.slice(1)){
   const start=position;for(let i=0;i<500;i++)position=walkStep3(position,[(target[0]-start[0])/500,(target[1]-start[2])/500],f=>models.get(f)!.barriers);
   const near=models.get('4')!.barriers.filter(b=>distanceToSegment([position[0],position[2]],b.a,b.b)<.5);
   expect(position[0],JSON.stringify({target,position,near})).toBeCloseTo(target[0],1);expect(position[2],JSON.stringify({target,position,near})).toBeCloseTo(target[1],1);
  }
 });

 const rooms=ROOMS.filter(r=>r.floor==='4'&&(r.kind==='office'||r.kind==='workroom'||r.kind==='restroom'||r.id.startsWith('4-core-room')));
 it('keeps office windows on the building envelope',()=>{
  const footprint=footprintForFloor('4');
  for(const room of rooms)for(const p of room.polygon)expect(pointInPolygon(p,footprint)||footprint.some((a,i)=>distanceToSegment(p,a,footprint[(i+1)%footprint.length])<.01),room.id).toBe(true);
 });
 for(const room of rooms)it(`walks through every doorway in ${room.id}`,()=>{
  for(const door of [room.door,...(room.additionalDoors??[])]){
   const edges=room.polygon.map((a,i)=>({a,b:room.polygon[(i+1)%room.polygon.length]}));
   const {a,b}=edges.sort((a,b)=>distanceToSegment(door,a.a,a.b)-distanceToSegment(door,b.a,b.b))[0];
   const length=Math.hypot(b[0]-a[0],b[1]-a[1]);let nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
   if(!pointInPolygon([door[0]+nx*.3,door[1]+nz*.3],room.polygon)){nx=-nx;nz=-nz;}
   const outside:Point=[door[0]-nx*.65,door[1]-nz*.65],inside:Point=[door[0]+nx*.65,door[1]+nz*.65];
   let position:Position=[outside[0],FLOOR_HEIGHT['4'],outside[1]];
   for(const target of [inside,outside]){
    const start=position;for(let i=0;i<100;i++)position=walkStep3(position,[(target[0]-start[0])/100,(target[1]-start[2])/100],f=>models.get(f)!.barriers);
    expect(position[0]).toBeCloseTo(target[0],1);expect(position[2]).toBeCloseTo(target[1],1);
   }
  }
 });
 for(const [name,from,to] of [
  ['west',[650,801],[1040,852.48]],['east',[620,953],[1040,953]],
 ] as const)it(`keeps the ${name} corridor open to the north lounge`,()=>{
  const a=fourthPlan(from[0],from[1]),b=fourthPlan(to[0],to[1]);let position:Position=[a[0],FLOOR_HEIGHT['4'],a[1]];
  for(let i=0;i<1000;i++)position=walkStep3(position,[(b[0]-a[0])/1000,(b[1]-a[1])/1000],f=>models.get(f)!.barriers);
  expect(position[0]).toBeCloseTo(b[0],1);expect(position[2]).toBeCloseTo(b[1],1);
 });
});


describe('Small Artifacts Lab circulation',()=>{
 const room=ROOMS.find(r=>r.id==='0102')!,f=labFrame(room);
 it('keeps every equipment footprint inside the traced room',()=>{
  const barriers:InteriorModel['barriers']=[],materials:THREE.Material[]=[];
  const base=new THREE.MeshBasicMaterial();
  buildSmallArtifacts(room,{box(){},cylinder(){},put(g){g.dispose();},palette:{white:base,oak:base,metal:base,glass:base,black:base,light:base},materials,barriers});
  for(const barrier of barriers)for(const p of [barrier.a,barrier.b])expect(pointInPolygon(p,room.polygon),`equipment at ${p}`).toBe(true);
  materials.forEach(m=>m.dispose());base.dispose();
 });
 for(const reverse of [false,true])it(`walks ${reverse?'out of':'into'} the lab and across its central aisle`,()=>{
  const route=[[4.1,-1],[4.1,2.4],[7.1,2.4],[4.1,2.4],[1.5,2.4]].map(([x,z])=>f.at(x,z));
  if(reverse)route.reverse();
  let position:Position=[route[0][0],0,route[0][1]];
  for(let j=1;j<route.length;j++){
   const a=route[j-1],end=route[j],count=Math.ceil(Math.hypot(end[0]-a[0],end[1]-a[1])/.04);
   for(let i=0;i<count;i++)position=walkStep3(position,[(end[0]-a[0])/count,(end[1]-a[1])/count],floor=>models.get(floor)!.barriers);
   expect(position[0]).toBeCloseTo(end[0],2);expect(position[2]).toBeCloseTo(end[1],2);expect(position[1]).toBe(0);
  }
 });
});


describe('Brin aerial robotics lab',()=>{
 const room=ROOMS.find(r=>r.id==='0108')!,f=labFrame(room);
 it('fits the published flight area and height into the room outline',()=>{
  const area=Math.abs(DRONE_CAGE.reduce((sum,a,i)=>{const b=DRONE_CAGE[(i+1)%DRONE_CAGE.length];return sum+a[0]*b[1]-b[0]*a[1];},0))/2;
  expect(area).toBeCloseTo(DRONE_CAGE_AREA,6);
  expect(DRONE_CAGE_WIDTH/.3048).toBeCloseTo(24,6);expect(DRONE_CAGE_DEPTH/.3048).toBeCloseTo(18,6);expect(DRONE_CAMERAS).toHaveLength(12);
  expect(DRONE_CAGE_HEIGHT).toBeCloseTo(4.572,6);
  for(const p of DRONE_CAGE)expect(pointInPolygon(f.at(...p),room.polygon)).toBe(true);
 });
 for(const reverse of [false,true])it(`walks ${reverse?'out of':'into'} the cage through the net opening`,()=>{
  const gate=(DRONE_GATE[0]+DRONE_GATE[1])/2;
  const doorU=(room.door[0]-room.polygon[0][0])*f.u[0]+(room.door[1]-room.polygon[0][1])*f.u[1];
  const route=[[doorU,-.8],[doorU,1.45],[gate,1.45],[gate,4]].map(([x,z])=>f.at(x,z));if(reverse)route.reverse();
  let position:Position=[route[0][0],0,route[0][1]];
  for(let j=1;j<route.length;j++){
   const a=route[j-1],end=route[j],count=Math.ceil(Math.hypot(end[0]-a[0],end[1]-a[1])/.04);
   for(let i=0;i<count;i++)position=walkStep3(position,[(end[0]-a[0])/count,(end[1]-a[1])/count],floor=>models.get(floor)!.barriers);
   expect(position[0]).toBeCloseTo(end[0],2);expect(position[2]).toBeCloseTo(end[1],2);
  }
 });
 it('leaves the side aisle to the repair bench clear',()=>{
  const route=[[4.6,.38],[7.75,.38],[7.75,4.9]].map(([x,z])=>f.at(x,z));let position:Position=[route[0][0],0,route[0][1]];
  for(let j=1;j<route.length;j++){
   const a=route[j-1],end=route[j],count=Math.ceil(Math.hypot(end[0]-a[0],end[1]-a[1])/.04);
   for(let i=0;i<count;i++)position=walkStep3(position,[(end[0]-a[0])/count,(end[1]-a[1])/count],floor=>models.get(floor)!.barriers);
   expect(position[0]).toBeCloseTo(end[0],2);expect(position[2]).toBeCloseTo(end[1],2);
  }
 });
 it('stops a walker at the closed portion of the net',()=>{
  const a=f.at(3.5,DRONE_CAGE[0][1]-.5),end=f.at(3.5,DRONE_CAGE[0][1]+.5);let position:Position=[a[0],0,a[1]];
  for(let i=0;i<100;i++)position=walkStep3(position,[(end[0]-a[0])/100,(end[1]-a[1])/100],floor=>models.get(floor)!.barriers);
  expect(Math.hypot(position[0]-end[0],position[2]-end[1])).toBeGreaterThan(.65);
 });
});


describe('Robotics Manipulator Lab',()=>{
 const room=ROOMS.find(r=>r.id==='0116')!,f=labFrame(room);
 it('includes the documented inventory with all station footprints inside the room',()=>{
  expect(ROBOT_STATIONS.map(s=>s.kind).sort()).toEqual(['baxter','kuka','kuka','sawyer','ur3e','ur3e','ur5e']);
  const barriers:InteriorModel['barriers']=[],materials:THREE.Material[]=[];const base=new THREE.MeshBasicMaterial();
  buildRoboticsLab(room,{box(){},cylinder(){},put(g){g.dispose();},palette:{white:base,oak:base,metal:base,glass:base,black:base,light:base},materials,barriers});
  for(const barrier of barriers)for(const p of [barrier.a,barrier.b])expect(pointInPolygon(p,room.polygon),`station at ${p}`).toBe(true);
  materials.forEach(m=>m.dispose());base.dispose();
 });
 for(const reverse of [false,true])it(`walks ${reverse?'out of':'into'} the lab and between the robot stations`,()=>{
  const doorU=(room.door[0]-room.polygon[0][0])*f.u[0]+(room.door[1]-room.polygon[0][1])*f.u[1];
  const route=[[doorU,-1],[doorU,1.6],[4.3,2.5],[4.3,4.4],[5.9,4.4],[5.9,7.3]].map(([x,z])=>f.at(x,z));if(reverse)route.reverse();
  let position:Position=[route[0][0],0,route[0][1]];
  for(let j=1;j<route.length;j++){
   const a=route[j-1],end=route[j],count=Math.ceil(Math.hypot(end[0]-a[0],end[1]-a[1])/.04);
   for(let i=0;i<count;i++)position=walkStep3(position,[(end[0]-a[0])/count,(end[1]-a[1])/count],floor=>models.get(floor)!.barriers);
   expect(position[0]).toBeCloseTo(end[0],2);expect(position[2]).toBeCloseTo(end[1],2);expect(position[1]).toBe(0);
  }
 });
});


describe('Breakpoint Café access',()=>{
 for(const reverse of [false,true])it(`walks ${reverse?'back':'along'} the full public counter aisle`,()=>{
  const a=cafePoint(reverse?CAFE_LENGTH-.4:.4,1.1),end=cafePoint(reverse?.4:CAFE_LENGTH-.4,1.1);let position:Position=[a[0],0,a[1]];
  for(let i=0;i<400;i++)position=walkStep3(position,[(end[0]-a[0])/400,(end[1]-a[1])/400],floor=>models.get(floor)!.barriers);
  expect(position[0]).toBeCloseTo(end[0],2);expect(position[2]).toBeCloseTo(end[1],2);expect(position[1]).toBe(0);
 });
 it('blocks walking through the counter and display glass',()=>{
  const a=cafePoint(3,.7),end=cafePoint(3,-.7);let position:Position=[a[0],0,a[1]];
  for(let i=0;i<100;i++)position=walkStep3(position,[(end[0]-a[0])/100,(end[1]-a[1])/100],floor=>models.get(floor)!.barriers);
  expect(Math.hypot(position[0]-end[0],position[2]-end[1])).toBeGreaterThan(.85);
 });
});


it('keeps all curved lounge seating and coffee tables inside the ground-floor envelope',()=>{
 const barriers:InteriorModel['barriers']=[],materials:THREE.Material[]=[];const base=new THREE.MeshBasicMaterial();
 buildLobbySeating({box(){},cylinder(){},surface(){},wall(){},label(){},put(g){g.dispose();},contact(){},palette:{white:base,oak:base,metal:base,glass:base,black:base,light:base},materials,textures:[],barriers});
 for(const barrier of barriers)for(const p of [barrier.a,barrier.b])expect(pointInPolygon(p,footprintForFloor('G')),`lounge fixture at ${p}`).toBe(true);
 materials.forEach(m=>m.dispose());base.dispose();
});


function walkInteriorTargets(room:typeof ROOMS[number],targets:Point[][],gridStep?:number){
  const step=gridStep??(room.kind==='restroom'?.1:.25),minX=Math.min(...room.polygon.map(p=>p[0])),minZ=Math.min(...room.polygon.map(p=>p[1]));
  const maxX=Math.max(...room.polygon.map(p=>p[0])),maxZ=Math.max(...room.polygon.map(p=>p[1]));
  const local=FLOOR_ORDER.flatMap(f=>models.get(f)!.barriers.map(b=>({...b,minY:(b.minY??0)+FLOOR_HEIGHT[f]-FLOOR_HEIGHT[room.floor],maxY:(b.maxY??(f==='G'?10.5:f==='R'?1.2:4.2))+FLOOR_HEIGHT[f]-FLOOR_HEIGHT[room.floor]}))).filter(b=>(b.minY??0)<1.65&&(b.maxY??Infinity)>0&&Math.max(b.a[0],b.b[0])>=minX-.5&&Math.min(b.a[0],b.b[0])<=maxX+.5&&Math.max(b.a[1],b.b[1])>=minZ-.5&&Math.min(b.a[1],b.b[1])<=maxZ+.5);
  const free=new Map<string,Point>();
  for(let i=0;i*step<=maxX-minX;i++)for(let j=0;j*step<=maxZ-minZ;j++){
   const p:Point=[minX+i*step,minZ+j*step];
   if(pointInPolygon(p,room.polygon)&&local.every(b=>distanceToSegment(p,b.a,b.b)>.26))free.set(`${i},${j}`,p);
  }
  const start=[...free].sort((a,b)=>Math.hypot(a[1][0]-room.door[0],a[1][1]-room.door[1])-Math.hypot(b[1][0]-room.door[0],b[1][1]-room.door[1]))[0];
  expect(start).toBeDefined();expect(Math.hypot(start[1][0]-room.door[0],start[1][1]-room.door[1])).toBeLessThan(.55);
  const parents=new Map<string,string|null>([[start[0],null]]),queue=[start[0]];
  for(let head=0;head<queue.length;head++){
   const key=queue[head],[i,j]=key.split(',').map(Number);
   for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const next=`${i+di},${j+dj}`;
    if(free.has(next)&&!parents.has(next)){parents.set(next,key);queue.push(next);}
   }
  }
  for(const approaches of targets){
   const end=queue.find(key=>approaches.some(p=>Math.hypot(p[0]-free.get(key)![0],p[1]-free.get(key)![1])<.4));
   expect(end,`${room.id}: target group ${targets.indexOf(approaches)} is unreachable; ${JSON.stringify(approaches)}; reached ${queue.length}/${free.size}`).toBeDefined();
   const path:Point[]=[];let key:string|null=end!;
   while(key!==null){path.push(free.get(key)!);key=parents.get(key)!;}path.reverse();
   let position:Position=[path[0][0],FLOOR_HEIGHT[room.floor],path[0][1]];
   for(const target of (room.kind==='garden'?[...path.slice(1),...path.slice(0,-1).reverse()]:path.slice(1))){
    position=walkStep3(position,[target[0]-position[0],target[1]-position[2]],f=>models.get(f)!.barriers);
    expect(position[0]).toBeCloseTo(target[0],2);expect(position[2]).toBeCloseTo(target[1],2);
   }
  }
}

describe('fourth-floor shared workroom furniture',()=>{
 const rooms=ROOMS.filter(r=>r.floor==='4'&&r.deskBanks);
 for(const room of rooms)it(`reaches every desk bank from the doorway in ${room.id}`,()=>{
  walkInteriorTargets(room,room.deskBanks!.map(bank=>{
   const length=Math.hypot(bank.to[0]-bank.from[0],bank.to[1]-bank.from[1]),ux=(bank.to[0]-bank.from[0])/length,uz=(bank.to[1]-bank.from[1])/length;
   return [[bank.from[0]-ux*.65,bank.from[1]-uz*.65],[bank.to[0]+ux*.65,bank.to[1]+uz*.65]];
  }));
 });

 for(const room of rooms)it(`fits the traced desk banks and seating in ${room.id}`,()=>{
  const banks=room.deskBanks!.map(bank=>{
   const length=Math.hypot(bank.to[0]-bank.from[0],bank.to[1]-bank.from[1]),ux=(bank.to[0]-bank.from[0])/length,uz=(bank.to[1]-bank.from[1])/length;
   const at=(u:number,v:number):Point=>[(bank.from[0]+bank.to[0])/2+ux*u-uz*v,(bank.from[1]+bank.to[1])/2+uz*u+ux*v];
   return {...bank,length,at,polygon:[at(-length/2,-.625),at(length/2,-.625),at(length/2,.625),at(-length/2,.625)]};
  });
  banks.forEach((bank,index)=>{
   for(const p of bank.polygon)expect(pointInPolygon(p,room.polygon),`${room.id} bank ${index} corner ${p}`).toBe(true);
   for(const side of [-1,1])for(let i=0;i<bank.seatsPerSide;i++){
    const p=bank.at(((i+.5)/bank.seatsPerSide-.5)*bank.length,side*1.05);
    expect(pointInPolygon(p,room.polygon),`${room.id} chair ${index}/${side}/${i}`).toBe(true);
    expect(Math.min(...room.polygon.map((a,j)=>distanceToSegment(p,a,room.polygon[(j+1)%room.polygon.length]))),`${room.id} chair against wall`).toBeGreaterThan(.4);
    for(const other of banks.filter(b=>b!==bank)){
     expect(pointInPolygon(p,other.polygon),`${room.id} chair inside another desk`).toBe(false);
     for(const otherSide of [-1,1])for(let k=0;k<other.seatsPerSide;k++){
      const q=other.at(((k+.5)/other.seatsPerSide-.5)*other.length,otherSide*1.05);
      expect(Math.hypot(p[0]-q[0],p[1]-q[1]),`${room.id} overlapping chairs ${index}/${side}/${i} and ${banks.indexOf(other)}/${otherSide}/${k}`).toBeGreaterThan(.55);
     }
     expect(Math.min(...other.polygon.map((a,j)=>distanceToSegment(p,a,other.polygon[(j+1)%other.polygon.length]))),`${room.id} chair overlapping another desk`).toBeGreaterThan(.3);
    }
   }
  });
 });
});


describe('restroom fixtures',()=>{
 for(const room of ROOMS.filter(r=>r.kind==='restroom')){
  it(`keeps all fixtures and partitions inside ${room.id}`,()=>{
   const barriers:InteriorModel['barriers']=[],materials:THREE.Material[]=[],textures:THREE.Texture[]=[];
   const base=new THREE.MeshBasicMaterial();
   buildRestroom(room,{box(){},cylinder(){},surface(){},wall(a,b,h,_m,collision=true,base=0){if(collision)barriers.push({a,b,minY:base,maxY:base+h});},label(){},put(g){g.dispose();},palette:{white:base,oak:base,metal:base,glass:base,black:base,light:base},materials,textures,barriers});
   const outside=barriers.flatMap(wall=>[wall.a,wall.b]).filter(p=>!pointInPolygon(p,room.polygon)&&!room.polygon.some((a,i)=>distanceToSegment(p,a,room.polygon[(i+1)%room.polygon.length])<.02));
   expect(outside,`${room.id} fixtures outside walls`).toEqual([]);
   materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());base.dispose();
  });
  it(`connects the entry to all stalls and sinks in ${room.id}`,()=>{
   const data=RESTROOM_PLANS[room.id as keyof typeof RESTROOM_PLANS],row=restroomFrame(room,data.back[0],data.back[1]),sinks=restroomFrame(room,data.sinks[0],data.sinks[1]);
   const targets:Point[][]=restroomStalls(data,row.length).map(stall=>[row.at(stall.center,stall.depth-.3)]);
   for(let i=0;i<data.sinkCount;i++)targets.push([sinks.at((i+.5)*sinks.length/data.sinkCount,.98)]);
   walkInteriorTargets(room,targets);
  });
  it(`walks through every open stall doorway in ${room.id}`,()=>{
   const data=RESTROOM_PLANS[room.id as keyof typeof RESTROOM_PLANS],f=restroomFrame(room,data.back[0],data.back[1]);
   for(const [i,stall] of restroomStalls(data,f.length).entries()){
    const x=stall.center,start=f.at(x,stall.depth+.32),inside=f.at(x,stall.depth-.3);
    let position:Position=[start[0],FLOOR_HEIGHT[room.floor],start[1]];
    for(const target of [inside,start]){
     const from=position;for(let j=0;j<100;j++)position=walkStep3(position,[(target[0]-from[0])/100,(target[1]-from[2])/100],floor=>models.get(floor)!.barriers);
     expect(position[0],`${room.id} stall ${i}`).toBeCloseTo(target[0],1);expect(position[2],`${room.id} stall ${i}`).toBeCloseTo(target[1],1);
    }
   }
  });
 }
});


describe('amphitheater split-level floor',()=>{
 for(const [name,start,end] of [
  ['south',amphPoint(-.6,AMPH_DEPTH+.8),amphPoint(AMPH_WIDTH+.6,AMPH_DEPTH+.8)],
  ['north',amphPoint(AMPH_NORTH_AISLE+1,-.45),amphPoint(AMPH_NORTH_AISLE+1,3.6)],
 ] as const)for(const reverse of [false,true])it(`walks ${reverse?'up':'down'} the ${name} stair`,()=>{
  const from:Position=[start[0],0,start[1]],to:Position=[end[0],-AMPH_DROP,end[1]];
  follow([{from,to,width:1,lower:'G',upper:'G'}],reverse);
 });
 it('connects the lower entrance through the north return to the atrium in both directions',()=>{
  const path:Position[]=[[ENTRY[0],-AMPH_DROP,ENTRY[1]]];
  for(const [u,v,h] of [[8.5,4,-AMPH_DROP],[8.5,-.45,0],[-1,-.45,0],[-1,AMPH_DEPTH+.8,0]]){const p=amphPoint(u,v);path.push([p[0],h,p[1]]);}
  path.push(ATRIUM_FLIGHTS[0].from);
  const route:Flight[]=path.slice(0,-1).map((from,i)=>({from,to:path[i+1],width:1,lower:'G',upper:'G'}));
  follow(route);follow(route,true);
 });
 it('collides with the column below the main lobby elevation',()=>{
  const start=amphPoint(6.4,2.5),end=amphPoint(6.4,-.1);let p:Position=[start[0],-AMPH_DROP,start[1]];
  for(let i=0;i<200;i++)p=walkStep3(p,[(end[0]-start[0])/200,(end[1]-start[1])/200],f=>models.get(f)!.barriers);
  const column=amphPoint(6.4,1);expect(Math.hypot(p[0]-column[0],p[2]-column[1])).toBeGreaterThanOrEqual(.54);
  expect(Math.hypot(p[0]-start[0],p[2]-start[1])).toBeLessThan(1.1);
 });
 it('starts at the lower entrance floor',()=>expect(amphitheaterHeight(ENTRY)).toBe(-AMPH_DROP));
 it('does not walk through the fronts of the seating tiers',()=>{
  const start=amphPoint(AMPH_WIDTH+.3,5);
  let p:Position=[start[0],-AMPH_DROP,start[1]];
  const target=amphPoint(-1,5);
  for(let i=0;i<300;i++)p=walkStep3(p,[(target[0]-start[0])/300,(target[1]-start[1])/300],f=>models.get(f)!.barriers);
  expect(Math.hypot(p[0]-target[0],p[2]-target[1])).toBeGreaterThan(3);
 });
});


describe('upper floor slab undersides',()=>{
 for(const floor of FLOOR_ORDER.filter(f=>f!=='G'))it(`blocks the view through the underside of level ${floor}`,()=>{
  const mesh=models.get(floor)!.group.children.find(c=>c instanceof THREE.Mesh&&(c.material as THREE.Material).name==='Floor slab underside') as THREE.Mesh;
  expect(mesh).toBeDefined();
  const p=plan(625,600),ray=new THREE.Raycaster(new THREE.Vector3(p[0],-.5,p[1]),new THREE.Vector3(0,1,0),0,1);
  const hits=ray.intersectObject(mesh);expect(hits.length).toBeGreaterThan(0);expect(hits[0].point.y).toBeCloseTo(-.19,4);
 });
});

describe('first-floor family garden',()=>{
 it('keeps planting beds on the deck and outside the auditorium',()=>{
  for(const bed of FAMILY_BEDS)for(const p of bed){
   expect(pointInPolygon(p,FAMILY_TERRACE),`bed vertex ${p}`).toBe(true);
   expect(pointInPolygon(p,ANTONOV_FOOTPRINT),`auditorium overlap ${p}`).toBe(false);
  }
 });
 it('places the maples inside their planting beds',()=>{
  FAMILY_MAPLES.forEach(p=>expect(FAMILY_BEDS.some(bed=>pointInPolygon(p,bed))).toBe(true));
 });
 it('connects the corridor and terrace through the open glazed doorway',()=>{
  const d=FAMILY_GARDEN_DOOR,path:Position[]=[[d[0]+1.5,6.5,d[1]],[d[0]-.01,6.5,d[1]],[d[0]-1.6,6.5,d[1]]];
  const route:Flight[]=path.slice(0,-1).map((from,i)=>({from,to:path[i+1],width:1,lower:'1',upper:'1'}));follow(route);follow(route,true);
 });
 it('walks around the planters from the entrance to the far terrace and back',()=>{
  const targets:Point[][]=[[545,707],[581,619],[729,627]].map(([x,y])=>[familyGardenPlan(x,y)]);
  // Public viewpoints are inside the outer guard, not in the planted strip.
  for(const [edge,t] of [[0,.5],[9,.5],[10,.25],[10,.6],[10,.85]]){
   const a=FAMILY_TERRACE[edge],b=FAMILY_TERRACE[edge+1],length=Math.hypot(b[0]-a[0],b[1]-a[1]),p:Point=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];let nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
   if(!pointInPolygon([p[0]+nx*.1,p[1]+nz*.1],FAMILY_TERRACE)){nx=-nx;nz=-nz;}
   targets.push([[p[0]+nx*.8,p[1]+nz*.8]]);
  }
  walkInteriorTargets(FAMILY_GARDEN,targets);
 });
});


it('opens the garden glazing through the auditorium wall',()=>{
 const center:Point=[ANTONOV_FOOTPRINT.reduce((s,p)=>s+p[0],0)/ANTONOV_FOOTPRINT.length,ANTONOV_FOOTPRINT.reduce((s,p)=>s+p[1],0)/ANTONOV_FOOTPRINT.length];
 for(const i of [5,7,8,9]){
  const a=ANTONOV_FOOTPRINT[i],b=ANTONOV_FOOTPRINT[i+1],p:Point=[a[0]*.43+b[0]*.57,a[1]*.43+b[1]*.57],length=Math.hypot(b[0]-a[0],b[1]-a[1]);let nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
  if(nx*(p[0]-center[0])+nz*(p[1]-center[1])<0){nx=-nx;nz=-nz;}
  const ray=new THREE.Raycaster(new THREE.Vector3(p[0]+nx*.35,7.7,p[1]+nz*.35),new THREE.Vector3(-nx,0,-nz),0,.7);
  const hits=ray.intersectObject(models.get('G')!.group,true);
  expect(hits.length).toBeGreaterThan(0);expect(((hits[0].object as THREE.Mesh).material as THREE.Material).name).toBe('Auditorium garden glazing');
 }
});


describe('Sandbox studio layout and circulation',()=>{
 it('fits every workstation inside its documented studio or common area',()=>{
  for(const station of SANDBOX_STATIONS){
   const room=station.room==='1231'?SANDBOX_COMMON:SANDBOX_STUDIOS.find(r=>r.id===station.room)!;
   for(const point of sandboxStationFootprint(station))expect(pointInPolygon(point,room.polygon),`${station.kind} in ${station.room} at ${point}`).toBe(true);
  }
 });
 it('connects the suite entrance to every studio and equipment station and back',()=>{
  const suite={...SANDBOX_COMMON,kind:'garden' as const,polygon:[[205,25],[885,95],[835,593],[205,593]].map(([x,y])=>sandboxPlan(x,y))};
  const targets=SANDBOX_STATIONS.map(station=>[-1,1].map(side=>sandboxStationPoint(station,0,side*(station.depth/2+.6))));
  walkInteriorTargets(suite,targets);
 });
});


describe('Level 1 north corridor',()=>{
 it('connects classroom 1207, both restrooms, and the Sandbox entrance in both directions',()=>{
  const classroom=ROOMS.find(r=>r.id==='1207')!;
  const corridor={...classroom,kind:'garden' as const,polygon:[[516,450],[739,450],[805,1050],[508,1050]].map(([x,y])=>plan(x,y))};
  walkInteriorTargets(corridor,[...FIRST_RESTROOMS,SANDBOX_COMMON].map(room=>[roomArrival(room,models.get('1')!.barriers)!.point]));
 });
});


describe('Level 2 north corridor',()=>{
 it('connects classroom 2207 to both restrooms and back',()=>{
  const classroom=ROOMS.find(r=>r.id==='2207')!;
  const corridor={...classroom,kind:'garden' as const,polygon:[[516,450],[739,450],[805,1050],[508,1050]].map(([x,y])=>plan(x,y))};
  walkInteriorTargets(corridor,SECOND_RESTROOMS.map(room=>[roomArrival(room,models.get('2')!.barriers)!.point]));
 });
});


describe('Hatchery and Level 2 north offices',()=>{
 it('places the collaboration shortcut in the common area, outside enclosed rooms',()=>{
  const arrival=roomArrival(HATCHERY_COMMON,models.get('2')!.barriers)!;
  expect(arrival).toBeDefined();expect(pointInPolygon(arrival.point,HATCHERY_COMMON.polygon)).toBe(true);
  expect(HATCHERY_ROOMS.some(room=>pointInPolygon(arrival.point,room.polygon))).toBe(false);
  expect(pointInPolygon([arrival.point[0]-Math.sin(arrival.yaw)*2,arrival.point[1]-Math.cos(arrival.yaw)*2],HATCHERY_COMMON.polygon)).toBe(true);
 });
 it('keeps furniture and chairs within their rooms',()=>{
  for(const room of [HATCHERY_COMMON,...HATCHERY_ROOMS.filter(r=>r.kind==='workroom')]){
   const barriers:InteriorModel['barriers']=[],materials:THREE.Material[]=[],textures:THREE.Texture[]=[],base=new THREE.MeshBasicMaterial();
   buildHatchery(room.id,{box(){},cylinder(){},surface(){},wall(){},label(){},put(g){g.dispose();},palette:{white:base,oak:base,metal:base,glass:base,black:base,light:base},materials,textures,barriers});
   const outside=barriers.flatMap(wall=>[wall.a,wall.b]).filter(p=>!pointInPolygon(p,room.polygon));
   expect(outside,room.id).toEqual([]);materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());base.dispose();
  }
 });
 it('keeps common-area furniture clear of the offices and workrooms',()=>{
  for(const item of HATCHERY_ITEMS.filter(item=>item.room===HATCHERY_COMMON.id))for(const p of hatcheryItemFootprint(item))expect(HATCHERY_ROOMS.some(room=>pointInPolygon(p,room.polygon))).toBe(false);
 });
 it('connects classroom 2207 to both workrooms, every office, and every shared furniture zone',()=>{
  const classroom=ROOMS.find(r=>r.id==='2207')!,suite={...classroom,kind:'garden' as const,polygon:[[516,450],[739,450],[805,1050],[508,1050]].map(([x,y])=>plan(x,y))};
  const targets:Point[][]=HATCHERY_ROOMS.map(room=>[roomArrival(room,models.get('2')!.barriers)!.point]);
  for(const item of HATCHERY_ITEMS){const f=hatcheryItemFrame(item);targets.push(item.kind==='desk'?[f.at(0,item.depth/2+.95)]:item.kind==='windowbar'?[f.at(0,1.2)]:item.kind==='round'?[f.at(item.width/2+1,0),f.at(-item.width/2-1,0),f.at(0,item.depth/2+1),f.at(0,-item.depth/2-1)]:[f.at(0,item.depth/2+1),f.at(0,-item.depth/2-1)]);}
  for(const room of HATCHERY_ROOMS.filter(room=>room.kind==='office')){
   const a=room.polygon[0],b=room.polygon[1],length=Math.hypot(b[0]-a[0],b[1]-a[1]),u:Point=[(b[0]-a[0])/length,(b[1]-a[1])/length],mid:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2];let n:Point=[-u[1],u[0]];
   if(!pointInPolygon([mid[0]+n[0]*.3,mid[1]+n[1]*.3],room.polygon))n=[-n[0],-n[1]];
   targets.push([[mid[0]+n[0]*2.4,mid[1]+n[1]*2.4]]);
  }
  walkInteriorTargets(suite,targets,.1);
 },60000);
});

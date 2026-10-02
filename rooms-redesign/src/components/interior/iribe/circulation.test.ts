import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildInteriorFloor, type InteriorModel } from './model';
import { plan, fourthPlan, footprintForFloor, roofPlan, ROOF_GALLERY, ROOF_PUBLIC_FOOTPRINT, type Point, type FloorId } from './layout';
import { ROOF_BEDS, ROOF_LAWN, ROOF_POOL, ROOF_DOORS, ROOF_FACADE, ROOF_FOYER, ROOF_OUTDOOR } from './roof-layout';
import { ATRIUM_LANDING, ATRIUM_FLIGHTS, ENCLOSED_FLIGHTS, FLOOR_ORDER, type Flight, type Position } from './circulation';
import { GANNON_AISLES, gannonHeight, AUD_AISLES, AUD_SCALE, ROW_START, ROW_PITCH, auditoriumSeats, antonovHeight } from './auditorium';
import { walkStep3 } from './walk';
import { roomArrival } from './arrival';
import { labFrame, buildSmallArtifacts, DRONE_CAGE, DRONE_CAGE_AREA, DRONE_CAGE_HEIGHT, DRONE_CAGE_WIDTH, DRONE_CAGE_DEPTH, DRONE_CAMERAS, DRONE_GATE } from './labs';
import * as THREE from 'three';
import { buildRoboticsLab, ROBOT_STATIONS } from './robotics';
import { buildLobbySeating } from './lobby';
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
  const approach:Flight={from:[ENTRY[0],0,ENTRY[1]],to:first,width:1.8,lower:'G',upper:'G'};
  const exit:Flight={from:end,to:[end[0]-.8,end[1],end[2]],width:1.8,lower:'1',upper:'1'};
  follow([approach,...ATRIUM_FLIGHTS,ATRIUM_LANDING,exit]);
  follow([approach,...ATRIUM_FLIGHTS,ATRIUM_LANDING,exit],true);
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
 const rooms=ROOMS.filter(r=>r.floor==='4'&&(r.kind==='office'||r.kind==='workroom'));
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

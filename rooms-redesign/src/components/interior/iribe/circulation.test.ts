import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildInteriorFloor, type InteriorModel } from './model';
import type { FloorId } from './layout';
import { ATRIUM_LANDING, ATRIUM_FLIGHTS, ENCLOSED_FLIGHTS, FLOOR_ORDER, type Flight, type Position } from './circulation';
import { GANNON_AISLES, gannonHeight, AUD_AISLES, AUD_SCALE, ROW_START, ROW_PITCH, auditoriumSeats, antonovHeight } from './auditorium';
import { walkStep3 } from './walk';
import { roomArrival } from './arrival';
import { ROOMS, FLOOR_HEIGHT, ANTONOV_FOOTPRINT, groundPlan, pointInPolygon, distanceToSegment } from './layout';

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

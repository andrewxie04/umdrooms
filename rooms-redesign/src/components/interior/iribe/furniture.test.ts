import { FIRST_OFFICES, SANDBOX_SUPPORT } from './layout';
import { firstOfficeFurniture } from './first-offices';
import { describe, expect, it } from 'vitest';
import { ROOMS, pointInPolygon } from './layout';
import { clearInside, meetingTable, meetingSeats, MEETING_CAPACITIES, teachingTables } from './furniture';
import { CONFERENCE_AV_ROOMS, conferenceDisplayFrame } from './conference-av';
import { distanceToSegment } from './layout';
import { structuralColumns } from './structure';

describe('room furniture clearance',()=>{
 for(const room of ROOMS.filter(r=>r.kind==='classroom'))it(`${room.id} keeps table clusters inside walls and away from its doorway`,()=>{
  const tables=teachingTables(room);
  expect(tables.length).toBeGreaterThan(0);
  expect(tables.length).toBe(room.id==='1116'?16:9);
  for(const p of tables){
   expect(clearInside(room,p,1.32)).toBe(true);
   expect(Math.hypot(p[0]-room.door[0],p[1]-room.door[1])).toBeGreaterThan(2.4);
   for(const q of tables)if(p!==q)expect(Math.hypot(p[0]-q[0],p[1]-q[1])).toBeGreaterThan(room.id==='1207'?2.65:3.09);
  }
 });
 for(const room of ROOMS.filter(r=>r.kind==='conference'))it(`${room.id} fits its table and chairs within the actual room`,()=>{
  const table=meetingTable(room);expect(table).not.toBeNull();if(!table)return;
  const {center:[x,z],length,width,u,v}=table;
  for(const a of [-length/2-.3,length/2+.3])for(const b of [-width/2-.65,width/2+.65])expect(pointInPolygon([x+u[0]*a+v[0]*b,z+u[1]*a+v[1]*b],room.polygon)).toBe(true);
  const seats=meetingSeats(room,table);
  if(MEETING_CAPACITIES[room.id])expect(seats).toHaveLength(MEETING_CAPACITIES[room.id]);
  for(const {point} of seats){
   expect(clearInside(room,point,.26)).toBe(true);
   for(const other of seats)if(point!==other.point)expect(Math.hypot(point[0]-other.point[0],point[1]-other.point[1])).toBeGreaterThan(.52);
  }
 });
});

describe('documented conference AV placement',()=>{
 for(const room of ROOMS.filter(r=>CONFERENCE_AV_ROOMS.has(r.id)))it(`${room.id} keeps display hardware inside the room and clear of door openings`,()=>{
  const frame=conferenceDisplayFrame(room);expect(frame).not.toBeNull();if(!frame)return;
  for(const x of [-.96,.96])for(const z of [.12,.35])expect(pointInPolygon(frame.at(x,z),room.polygon)).toBe(true);
  const a=frame.at(-.96,0),b=frame.at(.96,0);
  for(const door of [room.door,...(room.additionalDoors??[])])expect(distanceToSegment(door,a,b)).toBeGreaterThan((room.doorWidth??1.6)/2);
  // Small controllers and keyboards must not overhang the fitted tabletop.
  expect(meetingTable(room)!.length/2).toBeGreaterThan(.645);
  for(const column of structuralColumns(room.floor))for(const x of [-.9,0,.9])expect(distanceToSegment(column,meetingTable(room)!.center,frame.at(x,.28))).toBeGreaterThanOrEqual(.4);
 });
});

describe('Level 1 perimeter office furniture',()=>{
 for(const room of [...FIRST_OFFICES,...SANDBOX_SUPPORT.filter(r=>r.id==='1214')])it(`${room.id} contains its desks and chair footprints`,()=>{
  const {frame,surfaces,chairs,round}=firstOfficeFurniture(room);
  for(const desk of surfaces)for(const x of [-1,1])for(const z of [-1,1])expect(clearInside(room,frame.at(desk.x+x*desk.w/2,desk.z+z*desk.d/2),.02)).toBe(true);
  for(const chair of chairs)expect(clearInside(room,chair.point,.26)).toBe(true);
  if(round)expect(clearInside(room,round.point,round.radius)).toBe(true);
 });
});

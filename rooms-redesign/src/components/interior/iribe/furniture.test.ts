import { describe, expect, it } from 'vitest';
import { ROOMS, pointInPolygon } from './layout';
import { clearInside, meetingTable, teachingTables } from './furniture';

describe('room furniture clearance',()=>{
 for(const room of ROOMS.filter(r=>r.kind==='classroom'))it(`${room.id} keeps table clusters inside walls and away from its doorway`,()=>{
  const tables=teachingTables(room);
  expect(tables.length).toBeGreaterThan(0);
  expect(tables.length).toBe(room.id==='1116'?16:9);
  for(const p of tables){
   expect(clearInside(room,p,1.32)).toBe(true);
   expect(Math.hypot(p[0]-room.door[0],p[1]-room.door[1])).toBeGreaterThan(2.4);
   for(const q of tables)if(p!==q)expect(Math.hypot(p[0]-q[0],p[1]-q[1])).toBeGreaterThan(3.09);
  }
 });
 for(const room of ROOMS.filter(r=>r.kind==='conference'))it(`${room.id} fits its table and chairs within the actual room`,()=>{
  const table=meetingTable(room);expect(table).not.toBeNull();if(!table)return;
  const {center:[x,z],length,width,u,v}=table;
  for(const a of [-length/2-.3,length/2+.3])for(const b of [-width/2-.65,width/2+.65])expect(pointInPolygon([x+u[0]*a+v[0]*b,z+u[1]*a+v[1]*b],room.polygon)).toBe(true);
 });
});

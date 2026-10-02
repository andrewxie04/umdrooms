import { describe,it,expect } from 'vitest';
import { canStand,walkStep } from './walk';
import { ENTRY, GROUND_FOOTPRINT, MAIN_FOOTPRINT, ROOMS, pointInPolygon, plan, type Polygon } from './layout';
const floor:Polygon=[[0,0],[10,0],[10,10],[0,10]];
describe('interior walking',()=>{
 it('does not tunnel through a wall on a long frame',()=>{
  const barriers=[{a:[5,0] as const,b:[5,10] as const}];
  const next=walkStep([2,5],[7,0],floor,barriers);
  expect(next[0]).toBeLessThan(4.77);expect(next[0]).toBeGreaterThan(4.5);
 });
 it('can walk through an actual doorway and slides along adjacent walls',()=>{
  const barriers=[{a:[5,0] as const,b:[5,4] as const},{a:[5,6] as const,b:[5,10] as const}];
  expect(walkStep([2,5],[6,0],floor,barriers)[0]).toBeCloseTo(8);
  const slide=walkStep([4.7,2],[2,1],floor,barriers);
  expect(slide[0]).toBeLessThan(5);expect(slide[1]).toBeCloseTo(3);
 });
 it('keeps the visitor inside the modeled footprint',()=>{
  expect(canStand([-1,5],floor,[])).toBe(false);
  expect(walkStep([5,5],[100,0],floor,[])[0]).toBeLessThan(10);
 });
 it('spawns inside the ground entrance and upper-floor circulation',()=>{
  expect(pointInPolygon(ENTRY,GROUND_FOOTPRINT)).toBe(true);
  expect(pointInPolygon(plan(650,1040),MAIN_FOOTPRINT)).toBe(true);
 });
 it('keeps all traced room coordinates finite and IDs unique per floor',()=>{
  expect(new Set(ROOMS.map(r=>r.floor+'/'+r.id)).size).toBe(ROOMS.length);
  for(const room of ROOMS){expect(room.polygon.length).toBeGreaterThan(2);for(const p of [...room.polygon,room.door])expect(p.every(Number.isFinite)).toBe(true);}
 });
});

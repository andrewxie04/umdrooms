import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import campusData from '../../../../public/campus-data.json';
import treeData from '../../../../public/campus-trees.json';
import type { CampusData } from '../../map3d/scene/types';
import { SITE_A, SITE_B, SITE_OFFSET, SITE_SCALE, SITE_ANCHORS, SURROUNDINGS_RADIUS, campusToInterior, geoToInterior, outsideInterior, selectSurroundings, siteProjection } from './surroundings-layout';
import { groundPlan } from './layout';

const data=campusData as unknown as CampusData;
const selected=selectSurroundings(data,treeData as CampusData['trees']);
describe('Iribe campus surroundings registration',()=>{
 it('fits the four reference corners without mirroring or stretching the campus',()=>{
  expect(SITE_SCALE).toBeGreaterThan(.85);expect(SITE_SCALE).toBeLessThan(1.1);
  for(const anchor of SITE_ANCHORS){const actual=geoToInterior(anchor.geo),target=groundPlan(anchor.plan[0],anchor.plan[1]);expect(Math.hypot(actual[0]-target[0],actual[1]-target[1])).toBeLessThan(3.5);}
  const a=campusToInterior([0,0]),b=campusToInterior([1,0]),c=campusToInterior([0,1]);
  expect((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])).toBeGreaterThan(0);
  expect(Math.hypot(b[0]-a[0],b[1]-a[1])).toBeCloseTo(Math.hypot(c[0]-a[0],c[1]-a[1]),10);
 });
 it('uses the same transform for scene placement and obstacle filtering',()=>{
  const group=new THREE.Group();group.position.set(SITE_OFFSET[0],0,SITE_OFFSET[1]);group.rotation.y=-Math.atan2(SITE_B,SITE_A);group.scale.set(SITE_SCALE,1,SITE_SCALE);group.updateMatrixWorld();
  for(const b of selected.buildings)for(const geo of b.footprint){const p=siteProjection.toLocal(...geo),v=new THREE.Vector3(p.x,0,p.z).applyMatrix4(group.matrixWorld),expected=geoToInterior(geo);expect(v.x).toBeCloseTo(expected[0],8);expect(v.z).toBeCloseTo(expected[1],8);}
 });
 it('retains the actual neighbors while excluding both Iribe site footprints',()=>{
  expect(selected.buildings.some(b=>b.name==='Computer Science Instructional Center')).toBe(true);
  expect(selected.buildings.some(b=>b.name==='Glenn L. Martin Hall')).toBe(true);
  expect(selected.buildings.some(b=>b.umdCode==='IRB'||b.id==='way/698370196')).toBe(false);
  expect(selected.buildings.length).toBeLessThan(data.buildings.length/3);
 });
 it('keeps nearby inventory tree crowns outside occupied floors',()=>{
  expect(selected.trees.length).toBeGreaterThan(20);
  for(const tree of selected.trees){const p=siteProjection.toLocal(tree[0],tree[1]);expect(Math.hypot(p.x,p.z)).toBeLessThanOrEqual(SURROUNDINGS_RADIUS);expect(outsideInterior(geoToInterior([tree[0],tree[1]]),(tree[3]??3.7)*SITE_SCALE+1)).toBe(true);}
 });
 it('keeps whole road ribbons clear of the interior after registration',()=>{
  for(const road of selected.roads){const margin=Math.max(2.4,road.width)*SITE_SCALE/2;
   for(let i=0;i<road.line.length-1;i++)for(const t of [0,.25,.5,.75,1]){const a=road.line[i],b=road.line[i+1];expect(outsideInterior(geoToInterior([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]),margin)).toBe(true);}
  }
 });
 it('does not mutate the shared campus data',()=>{
  expect(data.buildings.some(b=>b.umdCode==='IRB')).toBe(true);
  expect(selected.center).not.toEqual(data.center);expect(selected.roads).not.toBe(data.roads);
 });
});

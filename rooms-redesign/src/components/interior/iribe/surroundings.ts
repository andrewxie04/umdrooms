import * as THREE from 'three';
import { buildSurroundingsGeometries } from '../../map3d/scene/geometry';
import { addWorldBuildingUV, addWorldSurfaceUV, makeBuildingTexture, makeGroundTexture, makeSurfaceTexture } from '../../map3d/scene/texture-ground';
import type { CampusData } from '../../map3d/scene/types';
import { AMPH_DROP } from './layout';
import { SITE_A, SITE_B, SITE_OFFSET, SITE_SCALE, selectSurroundings, siteProjection } from './surroundings-layout';

export function buildSurroundings(data:CampusData,trees?:CampusData['trees']) {
 const nearby=selectSurroundings(data,trees),geometries=buildSurroundingsGeometries(nearby,siteProjection);
 const group=new THREE.Group();group.name='Campus surroundings';
 group.position.set(SITE_OFFSET[0],-AMPH_DROP-.25,SITE_OFFSET[1]);group.rotation.y=-Math.atan2(SITE_B,SITE_A);group.scale.set(SITE_SCALE,1,SITE_SCALE);
 const groundSize=1800;
 const textures=[makeGroundTexture(groundSize,4),makeBuildingTexture(4),makeSurfaceTexture(4)];
 const ground=new THREE.MeshStandardMaterial({color:0xafc49b,map:textures[0],roughness:1});
 const building=new THREE.MeshStandardMaterial({vertexColors:true,map:textures[1],roughness:.88});
 const surface=new THREE.MeshStandardMaterial({vertexColors:true,map:textures[2],roughness:.96});
 const foliage=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});
 const water=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.35});
 const car=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.46,metalness:.12});
 const glass=new THREE.MeshBasicMaterial({color:0x435b62,transparent:true,opacity:.68,depthWrite:false,side:THREE.DoubleSide});
 const materials=[ground,building,surface,foliage,water,car,glass];
 const terrain=new THREE.PlaneGeometry(groundSize,groundSize);terrain.rotateX(-Math.PI/2);group.add(new THREE.Mesh(terrain,ground));
 addWorldBuildingUV(geometries.buildings);addWorldSurfaceUV(geometries.roads);addWorldSurfaceUV(geometries.areas);
 for(const [key,geometry] of Object.entries(geometries)){
  const material=key==='buildings'?building:key==='roads'||key==='areas'?surface:key==='water'?water:key==='dayWindows'?glass:key==='parkedCars'?car:foliage;
  group.add(new THREE.Mesh(geometry,material));
 }
 return {group,dispose(){terrain.dispose();Object.values(geometries).forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());group.removeFromParent();}};
}
export async function loadSurroundings(signal:AbortSignal) {
 const base=import.meta.env.BASE_URL;
 const [data,trees]=await Promise.all([
  fetch(`${base}campus-data.json`,{signal}).then(r=>{if(!r.ok)throw new Error('Campus surroundings unavailable');return r.json() as Promise<CampusData>;}),
  fetch(`${base}campus-trees.json`,{signal}).then(r=>r.ok?r.json() as Promise<CampusData['trees']>:undefined).catch(()=>undefined),
 ]);
 signal.throwIfAborted();
 return buildSurroundings(data,trees);
}

import * as THREE from 'three';
import { groundGuidePlan } from './ground-guide-layout';
import { GROUND_WEST_WING_CEILING, GROUND_WEST_WING_LIGHTS, GROUND_WEST_WING_SOLIDS } from './ground-west-wing-source';
import type { Point } from './layout';
import type { RoofBuilder } from './roof';

/** World-frame wall solids of the Ground northwest service wing. */
export const GROUND_WEST_WING_WORLD=GROUND_WEST_WING_SOLIDS.map(({outer,holes})=>({
 outer:outer.map(p=>groundGuidePlan(...p)) as Point[],
 holes:holes.map(ring=>ring.map(p=>groundGuidePlan(...p)) as Point[]),
}));

/** Estimated dropped-ceiling height; no wing section is published. */
export const GROUND_WEST_WING_CEILING_HEIGHT=3.2;

/**
 * Extrudes the traced wing walls (restroom block, west core, corridor and
 * perimeter rooms) to the estimated 6.3 m Ground ceiling, then adds an
 * estimated dropped ceiling and downlights. The plan gives wall positions and
 * door openings only; heights, finishes and fixtures are estimates.
 */
export function buildGroundWestWing(b:RoofBuilder,paint:THREE.Material,ceiling:THREE.Material,fixture:THREE.Material){
 const height=6.3;
 for(const {outer,holes} of GROUND_WEST_WING_WORLD){
  const shape=new THREE.Shape(outer.map(([x,z])=>new THREE.Vector2(x,-z)));
  for(const hole of holes)shape.holes.push(new THREE.Path(hole.map(([x,z])=>new THREE.Vector2(x,-z))));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:1});
  geometry.rotateX(-Math.PI/2);
  b.put(geometry,paint);
  for(const ring of [outer,...holes])ring.forEach((a,i)=>b.barriers.push({a,b:ring[(i+1)%ring.length],minY:0,maxY:height}));
 }
 const toWorld=(ring:readonly Point[])=>ring.map(p=>groundGuidePlan(...p)) as Point[];
 b.surface(toWorld(GROUND_WEST_WING_CEILING.outer),GROUND_WEST_WING_CEILING_HEIGHT,ceiling,GROUND_WEST_WING_CEILING.holes.map(toWorld));
 for(const p of GROUND_WEST_WING_LIGHTS){const [x,z]=groundGuidePlan(...p);b.cylinder(x,GROUND_WEST_WING_CEILING_HEIGHT-.012,z,.16,.02,fixture);}
}

import * as THREE from 'three';
import type { Polygon } from './layout';

/** Interior ceilings face the room below; floor surfaces face upward. */
export function ceilingGeometry(polygon:Polygon,height:number){
 const shape=new THREE.Shape(polygon.map(([x,z])=>new THREE.Vector2(x,z)));
 const geometry=new THREE.ShapeGeometry(shape);
 geometry.rotateX(Math.PI/2);
 geometry.translate(0,height,0);
 return geometry;
}

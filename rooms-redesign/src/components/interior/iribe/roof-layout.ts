import * as THREE from 'three';
import { roofPlan, pointInPolygon, type Point, type Polygon } from './layout';

function smooth(points:Polygon):Polygon {
 const curve=new THREE.CatmullRomCurve3(points.map(([x,y])=>{const p=roofPlan(x,y);return new THREE.Vector3(p[0],0,p[1]);}),true,'centripetal');
 return curve.getPoints(80).slice(0,-1).map(p=>[p.x,p.z]);
}
// Rounded lawn, water basin, and peripheral beds traced from UMD/HDR's roof
// plan. Curbs, planting sizes and bench details are interpreted from its photos.
export const ROOF_LAWN=smooth([[827,850],[870,842],[960,846],[994,857],[1010,898],[977,925],[895,954],[866,947],[838,916]]);
export const ROOF_POOL=smooth([[735,934],[755,935],[772,955],[759,974],[733,969],[719,948]]);
export const ROOF_BEDS:Polygon[]=[
 smooth([[752,790],[813,797],[863,817],[910,805],[960,813],[1020,821],[1068,807],[1090,792],[1052,788],[900,782],[760,775]]),
 smooth([[781,985],[825,986],[865,977],[908,985],[960,1004],[1030,1020],[765,1016]]),
];
export const ROOF_PORTALS:Point[]=[[554,759],[722,760]].map(([x,y])=>[(x-660)*.085,(y-1100)*.085]);
export function roofTerrainHeight(point:Point):number {return pointInPolygon(point,ROOF_LAWN)?.15:0;}

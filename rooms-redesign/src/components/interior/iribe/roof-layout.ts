import * as THREE from 'three';
import { plan, roofPlan, ROOF_LAWN_PLAN, pointInPolygon, type Point, type Polygon } from './layout';

function smooth(points:Polygon):Polygon {
 const curve=new THREE.CatmullRomCurve3(points.map(([x,y])=>{const p=roofPlan(x,y);return new THREE.Vector3(p[0],0,p[1]);}),true,'centripetal');
 return curve.getPoints(80).slice(0,-1).map(p=>[p.x,p.z]);
}
// Rounded lawn, water basin, and peripheral beds traced from UMD/HDR's roof
// plan. Curbs, planting sizes and bench details are interpreted from its photos.
export const ROOF_LAWN=smooth(ROOF_LAWN_PLAN);
export const ROOF_POOL=smooth([[748,860],[761,865],[781,927],[770,942],[731,930]]);
export const ROOF_BEDS:Polygon[]=[
 smooth([[752,790],[813,797],[863,817],[910,805],[960,813],[1020,821],[1068,807],[1090,792],[1052,788],[900,782],[760,775]]),
 smooth([[781,985],[825,986],[865,977],[908,985],[960,1001],[1030,1010],[765,1006]]),
];
// Exterior wall of the rooftop enclosure, traced in the same HDR sheet as
// the gallery. The two terrace doors occupy edges 1 and 5; edge 3 is glazing.
export const ROOF_FACADE:Polygon=[[715,739],[702,800],[690,843.820755],[741,852],[720,930],[656,930],[638,979],[626,1025]].map(([x,y])=>roofPlan(x,y));
export const ROOF_DOORS=[1,5].map(edge=>{
 const a=ROOF_FACADE[edge],b=ROOF_FACADE[edge+1];
 return {edge,center:[(a[0]+b[0])/2,(a[1]+b[1])/2] as Point,width:1.2};
});
export const ROOF_PORTALS=ROOF_DOORS.map(d=>d.center);
export const ROOF_OUTDOOR:Polygon=[ROOF_FACADE[0],plan(515,449),plan(740,449),...ROOF_FACADE.slice(1).reverse()];
export const ROOF_FOYER:Polygon=[...ROOF_FACADE,plan(807,940),plan(507,940)];
export function roofTerrainHeight(point:Point):number {return pointInPolygon(point,ROOF_LAWN)?.15:0;}

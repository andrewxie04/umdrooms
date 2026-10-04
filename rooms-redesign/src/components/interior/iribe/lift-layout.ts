import { communicatingStairForFloor } from './communicating-layout';
import { atriumPoint, pointInPolygon, type FloorId, type Point, type Polygon } from './layout';

export type LiftCar = 0 | 1;
export const LIFT_FLOORS:FloorId[]=['G','1','2','3','4','5'];

// HDR / UMD guide, original page-index 6 PDF points. The cab lines and the
// curved enclosure are traced separately. Metric scale/registration remain
// fitted estimates; this is not a dimensioned lift installation drawing.
const origin:Point=[222.394,432.6],normal:Point=[.99186,.12734],tangent:Point=[-.12734,.99186];
export function atriumLiftSource(x:number,y:number):Point {
 const dx=x-origin[0],dy=y-origin[1];
 return atriumPoint(1.85+(dx*normal[0]+dy*normal[1])*.13,(dx*tangent[0]+dy*tangent[1])*.13);
}
const contour:Point[]=[];
const line=(x:number,y:number)=>contour.push([x,y]);
const curve=(ax:number,ay:number,bx:number,by:number,x:number,y:number,segments=8)=>{
 const a=contour.at(-1)!;
 for(let i=1;i<=segments;i++){const t=i/segments,s=1-t;line(s*s*s*a[0]+3*s*s*t*ax+3*s*t*t*bx+t*t*t*x,s*s*s*a[1]+3*s*s*t*ay+3*s*t*t*by+t*t*t*y);}
};
line(224.725,414.441);
curve(217.394,412.774,210.945,412.774,204.236,412.760);
line(201.878,413.046);line(199.669,413.913);line(197.013,416.040);
curve(192.541,421.216,189.397,426.731,187.231,433.223);
curve(186.118,436.530,186.485,438.954,188.518,441.788);
curve(189.208,444.524,190.794,445.351,193.680,445.419);
curve(195.523,446.041,197.365,446.610,199.209,447.099,4);
curve(205.712,448.847,212.271,449.742,219.142,449.850);
line(220.185,449.795);line(221.690,449.538);line(223.289,448.969);
line(224.780,448.102);line(226.081,447.004);line(226.650,446.367);
export const ATRIUM_LIFT_CORE:Polygon=contour.map(p=>atriumLiftSource(...p));
// The Level 1 plan shows a landing in front of the pair of cabs. The earlier
// broad atrium void incorrectly removed that landing. Its fitted extents meet
// the existing mezzanine corridor; they are not surveyed dimensions.
export const ATRIUM_LIFT_APRON:Polygon=[[1.85,-2.25],[5.2,-2.25],[5.2,2.4],[1.85,2.4]].map(p=>atriumPoint(p[0],p[1]));
// Fill only the removed part of the slab, avoiding a coplanar overlap with
// the existing mezzanine floor outside the atrium opening.
export const ATRIUM_LIFT_APRON_SURFACE:Polygon=[[1.85,-2.25],[4.7,-2.25],[4.7,.4],[4.7-.5*(2.4-.4)/(3-.4),2.4],[1.85,2.4]].map(p=>atriumPoint(p[0],p[1]));

export interface LiftCabLayout {
 car:LiftCar; floor:FloorId; door:Point; u:Point; outward:Point;
 width:number; depth:number; opening:number; polygon:Polygon;
 at(along:number,inward:number):Point;
}
export interface LiftLandingLayout { floor:FloorId; core:Polygon; face:readonly [Point,Point]; cabs:readonly LiftCabLayout[]; }
function cab(floor:FloorId,car:LiftCar,door:Point,u:Point,outward:Point,width:number,depth:number,opening:number):LiftCabLayout {
 const at=(along:number,inward:number):Point=>[door[0]+u[0]*along-outward[0]*inward,door[1]+u[1]*along-outward[1]*inward];
 return {floor,car,door,u,outward,width,depth,opening,at,polygon:[at(-width/2,0),at(width/2,0),at(width/2,depth),at(-width/2,depth)]};
}
const atriumFace=[atriumPoint(1.85,-2.13),atriumPoint(1.85,2.27)] as const;
// Original drawn cab rear corners. Door depth is fitted at the shaft face;
// preserve the two distinct drawn cab centers and width/depth proportions.
const atriumCabs=(floor:FloorId)=>([
 [[207.193,418.455],[205.884,428.678],[220.729,420.190],[219.419,430.413]],
 [[205.433,432.194],[204.120,442.442],[218.969,433.929],[217.656,444.177]],
] as const).map((p,car)=>{
 const back=p.slice(0,2).map(q=>atriumLiftSource(q[0],q[1])),front=p.slice(2).map(q=>atriumLiftSource(q[0],q[1]));
 const origin=atriumPoint(1.85,0),alongPoint=atriumPoint(1.85,1),outPoint=atriumPoint(2.85,0);
 const unit=(p:Point):Point=>{const dx=p[0]-origin[0],dz=p[1]-origin[1],length=Math.hypot(dx,dz);return [dx/length,dz/length];};
 const u=unit(alongPoint),out=unit(outPoint),frontCenter:Point=[(front[0][0]+front[1][0])/2,(front[0][1]+front[1][1])/2];
 const along=(frontCenter[0]-origin[0])*u[0]+(frontCenter[1]-origin[1])*u[1];
 const door:Point=[origin[0]+u[0]*along,origin[1]+u[1]*along];
 const width=Math.hypot(back[1][0]-back[0][0],back[1][1]-back[0][1]);
 const depth=(door[0]-(back[0][0]+back[1][0])/2)*out[0]+(door[1]-(back[0][1]+back[1][1])/2)*out[1];
 return cab(floor,car as LiftCar,door,u,out,width,depth,Math.min(1.10,width-.12));
});
const landingCache=new Map<FloorId,LiftLandingLayout>();
export function liftLanding(floor:FloorId):LiftLandingLayout|null {
 if(!LIFT_FLOORS.includes(floor))return null;
 const cached=landingCache.get(floor);if(cached)return cached;
 if(floor==='G'||floor==='1'){const landing={floor,core:ATRIUM_LIFT_CORE,face:atriumFace,cabs:atriumCabs(floor)};landingCache.set(floor,landing);return landing;}
 const stair=communicatingStairForFloor(floor)!,[a,b]=stair.face;
 const length=Math.hypot(b[0]-a[0],b[1]-a[1]),u:Point=[(b[0]-a[0])/length,(b[1]-a[1])/length];
 let outward:Point=[u[1],-u[0]];
 const mid:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2];
 if(pointInPolygon([mid[0]+outward[0]*.2,mid[1]+outward[1]*.2],stair.core))outward=[-outward[0],-outward[1]];
 const landing:LiftLandingLayout={floor,core:stair.core,face:[a,b],cabs:([.26,.74] as const).map((t,car)=>cab(floor,car as LiftCar,[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],u,outward,1.90,2.55,1.65))};
 landingCache.set(floor,landing);return landing;
}
export function insideLift(floor:FloorId,point:Point,margin=.05):LiftCabLayout|null {
 return liftLanding(floor)?.cabs.find(c=>{
  const dx=point[0]-c.door[0],dz=point[1]-c.door[1],along=dx*c.u[0]+dz*c.u[1],inward=-dx*c.outward[0]-dz*c.outward[1];
  return Math.abs(along)<c.width/2-margin&&inward>margin&&inward<c.depth-margin;
 })??null;
}
export function nearbyLift(floor:FloorId,point:Point):LiftCabLayout|null {
 const inside=insideLift(floor,point);if(inside)return inside;
 return liftLanding(floor)?.cabs.map(c=>({c,d:Math.hypot(point[0]-c.door[0],point[1]-c.door[1])})).filter(({c,d})=>d<2.25&&(point[0]-c.door[0])*c.outward[0]+(point[1]-c.door[1])*c.outward[1]>-.1).sort((a,b)=>a.d-b.d)[0]?.c??null;
}
export function liftDoorwayOccupied(cab:LiftCabLayout,point:Point):boolean {
 const dx=point[0]-cab.door[0],dz=point[1]-cab.door[1];
 return Math.abs(dx*cab.u[0]+dz*cab.u[1])<cab.opening/2+.24&&Math.abs(dx*cab.outward[0]+dz*cab.outward[1])<.38;
}

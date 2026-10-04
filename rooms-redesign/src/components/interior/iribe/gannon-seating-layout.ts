import { GANNON_RUNTIME_CHAIRS, GANNON_RUNTIME_TABLES, GANNON_RUNTIME_BOUNDARIES } from './gannon-seating-runtime-source';
import { GANNON_NATIVE_FOOTPRINT, GANNON_WORLD_FOOTPRINT } from './gannon-ground-layout';
import { groundGuidePlan } from './ground-guide-layout';
import { pointInPolygon, type Point, type Polygon } from './layout';

// Provisional section: paired rear entrances meet the Ground corridor datum.
// Three drawn boundary sets are interpreted as three 0.30 m platforms. The
// source establishes plan locations only; rise, construction and datum need
// a measured section. These estimates are shared by render and walk support.
export const GANNON_FRONT_HEIGHT=-.9;
const origin=groundGuidePlan(0,0),xAxis=groundGuidePlan(1,0).map((v,i)=>v-origin[i]),yAxis=groundGuidePlan(0,1).map((v,i)=>v-origin[i]);
export function gannonNativePoint(p:Point):Point{
 const x=p[0]-origin[0],y=p[1]-origin[1],det=xAxis[0]*yAxis[1]-xAxis[1]*yAxis[0];
 return [(x*yAxis[1]-y*yAxis[0])/det,(y*xAxis[0]-x*xAxis[1])/det];
}
const first=GANNON_RUNTIME_BOUNDARIES[0];
const aisleBounds=(items:typeof first.northAisle|typeof first.southAisle):Point=>{
 const ys=items.flatMap(i=>[i.command[1][1],i.command[2][1]]);return [Math.min(...ys),Math.max(...ys)];
};
export const GANNON_AISLE_BOUNDS=[aisleBounds(first.northAisle),aisleBounds(first.southAisle)];
export const GANNON_AISLE_ROUTES=GANNON_AISLE_BOUNDS.map(([a,b])=>({start:groundGuidePlan(340,(a+b)/2),end:groundGuidePlan(406,(a+b)/2)}));
const bands=[[-Infinity,GANNON_AISLE_BOUNDS[0][0],0,false],[...GANNON_AISLE_BOUNDS[0],1,true],[GANNON_AISLE_BOUNDS[0][1],GANNON_AISLE_BOUNDS[1][0],1,false],[...GANNON_AISLE_BOUNDS[1],1,true],[GANNON_AISLE_BOUNDS[1][1],Infinity,2,false]] as const;
function boundaryX(index:number,bank:number,y:number){
 const [,a,b]=GANNON_RUNTIME_BOUNDARIES[index].lines[bank].command;
 return a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]);
}
function clip(polygon:Polygon,value:(p:Point)=>number):Polygon{
 const out:Point[]=[];
 polygon.forEach((a,i)=>{const b=polygon[(i+1)%polygon.length],av=value(a),bv=value(b);if(av>=0)out.push(a);if((av>=0)!==(bv>=0)){const t=av/(av-bv);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}});
 return out;
}
function aisleStepEnd(index:number){return Math.max(...GANNON_RUNTIME_BOUNDARIES[index].northAisle.flatMap(i=>[i.command[1][0],i.command[2][0]]));}
const piece=(minY:number,maxY:number,bank:number,tier:number,aisle:boolean,halfStep=false)=>{
 let polygon:Polygon=GANNON_NATIVE_FOOTPRINT;
 if(Number.isFinite(minY))polygon=clip(polygon,p=>p[1]-minY);
 if(Number.isFinite(maxY))polygon=clip(polygon,p=>maxY-p[1]);
 if(tier>0)polygon=clip(polygon,p=>p[0]-(aisle&&!halfStep?aisleStepEnd(tier-1):boundaryX(tier-1,bank,p[1])));
 if(tier<3)polygon=clip(polygon,p=>boundaryX(tier,bank,p[1])-p[0]);
 if(halfStep)polygon=clip(polygon,p=>aisleStepEnd(tier-1)-p[0]);
 return {polygon:polygon.map(p=>groundGuidePlan(...p)),height:GANNON_FRONT_HEIGHT+tier*.3-(halfStep?.15:0),riser:tier?(aisle?.15:.3):0};
};
export const GANNON_FLOOR_PIECES=bands.flatMap(([minY,maxY,bank,aisle])=>[
 ...Array.from({length:4},(_,tier)=>piece(minY,maxY,bank,tier,aisle)),
 ...(aisle?Array.from({length:3},(_,i)=>piece(minY,maxY,bank,i+1,aisle,true)):[]),
]).filter(p=>p.polygon.length>=3);
export function gannonFloorHeight(point:Point):number|null{
 if(!pointInPolygon(point,GANNON_WORLD_FOOTPRINT))return null;
 const [x,y]=gannonNativePoint(point),bank=y<GANNON_AISLE_BOUNDS[0][0]?0:y>GANNON_AISLE_BOUNDS[1][1]?2:1;
 let tier=0;for(let i=0;i<3;i++)if(x>boundaryX(i,bank,y))tier++;
 const aisle=GANNON_AISLE_BOUNDS.some(([a,b])=>y>=a&&y<=b);
 return GANNON_FRONT_HEIGHT+tier*.3-(aisle&&tier&&x<aisleStepEnd(tier-1)?.15:0);
}
export const GANNON_CHAIRS=GANNON_RUNTIME_CHAIRS.map(s=>{
 const point=groundGuidePlan(s.centerPt[0],s.centerPt[1]),front=groundGuidePlan(s.centerPt[0]+s.facingPdf[0],s.centerPt[1]+s.facingPdf[1]);
 const length=Math.hypot(front[0]-point[0],front[1]-point[1]);
 const depth:Point=[(point[0]-front[0])/length,(point[1]-front[1])/length],width:Point=[-depth[1],depth[0]];
 const bank:-1|0|1=s.bank==='north'?-1:s.bank==='south'?1:0;
 return {id:s.id,role:s.role,tableId:s.tableId,point,depth,width,row:s.rowIndex??-1,bank,height:gannonFloorHeight(point)!};
});
export const GANNON_TABLES=GANNON_RUNTIME_TABLES.map(t=>{
 const polygon:Polygon=t.envelopePdf.map(p=>groundGuidePlan(p[0],p[1])),center:Point=[polygon.reduce((sum,p)=>sum+p[0],0)/4,polygon.reduce((sum,p)=>sum+p[1],0)/4];
 // A desk's supporting platform is the one behind its source front edge;
 // looking up its center avoids boundary-point roundoff at the riser.
 return {id:t.id,polygon,center,height:gannonFloorHeight(center)!};
});

import { ROOMS, ANTONOV_PLAN, ANTONOV_FOOTPRINT, groundPlan, pointInPolygon, type Point, type Polygon } from './layout';
import { ANTONOV_RUNTIME_CHAIRS, ANTONOV_RUNTIME_TABLES } from './antonov-seating-runtime-source';
import { firstGuidePlan, firstGuideNativePoint, FIRST_GUIDE_METRIC } from './first-guide-layout';
import { GANNON_CHAIRS, gannonFloorHeight } from './gannon-seating-layout';
export { GANNON_FRONT_HEIGHT } from './gannon-seating-layout';

// UMD/HDR guide, ground and Level 1 spreads: Antonov occupies the full upper
// auditorium volume; Gannon sits beneath its eastern/back seating. Heights
// below are estimated because the public guide contains no dimensioned section.
export const ANTONOV_ROWS=Array.from({length:10},(_,row)=>ANTONOV_RUNTIME_CHAIRS.filter(c=>c.rowIndex===row).length);
// Keep the legacy inverse only for the surrounding schematic Ground facade.
const origin=groundPlan(0,0),ux=groundPlan(1,0),uy=groundPlan(0,1),legacyScale=Math.hypot(ux[0]-origin[0],ux[1]-origin[1]);
export const audCoordinates=(p:Point):Point=>[((p[0]-origin[0])*(ux[0]-origin[0])+(p[1]-origin[1])*(ux[1]-origin[1]))/(legacyScale*legacyScale),((p[0]-origin[0])*(uy[0]-origin[0])+(p[1]-origin[1])*(uy[1]-origin[1]))/(legacyScale*legacyScale)];
const sourceOrigin=firstGuidePlan(0,0),sourceX=firstGuidePlan(1,0),sourceY=firstGuidePlan(0,1);
export const AUD_SCALE=FIRST_GUIDE_METRIC/2.45;
export const AUD_DEPTH:Point=[(sourceX[0]-sourceOrigin[0])/FIRST_GUIDE_METRIC,(sourceX[1]-sourceOrigin[1])/FIRST_GUIDE_METRIC];
export const AUD_WIDTH:Point=[(sourceY[0]-sourceOrigin[0])/FIRST_GUIDE_METRIC,(sourceY[1]-sourceOrigin[1])/FIRST_GUIDE_METRIC];
export const ROW_RISE=.55;
export const AUD_AISLES=[(142.4-175.5)*FIRST_GUIDE_METRIC,(208.3-175.5)*FIRST_GUIDE_METRIC];
export const antonovDiagram=firstGuidePlan;
export const antonovDiagramCoordinates=firstGuideNativePoint;
export const antonovWayfinding=(x:number,y:number):Point=>firstGuidePlan(254.462+(x-1173)/2.45,175.5+(y-274)/2.45);
export const antonovWayfindingCoordinates=(p:Point):Point=>{const [x,y]=firstGuideNativePoint(p);return [1173+(x-254.462)*2.45,274+(y-175.5)*2.45];};
// Native chair fronts and desk edges retain their individual fan angles.
// Vertical row rises/interpolated aisle steps remain section estimates; the
// drawing's four two-band details do not establish ten measured floor rises.
export const ANTONOV_BANK_ANGLE=25*Math.PI/180;
export interface AntonovPlane { slope:number; intercept:number; }
export interface AntonovBand { minY:number; maxY:number; bank:-1|0|1; aisle:boolean; }
export const ANTONOV_BANDS:AntonovBand[]=[
 {minY:-Infinity,maxY:138.7966,bank:-1,aisle:false},
 {minY:138.7966,maxY:146.0016,bank:-1,aisle:true},
 {minY:146.0016,maxY:204.6952,bank:0,aisle:false},
 {minY:204.6952,maxY:211.9827,bank:1,aisle:true},
 {minY:211.9827,maxY:Infinity,bank:1,aisle:false},
];
const planeX=(p:AntonovPlane,y:number)=>p.intercept+p.slope*y;
function bankPlane(bank:number,row:number):AntonovPlane {
 const name=bank<0?'north':bank>0?'south':'center';
 const records=ANTONOV_RUNTIME_TABLES.filter(t=>t.bank===name),table=records.find(t=>t.rowIndex===Math.min(row,9))!;
 const [a,b]=table.frontEdgePt,slope=(b[0]-a[0])/(b[1]-a[1]);
 let intercept=a[0]-slope*a[1];
 if(row===10){const [p,q]=records.find(t=>t.rowIndex===8)!.frontEdgePt;intercept+=intercept-(p[0]-(q[0]-p[0])/(q[1]-p[1])*p[1]);}
 return {slope,intercept};
}
export function antonovRowPlane(band:AntonovBand,row:number):AntonovPlane {
 if(!band.aisle)return bankPlane(band.bank,row);
 const a=bankPlane(band.bank<0?-1:0,row),b=bankPlane(band.bank<0?0:1,row);
 const start=planeX(a,band.minY),end=planeX(b,band.maxY),slope=(end-start)/(band.maxY-band.minY);
 return {slope,intercept:start-slope*band.minY};
}
export const ANTONOV_AISLE_ROUTES=ANTONOV_BANDS.filter(b=>b.aisle).map(band=>{
 const y=(band.minY+band.maxY)/2;
 return {band,start:antonovDiagram(planeX(antonovRowPlane(band,0),y)-1,y),end:antonovDiagram(planeX(antonovRowPlane(band,10),y)+1,y)};
});
const blendPlane=(a:AntonovPlane,b:AntonovPlane,t:number):AntonovPlane=>({slope:a.slope+(b.slope-a.slope)*t,intercept:a.intercept+(b.intercept-a.intercept)*t});
/** The same clipped planes drive rendered tiers and the walker's support. */
export function antonovBandStrip(band:AntonovBand,lower:AntonovPlane|null,upper:AntonovPlane|null):Polygon {
 let polygon:Point[]=ANTONOV_FOOTPRINT.map(antonovDiagramCoordinates);
 const clip=(value:(p:Point)=>number)=>{
  const result:Point[]=[];
  polygon.forEach((a,i)=>{const b=polygon[(i+1)%polygon.length],av=value(a),bv=value(b);if(av>=0)result.push(a);if((av>=0)!==(bv>=0)){const t=av/(av-bv);result.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}});polygon=result;
 };
 if(Number.isFinite(band.minY))clip(p=>p[1]-band.minY);
 if(Number.isFinite(band.maxY))clip(p=>band.maxY-p[1]);
 if(lower)clip(p=>p[0]-planeX(lower,p[1]));
 if(upper)clip(p=>planeX(upper,p[1])-p[0]);
 return polygon.map(p=>antonovDiagram(...p));
}
export function antonovFloorPieces():{polygon:Polygon;height:number;riser:number}[]{
 const pieces:{polygon:Polygon;height:number;riser:number}[]=[];
 for(const band of ANTONOV_BANDS){
  pieces.push({polygon:antonovBandStrip(band,null,antonovRowPlane(band,0)),height:0,riser:0});
  for(let row=0;row<10;row++){
   const a=antonovRowPlane(band,row),b=antonovRowPlane(band,row+1),steps=band.aisle?4:1;
   for(let step=0;step<steps;step++)pieces.push({polygon:antonovBandStrip(band,blendPlane(a,b,step/steps),blendPlane(a,b,(step+1)/steps)),height:(row+(step+1)/steps)*ROW_RISE,riser:ROW_RISE/steps});
  }
  pieces.push({polygon:antonovBandStrip(band,antonovRowPlane(band,10),null),height:10*ROW_RISE,riser:0});
 }
 return pieces.filter(p=>p.polygon.length>=3);
}
export function antonovHeight(point:Point):number|null {
 if(!pointInPolygon(point,ANTONOV_FOOTPRINT))return null;
 const [x,y]=antonovDiagramCoordinates(point),band=ANTONOV_BANDS.find(b=>y>=b.minY&&y<=b.maxY)!;
 let row=-1;for(let i=0;i<=10;i++){if(x>=planeX(antonovRowPlane(band,i),y))row=i;else break;}
 if(row<0)return 0;if(row>=10)return 10*ROW_RISE;
 if(!band.aisle)return (row+1)*ROW_RISE;
 const start=planeX(antonovRowPlane(band,row),y),end=planeX(antonovRowPlane(band,row+1),y);
 return (row+Math.ceil((x-start)/(end-start)*4)/4)*ROW_RISE;
}
/** Clip the public plan outline to a depth strip, preserving the curved ends. */
export function auditoriumStrip(min:number,max:number,minY=-Infinity,maxY=Infinity,outline:Polygon=ANTONOV_PLAN):Polygon {
 let poly:Point[]=[...outline];
 for(const [axis,bound,keepGreater] of [[0,min,true],[0,max,false],[1,minY,true],[1,maxY,false]] as const){
  if(!Number.isFinite(bound))continue;
  const next:Point[]=[];
  for(let i=0;i<poly.length;i++){
   const a=poly[i],b=poly[(i+1)%poly.length],ain=keepGreater?a[axis]>=bound:a[axis]<=bound,bin=keepGreater?b[axis]>=bound:b[axis]<=bound;
   if(ain)next.push(a);
   if(ain!==bin){const t=(bound-a[axis])/(b[axis]-a[axis]);next.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
  }
  poly=next;
 }
 return poly.map(p=>antonovWayfinding(...p));
}
export interface AuditoriumSeat { point:Point; height:number; row:number; depth:Point; width:Point; bank?:-1|0|1; }
export function auditoriumSeats(id:string):AuditoriumSeat[] {
 if(id==='0318')return GANNON_CHAIRS;
 return ANTONOV_RUNTIME_CHAIRS.map(c=>{
  const point=firstGuidePlan(...c.centerPt),facing=firstGuidePlan(c.centerPt[0]+c.facingPdf[0],c.centerPt[1]+c.facingPdf[1]);
  const depth:Point=[(point[0]-facing[0])/FIRST_GUIDE_METRIC,(point[1]-facing[1])/FIRST_GUIDE_METRIC],width:Point=[-depth[1],depth[0]];
  return {point,height:antonovHeight(point)??0,row:c.rowIndex??-1,bank:c.bank==='north'?-1:c.bank==='south'?1:0,depth,width} as AuditoriumSeat;
 });
}

export function auditoriumSidePoint(x:number,side:number,inset:number):Point {
 const ys=auditoriumStrip(x-.02,x+.02).map(p=>antonovWayfindingCoordinates(p)[1]);
 return antonovWayfinding(x,side<0?Math.min(...ys)+inset:Math.max(...ys)-inset);
}

export const GANNON_FOOTPRINT=ROOMS.find(r=>r.id==='0318')!.polygon;
export const gannonHeight=gannonFloorHeight;

export const ANTONOV_TABLES=ANTONOV_RUNTIME_TABLES.map(t=>{
 const polygon:Polygon=t.envelopePt.map(p=>firstGuidePlan(p[0],p[1])),center:Point=[polygon.reduce((sum,p)=>sum+p[0],0)/4,polygon.reduce((sum,p)=>sum+p[1],0)/4];
 return {id:t.id,polygon,center,height:antonovHeight(center)??0};
});

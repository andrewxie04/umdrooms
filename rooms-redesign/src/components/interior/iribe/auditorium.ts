import { ROOMS, ANTONOV_PLAN, ANTONOV_FOOTPRINT, groundPlan, pointInPolygon, type Point, type Polygon } from './layout';

// UMD/HDR guide, ground and Level 1 spreads: Antonov occupies the full upper
// auditorium volume; Gannon sits beneath its eastern/back seating. Heights
// below are estimated because the public guide contains no dimensioned section.
export const ANTONOV_ROWS=[24,28,30,30,32,32,32,32,30,28];
const origin=groundPlan(0,0),ux=groundPlan(1,0),uy=groundPlan(0,1);
export const AUD_SCALE=Math.hypot(ux[0]-origin[0],ux[1]-origin[1]);
export const AUD_DEPTH:Point=[(ux[0]-origin[0])/AUD_SCALE,(ux[1]-origin[1])/AUD_SCALE];
export const AUD_WIDTH:Point=[(uy[0]-origin[0])/AUD_SCALE,(uy[1]-origin[1])/AUD_SCALE];
export const audCoordinates=(p:Point):Point=>[((p[0]-origin[0])*AUD_DEPTH[0]+(p[1]-origin[1])*AUD_DEPTH[1])/AUD_SCALE,((p[0]-origin[0])*AUD_WIDTH[0]+(p[1]-origin[1])*AUD_WIDTH[1])/AUD_SCALE];
export const ROW_START=1240,ROW_PITCH=24.2,ROW_RISE=.55;
export const AUD_AISLES=[-4.775,4.775];
export function antonovHeight(point:Point):number|null {
 if(!pointInPolygon(point,ANTONOV_FOOTPRINT))return null;
 const [x,y]=audCoordinates(point);
 // Four small steps per seating tier, continued across the walking surface.
 // Platforms beneath desks are added by the renderer at each row's full height.
 const step=ROW_PITCH/4;
 const inAisle=AUD_AISLES.some(c=>Math.abs((y-274)*AUD_SCALE-c)<.6);
 return Math.max(0,Math.min(10*ROW_RISE,inAisle?Math.ceil((x-ROW_START)/step)*ROW_RISE/4:Math.ceil((x-ROW_START)/ROW_PITCH)*ROW_RISE));
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
 return poly.map(p=>groundPlan(...p));
}
export interface AuditoriumSeat { point:Point; height:number; row:number; depth:Point; width:Point; }
export function auditoriumSeats(id:string):AuditoriumSeat[] {
 if(id==='0318')return gannonSeats();
 const antonov=true,rows=ANTONOV_ROWS,result:AuditoriumSeat[]=[];
 rows.forEach((count,row)=>{
  const middle=antonov?12:8,side=(count-middle)/2;
  const spacing=antonov?.7:.72,aisle=1.15;
  const width=(count-1)*spacing+aisle*2;
  for(let i=0;i<count;i++){
   let along=i*spacing-width/2;
   if(i>=side)along+=aisle;if(i>=side+middle)along+=aisle;
   const x=antonov?ROW_START+(row+.8)*ROW_PITCH:1426+row*17;
   const y=(antonov?274:225)+along/AUD_SCALE;
   result.push({point:groundPlan(x,y),height:antonov?(row+1)*ROW_RISE:0,row,depth:AUD_DEPTH,width:AUD_WIDTH});
  }
 });return result;
}

export function auditoriumSidePoint(x:number,side:number,inset:number):Point {
 const ys=auditoriumStrip(x-.02,x+.02).map(p=>audCoordinates(p)[1]);
 return groundPlan(x,side<0?Math.min(...ys)+inset:Math.max(...ys)-inset);
}

export const GANNON_FOOTPRINT=ROOMS.find(r=>r.id==='0318')!.polygon;
export const GANNON_PLAN=GANNON_FOOTPRINT.map(audCoordinates);
export const GANNON_AISLES=[-3.455,3.455];
export function gannonHeight(point:Point):number|null {
 if(!pointInPolygon(point,GANNON_FOOTPRINT))return null;
 const [x,y]=audCoordinates(point);
 const tier=Math.max(0,Math.min(3,Math.ceil((x-1422)/24)));
 if(!GANNON_AISLES.some(c=>Math.abs((y-225)*AUD_SCALE-c)<.6)||!tier)return tier*.3;
 const start=1422+(tier-1)*24;
 return (tier-1)*.3+(x-start<=12?.15:.3);
}
function gannonSeats():AuditoriumSeat[]{
 const seats:AuditoriumSeat[]=[];
 for(let row=0;row<6;row++)for(const side of [-1,0,1]){
  const count=side?4:8,tilt=side*.23,cos=Math.cos(tilt),sin=Math.sin(tilt);
  const width:Point=[AUD_WIDTH[0]*cos+AUD_DEPTH[0]*sin,AUD_WIDTH[1]*cos+AUD_DEPTH[1]*sin];
  const depth:Point=[AUD_DEPTH[0]*cos-AUD_WIDTH[0]*sin,AUD_DEPTH[1]*cos-AUD_WIDTH[1]*sin];
  const center=groundPlan(1430+12*row,225+side*5.47/AUD_SCALE);
  for(let i=0;i<count;i++){
   const t=(i-(count-1)/2)*.72,point:Point=[center[0]+width[0]*t,center[1]+width[1]*t];
   seats.push({point,height:(Math.floor(row/2)+1)*.3,row,depth,width});
  }
 }
 for(const offset of [2,3,4,5])seats.push({point:groundPlan(1416,225+offset/AUD_SCALE),height:0,row:-1,depth:AUD_DEPTH,width:AUD_WIDTH});
 return seats;
}

import * as THREE from 'three';
import { ceilingGeometry } from './ceiling';
import { distanceToSegment, firstWestPlan, pointInPolygon, type InteriorRoom, type Point, type Polygon } from './layout';
import type { RoofBuilder } from './roof';

// Coordinates below use the existing west-wing crop: the Level 1 spread
// starts at PDF (433,165) on index 7, rendered at 4x, and continues onto
// index 8. See docs/research/iribe/first-west-offices-fitout-2026-10-03.md.
// Only drawn surfaces and seats are included; IDs are descriptive layout IDs.
const U_DESK_IDS=new Set([3,5,6,8].map(i=>`1-west-upper-office-${i}`));
interface SourceSeat {point:Point;faces:Point;task?:boolean;}
interface SourceFit {desks:Polygon[];seats:SourceSeat[];round?:Point;}
const SOURCE_FITS:Readonly<Record<string,SourceFit>>={
 '1-west-inner-office-1':{
  desks:[[[394.09,247.53],[407.56,260.36],[376.78,292.71],[363.31,279.88]],[[397.4,271.23],[407.62,260.41],[426.56,278.29],[416.34,289.12]],[[366.54,222.78],[379.72,235.8],[373.62,241.98],[360.43,228.96]]],
  seats:[{point:[397,294],faces:[385,277],task:true},{point:[364,269],faces:[380,275]},{point:[379,253],faces:[392,261]}],
 },
 '1-west-inner-office-2':{
  desks:[[[343.16,298.59],[356.23,310.95],[325.54,343.39],[312.47,331.03]],[[355.8,311.4],[374.72,329.3],[364.5,340.11],[345.57,322.21]],[[311.21,280.98],[324.39,294],[318.28,300.18],[305.1,287.16]]],
  seats:[{point:[344,345],faces:[333,329],task:true},{point:[309,321],faces:[325,327]},{point:[324,307],faces:[337,314]}],
 },
 '1-west-upper-office-1':{
  desks:[[[421.08,97.36],[453.55,128.02],[441.2,141.1],[408.73,110.44]],[[441.65,75.58],[452.47,85.8],[432.03,107.45],[421.21,97.23]],[[398.89,121.32],[405.2,127.28],[389.93,143.46],[383.61,137.5]]],
  seats:[{point:[447,112],faces:[433,125],task:true},{point:[407,132],faces:[423,121]},{point:[422,146],faces:[437,135]}],
 },
 '1-west-upper-office-2':{
  desks:[[[486.05,174.3],[517.85,205.65],[505.22,218.46],[473.42,187.11]],[[525.1,176.22],[535.69,186.67],[517.41,205.22],[506.8,194.77]],[[497.47,213.86],[503.79,219.82],[488.51,236],[482.2,230.04]]],
  seats:[{point:[500,182],faces:[492,198],task:true},{point:[467,201],faces:[484,192]},{point:[481,215],faces:[498,206]}],
 },
 '1-west-upper-office-4':{
  // Guide page index 8: front 23184-23186, return 23180-23183,
  // rear 24945-24947. Keep the native open end on the left partition.
  desks:[[[596.56,275.25],[628.62,305.79],[616.28,318.86],[584.15,288.28]],[[635.63,276.48],[646.42,286.75],[628.45,305.62],[617.67,295.35]],[[624.31,245.31],[656.78,275.96],[646.56,286.79],[614.09,256.13]]],
  seats:[{point:[612,279],faces:[606,296],task:true},{point:[581,296],faces:[596,287]},{point:[599,313],faces:[614,304]}],
 },
 '1-west-upper-office-7':{
  // The curved front is sampled from the PDF's cubic, not a rectangular desk.
  desks:[],seats:[{point:[757,465],faces:[744,478],task:true}],
 },
 '1-west-upper-office-9':{
  desks:[[[859.09,503.32],[869.91,513.54],[812,574.88],[801.17,564.66]],[[880.57,489.39],[886.89,495.35],[871.61,511.53],[865.31,505.57]]],
  seats:[{point:[861,535],faces:[845,528],task:true},{point:[833,565],faces:[817,558],task:true},{point:[900,558],faces:[882,566]},{point:[873,588],faces:[882,566]}],round:[881.93,565.74],
 },
 '1-west-lower-office-1':{
  desks:[[[152.98,443.42],[174.81,482.37],[159.13,491.17],[137.29,452.21]],[[151.85,478.18],[159.13,491.17],[129.91,507.55],[122.63,494.56]],[[219.01,447.55],[223.27,455.12],[174.82,482.37],[170.56,474.8]]],
  seats:[{point:[136,473],faces:[156,468],task:true},{point:[177,453],faces:[192,444]},{point:[207,436],faces:[192,444]}],round:[191.6,444],
 },
 '1-west-lower-office-2':{
  desks:[[[192.08,479.56],[213.88,518.54],[198.18,527.32],[176.38,488.34]],[[176.38,488.35],[183.65,501.34],[154.42,517.69],[147.15,504.69]],[[147.15,504.69],[168.95,543.67],[155.96,550.94],[134.16,511.96]]],
  seats:[{point:[168,520],faces:[191,508],task:true},{point:[196,493],faces:[188,499]},{point:[207,511],faces:[199,517]}],
 },
 '1-west-lower-office-3':{
  desks:[[[296.49,576.61],[303.76,589.6],[266.98,610.22],[259.7,597.24]],[[240.29,608.12],[247.57,621.11],[210.79,641.73],[203.5,628.75]]],
  seats:[{point:[273,581],faces:[282,598],task:true},{point:[218,612],faces:[227,629],task:true},{point:[210,573],faces:[229,570]},{point:[240,555],faces:[229,570]}],round:[228.68,570.48],
 },
 '1-west-lower-office-4':{
  desks:[[[306.7,594.84],[313.99,607.82],[277.2,628.44],[269.92,615.46]],[[250.51,626.34],[257.78,639.32],[221,659.95],[213.72,646.97]]],
  seats:[{point:[302,632],faces:[292,611],task:true},{point:[247,663],faces:[236,643],task:true},{point:[270,686],faces:[284,669]},{point:[304,668],faces:[284,669]}],round:[284.07,668.73],
 },
 '1-west-lower-office-5':{
  desks:[[[384.52,706.44],[391.8,719.43],[355.01,740.05],[347.73,727.07]],[[328.32,737.95],[335.61,750.94],[298.82,771.56],[291.54,758.58]]],
  seats:[{point:[361,711],faces:[369,729],task:true},{point:[306,742],faces:[314,760],task:true},{point:[298,703],faces:[317,700]},{point:[329,685],faces:[317,700]}],round:[316.72,700.32],
 },
};

function officeFrame(room:InteriorRoom){
 const [a,b]=room.polygon,length=Math.hypot(b[0]-a[0],b[1]-a[1]);
 const u:Point=[(b[0]-a[0])/length,(b[1]-a[1])/length],origin:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2];
 const sign=pointInPolygon([origin[0]-u[1]*.3,origin[1]+u[0]*.3],room.polygon)?1:-1;
 const v:Point=[-u[1]*sign,u[0]*sign];
 return {u,v,origin,angle:-Math.atan2(u[1],u[0])};
}
// The facade vertices are projected onto the shared envelope by layout.ts.
// Nudge a traced object off that fitted wall without changing its outline.
function insetFromWalls(points:Point[],room:InteriorRoom,clearance:number){
 for(let pass=0;pass<3;pass++)room.polygon.forEach((a,i)=>{
  const b=room.polygon[(i+1)%room.polygon.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  let nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
  if(!pointInPolygon([(a[0]+b[0])/2+nx*.1,(a[1]+b[1])/2+nz*.1],room.polygon)){nx=-nx;nz=-nz;}
  const gap=Math.min(...points.map(p=>(p[0]-a[0])*nx+(p[1]-a[1])*nz));
  if(gap<clearance)points.forEach((p,j)=>points[j]=[p[0]+nx*(clearance-gap),p[1]+nz*(clearance-gap)]);
 });
}
export function firstWestOfficeDesk(room:InteriorRoom){
 const source=SOURCE_FITS[room.id];
 if(!U_DESK_IDS.has(room.id)&&!source)return null;
 const {u,v,origin,angle}=officeFrame(room);
 // The return adjoins the right partition, leaving the access aisle on the left.
 const at=(x:number,z:number):Point=>[origin[0]+u[0]*(x+.3)+v[0]*z,origin[1]+u[1]*(x+.3)+v[1]*z];
 const tops=U_DESK_IDS.has(room.id)?[{x:0,z:.65,w:2.0,d:.6},{x:.7,z:1.55,w:.6,d:1.2},{x:0,z:2.45,w:2.0,d:.6}]:[];
 const outlines=tops.map(t=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z])=>at(t.x+x*t.w/2,t.z+z*t.d/2)));
 const chairs:Point[]=[at(0,1.55),at(-.55,3.16),at(.55,3.16)];
 const workerAngle=Math.atan2(-v[0],-v[1]),guestAngle=Math.atan2(v[0],v[1]);
 const angles=[workerAngle,guestAngle,guestAngle],swivel=[true,false,false];
 let approaches=[at(-.65,1.55),at(-.55,3.85),at(.55,3.85)];
 const surfaces:Point[][]=[];
 let round:{point:Point;radius:number}|undefined;
 if(source){
  for(const [i,desk] of source.desks.entries())surfaces.push(desk.map(([x,y],j)=>{
   // The current doors differ from the drawn swing locations. Keep the
   // evidenced forms, with the documented clearance adjustments in the note.
   if(room.id==='1-west-upper-office-9'&&i===0&&j>=2){x+=12;y-=12;}
   if(room.id==='1-west-upper-office-2'){x+=10;y-=10;}
   if(room.id==='1-west-lower-office-1'&&i===2&&j<2){x-=14;y+=8;}
   if(room.id==='1-west-lower-office-3'&&i===0){x-=13;y+=7;}
   return firstWestPlan(x,y);
  }));
  if(room.id==='1-west-upper-office-7'){
   const curve=new THREE.CubicBezierCurve(new THREE.Vector2(723.71,469.21),new THREE.Vector2(730.43,482.73),new THREE.Vector2(739.24,490.93),new THREE.Vector2(753.2,496.67));
   surfaces.push([[765.23,482.85],[736.66,456.23],...curve.getPoints(16).map(p=>[p.x,p.y])].map(([x,y])=>firstWestPlan(x,y)));
  }
  // Leave a small reveal from traced partitions and between separate symbols.
  // Plan registration, surface height and leg positions are estimates.
  for(const surface of surfaces){
   const center=surface.reduce((p,q)=>[p[0]+q[0]/surface.length,p[1]+q[1]/surface.length],[0,0]);
   surface.forEach((p,i)=>surface[i]=[center[0]+(p[0]-center[0])*.96,center[1]+(p[1]-center[1])*.96]);
   insetFromWalls(surface,room,.16);
  }
  outlines.push(...surfaces);
  if(source.round){
   const [x,y]=source.round;
   round={point:room.id==='1-west-lower-office-1'?firstWestPlan(x-14,y):firstWestPlan(x,y),radius:.43};
   outlines.push(Array.from({length:32},(_,i):Point=>[round!.point[0]+Math.cos(i*Math.PI/16)*round!.radius,round!.point[1]+Math.sin(i*Math.PI/16)*round!.radius]));
  }
  chairs.length=angles.length=swivel.length=0;
  for(const [i,seat] of source.seats.entries()){
   const original=firstWestPlan(...seat.point),target=firstWestPlan(...seat.faces);
   let [x,y]=seat.point;
   if(room.id==='1-west-upper-office-1'&&i===1){x+=8;y-=2;}
   // Keep the right end of the L desk accessible around the visitor row.
   if(room.id==='1-west-upper-office-1'&&i===2){x+=12;y+=7;}
   // Separate the native visitor row enough to reach its far chair without
   // closing the aisle between the first chair and the corridor partition.
   if(room.id==='1-west-upper-office-4'&&i===1){x-=2;y-=4;}
   if(room.id==='1-west-upper-office-2'){x+=10;y-=10;}
   if(room.id==='1-west-upper-office-9'&&i===1){x+=7;y-=7;}
   if(room.id==='1-west-lower-office-3'&&i===0){x-=13;y+=7;}
   if(room.id==='1-west-lower-office-1'&&!seat.task){x-=14;}
   if(room.id==='1-west-lower-office-1'&&i===1){x=168;y=427;}
   const position=[firstWestPlan(x,y)];insetFromWalls(position,room,.34);
   const facing=room.id==='1-west-lower-office-1'&&i===1?round!.point:target;
   const back=room.id==='1-west-lower-office-1'&&i===1?position[0]:original;
   chairs.push(position[0]);angles.push(Math.atan2(back[0]-facing[0],back[1]-facing[1]));swivel.push(!!seat.task);
  }
  // These are standing approaches beside/behind the drawn seats. Choose a
  // clear side when the chair back faces a wall; do not relocate a desk to
  // populate an empty area or add an undocumented chair.
  approaches=chairs.map((p,i)=>{
   const offsets=[0,Math.PI/2,-Math.PI/2,Math.PI/4,-Math.PI/4,Math.PI*3/4,-Math.PI*3/4,Math.PI];
   const candidates=offsets.map(a=>[p[0]+Math.sin(angles[i]+a)*.65,p[1]+Math.cos(angles[i]+a)*.65] as Point);
   candidates.sort((a,b)=>Math.hypot(a[0]-room.door[0],a[1]-room.door[1])-Math.hypot(b[0]-room.door[0],b[1]-room.door[1]));
   return candidates.find(q=>pointInPolygon(q,room.polygon)&&room.polygon.every((a,j)=>distanceToSegment(q,a,room.polygon[(j+1)%room.polygon.length])>.3)&&outlines.every(poly=>!pointInPolygon(q,poly)&&poly.every((a,j)=>distanceToSegment(q,a,poly[(j+1)%poly.length])>.3))&&chairs.every(c=>Math.hypot(q[0]-c[0],q[1]-c[1])>.54))??candidates[0];
  });
 }
 return {at,u,v,tops,surfaces,round,outlines,chairs,angles,swivel,angle,approaches};
}
interface Builder extends RoofBuilder {chair(x:number,z:number,angle:number,m:THREE.Material,swivel?:boolean):void;}
export function buildFirstWestOffice(room:InteriorRoom,b:Builder){
 const f=firstWestOfficeDesk(room);if(!f)return;
 const m=b.palette;
 for(let i=0;i<f.tops.length;i++){
  const t=f.tops[i],p=f.at(t.x,t.z);
  b.box(p[0],.75,p[1],t.w,.065,t.d,m.white,f.angle);
  for(const side of [-1,1]){
   const foot=f.at(t.x+side*(t.w/2-.12),t.z);
   b.box(foot[0],.36,foot[1],.05,.72,t.d-.12,m.metal,f.angle);
  }
 }
 for(const surface of f.surfaces){
  const shape=new THREE.Shape(surface.map(([x,z])=>new THREE.Vector2(x,-z)));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:false});
  geometry.rotateX(-Math.PI/2);geometry.translate(0,.7175,0);b.put(geometry,m.white);
  const center=surface.reduce((p,q)=>[p[0]+q[0]/surface.length,p[1]+q[1]/surface.length],[0,0]);
  const edges=surface.map((p,i)=>{const q=surface[(i+1)%surface.length];return [q[0]-p[0],q[1]-p[1]];});
  const longest=edges.reduce((a,b)=>Math.hypot(...a)>Math.hypot(...b)?a:b);
  for(const side of [-1,1])b.cylinder(center[0]+longest[0]*.28*side,.36,center[1]+longest[1]*.28*side,.035,.72,m.metal);
 }
 if(f.round){
  const [x,z]=f.round.point;b.cylinder(x,.75,z,f.round.radius,.065,m.white);b.cylinder(x,.36,z,.035,.72,m.metal);b.cylinder(x,.035,z,.24,.045,m.metal);
 }
 for(const outline of f.outlines)outline.forEach((a,i)=>b.barriers.push({a,b:outline[(i+1)%outline.length],minY:0,maxY:.79}));
 f.chairs.forEach((p,i)=>b.chair(p[0],p[1],f.angles[i],m.black,f.swivel[i]));
 b.put(ceilingGeometry(room.polygon,3.15),m.white);
 const light=f.at(0,2.4);b.box(light[0],3.08,light[1],1.8,.04,.13,m.light,f.angle+Math.PI/2);
}

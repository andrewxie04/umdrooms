import { ShapeUtils, Vector2 } from 'three';
import { antonovFloorPieces, antonovHeight } from './auditorium';
import { GANNON_WORLD_FOOTPRINT } from './gannon-ground-layout';
import { type Point, type Polygon } from './layout';

// Estimated shared section, not measured construction: keep Gannon's ceiling
// and enclosure below the existing upper seating with a 0.19 m slab allowance.
// Both rooms share the original guide registration. A documented section remains needed.
const upperPieces=antonovFloorPieces();
const area=(p:Polygon)=>p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-b[0]*a[1];},0)/2;
function clip(subject:Polygon,a:Point,b:Point,sign:number,inside=true):Polygon{
 const value=(p:Point)=>((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]))*sign*(inside?1:-1);
 const out:Point[]=[];
 subject.forEach((p,i)=>{const q=subject[(i+1)%subject.length],pv=value(p),qv=value(q);if(pv>=0)out.push(p);if((pv>=0)!==(qv>=0)){const t=pv/(pv-qv);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}});
 return out;
}
function partition(subject:Polygon,convex:Polygon){
 let inside=subject;const outside:Polygon[]=[],sign=Math.sign(area(convex));
 convex.forEach((a,i)=>{
  if(!inside.length)return;
  const b=convex[(i+1)%convex.length],piece=clip(inside,a,b,sign,false);
  if(piece.length>=3&&Math.abs(area(piece))>1e-8)outside.push(piece);
  inside=clip(inside,a,b,sign);
 });
 return {inside,outside};
}
// The native upper face loop is concave at its two recesses. Partition by
// actual upper tier triangles instead of treating the enclosure as convex.
// Only low tiers affect the 3.3 m ceiling; higher tiers keep that default.
const lowerTriangles=upperPieces.filter(p=>p.height-.19<3.3).flatMap(piece=>
 ShapeUtils.triangulateShape(piece.polygon.map(p=>new Vector2(...p)),[]).map(indices=>{
  const polygon:Polygon=indices.map(i=>piece.polygon[i]);
  return {polygon,height:piece.height-.19,minX:Math.min(...polygon.map(p=>p[0])),maxX:Math.max(...polygon.map(p=>p[0])),minZ:Math.min(...polygon.map(p=>p[1])),maxZ:Math.max(...polygon.map(p=>p[1]))};
 }));
export const GANNON_CEILING_PIECES=ShapeUtils.triangulateShape(GANNON_WORLD_FOOTPRINT.map(p=>new Vector2(...p)),[]).flatMap(indices=>{
 const triangle:Polygon=indices.map(i=>GANNON_WORLD_FOOTPRINT[i]),pieces:{polygon:Polygon;height:number}[]=[];
 const minX=Math.min(...triangle.map(p=>p[0])),maxX=Math.max(...triangle.map(p=>p[0])),minZ=Math.min(...triangle.map(p=>p[1])),maxZ=Math.max(...triangle.map(p=>p[1]));
 let remaining:Polygon[]=[triangle];
 for(const upper of lowerTriangles){
  if(upper.maxX<minX||upper.minX>maxX||upper.maxZ<minZ||upper.minZ>maxZ)continue;
  const outside:Polygon[]=[];
  for(const subject of remaining){
   const result=partition(subject,upper.polygon);
   if(result.inside.length>=3&&Math.abs(area(result.inside))>1e-8)pieces.push({polygon:result.inside,height:upper.height});
   outside.push(...result.outside);
  }
  remaining=outside;
  if(!remaining.length)break;
 }
 return [...pieces,...remaining.map(polygon=>({polygon,height:3.3}))];
});
export function gannonCeilingHeight(point:Point){const upper=antonovHeight(point);return upper===null?3.3:Math.min(3.3,upper-.19);}
export function gannonWallSections(a:Point,b:Point){
 const dx=b[0]-a[0],dy=b[1]-a[1],cuts=[0,1];
 for(const {polygon} of upperPieces)polygon.forEach((c,i)=>{
  const d=polygon[(i+1)%polygon.length],ex=d[0]-c[0],ey=d[1]-c[1],den=dx*ey-dy*ex;
  if(Math.abs(den)<1e-10)return;
  const t=((c[0]-a[0])*ey-(c[1]-a[1])*ex)/den,s=((c[0]-a[0])*dy-(c[1]-a[1])*dx)/den;
  if(t>1e-8&&t<1-1e-8&&s>=0&&s<=1)cuts.push(t);
 });
 const ordered=[...new Set(cuts)].sort((x,y)=>x-y),point=(t:number):Point=>[a[0]+dx*t,a[1]+dy*t];
 return ordered.slice(0,-1).map((from,i)=>{
  const to=ordered[i+1];
  return {a:point(from),b:point(to),top:gannonCeilingHeight(point((from+to)/2))};
 });
}

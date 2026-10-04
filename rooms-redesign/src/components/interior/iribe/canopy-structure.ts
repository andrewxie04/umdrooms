import * as THREE from 'three';
import { CANOPY_COLUMNS, CANOPY_SOFFIT_HEIGHT, CANOPY_SOFFIT_OUTLINE, canopyColumnSection, type CanopyColumn } from './canopy-structure-layout';
import { AMPH_DROP, pointInPolygon, type Point } from './layout';
import type { RoofBuilder } from './roof';

/** Inclined tube with horizontal end cuts, so its base is on the paving and
 * its upper elliptical cut meets the soffit without a projecting round cap. */
function columnGeometry(c:CanopyColumn,base:number){
 const positions:number[]=[],normals:number[]=[],uvs:number[]=[],indices:number[]=[],sides=32;
 for(const y of [base,CANOPY_SOFFIT_HEIGHT]){
  const {center,direction:[dx,dz],cosine,sine}=canopyColumnSection(c,y,base);
  for(let i=0;i<=sides;i++){
   const theta=i/sides*Math.PI*2,along=Math.cos(theta),across=Math.sin(theta);
   positions.push(center[0]+c.radius*(along*dx/cosine-across*dz),y,center[1]+c.radius*(along*dz/cosine+across*dx));
   normals.push(along*cosine*dx-across*dz,-along*sine,along*cosine*dz+across*dx);
   uvs.push(i/sides,(y-base)/(CANOPY_SOFFIT_HEIGHT-base));
  }
 }
 for(let i=0;i<sides;i++){const j=i+sides+1;indices.push(i,j,i+1,i+1,j,j+1);}
 for(const [y,normal] of [[base,-1],[CANOPY_SOFFIT_HEIGHT,1]]){
  const {center,direction:[dx,dz],cosine}=canopyColumnSection(c,y,base),start=positions.length/3;
  positions.push(center[0],y,center[1]);normals.push(0,normal,0);uvs.push(.5,.5);
  for(let i=0;i<=sides;i++){
   const theta=i/sides*Math.PI*2,along=Math.cos(theta),across=Math.sin(theta);
   positions.push(center[0]+c.radius*(along*dx/cosine-across*dz),y,center[1]+c.radius*(along*dz/cosine+across*dx));
   normals.push(0,normal,0);uvs.push((along+1)/2,(across+1)/2);
   if(i<sides){const a=start+i+1,b=a+1;indices.push(...(normal>0?[start,b,a]:[start,a,b]));}
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);return g;
}

function clippedLine(origin:Point,d:Point){
 const crossings:number[]=[];
 CANOPY_SOFFIT_OUTLINE.forEach((a,i)=>{
  const b=CANOPY_SOFFIT_OUTLINE[(i+1)%CANOPY_SOFFIT_OUTLINE.length],ex=b[0]-a[0],ez=b[1]-a[1],qx=a[0]-origin[0],qz=a[1]-origin[1],det=d[0]*ez-d[1]*ex;
  if(Math.abs(det)<1e-10)return;
  const t=(qx*ez-qz*ex)/det,s=(qx*d[1]-qz*d[0])/det;
  if(s>=0&&s<=1)crossings.push(t);
 });
 if(crossings.length<2)return null;
 const lo=Math.min(...crossings),hi=Math.max(...crossings);
 return [[origin[0]+d[0]*lo,origin[1]+d[1]*lo],[origin[0]+d[0]*hi,origin[1]+d[1]*hi]] as const;
}

export function buildCanopyStructure(b:RoofBuilder){
 const base=-AMPH_DROP;
 const silver=new THREE.MeshStandardMaterial({color:0xa9b2b5,metalness:.68,roughness:.48});silver.name='Inclined canopy silver';
 const bronze=new THREE.MeshStandardMaterial({color:0x806442,metalness:.58,roughness:.48});bronze.name='Canopy bronze soffit';bronze.side=THREE.DoubleSide;
 b.materials.push(silver,bronze);
 for(const c of CANOPY_COLUMNS){
  b.put(columnGeometry(c,base),silver);
  // Bands use the actual changing axis, not a vertical cylinder collider. An
  // expanded ellipse encloses each band, including the lean between its ends.
  const bands=12,sides=16,h=(CANOPY_SOFFIT_HEIGHT-base)/bands,circumscribed=1/Math.cos(Math.PI/sides);
  for(let j=0;j<bands;j++){
   const y=base+(j+.5)*h,{center,direction:[dx,dz],cosine,lean}=canopyColumnSection(c,y,base),along=(c.radius/cosine+lean/bands/2)*circumscribed;
   const ring:Point[]=Array.from({length:sides},(_,i)=>{
    const angle=i/sides*Math.PI*2;
    return [center[0]+Math.cos(angle)*along*dx-Math.sin(angle)*c.radius*circumscribed*dz,center[1]+Math.cos(angle)*along*dz+Math.sin(angle)*c.radius*circumscribed*dx];
   });
   ring.forEach((a,i)=>b.barriers.push({a,b:ring[(i+1)%ring.length],minY:base+j*h,maxY:base+(j+1)*h}));
  }
 }
 b.surface(CANOPY_SOFFIT_OUTLINE,CANOPY_SOFFIT_HEIGHT,bronze);
 // Shallow outer trim follows the original overhead projection; it is not an
 // invented storey above the canopy. The western facade closure has no fascia.
 CANOPY_SOFFIT_OUTLINE.slice(0,-1).forEach((a,i)=>b.wall(a,CANOPY_SOFFIT_OUTLINE[i+1],.16,bronze,false,CANOPY_SOFFIT_HEIGHT,.035));
 const a=CANOPY_SOFFIT_OUTLINE[0],end=CANOPY_SOFFIT_OUTLINE[1],length=Math.hypot(end[0]-a[0],end[1]-a[1]);
 const u:Point=[(end[0]-a[0])/length,(end[1]-a[1])/length],v:Point=[-u[1],u[0]];
 const at=(x:number,z:number):Point=>[a[0]+u[0]*x+v[0]*z,a[1]+u[1]*x+v[1]*z];
 const local=CANOPY_SOFFIT_OUTLINE.map(p=>[(p[0]-a[0])*u[0]+(p[1]-a[1])*u[1],(p[0]-a[0])*v[0]+(p[1]-a[1])*v[1]]);
 const minU=Math.min(...local.map(p=>p[0])),maxU=Math.max(...local.map(p=>p[0])),minV=Math.min(...local.map(p=>p[1])),maxV=Math.max(...local.map(p=>p[1]));
 // Photographs show rectangular panel joints and small recessed fixtures;
 // their metric pitch and locations are explicit visual estimates.
 for(const [start,stop,step,direction,cross] of [[minU,maxU,2.4,v,u],[minV,maxV,1.2,u,v]] as const){
  for(let t=start+step;t<stop;t+=step){
   const p:Point=[a[0]+cross[0]*t,a[1]+cross[1]*t],line=clippedLine(p,direction);
   if(line)b.wall(line[0],line[1],.005,b.palette.black,false,CANOPY_SOFFIT_HEIGHT-.009,.006);
  }
 }
 for(let x=minU+2.4;x<maxU-1;x+=4.8)for(let z=minV+1.8;z<maxV-1;z+=3.6){
  const p=at(x,z);if(!pointInPolygon(p,CANOPY_SOFFIT_OUTLINE)||CANOPY_COLUMNS.some(c=>Math.hypot(c.top[0]-p[0],c.top[1]-p[1])<.85))continue;
  b.cylinder(p[0],CANOPY_SOFFIT_HEIGHT-.018,p[1],.052,.012,b.palette.black);
  b.cylinder(p[0],CANOPY_SOFFIT_HEIGHT-.026,p[1],.025,.004,b.palette.light);
 }
}

import * as THREE from 'three';
import { ATRIUM_FLIGHTS, ATRIUM_MIDDLE_LANDING, ATRIUM_LANDING, ATRIUM_LANDING_POLYGON, type Position } from './circulation';
import { ATRIUM_VOID, atriumPoint, pointInPolygon, distanceToSegment, type Point, type Polygon } from './layout';
import { ATRIUM_LIFT_APRON, ATRIUM_LIFT_CORE } from './lift-layout';
import type { RoofBuilder } from './roof';
import { ATRIUM_SOURCE_OPENING_GUARD } from './atrium-opening-layout';
import { soffitFinish } from './finishes';

export function buildAtrium(floor:'G'|'1',b:RoofBuilder){
 const {box,surface,put,palette:m}=b;
 const structure=new THREE.MeshStandardMaterial({color:0xe9e9e4,roughness:.65,side:THREE.DoubleSide});b.materials.push(structure);
 // The HDR photograph separates the pale guards from a cooler metal soffit.
 // Color and reflectance are estimates; use one shared material for all flights.
 const metalFinish=soffitFinish(true);b.textures.push(metalFinish.map,metalFinish.bumpMap);
 const soffit=new THREE.MeshStandardMaterial({map:metalFinish.map,bumpMap:metalFinish.bumpMap,bumpScale:.0015,roughness:.46,metalness:.42,side:THREE.DoubleSide});b.materials.push(soffit);
 // Gray walking faces remain distinct from pale risers and perforated guards.
 // Exact tread finish and color are photograph-informed estimates.
 const treads=new THREE.MeshStandardMaterial({color:0xc2c6c3,roughness:.78,side:THREE.DoubleSide});b.materials.push(treads);
 // Paired source tread lines inform a thin nosing band. Its darker finish is
 // estimated; depth bias keeps it stable on the coplanar walking face.
 const nosing=new THREE.MeshStandardMaterial({color:0x8c9290,roughness:.7,metalness:.2,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});b.materials.push(nosing);
 // Draw only the part removed by the opening. Triangulating the target also
 // supports a concave traced opening without layering over the existing slab.
 const clippedSurface=(poly:Polygon,y:number,material:THREE.Material)=>{
  const triangles=THREE.ShapeUtils.triangulateShape(ATRIUM_VOID.map(p=>new THREE.Vector2(...p)),[]);
  const cross=(a:Point,end:Point,p:Point)=>(end[0]-a[0])*(p[1]-a[1])-(end[1]-a[1])*(p[0]-a[0]);
  for(const ids of triangles){
   const triangle=ids.map(i=>ATRIUM_VOID[i]),sign=Math.sign(cross(triangle[0],triangle[1],triangle[2]));
   let clipped=poly;
   for(let i=0;i<3;i++){
    const a=triangle[i],end=triangle[(i+1)%3],result:Point[]=[];
    for(let j=0;j<clipped.length;j++){
     const p=clipped[j],q=clipped[(j+1)%clipped.length],dp=cross(a,end,p)*sign,dq=cross(a,end,q)*sign;
     if(dp>=0)result.push(p);
     if((dp<0)!==(dq<0)){const t=dp/(dp-dq);result.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}
    }
    clipped=result;
   }
   if(clipped.length>=3)surface(clipped,y,material);
  }
 };
 // Perforated metal guards: a single mipmapped material for every panel.
 const pixels=new Uint8Array(64*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){
  const i=(y*64+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=245;
  pixels[i+3]=Math.hypot(x-31.5,y-31.5)<11?0:255;
 }
 const map=new THREE.DataTexture(pixels,64,64);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.generateMipmaps=true;map.minFilter=THREE.LinearMipmapLinearFilter;map.magFilter=THREE.LinearFilter;map.anisotropy=4;map.needsUpdate=true;b.textures.push(map);
 const perforated=new THREE.MeshStandardMaterial({map,alphaTest:.4,side:THREE.DoubleSide,roughness:.7});b.materials.push(perforated);
 const panel=(a:Position,end:Position,low:number,high:number,mat:THREE.Material,repeat=false)=>{
  const length=Math.hypot(end[0]-a[0],end[2]-a[2]),h=high-low;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([
   a[0],a[1]+low,a[2],end[0],end[1]+low,end[2],end[0],end[1]+high,end[2],a[0],a[1]+high,a[2],
  ],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,repeat?length/.035:1,0,repeat?length/.035:1,repeat?h/.035:1,0,repeat?h/.035:1],2));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();put(g,mat);
 };
 const guardPosts=new Set<string>();
 const postPositions:Position[]=[];
 const rail=(a:Position,end:Position,collision=true)=>{
  panel(a,end,-.22,.12,structure);panel(a,end,.12,1.05,perforated,true);
  const start=new THREE.Vector3(a[0],a[1]+1.065,a[2]),finish=new THREE.Vector3(end[0],end[1]+1.065,end[2]);
  const g=new THREE.CylinderGeometry(.027,.027,start.distanceTo(finish),10);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),finish.clone().sub(start).normalize()));g.translate(...start.add(finish).multiplyScalar(.5).toArray());put(g,m.white);
  for(const p of [a,end]){
   const key=p.map(v=>Math.round(v*1000)).join(',');
   // Adaptive curve samples describe the guard contour, not a physical post
   // at every sample or tread. Keep the photographed light guard structure
   // at an estimated spacing, while retaining every panel and collision edge.
   if(!guardPosts.has(key)&&postPositions.every(q=>Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])>=.8)){
    guardPosts.add(key);postPositions.push(p);box(p[0],p[1]+.57,p[2],.03,1,.03,m.white);
   }
  }
  if(collision)b.barriers.push({a:[a[0],a[2]],b:[end[0],end[2]],minY:Math.min(a[1],end[1])-.22,maxY:Math.max(a[1],end[1])+1.08});
 };
 if(floor==='G'){
  // HDR's stair photograph shows suspended linear lights against exposed
  // black services. Fit the visible motif to the atrium, keeping every strip
  // clear of the timber enclosure. Routing and fixture heights are estimates.
  const luminous=new THREE.MeshBasicMaterial({color:0xfff7eb,toneMapped:false});
  b.materials.push(luminous);
  const strips=[
   [-2.6,-4.6,2.4,.5],[-.1,-5.1,2.5,-.45],[2.7,-4.8,2,.72],
   [-3.1,-1.8,2.3,-.55],[3.4,-1.4,1.9,.82],
   [-3.3,1.1,2,.45],[2.9,3,2.1,-.6],[-1.8,3.6,2.3,.8],[.2,4,1.8,-.3],
  ] as const;
  const clear=(p:Point)=>pointInPolygon(p,ATRIUM_VOID)&&!pointInPolygon(p,ATRIUM_LIFT_CORE)&&ATRIUM_LIFT_CORE.every((a,i)=>distanceToSegment(p,a,ATRIUM_LIFT_CORE[(i+1)%ATRIUM_LIFT_CORE.length])>.22);
  for(const [index,[x,z,length,angle]] of strips.entries()){
   const [cx,cz]=atriumPoint(x,z),tip=atriumPoint(x+Math.cos(angle),z-Math.sin(angle));
   const scale=Math.hypot(tip[0]-cx,tip[1]-cz),axis:Point=[(tip[0]-cx)/scale,(tip[1]-cz)/scale],rotation=-Math.atan2(axis[1],axis[0]);
   if(![-.5,0,.5].every(t=>clear([cx+axis[0]*length*t,cz+axis[1]*length*t])))continue;
   const y=9.45+(index%3)*.16;
   box(cx,y,cz,length,.055,.065,m.black,rotation);
   box(cx,y-.029,cz,length-.04,.006,.043,luminous,rotation);
   for(const t of [-.32,.32])b.cylinder(cx+axis[0]*length*t,(y+10.6)/2,cz+axis[1]*length*t,.005,10.6-y,m.metal);
  }
  // Dark shallow beams make the high ceiling read as a separate exposed zone.
  for(const z of [-4,3.8]){
   const a=atriumPoint(-4.2,z),end=atriumPoint(3.8,z);
   if(pointInPolygon(a,ATRIUM_VOID)&&pointInPolygon(end,ATRIUM_VOID))b.wall(a,end,.13,m.black,false,10.44,.12);
  }
  const flights=[...ATRIUM_FLIGHTS,ATRIUM_LANDING],path=[flights[0].from,...flights.map(f=>f.to)];
  // Miter adjacent edges so the curved landing and its guards have no cracks.
  const sides=path.map((p,i)=>{
   const prev=path[Math.max(0,i-1)],next=path[Math.min(path.length-1,i+1)];
   const direction=(a:Position,end:Position):Point=>{const l=Math.hypot(end[0]-a[0],end[2]-a[2]);return [(end[0]-a[0])/l,(end[2]-a[2])/l];};
   const before=direction(i?prev:p,i?p:next),after=direction(i===path.length-1?prev:p,i===path.length-1?p:next);
   const nx=-before[1]-after[1],nz=before[0]+after[0],l=Math.hypot(nx,nz),ux=nx/l,uz=nz/l;
   const half=(flights[Math.max(0,i-1)].width+flights[Math.min(i,flights.length-1)].width)/4;
   const extent=half/Math.max(.5,ux*(-after[1])+uz*after[0]);
   return [-1,1].map(sign=>[p[0]+ux*extent*sign,p[1],p[2]+uz*extent*sign] as Position);
  });
  // Stitch each source flight to the fitted connecting segments using its
  // actual end cross-sections, preserving inner/outer edge ownership.
  for(const [i,flight] of flights.entries())if(flight.sections){
   const first=flight.sections[0],guess=sides[i][0],aFirst=Math.hypot(guess[0]-first.a[0],guess[2]-first.a[1])<Math.hypot(guess[0]-first.b[0],guess[2]-first.b[1]);
   for(const [index,row] of [[i,first],[i+1,flight.sections.at(-1)!]] as const)sides[index]=(aFirst?[row.a,row.b]:[row.b,row.a]).map(p=>[p[0],row.height,p[1]] as Position);
  }
  const bridgeStart=sides[sides.length-2],bridgeDelta=[ATRIUM_LANDING.to[0]-ATRIUM_LANDING.from[0],ATRIUM_LANDING.to[2]-ATRIUM_LANDING.from[2]];
  sides[sides.length-1]=bridgeStart.map(p=>[p[0]+bridgeDelta[0],p[1],p[2]+bridgeDelta[1]] as Position);
  flights.forEach((flight,i)=>{
   const {from:a,to:end,width}=flight,length=Math.hypot(end[0]-a[0],end[2]-a[2]),rise=end[1]-a[1],angle=-Math.atan2(end[2]-a[2],end[0]-a[0]);
   if(flight.route&&flight.polygon){
    // One traced flat deck replaces fitted, overlapping mitered arc strips.
    // Only its inner/outer contours receive guards; flight mouths stay open.
    surface(flight.polygon,a[1],treads);surface(flight.polygon,a[1]-.22,soffit);
    for(const edge of [ATRIUM_MIDDLE_LANDING.outer,ATRIUM_MIDDLE_LANDING.inner])edge.slice(0,-1).forEach((p,j)=>{
     const q=edge[j+1];rail([p[0],a[1],p[1]],[q[0],a[1],q[1]]);
    });
    return;
   }
   if(flight.sections){
    const sections=flight.sections;
    for(let j=0;j<sections.length-1;j++){
     const start=sections[j],end=sections[j+1],poly:Polygon=[start.a,start.b,end.b,end.a];
     surface(poly,end.height,treads);
     const t=Math.min(.15,.024/Math.min(Math.hypot(end.a[0]-start.a[0],end.a[1]-start.a[1]),Math.hypot(end.b[0]-start.b[0],end.b[1]-start.b[1])));
     surface([start.a,start.b,[start.b[0]+(end.b[0]-start.b[0])*t,start.b[1]+(end.b[1]-start.b[1])*t],[start.a[0]+(end.a[0]-start.a[0])*t,start.a[1]+(end.a[1]-start.a[1])*t]],end.height,nosing);
     panel([start.a[0],start.height,start.a[1]],[start.b[0],start.height,start.b[1]],0,end.height-start.height,structure);
     for(const side of ['a','b'] as const){
      const a=start[side],bp=end[side];
      rail([a[0],start.height,a[1]],[bp[0],end.height,bp[1]]);
     }
    }
    // One continuous sloping soffit closes the flight. Separate horizontal
    // undersides for every tread would intersect it and create folded faces.
    const geometry=new THREE.BufferGeometry(),vertices:number[]=[],indices:number[]=[];
    sections.forEach(s=>vertices.push(s.a[0],s.height-.22,s.a[1],s.b[0],s.height-.22,s.b[1]));
    for(let j=0;j<sections.length-1;j++){const k=j*2;indices.push(k,k+1,k+3,k,k+3,k+2);}
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(sections.flatMap(s=>[s.a[0],s.a[1],s.b[0],s.b[1]]),2));geometry.setIndex(indices);geometry.computeVertexNormals();put(geometry,soffit);
    return;
   }
   if(rise===0){
    const poly:Polygon=[[sides[i][0][0],sides[i][0][2]],[sides[i+1][0][0],sides[i+1][0][2]],[sides[i+1][1][0],sides[i+1][1][2]],[sides[i][1][0],sides[i][1][2]]];
    if(i===flights.length-1){clippedSurface(poly,a[1],treads);clippedSurface(poly,a[1]-.22,soffit);}
    else{surface(poly,a[1],treads);surface(poly,a[1]-.22,soffit);}
   }else{
    const steps=Math.ceil(rise/.175);
    for(let j=0;j<steps;j++){
     const t=(j+.5)/steps;box(a[0]+(end[0]-a[0])*t,a[1]+rise*(j+1)/steps-.11,a[2]+(end[2]-a[2])*t,length/steps+.012,.22,width,m.white,angle);
    }
    const corners=[sides[i][0],sides[i+1][0],sides[i+1][1],sides[i][1]];
    const underside=new THREE.BufferGeometry();underside.setAttribute('position',new THREE.Float32BufferAttribute(corners.flatMap(p=>[p[0],p[1]-.22,p[2]]),3));underside.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,1],2));underside.setIndex([0,1,2,0,2,3]);underside.computeVertexNormals();put(underside,soffit);
   }
   // Subdivide sloping guards for collisions that permit walking underneath
   // the high end of a flight while blocking its low soffit.
   const count=Math.max(1,Math.ceil(length/.55));
   for(let side=0;side<2;side++){
    const p=sides[i][side],q=sides[i+1][side];
    for(let j=0;j<count;j++){
     const at=(t:number):Position=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t];
     rail(at(j/count),at((j+1)/count));
    }
   }
  });
 }else{
  clippedSurface(ATRIUM_LIFT_APRON,0,structure);clippedSurface(ATRIUM_LIFT_APRON,-.19,structure);
  ATRIUM_LIFT_APRON.forEach((a,i)=>b.wall(a,ATRIUM_LIFT_APRON[(i+1)%ATRIUM_LIFT_APRON.length],.19,structure,false,-.19,.02));
  // Split a guard where the reconstructed lift landing rejoins the corridor.
  const split=(a:Point,end:Point,polygon:Polygon,inside:boolean)=>{
   const dx=end[0]-a[0],dz=end[1]-a[1],cuts=[0,1];
   polygon.forEach((p,i)=>{
    const q=polygon[(i+1)%polygon.length],ex=q[0]-p[0],ez=q[1]-p[1],det=dx*ez-dz*ex;
    if(Math.abs(det)<1e-8)return;
    const ax=p[0]-a[0],az=p[1]-a[1],t=(ax*ez-az*ex)/det,u=(ax*dz-az*dx)/det;
    if(t>0&&t<1&&u>=0&&u<=1)cuts.push(t);
   });cuts.sort((x,y)=>x-y);
   const at=(t:number):Point=>[a[0]+dx*t,a[1]+dz*t];
   return cuts.slice(0,-1).flatMap((t,i)=>pointInPolygon(at((t+cuts[i+1])/2),polygon)===inside&&cuts[i+1]-t>1e-6?[[at(t),at(cuts[i+1])] as const]:[]);
  };
  // Guard the mezzanine opening, leaving the stair's upper landing open.
  // The broad source guard is an open contour. Neither estimated mask closure
  // nor the sloping upper stair edge receives a horizontal mezzanine guard.
  ATRIUM_SOURCE_OPENING_GUARD.slice(0,-1).forEach((a,i)=>{
   const end=ATRIUM_SOURCE_OPENING_GUARD[i+1];
   const pos=(p:Point):Position=>[p[0],0,p[1]];
   for(const [p,q] of split(a,end,ATRIUM_LIFT_APRON,false))for(const [u,v] of split(p,q,ATRIUM_LANDING_POLYGON,false))rail(pos(u),pos(v));
  });
  for(const i of [0,2])for(const [a,end] of split(ATRIUM_LIFT_APRON[i],ATRIUM_LIFT_APRON[i+1],ATRIUM_VOID,true))rail([a[0],0,a[1]],[end[0],0,end[1]]);
 }
}

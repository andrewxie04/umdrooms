import * as THREE from 'three';
import { FAMILY_GARDEN_DOOR, FAMILY_GARDEN_GUARD_EDGES, FAMILY_TERRACE, MAIN_FOOTPRINT, distanceToSegment, pointInPolygon, type Point, type Polygon } from './layout';
import { FAMILY_BEDS, FAMILY_MAPLES } from './family-garden-layout';
import type { RoofBuilder } from './roof';

export function buildFamilyGarden(b:RoofBuilder){
 const {box,cylinder,wall,surface,put}=b;
 const mat=(color:number,roughness=.85)=>{const m=new THREE.MeshStandardMaterial({color,roughness});b.materials.push(m);return m;};
 const cream=mat(0xc8c0a8),soil=mat(0x3e3023),wood=mat(0x73746c,.86),leaf=mat(0x516b36),darkLeaf=mat(0x3b592e),grass=mat(0x959166),bark=mat(0x65513d),metal=mat(0x6f7876,.42),hosta=mat(0x668555),flower=mat(0xdad8ba);hosta.side=THREE.DoubleSide;grass.side=THREE.DoubleSide;
 const deckPixels=new Uint8Array(128*128*4);
 for(let z=0;z<128;z++)for(let x=0;x<128;x++){const i=(z*128+x)*4,joint=x%10.67<.6,n=Math.sin(x*2+Math.sin(z*.065))*.06+Math.sin(x*9+z*.015)*.03,shade=joint?.46:1+n;deckPixels.set([108*shade,106*shade,98*shade,255],i);}
 const deckMap=new THREE.DataTexture(deckPixels,128,128);deckMap.colorSpace=THREE.SRGBColorSpace;deckMap.wrapS=deckMap.wrapT=THREE.RepeatWrapping;deckMap.repeat.set(.5,.5);deckMap.generateMipmaps=true;deckMap.minFilter=THREE.LinearMipmapLinearFilter;deckMap.magFilter=THREE.LinearFilter;deckMap.anisotropy=4;deckMap.needsUpdate=true;b.textures.push(deckMap);
 const deck=mat(0xffffff);deck.map=deckMap;
 surface(FAMILY_TERRACE,0,deck);
 const underside=mat(0xb7b9b3);underside.side=THREE.BackSide;surface(FAMILY_TERRACE,-.19,underside);
 FAMILY_TERRACE.forEach((a,i)=>wall(a,FAMILY_TERRACE[(i+1)%FAMILY_TERRACE.length],.19,cream,false,-.19,.025));
 // The glass guard encloses the outer edge, not the auditorium wall or the
 // curtain-wall connection back to the building.
 for(const {a,b:end} of FAMILY_GARDEN_GUARD_EDGES){
  const length=Math.hypot(end[0]-a[0],end[1]-a[1]),count=Math.ceil(length/1.35);
  wall(a,end,1.23,b.palette.glass,true,0,.028);wall(a,end,.075,metal,false,1.23,.08);wall(a,end,.11,metal,false,.06,.1);
  for(let j=0;j<=count;j++){const t=j/count;box(a[0]+(end[0]-a[0])*t,.65,a[1]+(end[1]-a[1])*t,.065,1.3,.065,metal);}
 }
 // Curved concrete planters and soil beds follow the published garden plan.
 for(const bed of FAMILY_BEDS){surface(bed,.43,soil);bed.forEach((a,i)=>wall(a,bed[(i+1)%bed.length],.48,cream,true,0,.12));}
 function bench(bed:Polygon,from:number,to:number){
  for(let i=from;i<to;i++){
   const a=bed[i],end=bed[(i+1)%bed.length],length=Math.hypot(end[0]-a[0],end[1]-a[1]),dx=(end[0]-a[0])/length,dz=(end[1]-a[1])/length;let nx=-dz,nz=dx;
   if(pointInPolygon([(a[0]+end[0])/2+nx*.04,(a[1]+end[1])/2+nz*.04],bed)){nx=-nx;nz=-nz;}
   const count=Math.max(1,Math.ceil(length/.085)),angle=-Math.atan2(dz,dx);
   for(let j=0;j<count;j++){
    const t=(j+.5)/count,x=a[0]+(end[0]-a[0])*t,z=a[1]+(end[1]-a[1])*t;
    box(x+nx*.16,.51,z+nz*.16,length/count*.78,.065,.49,wood,angle);
    box(x-nx*.055,.76,z-nz*.055,length/count*.78,.51,.055,wood,angle);
   }
   b.barriers.push({a:[a[0]+nx*.39,a[1]+nz*.39],b:[end[0]+nx*.39,end[1]+nz*.39],minY:0,maxY:1.04});
  }
 }
 bench(FAMILY_BEDS[0],12,32);bench(FAMILY_BEDS[1],0,23);bench(FAMILY_BEDS[2],72,105);
 let seed=9324;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(const bed of FAMILY_BEDS){
  const xs=bed.map(p=>p[0]),zs=bed.map(p=>p[1]);
  const area=Math.abs(bed.reduce((s,p,i)=>s+p[0]*bed[(i+1)%bed.length][1]-p[1]*bed[(i+1)%bed.length][0],0))/2,target=Math.ceil(area*3.2);let placed=0;
  for(let i=0;i<target*12&&placed<target;i++){
   const p:Point=[Math.min(...xs)+random()*(Math.max(...xs)-Math.min(...xs)),Math.min(...zs)+random()*(Math.max(...zs)-Math.min(...zs))];
   if(!pointInPolygon(p,bed)||bed.some((a,j)=>distanceToSegment(p,a,bed[(j+1)%bed.length])<.3))continue;placed++;
   if(i%3===0){
    // Tufts of pale ornamental grass, with static bent blades.
    for(let j=0;j<10;j++){
     const a=random()*Math.PI*2,h=.3+random()*.35,w=.028,dx=Math.cos(a),dz=Math.sin(a);
     const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([p[0]-dz*w,.44,p[1]+dx*w,p[0]+dz*w,.44,p[1]-dx*w,p[0]+dx*.16,.44+h*.65,p[1]+dz*.16,p[0]+dx*.29,.44+h,p[1]+dz*.29],3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,.65,.5,1],2));geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals();put(geometry,grass);
    }
   }else if(i%3===1){
    for(let j=0;j<6;j++){const a=j*Math.PI/3+random()*.3,g=new THREE.SphereGeometry(1,8,4);g.scale(.11,.035,.24);g.rotateX(.3);g.rotateY(a);g.translate(p[0]+Math.sin(a)*.18,.54+random()*.08,p[1]+Math.cos(a)*.18);put(g,hosta);}
   }else{
    const g=new THREE.IcosahedronGeometry(.26+random()*.2,1);g.scale(1,.8,1);g.translate(p[0],.62,p[1]);put(g,darkLeaf);
    if(i%5===0)for(let j=0;j<3;j++){const f=new THREE.IcosahedronGeometry(.055,0);f.scale(1,.4,1);f.translate(p[0]+(random()-.5)*.2,.99,p[1]+(random()-.5)*.2);put(f,flower);}
   }
  }
 }
 for(const p of FAMILY_MAPLES){
  cylinder(p[0],1.2,p[1],.055,1.6,bark);
  for(let j=0;j<7;j++){
   const a=j*2.4,tip=new THREE.Vector3(p[0]+Math.cos(a)*(.45+j*.075),2.05+random()*.55,p[1]+Math.sin(a)*(.45+j*.075)),base=new THREE.Vector3(p[0],1.18,p[1]);
   const g=new THREE.CylinderGeometry(.012,.028,base.distanceTo(tip),6);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),tip.clone().sub(base).normalize()));g.translate(...base.add(tip).multiplyScalar(.5).toArray());put(g,bark);
   const crown=new THREE.IcosahedronGeometry(.58,1);crown.scale(1.2,.6,1.2);crown.translate(tip.x,tip.y,tip.z);put(crown,j%2?leaf:darkLeaf);
  }
 }
 // Small garden lights sit within the planting, clear of the deck routes.
 for(const bed of FAMILY_BEDS)for(const i of [8,35,61]){
  const a=bed[i],center:Point=[bed.reduce((s,p)=>s+p[0],0)/bed.length,bed.reduce((s,p)=>s+p[1],0)/bed.length],p:Point=[a[0]*.92+center[0]*.08,a[1]*.92+center[1]*.08];
  cylinder(p[0],.69,p[1],.04,.52,metal);cylinder(p[0],.94,p[1],.052,.035,b.palette.light);
 }
 // Open double glazed doors at the corridor connection. The curtain wall
 // builder cuts this same opening, so there is no invisible glass barrier.
 const edge=MAIN_FOOTPRINT.reduce((best,a,i)=>distanceToSegment(FAMILY_GARDEN_DOOR,a,MAIN_FOOTPRINT[(i+1)%MAIN_FOOTPRINT.length])<distanceToSegment(FAMILY_GARDEN_DOOR,MAIN_FOOTPRINT[best],MAIN_FOOTPRINT[(best+1)%MAIN_FOOTPRINT.length])?i:best,0);
 const a=MAIN_FOOTPRINT[edge],end=MAIN_FOOTPRINT[(edge+1)%MAIN_FOOTPRINT.length],length=Math.hypot(end[0]-a[0],end[1]-a[1]),ux=(end[0]-a[0])/length,uz=(end[1]-a[1])/length;
 let nx=-uz,nz=ux;if(pointInPolygon([FAMILY_GARDEN_DOOR[0]+nx*.5,FAMILY_GARDEN_DOOR[1]+nz*.5],MAIN_FOOTPRINT)){nx=-nx;nz=-nz;}
 for(const side of [-1,1]){
  const jamb:Point=[FAMILY_GARDEN_DOOR[0]+ux*.9*side,FAMILY_GARDEN_DOOR[1]+uz*.9*side],tip:Point=[jamb[0]+nx*.85,jamb[1]+nz*.85];
  wall(jamb,tip,2.4,b.palette.glass,true,0,.025);wall(jamb,tip,.035,metal,false,0,.045);wall(jamb,tip,.035,metal,false,2.38,.045);
  for(const p of [jamb,tip])box(p[0],1.2,p[1],.05,2.4,.05,metal);
  box(tip[0]-nx*.12,1.05,tip[1]-nz*.12,.035,.33,.035,metal);
 }
}

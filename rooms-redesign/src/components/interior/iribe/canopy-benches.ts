import * as THREE from 'three';
import { CANOPY_BENCHES, CANOPY_BENCH_HEIGHT, CANOPY_BENCH_THICKNESS, canopyBenchSlats } from './canopy-bench-layout';
import { AMPH_DROP, type Point, type Polygon } from './layout';
import type { RoofBuilder } from './roof';

export function buildCanopyBenches(b:RoofBuilder){
 const base=-AMPH_DROP,seat=base+CANOPY_BENCH_HEIGHT;
 const oak=b.palette.oak as THREE.MeshStandardMaterial;
 // Reuse the existing wood texture; outdoor tone and weathering are estimates.
 const timber=new THREE.MeshStandardMaterial({color:0xd5bf9e,map:oak.map,roughness:.82});timber.name='Canopy bench timber';b.materials.push(timber);
 const steel=new THREE.MeshStandardMaterial({color:0x566166,roughness:.58,metalness:.65});steel.name='Canopy bench steel';b.materials.push(steel);
 const volume=(polygon:Polygon,y:number,height:number)=>{
  const shape=new THREE.Shape(polygon.map(([x,z])=>new THREE.Vector2(x,-z)));
  const g=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,steps:1});g.rotateX(-Math.PI/2);g.translate(0,y,0);b.put(g,timber);
 };
 for(const bench of CANOPY_BENCHES){
  for(const slat of canopyBenchSlats(bench))volume(slat,seat-CANOPY_BENCH_THICKNESS,CANOPY_BENCH_THICKNESS);
  // Two slender concentric support rails follow the native segmented curves.
  // Radial brackets and paired legs are photo-informed estimates, not plan data.
  const inner=bench.innerEdge,outer=[...bench.outerEdge].reverse();
  const sample=(edge:readonly Point[],t:number):Point=>{const q=t*(edge.length-1),i=Math.min(edge.length-2,Math.floor(q)),f=q-i;return [edge[i][0]+(edge[i+1][0]-edge[i][0])*f,edge[i][1]+(edge[i+1][1]-edge[i][1])*f];};
  const rail=(t:number,f:number):Point=>{const p=sample(inner,t),q=sample(outer,t);return [p[0]+(q[0]-p[0])*f,p[1]+(q[1]-p[1])*f];};
  for(const f of [.22,.78])for(let i=0;i<80;i++)b.wall(rail(i/80,f),rail((i+1)/80,f),.055,steel,false,seat-CANOPY_BENCH_THICKNESS-.065,.035);
  for(const t of [.04,.22,.4,.58,.76,.94]){
   const p=rail(t,.08),q=rail(t,.92);b.wall(p,q,.04,steel,false,seat-CANOPY_BENCH_THICKNESS-.08,.065);
   for(const f of [.22,.78]){const r=rail(t,f),h=CANOPY_BENCH_HEIGHT-CANOPY_BENCH_THICKNESS-.09;b.box(r[0],base+h/2,r[1],.035,h,.035,steel);b.box(r[0],base+.012,r[1],.09,.024,.075,steel);}
  }
  bench.polygon.forEach((a,i)=>b.barriers.push({a,b:bench.polygon[(i+1)%bench.polygon.length],minY:base,maxY:seat}));
 }
}

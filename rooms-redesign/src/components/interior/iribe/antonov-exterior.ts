import * as THREE from 'three';
import { ANTONOV_EXTERIOR_PIECES, ANTONOV_EXTERIOR_TOP } from './antonov-exterior-layout';
import type { RoofBuilder } from './roof';
import type { Point } from './layout';

/** Open concrete stair, light parapet cap and stainless handrail from the
 * photographer's exterior views. Finish colors, heights and rail sizes are
 * estimates. The roof access beyond the upper landing is not yet registered. */
export function buildAntonovExterior(b:RoofBuilder,concrete:THREE.Material,brick:THREE.Material){
 const pale=new THREE.MeshStandardMaterial({color:0xc9c9bf,roughness:.85});
 const stainless=new THREE.MeshStandardMaterial({color:0xa3a7a4,roughness:.38,metalness:.72});
 const copper=new THREE.MeshStandardMaterial({color:0xa67a56,roughness:.58,metalness:.45});
 pale.name='Antonov exterior parapet cap';copper.name='Antonov exterior copper cladding';
 b.materials.push(pale,stainless,copper);
 const brickWall=(a:Point,z:Point,topA:number,topZ:number,phase:number)=>{
  const length=Math.hypot(z[0]-a[0],z[1]-a[1]),g=new THREE.BoxGeometry(length,1,.20);
  const uv=g.getAttribute('uv'),position=g.getAttribute('position'),normal=g.getAttribute('normal');
  for(let i=0;i<uv.count;i++){
   const top=topA+(topZ-topA)*(position.getX(i)/length+.5);
   position.setY(i,(position.getY(i)+.5)*top);
   const horizontal=Math.abs(normal.getZ(i))>.5?position.getX(i):position.getZ(i);
   uv.setXY(i,(horizontal+length/2+phase)/.48,position.getY(i)/.15);
  }
  g.computeVertexNormals();g.rotateY(-Math.atan2(z[1]-a[1],z[0]-a[0]));g.translate((a[0]+z[0])/2,0,(a[1]+z[1])/2);b.put(g,brick);
  b.barriers.push({a,b:z,minY:0,maxY:Math.max(topA,topZ)});
 };
 const rail=(a:Point,z:Point,ay:number,zy:number)=>{
  const from=new THREE.Vector3(a[0],ay,a[1]),to=new THREE.Vector3(z[0],zy,z[1]);
  const g=new THREE.CylinderGeometry(.023,.023,from.distanceTo(to),8);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),to.clone().sub(from).normalize()));
  g.translate(...from.add(to).multiplyScalar(.5).toArray());b.put(g,stainless);
 };
 let innerPhase=0,outerPhase=0;
 for(const [i,piece] of ANTONOV_EXTERIOR_PIECES.entries()){
  const {from,to,height,rise,polygon}=piece;
  b.surface(polygon,height+.004,concrete);
  if(rise)b.wall(from[0],from[1],rise,concrete,false,height-rise,.024);
  // Brick along the building side; a lower brick parapet with broad pale cap
  // follows the outside edge. Neither wall covers the stair with a ceiling.
  brickWall(from[1],to[1],ANTONOV_EXTERIOR_TOP+.2,ANTONOV_EXTERIOR_TOP+.2,innerPhase);
  b.wall(from[1],to[1],1.9,copper,false,ANTONOV_EXTERIOR_TOP+.2,.19);
  brickWall(from[0],to[0],height-rise+1.03,height+1.03,outerPhase);
  innerPhase+=Math.hypot(to[1][0]-from[1][0],to[1][1]-from[1][1]);outerPhase+=Math.hypot(to[0][0]-from[0][0],to[0][1]-from[0][1]);
  // The photographed cap slopes continuously beside the stepped treads.
  const length=Math.hypot(to[0][0]-from[0][0],to[0][1]-from[0][1]),cap=new THREE.BoxGeometry(length,.10,.36),capPosition=cap.getAttribute('position');
  for(let j=0;j<capPosition.count;j++)capPosition.setY(j,capPosition.getY(j)+height-rise+1.08+rise*(capPosition.getX(j)/length+.5));
  cap.computeVertexNormals();cap.rotateY(-Math.atan2(to[0][1]-from[0][1],to[0][0]-from[0][0]));cap.translate((from[0][0]+to[0][0])/2,0,(from[0][1]+to[0][1])/2);b.put(cap,pale);
  // Continuous handrail mounted on the building side, with sparse uprights.
  const inset=(outer:Point,inner:Point):Point=>{const length=Math.hypot(inner[0]-outer[0],inner[1]-outer[1]);return [inner[0]+(outer[0]-inner[0])*.14/length,inner[1]+(outer[1]-inner[1])*.14/length];};
  const a=inset(from[0],from[1]),z=inset(to[0],to[1]);
  rail(a,z,height-rise+.91,height+.91);
  if(i%4===0)b.cylinder(z[0],height+.47,z[1],.02,.94,stainless);
 }
 // The public photograph shows transverse gates at the two landings. Leave
 // their leaves open to support exploration; exact hardware is not documented.
 for(const piece of ANTONOV_EXTERIOR_PIECES.filter(p=>!p.rise&&p.height>0&&p.height<ANTONOV_EXTERIOR_TOP)){
  const a=piece.from[0],z=piece.from[1],length=Math.hypot(z[0]-a[0],z[1]-a[1]),ux=(z[0]-a[0])/length,uz=(z[1]-a[1])/length;
  const dx=piece.to[0][0]-a[0],dz=piece.to[0][1]-a[1],run=Math.hypot(dx,dz),nx=dx/run,nz=dz/run;
  for(const side of [0,1]){
   const jamb:Point=[a[0]+ux*length*side,a[1]+uz*length*side],tip:Point=[jamb[0]+nx*Math.min(.8,length*.45),jamb[1]+nz*Math.min(.8,length*.45)];
   b.cylinder(jamb[0],piece.height+.59,jamb[1],.034,1.18,b.palette.black);
   for(const y of [.09,1.15])rail(jamb,tip,piece.height+y,piece.height+y);
   for(let t=.08;t<.78;t+=.095){const p:Point=[jamb[0]+nx*t,jamb[1]+nz*t];b.cylinder(p[0],piece.height+.61,p[1],.008,1.02,b.palette.black);}
  }
 }
 // Guard the unfinished roof continuation at the top; do not imply an open
 // route through a guessed roof-access door or the auditorium's rear windows.
 const end=ANTONOV_EXTERIOR_PIECES.at(-1)!.to;
 b.wall(end[0],end[1],1.08,pale,true,ANTONOV_EXTERIOR_TOP,.1);
}

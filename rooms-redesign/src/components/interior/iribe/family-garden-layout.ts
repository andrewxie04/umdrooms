import * as THREE from 'three';
import { familyGardenPlan, theaterOffset, type Point, type Polygon } from './layout';
import { ANTONOV_SHELL_EDGES } from './antonov-shell-layout';
function round(points:Polygon):Polygon {
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],0,p[1])),true,'centripetal');
 return curve.getPoints(72).slice(0,-1).map(p=>[p.x,p.z]);
}
const trace=(p:Polygon)=>p.map(([x,y])=>familyGardenPlan(x,y));
// The planting strip follows the east glazing, excluding the south recess.
// Its setback/width remain landscape estimates; the wall baseline is native.
const alongTheater=ANTONOV_SHELL_EDGES.filter(e=>/^(northeast-to-east-return|east-|southeast-room-curve)/.test(e.runId)).map(e=>e.a).reverse();
function theaterBed():Polygon {
 const curve=new THREE.CatmullRomCurve3(alongTheater.map(p=>{const q=theaterOffset(p,1.15);return new THREE.Vector3(q[0],0,q[1]);}),false,'centripetal');
 const length=curve.getLength();
 // Leave the recessed south corner and the north outer guard clear.
 const line=Array.from({length:61},(_,i)=>curve.getPointAt(3/length+(1-4.8/length)*i/60));
 const inner:Point[]=[],outer:Point[]=[];
 for(let i=0;i<line.length;i++){
  const p=line[i],a=line[Math.max(0,i-1)],b=line[Math.min(line.length-1,i+1)],l=Math.hypot(b.x-a.x,b.z-a.z);let nx=-(b.z-a.z)/l,nz=(b.x-a.x)/l;
  const out=theaterOffset([p.x,p.z],1);if(nx*(out[0]-p.x)+nz*(out[1]-p.z)<0){nx=-nx;nz=-nz;}
  inner.push([p.x-nx*.65,p.z-nz*.65]);outer.push([p.x+nx*.65,p.z+nz*.65]);
 }
 return [...inner,...outer.reverse()];
}
export const FAMILY_BEDS:Polygon[]=[
 round(trace([[488,581],[504,577],[554,611],[572,631],[562,643],[511,657],[500,649],[477,611]])),
 round(trace([[578,705],[598,670],[616,653],[638,654],[685,679],[704,701],[713,729],[684,732],[618,720]])),
 theaterBed(),
];
export const FAMILY_MAPLES:Point[]=[familyGardenPlan(512,617),familyGardenPlan(639,693)];

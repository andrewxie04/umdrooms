import * as THREE from 'three';
import { labFrame } from './labs';
import type { InteriorRoom } from './layout';
import type { RoofBuilder } from './roof';

type RobotKind='kuka'|'ur3e'|'ur5e'|'baxter'|'sawyer';
/** Equipment inventory: facilities.robotics.umd.edu/rml/home.html.
 * Stations are movable in the real lab; this arrangement is a photo-informed
 * approximation, not a survey of their current positions. */
export const ROBOT_STATIONS:readonly {kind:RobotKind;x:number;z:number}[]=[
 {kind:'kuka',x:1.25,z:2.55},{kind:'kuka',x:1.4,z:4.7},
 {kind:'ur3e',x:7.6,z:2.5},{kind:'ur3e',x:7.6,z:4.3},
 {kind:'ur5e',x:7.5,z:6.35},{kind:'baxter',x:4.65,z:6.7},
 {kind:'sawyer',x:2.15,z:6.35},
];
type Builder=Pick<RoofBuilder,'box'|'cylinder'|'put'|'palette'|'materials'|'barriers'>;
type Vec3=readonly [number,number,number];
export function buildRoboticsLab(room:InteriorRoom,b:Builder){
 const f=labFrame(room),m=b.palette;
 const material=(color:number,roughness=.5)=>{const value=new THREE.MeshStandardMaterial({color,roughness});b.materials.push(value);return value;};
 const red=material(0xb9232f),orange=material(0xd96e20),jointBlue=material(0x87b4cb),yellow=material(0xd0a831),silver=material(0xc0c7c7,.3);
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material,angle=0)=>{const p=f.at(x,z);b.box(p[0],y,p[1],w,h,d,mat,f.angle+angle);};
 const cylinder=(x:number,y:number,z:number,r:number,h:number,mat:THREE.Material)=>{const p=f.at(x,z);b.cylinder(p[0],y,p[1],r,h,mat);};
 const vector=(a:Vec3)=>{const p=f.at(a[0],a[2]);return new THREE.Vector3(p[0],a[1],p[1]);};
 const link=(a:Vec3,end:Vec3,r:number,mat:THREE.Material)=>{
  const start=vector(a),finish=vector(end),g=new THREE.CylinderGeometry(r,r,start.distanceTo(finish),16);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),finish.clone().sub(start).normalize()));g.translate(...start.add(finish).multiplyScalar(.5).toArray());b.put(g,mat);
 };
 const round=(p:Vec3,r:number,mat:THREE.Material)=>{const g=new THREE.SphereGeometry(r,16,10);g.translate(...vector(p).toArray());b.put(g,mat);};
 const obstacle=(x:number,z:number,w:number,d:number)=>{const p=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([u,v])=>f.at(x+u,z+v));p.forEach((a,i)=>b.barriers.push({a,b:p[(i+1)%4],minY:0,maxY:2}));};
 const bench=(x:number,z:number,w:number,d:number,top=m.oak)=>{
  box(x,.8,z,w,.07,d,top);for(const dx of [-w/2+.1,w/2-.1])for(const dz of [-d/2+.1,d/2-.1]){box(x+dx,.41,z+dz,.065,.75,.065,m.black);cylinder(x+dx,.045,z+dz,.045,.06,m.black);}
  box(x,.24,z,w-.15,.055,.05,m.metal);obstacle(x,z,w,d);
 };
 const gripper=(p:Vec3,scale=1)=>{
  box(p[0],p[1],p[2],.12*scale,.07*scale,.095*scale,m.black);
  for(const side of [-1,1])box(p[0]+side*.045*scale,p[1]-.075*scale,p[2],.018*scale,.12*scale,.032*scale,silver);
 };
 // Articulated links and circular joint covers follow the equipment portraits.
 // These are static display poses, so the walkthrough adds no animation loop.
 const arm=(points:Vec3[],body:THREE.Material,cap:THREE.Material,r:number)=>{
  points.slice(0,-1).forEach((p,i)=>link(p,points[i+1],r*(1-i*.07),body));
  points.forEach((p,i)=>{
   const radius=r*(1.12-i*.06);round(p,radius,body);
   link([p[0],p[1],p[2]-.07],[p[0],p[1],p[2]+.07],radius,cap);
  });
  gripper(points[points.length-1]);
 };
 const pendant=(x:number,z:number)=>{
  box(x,.87,z,.23,.065,.3,m.black);box(x,.91,z-.01,.16,.012,.2,m.white);
  cylinder(x+.075,.925,z+.1,.025,.02,red);
 };
 for(const station of ROBOT_STATIONS){
  const {kind,x,z}=station;
  if(kind==='baxter'){
   box(x,.12,z,.8,.15,.7,m.black);cylinder(x,.62,z,.105,.95,m.metal);obstacle(x,z,1.8,.95);
   cylinder(x,1.15,z,.29,.25,m.black);box(x,1.46,z,.42,.5,.32,m.black);box(x,1.47,z-.17,.11,.48,.025,silver);
   box(x,1.96,z-.025,.4,.29,.085,red);box(x,1.96,z-.073,.34,.23,.014,m.black);cylinder(x,2.18,z,.09,.1,m.black);
   for(const side of [-1,1]){
    const points:Vec3[]=[[x+side*.28,1.28,z],[x+side*.44,1.48,z],[x+side*.52,1.91,z+.04],[x+side*.77,1.92,z-.06],[x+side*.8,1.57,z-.18],[x+side*.76,1.32,z-.25]];
    arm(points,red,m.black,.105);
   }
   // Manipulation work surface sits in front of the mobile pedestal.
   bench(x,z-1,1.85,.72);pendant(x+.6,z-1);
  }else if(kind==='sawyer'){
   box(x,.11,z,.7,.14,.65,m.black);cylinder(x,.55,z,.085,.83,m.metal);obstacle(x,z,1.1,.95);
   const points:Vec3[]=[[x,1,z],[x+.1,1.62,z],[x+.32,1.65,z],[x+.44,1.25,z],[x+.28,1.09,z-.12],[x-.03,1.53,z-.18],[x-.24,1.54,z-.25],[x-.31,1.28,z-.3]];
   arm(points,red,m.black,.08);
   cylinder(x,1.78,z,.035,.25,silver);box(x,1.94,z,.33,.23,.07,m.black);box(x,1.94,z-.042,.29,.19,.012,m.white);
   // The manufacturer's face display consists of two dark camera-like eyes.
   for(const side of [-1,1])round([x+side*.075,1.94,z-.053],.022,m.black);
  }else{
   const small=kind==='ur3e',width=kind==='kuka'?1.35:small?1.1:1.5;
   bench(x,z,width,.95,kind==='kuka'?m.white:m.oak);
   cylinder(x,.865,z,.115,.07,silver);
   if(kind==='kuka'){
    const points:Vec3[]=[[x,.9,z],[x,1.1,z],[x-.1,1.32,z],[x+.08,1.5,z],[x+.28,1.46,z],[x+.46,1.29,z],[x+.5,1.15,z]];
    arm(points,silver,orange,.075);
   }else{
    const scale=small?.62:1;
    const pose:Vec3[]=[[0,0,0],[0,.2,0],[.25,.46,0],[.03,.73,0],[.01,.73,-.16],[.11,.65,-.2]];
    arm(pose.map(([dx,y,dz])=>[x+dx*scale,.9+y*scale,z+dz*scale]),silver,jointBlue,.067*scale);
   }
   pendant(x-width*.32,z+.24);
  }
 }
 // Yellow mobile gantry in the left side of the lab's official panorama.
 for(const x of [.22,2.32]){
  box(x,1.57,2.55,.11,3.02,.11,yellow);box(x,.16,2.55,.16,.13,1.45,m.black);
  for(const z of [1.92,3.18])cylinder(x,.065,z,.065,.095,m.black);
  link([x,.5,1.98],[x,2.05,2.55],.035,yellow);link([x,.5,3.12],[x,2.05,2.55],.035,yellow);
  obstacle(x,2.55,.18,1.45);
 }
 box(1.27,3.12,2.55,2.35,.16,.16,yellow);box(1.27,2.99,2.55,.28,.15,.26,m.black);
 // Glass display case immediately beside the entrance, with small mechanisms.
 const cx=2.95,cz=.48;
 box(cx,.11,cz,1.3,.17,.62,m.black);box(cx,2.16,cz,1.3,.075,.62,m.metal);obstacle(cx,cz,1.3,.62);
 for(const dx of [-.63,.63])for(const dz of [-.29,.29])box(cx+dx,1.13,cz+dz,.025,2.05,.025,m.metal);
 for(const dz of [-.3,.3])box(cx,1.14,cz+dz,1.25,1.98,.012,m.glass);
 for(const dx of [-.64,.64])box(cx+dx,1.14,cz,.012,1.98,.59,m.glass);
 for(const y of [.5,.95,1.4,1.85]){
  box(cx,y,cz,1.26,.014,.59,m.glass);
  for(const dx of [-.37,.1,.4]){box(cx+dx,y+.065,cz,.12,.11,.12,dx<0?m.metal:red);cylinder(cx+dx,y+.14,cz,.035,.035,m.black);}
 }
 bench(7.2,.7,2.5,.72);box(7.5,1.13,.72,.52,.32,.045,m.black);box(7.5,.94,.72,.045,.24,.045,m.metal);
 for(const x of [6.5,7.7]){
  box(x,.46,1.4,.44,.07,.44,m.black);box(x,.76,1.59,.43,.49,.05,m.black);cylinder(x,.25,1.4,.035,.43,m.metal);
  for(const dx of [-.21,.21])box(x+dx,.09,1.4,.04,.04,.44,m.metal);obstacle(x,1.4,.46,.46);
 }
}

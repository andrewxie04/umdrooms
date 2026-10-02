import * as THREE from 'three';
import { sandboxPlan, type Point } from './layout';
import type { RoofBuilder } from './roof';

// Positions follow studio zones on the Sandbox wiki diagram. Equipment shapes
// follow its inventory photographs; individual placements and sizes are estimates.
export interface SandboxStation {room:string;kind:string;at:Point;width:number;depth:number;}
export const SANDBOX_STATIONS:SandboxStation[]=[
 ...([[718,185],[789,195],[709,290],[780,300],[698,400],[768,410]] as Point[]).map(at=>({room:'1231',kind:'workbench',at,width:2.1,depth:1.05})),
 {room:'1231',kind:'cutting',at:[561,267],width:2.6,depth:1.4},
 {room:'1231',kind:'woodbench',at:[547,374],width:2.1,depth:1.15},
 {room:'1231',kind:'printers',at:[458,351],width:2.3,depth:1.1},
 {room:'1231',kind:'staff',at:[454,250],width:1.4,depth:.75},
 {room:'1231',kind:'media',at:[716,527],width:2.8,depth:.8},
 {room:'1246',kind:'electronics',at:[350,80],width:3.5,depth:.85},
 {room:'1242',kind:'craft',at:[479,108],width:2.5,depth:.8},
 {room:'1238',kind:'sewing',at:[590,125],width:2.6,depth:.8},
 {room:'1245',kind:'staff',at:[360,267],width:1.6,depth:.8},
 {room:'1223',kind:'laser',at:[350,348],width:1.118,depth:.914},
 {room:'1220',kind:'projects',at:[285,524],width:2.6,depth:1.25},
 {room:'1222',kind:'mill',at:[419,537],width:1.3,depth:1.25},
 {room:'1224',kind:'drill',at:[550,543],width:.75,depth:.85},
 {room:'1224',kind:'woodbench',at:[520,505],width:1.6,depth:.75},
];
const origin=sandboxPlan(0,0),along=sandboxPlan(1,0),length=Math.hypot(along[0]-origin[0],along[1]-origin[1]);
export const SANDBOX_U:Point=[(along[0]-origin[0])/length,(along[1]-origin[1])/length];
export const SANDBOX_V:Point=[-SANDBOX_U[1],SANDBOX_U[0]];
const stationFacing=(s:SandboxStation)=>['1220','1222','1224'].includes(s.room)?-1:1;
export function sandboxStationPoint(s:SandboxStation,u:number,v:number):Point {const p=sandboxPlan(...s.at),sign=stationFacing(s);return [p[0]+sign*(SANDBOX_U[0]*u+SANDBOX_V[0]*v),p[1]+sign*(SANDBOX_U[1]*u+SANDBOX_V[1]*v)];}
export const sandboxStationFootprint=(s:SandboxStation)=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>sandboxStationPoint(s,u*s.width/2,v*s.depth/2));

export function buildSandbox(roomId:string,b:RoofBuilder){
 const {palette:m}=b;
 const mat=(color:number)=>{const material=new THREE.MeshStandardMaterial({color,roughness:.65});b.materials.push(material);return material;};
 const yellow=mat(0xd8b62e),mint=mat(0xa4c0b2),blue=mat(0x258da0),red=mat(0xb94236);
 for(const s of SANDBOX_STATIONS.filter(s=>s.room===roomId)){
  const angle=-Math.atan2(SANDBOX_U[1],SANDBOX_U[0])+(stationFacing(s)<0?Math.PI:0);
  const box=(u:number,y:number,v:number,w:number,h:number,d:number,material:THREE.Material)=>{const p=sandboxStationPoint(s,u,v);b.box(p[0],y,p[1],w,h,d,material,angle);};
  const cyl=(u:number,y:number,v:number,r:number,h:number,material:THREE.Material)=>{const p=sandboxStationPoint(s,u,v);b.cylinder(p[0],y,p[1],r,h,material);};
  const dial=(u:number,y:number,v:number,r:number)=>{
   const p=sandboxStationPoint(s,u,v),g=new THREE.CylinderGeometry(r,r,.025,16);
   g.rotateX(Math.PI/2);g.rotateY(angle);g.translate(p[0],y,p[1]);b.put(g,m.metal);
  };
  const outline=sandboxStationFootprint(s);outline.forEach((a,i)=>b.barriers.push({a,b:outline[(i+1)%4],minY:0,maxY:s.kind==='mill'||s.kind==='drill'?2:.95}));
  const bench=()=>{
   box(0,.91,0,s.width,.08,s.depth,s.kind==='cutting'?mint:m.oak);
   for(const u of [-1,1])for(const v of [-1,1])box(u*(s.width/2-.09),.43,v*(s.depth/2-.09),.06,.86,.06,m.metal);
   box(0,.22,0,s.width-.15,.05,s.depth-.2,m.white);
  };
  if(!['laser','mill','drill'].includes(s.kind))bench();
  const monitor=(u:number)=>{box(u,1.22,-.13,.51,.34,.045,m.black);box(u,1.22,-.103,.45,.27,.008,blue);box(u,1.01,-.13,.04,.15,.04,m.metal);box(u,.98,.16,.45,.025,.17,m.black);};
  if(s.kind==='workbench'||s.kind==='projects'){
   // Stools stay tucked under the long sides, preserving the shared aisle.
   for(const v of [-1,1]){cyl(0,.62,v*(s.depth/2+.12),.23,.065,yellow);cyl(0,.3,v*(s.depth/2+.12),.03,.58,m.metal);}
  }
  if(s.kind==='electronics'){
   for(const u of [-1,0,1]){
    box(u,1.13,0,.43,.32,.18,m.white);box(u-.06,1.15,.097,.25,.2,.014,m.black);
    for(let i=0;i<5;i++)box(u-.15+i*.04,1.15+Math.sin(i*2)*.035,.108,.035,.008,.008,blue);
    for(const y of [1.08,1.2])box(u+.15,y,.105,.05,.045,.025,m.metal);
    box(u+.32,1.01,.07,.13,.13,.16,blue);box(u+.3,1.14,.07,.018,.19,.018,m.metal);
   }
  }else if(s.kind==='sewing'){
   for(const u of [-.85,0,.85]){
    box(u,.98,0,.48,.06,.22,m.white);box(u+.16,1.16,0,.15,.32,.21,m.white);
    box(u-.045,1.31,0,.42,.09,.2,m.white);box(u-.2,1.23,0,.1,.16,.18,m.white);
    box(u-.2,1.1,.03,.012,.16,.012,m.metal);dial(u+.18,1.2,.116,.045);dial(u+.18,1.08,.116,.035);cyl(u+.12,1.42,0,.025,.09,m.white);
   }
  }else if(s.kind==='craft'){
   box(-.55,1.06,0,.57,.22,.24,mint);box(-.55,1.02,.13,.48,.018,.12,m.white);
   box(.55,1.08,0,.48,.25,.35,m.black);box(.55,1.08,.18,.32,.045,.025,m.white);
  }else if(s.kind==='printers'){
   for(const u of [-.7,.05,.8]){
    box(u,.995,0,.55,.09,.51,m.white);box(u,1.55,0,.55,.06,.51,m.white);
    for(const dx of [-.25,.25]){box(u+dx,1.28,0,.04,.51,.51,m.white);box(u+dx*.72,1.28,-.19,.012,.48,.012,m.metal);}
    box(u,1.28,-.24,.5,.48,.02,m.white);box(u,1.2,0,.43,.022,.4,m.metal);
    box(u,1.43,0,.11,.14,.1,m.white);box(u,1.26,.01,.12,.1,.12,blue);box(u,1.05,.267,.16,.08,.015,m.black);
   }
  }else if(s.kind==='laser'){
   box(0,.49,0,1.118,.98,.914,m.white);box(0,.986,0,.86,.018,.64,m.glass);box(0,.997,0,.62,.01,.39,m.black);
   box(.48,.998,.22,.12,.025,.2,m.black);box(0,.86,.465,.38,.025,.025,m.metal);
  }else if(s.kind==='mill'){
   box(0,.42,0,1.15,.84,1.1,m.metal);box(0,1.4,-.51,1.15,1.1,.1,m.white);
   for(const u of [-.6,.6])box(u,1.4,0,.075,1.1,1.15,m.white);
   box(0,.91,0,1.27,.13,1.2,m.white);box(0,1.88,0,1.25,.06,1.2,m.white);
   box(0,1.47,-.28,.28,.68,.24,m.metal);box(0,1.17,0,.82,.09,.47,m.metal);cyl(0,1.34,-.08,.045,.19,m.black);
  }else if(s.kind==='drill'){
   box(0,.055,0,.65,.11,.76,m.black);cyl(0,.8,-.2,.055,1.5,m.metal);
   box(0,1.6,-.08,.3,.3,.58,m.white);box(0,.94,.08,.53,.055,.48,m.metal);cyl(0,1.34,.13,.04,.22,m.metal);
   box(.17,1.59,.02,.018,.055,.08,red);box(.25,1.35,-.1,.3,.025,.025,m.black);
  }else if(s.kind==='woodbench'){
   box(-s.width*.3,.84,s.depth/2+.035,.3,.16,.12,m.metal);box(-s.width*.3,.84,s.depth/2+.12,.035,.035,.24,m.metal);
  }else if(s.kind==='staff'||s.kind==='media'){monitor(s.kind==='media'?-.7:0);if(s.kind==='media')monitor(.65);}
  if(s.kind==='workbench'&&s.at[0]===718){
   box(0,.98,0,.42,.055,.42,m.black);
   for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let k=0;k<3;k++)box((i-1)*.13,1.04+j*.13,(k-1)*.13,.022,.022,.022,m.light);
  }
  if(s.kind==='staff'&&roomId==='1231'){
   box(0,.62,.39,1.35,.5,.035,m.white);const p=sandboxStationPoint(s,0,.412);b.label('sandbox',p[0],.62,p[1],angle,1.1);
  }
  if(s.kind==='cutting'){
   box(0,.958,0,1.4,.012,.85,blue);for(let i=-5;i<=5;i++)box(i*.12,.966,0,.003,.003,.85,m.white);
  }
 }
}

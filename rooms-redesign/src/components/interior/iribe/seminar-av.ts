import * as THREE from 'three';
import { pointInPolygon, type InteriorRoom, type Point } from './layout';
import type { RoofBuilder } from './roof';

// UMD's room inventory explicitly identifies 4105 as a large seminar room:
// projector + rear LCD, two PTZ cameras, lectern, microphone and room PC.
// Positions, enclosure sizes and finishes below are estimates within its
// documented outline. Seating remains unmodeled pending a room-specific plan.
export function seminarAVLayout(room:InteriorRoom){
 const edge=(index:number)=>{
  const a=room.polygon[index],b=room.polygon[(index+1)%room.polygon.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  const u:Point=[(b[0]-a[0])/length,(b[1]-a[1])/length],center:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2];
  const sign=pointInPolygon([center[0]-u[1]*.3,center[1]+u[0]*.3],room.polygon)?1:-1,n:Point=[-u[1]*sign,u[0]*sign];
  return {length,u,n,angle:-Math.atan2(u[1],u[0]),at:(x:number,z:number):Point=>[center[0]+u[0]*x+n[0]*z,center[1]+u[1]*x+n[1]*z]};
 };
 const front=edge(0),rear=edge(2),lecternX=-front.length/2+1.4,lecternZ=1.45;
 const lectern=front.at(lecternX,lecternZ);
 const lecternFootprint:Point[]=[[-.45,-.35],[.45,-.35],[.45,.35],[-.45,.35]].map(([x,z])=>front.at(lecternX+x,lecternZ+z));
 return {front,rear,lectern,lecternX,lecternZ,lecternFootprint,projector:front.at(0,3.8),presenter:front.at(lecternX,lecternZ-.95),audience:front.at(0,5)};
}

export function buildSeminarAV(room:InteriorRoom,b:RoofBuilder){
 if(room.id!=='4105')return false;
 const f=seminarAVLayout(room),m=b.palette;
 const screen=new THREE.MeshStandardMaterial({color:0xf0efea,roughness:.96});
 const lcd=new THREE.MeshBasicMaterial({color:0x1c2b36});
 b.materials.push(screen,lcd);
 const wallBox=(frame:typeof f.front,x:number,z:number,y:number,w:number,h:number,d:number,mat:THREE.Material)=>{
  const p=frame.at(x,z);b.box(p[0],y,p[1],w,h,d,mat,frame.angle);
 };
 // Retractable front projection screen, housing and weighted bottom rail.
 wallBox(f.front,0,.12,3.47,3.45,.16,.18,m.white);
 wallBox(f.front,0,.22,2.35,3.25,2,.035,m.black);
 wallBox(f.front,0,.245,2.35,3.13,1.9,.012,screen);
 wallBox(f.front,0,.23,1.34,3.28,.045,.065,m.black);
 b.barriers.push({a:f.front.at(-1.65,.27),b:f.front.at(1.65,.27),minY:1.32,maxY:3.55});
 // The rear monitor is a separate destination on the documented touch panel.
 wallBox(f.rear,0,.1,2.2,.5,.35,.1,m.metal);
 wallBox(f.rear,0,.21,2.2,1.92,1.12,.09,m.black);
 wallBox(f.rear,0,.26,2.2,1.84,1.035,.012,lcd);
 b.barriers.push({a:f.rear.at(-.96,.28),b:f.rear.at(.96,.28),minY:1.62,maxY:2.78});
 const camera=(frame:typeof f.front,x:number,y:number)=>{
  const p=frame.at(x,.24);
  wallBox(frame,x,.19,y-.13,.28,.035,.3,m.metal);
  b.cylinder(p[0],y-.06,p[1],.105,.12,m.black);
  wallBox(frame,x,.255,y+.075,.19,.17,.17,m.black);
  const lens=new THREE.CylinderGeometry(.047,.047,.022,16);
  lens.rotateX(Math.PI/2);lens.rotateY(Math.atan2(frame.n[0],frame.n[1]));
  const q=frame.at(x,.355);lens.translate(q[0],y+.075,q[1]);b.put(lens,m.glass);
 };
 camera(f.front,2.15,2.85);camera(f.rear,0,1.48);
 b.barriers.push({a:f.rear.at(-.15,.38),b:f.rear.at(.15,.38),minY:1.3,maxY:1.68});
 // Ceiling projector: stem, mounting plate, case, lens and side cooling slots.
 const [px,pz]=f.projector;
 b.cylinder(px,3.97,pz,.025,.44,m.metal);
 b.box(px,3.74,pz,.34,.035,.25,m.metal,f.front.angle);
 b.box(px,3.59,pz,.5,.25,.4,m.white,f.front.angle);
 const lens=new THREE.CylinderGeometry(.072,.072,.045,16);
 lens.rotateX(Math.PI/2);lens.rotateY(Math.atan2(-f.front.n[0],-f.front.n[1]));
 const lp=f.front.at(-.12,3.58);lens.translate(lp[0],3.59,lp[1]);b.put(lens,m.glass);
 for(let i=0;i<6;i++)wallBox(f.front,.253,3.68+i*.045,3.59,.012,.13,.015,m.black);
 // Freestanding lectern with a recessed equipment rack and a control surface.
 const at=(x:number,z:number)=>f.front.at(f.lecternX+x,f.lecternZ+z),[x,z]=f.lectern;
 b.box(x,.52,z,.82,1.04,.6,m.oak,f.front.angle);
 b.box(x,.055,z,.88,.11,.67,m.black,f.front.angle);
 b.box(x,1.075,z,.9,.07,.7,m.black,f.front.angle);
 for(const [a,c] of [[-.22,.16],[.22,.16]]){
  const p=at(a,c);b.box(p[0],1.125,p[1],.26,.05,.23,m.black,f.front.angle);
 }
 // Equipment faces face the presenter; no network addresses or live codes.
 for(let i=0;i<3;i++){
  const p=at(0,-.309);b.box(p[0],.3+i*.18,p[1],.53,.13,.025,m.black,f.front.angle);
  const slot=at(-.025,-.325);b.box(slot[0],.31+i*.18,slot[1],.33,.009,.008,m.metal,f.front.angle);
 }
 const micPoints=[[.3,1.115,-.2],[.3,1.36,-.2],[.23,1.48,-.1]].map(([dx,y,dz])=>{const p=at(dx,dz);return new THREE.Vector3(p[0],y,p[1]);});
 b.put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(micPoints),12,.008,6,false),m.black);
 const micEnd=micPoints.at(-1)!;const capsule=new THREE.SphereGeometry(.022,8,6);capsule.translate(micEnd.x,micEnd.y,micEnd.z);b.put(capsule,m.black);
 const socket=at(.31,.17);b.box(socket[0],1.117,socket[1],.09,.015,.11,m.metal,f.front.angle);
 // Static redrawing of the photographed seminar-room routing interface.
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=320;const ctx=canvas.getContext('2d')!;
 ctx.fillStyle='#a8c9e2';ctx.fillRect(0,0,512,320);ctx.textAlign='center';ctx.font='16px Arial';
 const button=(x:number,y:number,w:number,label:string,color='#234c6a')=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,42);ctx.fillStyle='#eef5f8';ctx.fillText(label,x+w/2,y+26);};
 button(104,12,105,'Shutdown','#a64645');button(230,12,125,'Device Control');
 button(130,70,112,'Projector');button(260,70,112,'Monitor');
 ctx.fillStyle='#1e4059';ctx.fillText('Select source, then destination',256,157);
 for(const [i,label] of ['PC 1','Solstice','Camera A','Camera B','PC 2','Laptop','Tuner','Blu-ray'].entries())button(36+i%4*112,181+Math.floor(i/4)*55,102,label);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;b.textures.push(texture);
 const panel=new THREE.MeshBasicMaterial({map:texture});b.materials.push(panel);
 const face=new THREE.PlaneGeometry(.31,.194);face.rotateX(-Math.PI/2);face.rotateY(f.front.angle+Math.PI);
 const controller=at(-.2,-.02);face.translate(controller[0],1.172,controller[1]);b.put(face,panel);
 b.box(controller[0],1.135,controller[1],.35,.065,.23,m.black,f.front.angle);
 for(let i=0;i<4;i++)b.barriers.push({a:f.lecternFootprint[i],b:f.lecternFootprint[(i+1)%4],minY:0,maxY:1.12});
 return true;
}

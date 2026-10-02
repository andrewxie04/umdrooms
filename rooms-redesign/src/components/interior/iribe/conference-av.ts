import * as THREE from 'three';
import { distanceToSegment, pointInPolygon, type InteriorRoom, type Point } from './layout';
import { meetingTable } from './furniture';
import type { RoofBuilder } from './roof';
import { structuralColumns } from './structure';

// UMIACS documents one LCD, one conferencing camera and a room PC in these
// rooms. Combined conference/huddle placeholders are excluded until divided.
export const CONFERENCE_AV_ROOMS = new Set(['1119','1127','2137','2143','4137','4237','4145','5105','5107','5111','5137','5161','5165','5237']);

export function conferenceDisplayFrame(room:InteriorRoom){
 const table=meetingTable(room);if(!table)return null;
 const doors=[room.door,...(room.additionalDoors??[])];
 const candidates=room.polygon.flatMap((a,i)=>{
  if(room.exteriorEdges?.includes(i)||room.glazedEdges?.includes(i))return [];
  const b=room.polygon[(i+1)%room.polygon.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  if(length<2.1)return [];
  const u:Point=[(b[0]-a[0])/length,(b[1]-a[1])/length];
  return [.5,.25,.75].flatMap(t=>{
   const p:Point=[a[0]+u[0]*length*t,a[1]+u[1]*length*t];
   if(Math.min(t,1-t)*length<1.05)return [];
   const left:Point=[p[0]-u[0]*.96,p[1]-u[1]*.96],right:Point=[p[0]+u[0]*.96,p[1]+u[1]*.96];
   if(doors.some(d=>distanceToSegment(d,left,right)<(room.doorWidth??1.6)/2+.15))return [];
   const side=pointInPolygon([p[0]-u[1]*.2,p[1]+u[0]*.2],room.polygon)?1:-1;
   const n:Point=[-u[1]*side,u[0]*side];
   const at=(along:number,inset:number):Point=>[p[0]+u[0]*along+n[0]*inset,p[1]+u[1]*along+n[1]*inset];
   if(![-.96,.96].every(x=>pointInPolygon(at(x,.26),room.polygon)))return [];
   if(structuralColumns(room.floor).some(column=>[-.9,0,.9].some(x=>distanceToSegment(column,table.center,at(x,.28))<.4)))return [];
   // Prefer a table-end wall. Actual equipment positions are not surveyed.
   const score=Math.abs(n[0]*table.u[0]+n[1]*table.u[1])*10-Math.abs(t-.5);
   return [{at,u,n,angle:-Math.atan2(u[1],u[0]),score}];
  });
 });
 return candidates.sort((a,b)=>b.score-a.score)[0]??null;
}

/** One set of materials/textures per floor, merged with its furniture batches. */
export function createConferenceAVBuilder(b:RoofBuilder){
 let display:THREE.MeshBasicMaterial|undefined,panel:THREE.MeshBasicMaterial|undefined;
 const materials=()=>{
  if(display&&panel)return {display,panel};
  display=new THREE.MeshBasicMaterial({color:0x233746});
  // Redraw the photographed Crestron source-selection layout; no remote image
  // textures, connection codes or live scheduling state are embedded.
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=320;
  const ctx=canvas.getContext('2d')!;
  ctx.fillStyle='#c0d9ed';ctx.fillRect(0,0,512,320);
  ctx.textAlign='center';ctx.font='18px Arial';ctx.fillStyle='#18354f';ctx.fillText('Select Source To Be Displayed',256,40);
  for(const [x,y,label] of [[196,80,'Solstice'],[122,174,'Laptop'],[270,174,'Room PC']] as const){
   ctx.fillStyle='#17364e';ctx.fillRect(x,y,120,72);ctx.fillStyle='#e1eef7';ctx.fillText(label,x+60,y+43);
  }
  ctx.fillStyle='#253442';ctx.font='16px Arial';ctx.fillText('UNIVERSITY OF MARYLAND',256,300);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;b.textures.push(texture);
  panel=new THREE.MeshBasicMaterial({map:texture});b.materials.push(display,panel);
  return {display,panel};
 };
 return (room:InteriorRoom)=>{
  if(!CONFERENCE_AV_ROOMS.has(room.id))return false;
  const frame=conferenceDisplayFrame(room),table=meetingTable(room);if(!frame||!table)return false;
  const {display,panel}=materials(),{at,angle,n}=frame,m=b.palette;
  const wallBox=(along:number,inset:number,y:number,w:number,h:number,d:number,material:THREE.Material)=>{const p=at(along,inset);b.box(p[0],y,p[1],w,h,d,material,angle);};
  wallBox(0,.12,2.05,.55,.35,.08,m.metal); // VESA wall bracket
  wallBox(-.48,.145,2.05,.23,.23,.08,m.black); // PC behind the LCD
  wallBox(0,.225,2.05,1.92,1.12,.09,m.black);
  wallBox(0,.276,2.05,1.85,1.045,.014,display);
  wallBox(0,.205,1.43,.3,.035,.25,m.metal);
  wallBox(0,.27,1.53,.22,.16,.12,m.black);
  const lens=new THREE.CylinderGeometry(.042,.042,.018,16);
  lens.rotateX(Math.PI/2);lens.rotateY(Math.atan2(n[0],n[1]));
  const lensPoint=at(0,.342);lens.translate(lensPoint[0],1.54,lensPoint[1]);b.put(lens,m.glass);

  const {center,u,v}=table;
  const device=(along:number,across:number,y:number,w:number,h:number,d:number,material:THREE.Material)=>b.box(center[0]+u[0]*along+v[0]*across,y,center[1]+u[1]*along+v[1]*across,w,h,d,material,table.angle);
  // Low tabletop controller, cable well and compact wireless keyboard. All fit
  // above the already-collidable tabletop, leaving the circulation unchanged.
  device(-.38,0,.84,.34,.09,.24,m.black);
  const face=new THREE.PlaneGeometry(.3,.188);face.rotateX(-Math.PI/2);face.rotateY(table.angle);
  face.translate(center[0]-u[0]*.38,.887,center[1]-u[1]*.38);b.put(face,panel);
  device(.1,0,.802,.18,.018,.12,m.black);
  device(.47,0,.808,.35,.025,.14,m.black);
  for(let row=0;row<4;row++)for(let col=0;col<11;col++)device(.32+col*.026,-.045+row*.027,.823,.019,.005,.019,m.metal);
  return true;
 };
}

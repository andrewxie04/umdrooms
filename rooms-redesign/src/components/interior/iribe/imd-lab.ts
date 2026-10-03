import * as THREE from 'three';
import { pointInPolygon, type InteriorRoom, type Point } from './layout';
import type { RoofBuilder } from './roof';

// The Clarice's Iribe showcase photograph documents these furniture types and
// a white VR headset with ring controllers. Positions and dimensions are
// estimates; this is a representative event setup, not a permanent inventory.
export function imdLabLayout(room:InteriorRoom){
 const a=room.polygon[1],b=room.polygon[2],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
 const u:Point=[(b[0]-a[0])/length,(b[1]-a[1])/length],center:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2];
 const sign=pointInPolygon([center[0]-u[1],center[1]+u[0]],room.polygon)?1:-1,n:Point=[-u[1]*sign,u[0]*sign];
 const at=(x:number,z:number):Point=>[center[0]+u[0]*x+n[0]*z,center[1]+u[1]*x+n[1]*z];
 const fixtures=[{x:0,z:.36,w:Math.min(4.8,length-1.5),d:.62,h:.94},{x:0,z:2,w:1.6,d:.72,h:2.25},{x:0,z:3.15,w:2.1,d:.85,h:.83}];
 const footprint=(f:typeof fixtures[number])=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z])=>at(f.x+x*f.w/2,f.z+z*f.d/2));
 return {at,u,n,angle:-Math.atan2(u[1],u[0]),fixtures,footprint,approaches:[at(-1.7,2),at(1.7,2),at(0,4.25),at(0,1.05)]};
}
export function buildImdLab(room:InteriorRoom,b:RoofBuilder){
 const f=imdLabLayout(room),m=b.palette;
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,material:THREE.Material)=>{const p=f.at(x,z);b.box(p[0],y,p[1],w,h,d,material,f.angle);};
 const cylinder=(x:number,y:number,z:number,r:number,h:number,material:THREE.Material)=>{const p=f.at(x,z);b.cylinder(p[0],y,p[1],r,h,material);};
 for(const fixture of f.fixtures){const corners=f.footprint(fixture);corners.forEach((a,i)=>b.barriers.push({a,b:corners[(i+1)%4],minY:0,maxY:fixture.h}));}
 const width=f.fixtures[0].w,modules=Math.round(width/.8),unit=width/modules;
 box(0,.46,.36,width,.86,.62,m.oak);box(0,.92,.36,width+.04,.055,.66,m.black);
 for(let i=0;i<modules;i++){
  const x=-width/2+(i+.5)*unit;
  // Thin inset seams and metal pulls; open knee space is not implied.
  box(x,.49,.678,.012,.72,.014,m.metal);
  for(const y of [.38,.68])box(x+.15,y,.69,.20,.025,.025,m.metal);
  box(x,1.98,.25,unit-.025,.9,.42,m.oak);
  box(x+.15,1.7,.472,.025,.17,.025,m.metal);
 }
 // Freestanding display, matching the photographed dark central column.
 box(0,1.61,2,1.6,.94,.08,m.black);
 box(0,1.61,2.052,1.51,.85,.012,m.glass);
 box(0,.81,1.88,.13,1.48,.14,m.black);box(0,.12,2,1.16,.055,.65,m.black);
 for(const x of [-.5,.5])for(const z of [1.73,2.27])cylinder(x,.065,z,.055,.07,m.black);
 // Clear worktable in front of the screen, leaving both side aisles open.
 box(0,.79,3.15,2.1,.065,.85,m.oak);
 for(const x of [-.95,.95])for(const z of [2.8,3.5])box(x,.39,z,.045,.75,.045,m.metal);
 // A neutral powered-off headset rests on the worktable. No student artwork
 // or event-specific display content is reproduced.
 box(-.25,.93,3.17,.22,.14,.15,m.white);box(-.25,.93,3.085,.20,.10,.025,m.black);
 for(const x of [-.35,-.15])box(x,.92,3.02,.023,.025,.18,m.white);
 box(-.25,.92,2.93,.22,.025,.022,m.black);
 box(-.25,1.01,3.03,.025,.025,.22,m.black);
 for(const x of [.12,.38]){
  cylinder(x,.85,3.2,.018,.08,m.white);
  const p=f.at(x,3.18),ring=new THREE.TorusGeometry(.048,.008,6,16);
  ring.rotateX(-Math.PI/2);ring.translate(p[0],.895,p[1]);b.put(ring,m.white);
  cylinder(x,.891,3.18,.024,.008,m.black);
 }
}

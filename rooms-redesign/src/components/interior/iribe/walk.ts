import { supportHeight, FLOOR_ORDER, type Position } from './circulation';
import { FLOOR_HEIGHT, type FloorId } from './layout';
import * as THREE from 'three';
import { distanceToSegment, pointInPolygon, type Point, type Polygon } from './layout';
import type { Barrier } from './model';

export function canStand(point:Point,footprint:Polygon,barriers:Barrier[],radius=.24):boolean {
 return pointInPolygon(point,footprint) && !barriers.some(b=>distanceToSegment(point,b.a,b.b)<radius);
}
/** Small substeps prevent tunnelling, with independent axes for sliding along walls. */
export function walkStep(position:Point,delta:Point,footprint:Polygon,barriers:Barrier[]):Point {
 let [x,z]=position; const n=Math.max(1,Math.ceil(Math.hypot(...delta)/.12));
 for(let i=0;i<n;i++){
  const nx=x+delta[0]/n,nz=z+delta[1]/n;
  if(canStand([nx,z],footprint,barriers))x=nx;
  if(canStand([x,nz],footprint,barriers))z=nz;
 }
 return [x,z];
}
export function walkStep3(position:Position,delta:Point,barriers:(floor:FloorId)=>Barrier[]):Position {
 let [x,y,z]=position;const n=Math.max(1,Math.ceil(Math.hypot(...delta)/.08));
 for(let i=0;i<n;i++)for(const axis of [0,1]){
  const nx=x+(axis===0?delta[0]/n:0),nz=z+(axis===1?delta[1]/n:0);
  const h=supportHeight([nx,nz],y);
  if(h===null)continue;
  const blocked=FLOOR_ORDER.some(floor=>{
   const localHeight=h-FLOOR_HEIGHT[floor],ceiling=floor==='G'?10.5:floor==='R'?1.2:4.2;
   if(localHeight+1.65<=0||localHeight>=ceiling)return false;
   return barriers(floor).some(b=>localHeight+.18<(b.maxY??ceiling)&&localHeight+1.65>(b.minY??0)&&distanceToSegment([nx,nz],b.a,b.b)<.24);
  });
  if(!blocked){x=nx;y=h;z=nz;}
 }
 return [x,y,z];
}
export class WalkControls {
 private keys=new Set<string>(); private yaw=0;private pitch=0;private dragging=false;private lastX=0;private lastY=0;
 private abort=new AbortController();
 private touchMove:Point=[0,0];
 private paused=false;
 private camera:THREE.PerspectiveCamera;
 private geometry:(floor:FloorId)=>Barrier[];
 private dirty:()=>void;
 constructor(camera:THREE.PerspectiveCamera,canvas:HTMLCanvasElement,geometry:(floor:FloorId)=>Barrier[],dirty:()=>void){
  this.camera=camera;this.geometry=geometry;this.dirty=dirty;
  const opts={signal:this.abort.signal};
  window.addEventListener('keydown',e=>{if(this.paused)return;if(e.target instanceof HTMLElement && e.target.closest('input,select,textarea,button,a,[contenteditable=true],[role=dialog],dialog'))return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();this.keys.add(e.code);this.dirty();}},opts);
  window.addEventListener('keyup',e=>this.keys.delete(e.code),opts);
  window.addEventListener('blur',()=>this.resetInput(),opts);
  document.addEventListener('visibilitychange',()=>this.resetInput(),opts);
  canvas.addEventListener('pointerdown',e=>{if(this.paused||e.button!==0)return;this.dragging=true;this.lastX=e.clientX;this.lastY=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.focus();},opts);
  canvas.addEventListener('pointermove',e=>{if(!this.dragging)return;this.yaw-=(e.clientX-this.lastX)*.003;this.pitch=THREE.MathUtils.clamp(this.pitch-(e.clientY-this.lastY)*.003,-1.35,1.35);this.lastX=e.clientX;this.lastY=e.clientY;this.orient();this.dirty();},opts);
  canvas.addEventListener('pointerup',()=>{this.dragging=false;},opts);
  canvas.addEventListener('pointercancel',()=>{this.dragging=false;},opts);
 }
 private orient(){this.camera.rotation.set(this.pitch,this.yaw,0,'YXZ');}
 resetInput(){this.keys.clear();this.touchMove=[0,0];this.dragging=false;}
 setPose(point:Point,yaw=0,floor:FloorId='G',height=FLOOR_HEIGHT[floor]){this.camera.position.set(point[0],height+1.65,point[1]);this.yaw=yaw;this.pitch=0;this.orient();this.resetInput();this.dirty();}
 setPaused(paused:boolean){this.paused=paused;this.resetInput();}
 setMove(x:number,z:number){if(this.paused)return;this.touchMove=[x,z];this.dirty();}
 update(dt:number){
  if(this.paused)return false;
  let x=Number(this.keys.has('KeyD')||this.keys.has('ArrowRight'))-Number(this.keys.has('KeyA')||this.keys.has('ArrowLeft'))+this.touchMove[0];
  let z=Number(this.keys.has('KeyS')||this.keys.has('ArrowDown'))-Number(this.keys.has('KeyW')||this.keys.has('ArrowUp'))+this.touchMove[1];
  if(!x&&!z)return false;
  const len=Math.max(1,Math.hypot(x,z));x=x/len*dt*2.8;z=z/len*dt*2.8;
  const delta:Point=[Math.cos(this.yaw)*x+Math.sin(this.yaw)*z,-Math.sin(this.yaw)*x+Math.cos(this.yaw)*z];
  const next=walkStep3([this.camera.position.x,this.camera.position.y-1.65,this.camera.position.z],delta,this.geometry);
  this.camera.position.set(next[0],next[1]+1.65,next[2]);return true;
 }
 dispose(){this.abort.abort();this.resetInput();}
}

import * as THREE from 'three';
import { buildInteriorFloor } from './model';
import { FLOOR_ORDER, floorAtHeight } from './circulation';
import { ENTRY, plan, FLOOR_HEIGHT, type FloorId } from './layout';
import { WalkControls } from './walk';

export function createIribeScene(host:HTMLDivElement,onLocation:(x:number,z:number,floor:FloorId)=>void) {
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 renderer.domElement.tabIndex=0;renderer.domElement.style.cssText='width:100%;height:100%;display:block;touch-action:none;outline:none';renderer.domElement.setAttribute('aria-label','Iribe interior. Drag to look; W A S D or arrow keys to walk.');host.append(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xc5d5d9);scene.fog=new THREE.Fog(0xc5d5d9,65,150);
 const camera=new THREE.PerspectiveCamera(68,1,.08,180);
 scene.add(new THREE.HemisphereLight(0xe7f3ff,0x918578,2));
 const sun=new THREE.DirectionalLight(0xffecd5,2.3);sun.position.set(25,40,-18);scene.add(sun);
 const fill=new THREE.DirectionalLight(0xffffff,.7);fill.position.set(-30,10,30);scene.add(fill);
 const models=new Map(FLOOR_ORDER.map(f=>{const m=buildInteriorFloor(f);m.group.position.y=FLOOR_HEIGHT[f];scene.add(m.group);return [f,m] as const;}));
 let activeFloor:FloorId='G';
 const showFloor=(f:FloorId)=>{activeFloor=f;const index=FLOOR_ORDER.indexOf(f);models.forEach((m,id)=>{m.group.visible=Math.abs(FLOOR_ORDER.indexOf(id)-index)<=1;});};showFloor('G');
 let dirty=true,disposed=false,frame=0,last=performance.now(),reportAt=0;
 const controls=new WalkControls(camera,renderer.domElement,floor=>models.get(floor)!.barriers,()=>{dirty=true;});controls.setPose(ENTRY,Math.PI/2);
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();dirty=true;};
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 const render=(now:number)=>{if(disposed)return;frame=requestAnimationFrame(render);if(document.hidden){last=now;return;}const dt=Math.min(.05,(now-last)/1000);last=now;if(controls.update(dt)){dirty=true;const floor=floorAtHeight(camera.position.y-1.65);if(floor!==activeFloor)showFloor(floor);}if(dirty){renderer.render(scene,camera);dirty=false;if(now-reportAt>150){onLocation(camera.position.x,camera.position.z,activeFloor);reportAt=now;}}};frame=requestAnimationFrame(render);
 return {
  setFloor(floor:FloorId){showFloor(floor);controls.setPose(floor==='G'?ENTRY:plan(650,1040),floor==='G'?Math.PI/2:0,floor);dirty=true;},
  setMove:(x:number,z:number)=>controls.setMove(x,z),
  reset(){controls.setPose(ENTRY,Math.PI/2);},
  dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();models.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();},
 };
}

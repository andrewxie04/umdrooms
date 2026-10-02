import { WEST_STAIR } from './west-stair-layout';
import { communicatingStairForFloor } from './communicating-layout';
import { loadSurroundings } from './surroundings';
import { amphitheaterHeight } from './amphitheater';
import { ATRIUM_CENTER } from './layout';
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { roomArrival } from './arrival';
import { buildInteriorFloor } from './model';
import { FLOOR_ORDER, floorAtPosition, stairEntry } from './circulation';
import { ENTRY, FIFTH_NORTH_OFFICE_ENTRY, plan, FLOOR_HEIGHT, ROOMS, type FloorId } from './layout';
import { WalkControls } from './walk';

export function createIribeScene(host:HTMLDivElement,onLocation:(x:number,z:number,floor:FloorId)=>void,onSurroundings?:(status:'ready'|'unavailable')=>void) {
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 renderer.domElement.tabIndex=0;renderer.domElement.style.cssText='width:100%;height:100%;display:block;touch-action:none;outline:none';renderer.domElement.setAttribute('aria-label','Iribe interior. Drag to look; W A S D or arrow keys to walk.');host.append(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xc5d5d9);scene.fog=new THREE.Fog(0xc5d5d9,150,550);
 const sky=new Sky();sky.scale.setScalar(10000);sky.frustumCulled=false;
 sky.material.uniforms.turbidity.value=3;sky.material.uniforms.rayleigh.value=1.5;sky.material.uniforms.sunPosition.value.set(25,40,-18);scene.add(sky);
 const camera=new THREE.PerspectiveCamera(68,1,.08,750);
 scene.add(new THREE.HemisphereLight(0xe7f3ff,0xc8c6c0,2));
 const sun=new THREE.DirectionalLight(0xffecd5,2.3);sun.position.set(25,40,-18);scene.add(sun);
 const fill=new THREE.DirectionalLight(0xffffff,.7);fill.position.set(-30,10,30);scene.add(fill);
 const models=new Map(FLOOR_ORDER.map(f=>{const m=buildInteriorFloor(f);m.group.position.y=FLOOR_HEIGHT[f];scene.add(m.group);return [f,m] as const;}));
 const atrium = ATRIUM_CENTER;
 const entranceYaw = Math.atan2(ENTRY[0]-atrium[0],ENTRY[1]-atrium[1]);
 let activeFloor:FloorId='G';
 const showFloor=(f:FloorId)=>{activeFloor=f;const index=FLOOR_ORDER.indexOf(f);models.forEach((m,id)=>{m.setDetailsVisible(Math.abs(FLOOR_ORDER.indexOf(id)-index)<=1);});};showFloor('G');
 let dirty=true,reportPending=true,disposed=false,frame=0,last=performance.now(),reportAt=0;
 const contextAbort=new AbortController();let surroundings:Awaited<ReturnType<typeof loadSurroundings>>|null=null;
 void loadSurroundings(contextAbort.signal).then(context=>{if(disposed){context.dispose();return;}surroundings=context;scene.add(context.group);dirty=true;onSurroundings?.('ready');}).catch(()=>{if(!disposed)onSurroundings?.('unavailable');});
 const controls=new WalkControls(camera,renderer.domElement,floor=>models.get(floor)!.barriers,()=>{dirty=true;});controls.setPose(ENTRY,entranceYaw,'G',amphitheaterHeight(ENTRY)??0);
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();dirty=true;};
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 const render=(now:number)=>{if(disposed)return;frame=requestAnimationFrame(render);if(document.hidden){last=now;return;}const dt=Math.min(.05,(now-last)/1000);last=now;if(controls.update(dt)){dirty=true;const floor=floorAtPosition([camera.position.x,camera.position.y-1.65,camera.position.z]);if(floor!==activeFloor)showFloor(floor);}if(dirty){renderer.render(scene,camera);dirty=false;reportPending=true;}if(reportPending&&now-reportAt>150){onLocation(camera.position.x,camera.position.z,activeFloor);reportAt=now;reportPending=false;}};frame=requestAnimationFrame(render);
 return {
  setFloor(floor:FloorId){showFloor(floor);const entry=stairEntry(floor);controls.setPose(floor==='G'?ENTRY:floor==='R'?plan(578,915):[entry[0]-1.1,entry[1]+1.2],floor==='G'?entranceYaw:floor==='R'?0:Math.PI,floor,floor==='G'?(amphitheaterHeight(ENTRY)??0):FLOOR_HEIGHT[floor]);dirty=true;},
  visitRoom(floor:FloorId,id:string){
   const room=ROOMS.find(r=>r.floor===floor&&r.id===id);if(!room)return false;
   const arrival=roomArrival(room,models.get(floor)!.barriers);if(!arrival)return false;
   showFloor(floor);controls.setPose(arrival.point,arrival.yaw,floor,arrival.height,room.arrivalPitch??0);dirty=true;return true;
  },
  visitStair(){
   const stair=communicatingStairForFloor(activeFloor);if(!stair)return;
   const point=activeFloor===stair.lower?stair.entry:stair.exit,target=activeFloor===stair.lower?stair.path[0]:stair.path.at(-1)!;
   controls.setPose(point,Math.atan2(point[0]-target[0],point[1]-target[1]),activeFloor);dirty=true;
  },
  visitNorthOffices(){
   if(activeFloor!=='5')return;
   const p=FIFTH_NORTH_OFFICE_ENTRY,target=plan(624,605);
   controls.setPose(p,Math.atan2(p[0]-target[0],p[1]-target[1]),'5');dirty=true;
  },
  visitWestStair(){
   const s=WEST_STAIR;if(activeFloor!==s.lower&&activeFloor!==s.upper)return;
   controls.setPose(s.entry,Math.atan2(s.entry[0]-s.door[0],s.entry[1]-s.door[1]),activeFloor);dirty=true;
  },
  setPaused:(paused:boolean)=>controls.setPaused(paused),
  setMove:(x:number,z:number)=>controls.setMove(x,z),
  reset(){showFloor('G');controls.setPose(ENTRY,entranceYaw,'G',amphitheaterHeight(ENTRY)??0);dirty=true;},
  dispose(){disposed=true;contextAbort.abort();surroundings?.dispose();cancelAnimationFrame(frame);observer.disconnect();controls.dispose();models.forEach(m=>m.dispose());sky.geometry.dispose();sky.material.dispose();renderer.dispose();renderer.domElement.remove();},
 };
}

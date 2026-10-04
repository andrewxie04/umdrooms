import { NORTH_STAIR_FRAME } from './north-stair-source-layout';
import { SOUTH_STAIR_GROUND_APPROACH, SOUTH_STAIR_FIRST_INNER, SOUTH_STAIR_RUNS } from './lobby-south-stair-layout';
import { CANOPY_APPROACH, CANOPY_VIEW_TARGET } from './lobby-canopy-layout';
import { SOUTH_APPROACH, SOUTH_VIEW_TARGET } from './lobby-south-layout';
import { groundGuidePlan } from './ground-guide-layout';
import { loadDaylight } from './daylight';
import { COURTYARD_APPROACH, COURTYARD_VIEW_TARGET } from './lobby-entrance-layout';
import { westStairForFloor } from './west-stair-layout';
import { communicatingStairForFloor } from './communicating-layout';
import { loadSurroundings } from './surroundings';
import { amphitheaterHeight } from './amphitheater';
import { ANTONOV_AISLE_ROUTES, ROW_RISE, antonovWayfinding } from './auditorium';
import { ANTONOV_EXTERIOR_PIECES, ANTONOV_EXTERIOR_ROUTE } from './antonov-exterior-layout';
import { ATRIUM_CENTER } from './layout';
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { roomArrival } from './arrival';
import { buildInteriorFloor, type InteriorModel } from './model';
import { FLOOR_ORDER, floorAtPosition, stairEntry, ATRIUM_FLIGHTS, ATRIUM_LANDING } from './circulation';
import { ENTRY, FIRST_WEST_OFFICE_ENTRY, firstWestPlan, FIFTH_NORTH_OFFICE_ENTRY, plan, FLOOR_HEIGHT, ROOMS, type FloorId } from './layout';
import { WalkControls } from './walk';
import { LiftController, type LiftPhase } from './lift-controller';
import { insideLift, liftLanding, nearbyLift, liftDoorwayOccupied, type LiftCar } from './lift-layout';

export interface LiftUIState {floor:FloorId;car:LiftCar;inside:boolean;doorway:boolean;phase:LiftPhase;destination:FloorId|null;riding:boolean;}

export function createIribeScene(host:HTMLDivElement,onLocation:(x:number,z:number,floor:FloorId)=>void,onSurroundings?:(status:'ready'|'unavailable')=>void,onStartup?:(progress:number|null)=>void,onStartupError?:(message:string)=>void,onLift?:(state:LiftUIState|null)=>void) {
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
 renderer.domElement.tabIndex=0;renderer.domElement.style.cssText='width:100%;height:100%;display:block;touch-action:none;outline:none';renderer.domElement.setAttribute('aria-label','Iribe interior. Drag to look; W A S D or arrow keys to walk.');host.append(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xc5d5d9);scene.fog=new THREE.Fog(0xc5d5d9,150,550);
 // Photographed daylight supplies rough reflections and ambient color without
 // screen-space reflection passes; the studio environment is a load fallback.
 let environmentTarget:THREE.WebGLRenderTarget|undefined,daylight:Awaited<ReturnType<typeof loadDaylight>>|undefined;scene.environmentIntensity=.4;
 const sky=new Sky();sky.scale.setScalar(10000);sky.frustumCulled=false;
 sky.material.uniforms.turbidity.value=3;sky.material.uniforms.rayleigh.value=1.5;sky.material.uniforms.sunPosition.value.set(25,40,-18);scene.add(sky);
 const camera=new THREE.PerspectiveCamera(68,1,.08,750);
 scene.add(new THREE.HemisphereLight(0xeaf2f8,0x817b72,.45));
 const sun=new THREE.DirectionalLight(0xfff5e7,1.75);sun.position.set(50,75,-35);sun.castShadow=true;
 Object.assign(sun.shadow.camera,{left:-65,right:65,top:65,bottom:-65,near:1,far:180});sun.shadow.camera.updateProjectionMatrix();
 sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.00008;sun.shadow.normalBias=.035;scene.add(sun);
 // Two broad sources approximate the combined pendant/downlight illumination.
 // Warm fill adds softness; exact fixture output is not publicly documented.
 for(const [x,z] of [[270,335],[340,335]]){
  const p=groundGuidePlan(x,z),light=new THREE.RectAreaLight(0xffefe2,.85,8,9);
  light.position.set(p[0],6.05,p[1]);light.lookAt(p[0],0,p[1]);scene.add(light);
 }
 // A broad upward fill approximates reflected floor light on the photographed
 // pale ceiling. It avoids adding a shadow pass for every pendant fixture.
 const bouncePoint=groundGuidePlan(299,346),ceilingBounce=new THREE.RectAreaLight(0xf5ede1,.9,16,15);
 ceilingBounce.position.set(bouncePoint[0],.25,bouncePoint[1]);ceilingBounce.lookAt(bouncePoint[0],6.25,bouncePoint[1]);scene.add(ceilingBounce);
 // The HDR stair photograph shows a bright white guard against the black
 // exposed ceiling. Aggregate the suspended fixtures over the actual atrium
 // into soft sources; their output remains estimated. Neither casts shadows.
 const atriumFill=new THREE.RectAreaLight(0xfff3e7,1.4,11,12);
 atriumFill.position.set(ATRIUM_CENTER[0],10.25,ATRIUM_CENTER[1]);
 atriumFill.lookAt(ATRIUM_CENTER[0],0,ATRIUM_CENTER[1]);scene.add(atriumFill);
 const atriumBounce=new THREE.RectAreaLight(0xf4eee5,.55,10,11);
 atriumBounce.position.set(ATRIUM_CENTER[0],.3,ATRIUM_CENTER[1]);
 atriumBounce.lookAt(ATRIUM_CENTER[0],9,ATRIUM_CENTER[1]);scene.add(atriumBounce);
 // Aggregate the auditorium's photographed ceiling fixtures into two broad
 // sources. Fixture wattage is unknown; no additional shadow passes are used.
 for(const [x,height] of [[1318,9.4],[1438,9.4]]){
  const p=antonovWayfinding(x,274),light=new THREE.RectAreaLight(0xffe8cf,1.5,18,6);
  light.position.set(p[0],height,p[1]);light.lookAt(p[0],0,p[1]);scene.add(light);
 }
 const models=new Map<FloorId,InteriorModel>();
 const atrium = ATRIUM_CENTER;
 const entranceYaw = Math.atan2(ENTRY[0]-atrium[0],ENTRY[1]-atrium[1]);
 let activeFloor:FloorId='G';
 const showFloor=(f:FloorId)=>{activeFloor=f;const index=FLOOR_ORDER.indexOf(f);models.forEach((m,id)=>{m.setDetailsVisible(Math.abs(FLOOR_ORDER.indexOf(id)-index)<=1);});renderer.shadowMap.needsUpdate=true;};showFloor('G');
 let dirty=true,reportPending=true,disposed=false,ready=false,paused=false,startupReported=false,frame=0,last=performance.now(),reportAt=0;
 let startupFrame=0,startupTimer:number|undefined,resumeStartup:(()=>void)|undefined;
 const contextAbort=new AbortController();let surroundings:Awaited<ReturnType<typeof loadSurroundings>>|null=null;
 void loadSurroundings(contextAbort.signal).then(context=>{if(disposed){context.dispose();return;}surroundings=context;scene.add(context.group);renderer.shadowMap.needsUpdate=true;dirty=true;onSurroundings?.('ready');}).catch(()=>{if(!disposed)onSurroundings?.('unavailable');});
 const controls=new WalkControls(camera,renderer.domElement,floor=>models.get(floor)?.barriers??[],()=>{dirty=true;});controls.setPose(ENTRY,entranceYaw,'G',amphitheaterHeight(ENTRY)??0);controls.setPaused(true);
 const liftController=new LiftController();let riding=false,liftReportKey='';
 let ridePose={along:0,depth:.5,yaw:0};
 const syncLiftDoors=()=>models.forEach((model,floor)=>{for(const car of [0,1] as const)model.lift?.setDoorProgress(car,liftController.doorProgress(floor,car));});
 const cancelRide=()=>{liftController.reset();riding=false;syncLiftDoors();controls.setPaused(paused||!ready);dirty=true;};
 const reportLift=()=>{
  const p=[camera.position.x,camera.position.z] as const,cab=nearbyLift(activeFloor,p),trip=liftController.trip;
  const state:LiftUIState|null=cab?{floor:activeFloor,car:cab.car,inside:insideLift(activeFloor,p)?.car===cab.car,doorway:liftDoorwayOccupied(cab,p),phase:trip.floor===activeFloor&&trip.car===cab.car?trip.phase:'closed',destination:riding?trip.destination:null,riding}:null;
  const key=JSON.stringify(state);if(key!==liftReportKey){liftReportKey=key;onLift?.(state);}
 };
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();dirty=true;};
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 const render=(now:number)=>{
  if(disposed)return;frame=requestAnimationFrame(render);if(document.hidden||!ready){last=now;return;}
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(controls.update(dt)){dirty=true;const floor=floorAtPosition([camera.position.x,camera.position.y-1.65,camera.position.z]);if(floor!==activeFloor)showFloor(floor);}
  if(!paused){
   const result=liftController.update(dt);
   if(result.changed){syncLiftDoors();dirty=true;}
   if(result.arrival){
    const {floor,car}=result.arrival,cab=liftLanding(floor)!.cabs[car],p=cab.at(ridePose.along*cab.width,ridePose.depth*cab.depth);
    showFloor(floor);controls.setPose(p,Math.atan2(-cab.outward[0],-cab.outward[1])+ridePose.yaw,floor);controls.setPaused(true);
   }
   if(riding&&liftController.trip.phase==='open'){riding=false;controls.setPaused(paused);renderer.shadowMap.needsUpdate=true;dirty=true;}
  }
  if(dirty){reportLift();renderer.render(scene,camera);dirty=false;reportPending=true;if(!startupReported){startupReported=true;onStartup?.(null);}}
  if(reportPending&&now-reportAt>150){onLocation(camera.position.x,camera.position.z,activeFloor);reportAt=now;reportPending=false;}
 };frame=requestAnimationFrame(render);
 const yieldToBrowser=()=>new Promise<void>(resolve=>{
  const finish=()=>{cancelAnimationFrame(startupFrame);startupFrame=0;clearTimeout(startupTimer);startupTimer=undefined;resumeStartup=undefined;resolve();};
  resumeStartup=finish;startupTimer=window.setTimeout(finish,48);
  startupFrame=requestAnimationFrame(()=>{startupFrame=requestAnimationFrame(finish);});
 });
 // Give React a paint before expensive geometry, then yield between floors.
 // Cancellation also prevents StrictMode's discarded mount from building twice.
 void (async()=>{
  await yieldToBrowser();
  if(disposed)return;
  try{
   daylight=await loadDaylight(renderer,contextAbort.signal);
   if(disposed){daylight.dispose();daylight=undefined;return;}
   scene.background=daylight.background;scene.backgroundIntensity=.85;
   scene.backgroundRotation.y=daylight.rotation;scene.environmentRotation.y=daylight.rotation;
   scene.environment=daylight.environment;sun.position.copy(daylight.sunDirection).multiplyScalar(95);
   sky.visible=false;
  }catch{
   if(disposed)return;
   const environment=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);
   try{environmentTarget=pmrem.fromScene(environment,.04);scene.environment=environmentTarget.texture;}
   finally{environment.dispose();pmrem.dispose();}
  }
  RectAreaLightUniformsLib.init();await yieldToBrowser();
  for(let i=0;i<FLOOR_ORDER.length;i++){
   if(disposed)return;
   const floor=FLOOR_ORDER[i],model=buildInteriorFloor(floor);
   model.group.position.y=FLOOR_HEIGHT[floor];models.set(floor,model);scene.add(model.group);
   onStartup?.((i+1)/FLOOR_ORDER.length);await yieldToBrowser();
  }
  if(disposed)return;
  showFloor('G');await renderer.compileAsync(scene,camera);
  if(disposed)return;
  ready=true;controls.setPaused(paused);last=performance.now();dirty=true;
  // A first draw also completes startup when an embedded browser throttles RAF.
  renderer.render(scene,camera);dirty=false;startupReported=true;onLocation(camera.position.x,camera.position.z,activeFloor);reportLift();onStartup?.(null);
 })().catch(error=>{if(!disposed){ready=false;controls.setPaused(true);onStartupError?.(error instanceof Error?error.message:'Unable to prepare the interior.');}});
 return {
  setFloor(floor:FloorId){if(!ready)return;cancelRide();showFloor(floor);const entry=stairEntry(floor);controls.setPose(floor==='G'?ENTRY:floor==='R'?plan(578,915):entry,floor==='G'?entranceYaw:floor==='R'?0:Math.atan2(NORTH_STAIR_FRAME.u[0],NORTH_STAIR_FRAME.u[1]),floor,floor==='G'?(amphitheaterHeight(ENTRY)??0):FLOOR_HEIGHT[floor]);dirty=true;},
  visitRoom(floor:FloorId,id:string){
   if(!ready)return false;
   const room=ROOMS.find(r=>r.floor===floor&&r.id===id);if(!room)return false;
   const arrival=roomArrival(room,models.get(floor)!.barriers);if(!arrival)return false;
   cancelRide();showFloor(floor);controls.setPose(arrival.point,arrival.yaw,floor,arrival.height,room.arrivalPitch??0);dirty=true;return true;
  },
 visitStair(){
   if(!ready)return;
   const stair=communicatingStairForFloor(activeFloor);if(!stair)return;
   cancelRide();
   const point=activeFloor===stair.lower?stair.entry:stair.exit,target=activeFloor===stair.lower?stair.path[0]:stair.path.at(-1)!;
   controls.setPose(point,Math.atan2(point[0]-target[0],point[1]-target[1]),activeFloor);dirty=true;
  },
  visitAtriumStair(){
   if(!ready||(activeFloor!=='G'&&activeFloor!=='1'))return;
   cancelRide();
   const first=ATRIUM_FLIGHTS[0],length=Math.hypot(first.to[0]-first.from[0],first.to[2]-first.from[2]);
   const point:readonly [number,number]=activeFloor==='G'?[first.from[0]-(first.to[0]-first.from[0])/length*1.3,first.from[2]-(first.to[2]-first.from[2])/length*1.3]:[ATRIUM_LANDING.to[0],ATRIUM_LANDING.to[2]];
   const target=activeFloor==='G'?first.from:ATRIUM_LANDING.from;
   controls.setPose(point,Math.atan2(point[0]-target[0],point[1]-target[2]),activeFloor,FLOOR_HEIGHT[activeFloor],activeFloor==='1'?-.28:0);dirty=true;
  },
  visitCanopyEntrance(){
   if(!ready)return;
   cancelRide();showFloor('G');
   const point=CANOPY_APPROACH,target=CANOPY_VIEW_TARGET;
   controls.setPose(point,Math.atan2(point[0]-target[0],point[1]-target[1]),'G',amphitheaterHeight(point)??0);dirty=true;
  },
  visitSouthEntrance(){
   if(!ready)return;
   cancelRide();showFloor('G');
   const point=SOUTH_APPROACH,target=SOUTH_VIEW_TARGET;
   controls.setPose(point,Math.atan2(point[0]-target[0],point[1]-target[1]),'G');dirty=true;
  },
  visitSouthStair(){
   if(!ready||(activeFloor!=='G'&&activeFloor!=='1'))return;
   cancelRide();
   const point=activeFloor==='G'?SOUTH_STAIR_GROUND_APPROACH:SOUTH_STAIR_FIRST_INNER;
   const target=activeFloor==='G'?SOUTH_STAIR_RUNS[0].from:SOUTH_STAIR_RUNS[2].to;
   controls.setPose(point,Math.atan2(point[0]-target[0],point[1]-target[2]),activeFloor,FLOOR_HEIGHT[activeFloor],activeFloor==='1'?-.28:.08);dirty=true;
  },
  visitCourtyardEntrance(){
   if(!ready)return;
   cancelRide();showFloor('G');
   const point=COURTYARD_APPROACH,target=COURTYARD_VIEW_TARGET;
   controls.setPose(point,Math.atan2(point[0]-target[0],point[1]-target[1]),'G');dirty=true;
  },
  visitWestOffices(){
   if(!ready||activeFloor!=='1')return;
   cancelRide();
   const p=FIRST_WEST_OFFICE_ENTRY,target=firstWestPlan(760,555);
   controls.setPose(p,Math.atan2(p[0]-target[0],p[1]-target[1]),'1');dirty=true;
  },
  visitNorthOffices(){
   if(!ready||activeFloor!=='5')return;
   cancelRide();
   const p=FIFTH_NORTH_OFFICE_ENTRY,target=plan(624,605);
   controls.setPose(p,Math.atan2(p[0]-target[0],p[1]-target[1]),'5');dirty=true;
  },
  visitAntonovRear(){
   if(!ready)return;
   cancelRide();
   const p=ANTONOV_AISLE_ROUTES[1].end,target=ANTONOV_AISLE_ROUTES[1].start;
   showFloor('G');controls.setPose(p,Math.atan2(p[0]-target[0],p[1]-target[1]),'G',10*ROW_RISE,-.18);dirty=true;
  },
  visitAntonovExterior(){
   if(!ready)return;
   cancelRide();
   const [x,y,z]=ANTONOV_EXTERIOR_ROUTE[0],first=ANTONOV_EXTERIOR_PIECES[1],target=first.to;
   const tx=(target[0][0]+target[1][0])/2,tz=(target[0][1]+target[1][1])/2;
   showFloor('G');controls.setPose([x,z],Math.atan2(x-tx,z-tz),'G',y,.08);dirty=true;
  },
  visitWestStair(){
   const s=westStairForFloor(activeFloor);if(!ready||!s)return;
   cancelRide();
   const ascending=activeFloor===s.lower,point=ascending?s.at(s.width*.75,s.doorZ):s.landing;
   const target=ascending?s.flights[0].to:s.flights.at(-1)!.from;
   controls.setPose(point,Math.atan2(point[0]-target[0],point[1]-target[2]),activeFloor,FLOOR_HEIGHT[activeFloor],ascending?0:-.35);dirty=true;
  },
  visitLift(){
   const landing=liftLanding(activeFloor);if(!ready||!landing)return;
   cancelRide();const cab=landing.cabs[0],p=cab.at(0,-1.1);
   controls.setPose(p,Math.atan2(cab.outward[0],cab.outward[1]),activeFloor);dirty=true;
  },
  callLift(){
   if(!ready||paused||riding)return false;
   const cab=nearbyLift(activeFloor,[camera.position.x,camera.position.z]);if(!cab)return false;
   const ok=liftController.call(activeFloor,cab.car);if(ok){syncLiftDoors();dirty=true;}return ok;
  },
  rideLift(destination:FloorId){
   if(!ready||paused||riding)return false;
   const point=[camera.position.x,camera.position.z] as const,cab=insideLift(activeFloor,point),trip=liftController.trip;
   if(!cab||cab.car!==trip.car||activeFloor!==trip.floor||liftDoorwayOccupied(cab,point))return false;
   if(!liftController.travel(destination,true))return false;
   const dx=point[0]-cab.door[0],dz=point[1]-cab.door[1];
   ridePose={along:(dx*cab.u[0]+dz*cab.u[1])/cab.width,depth:Math.max(.35,(-dx*cab.outward[0]-dz*cab.outward[1])/cab.depth),yaw:camera.rotation.y-Math.atan2(-cab.outward[0],-cab.outward[1])};
   riding=true;controls.setPaused(true);dirty=true;return true;
  },
  setPaused:(value:boolean)=>{paused=value;controls.setPaused(value||riding||!ready);dirty=true;},
  setMove:(x:number,z:number)=>controls.setMove(x,z),
  reset(){if(!ready)return;cancelRide();showFloor('G');controls.setPose(ENTRY,entranceYaw,'G',amphitheaterHeight(ENTRY)??0);dirty=true;},
  dispose(){disposed=true;ready=false;contextAbort.abort();surroundings?.dispose();cancelAnimationFrame(frame);cancelAnimationFrame(startupFrame);clearTimeout(startupTimer);resumeStartup?.();resumeStartup=undefined;observer.disconnect();controls.dispose();models.forEach(m=>m.dispose());sky.geometry.dispose();sky.material.dispose();daylight?.dispose();environmentTarget?.dispose();sun.shadow.map?.dispose();renderer.dispose();renderer.domElement.remove();},
 };
}

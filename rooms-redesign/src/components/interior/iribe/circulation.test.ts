import { ANTONOV_SHELL_EDGES } from './antonov-shell-layout';
import { NORTH_STAIR_FRAME, northStairDoor } from './north-stair-source-layout';
import { SOUTH_STAIR_ROUTE, SOUTH_STAIR_RUNS, SOUTH_STAIR_LANDINGS, SOUTH_STAIR_GROUND_APPROACH, SOUTH_STAIR_FIRST_APPROACH, SOUTH_STAIR_FIRST_INNER, SOUTH_STAIR_FIRST_DOOR, SOUTH_STAIR_OPENING, SOUTH_STAIR_TOP_SUPPORT } from './lobby-south-stair-layout';
import { firstWestOfficeDesk } from './first-west-offices';
import { LIFT_FLOORS, liftLanding, insideLift } from './lift-layout';
import { ANTONOV_EXTERIOR_PIECES, ANTONOV_EXTERIOR_ROUTE, ANTONOV_EXTERIOR_TOP, antonovExteriorHeight } from './antonov-exterior-layout';
import { antonovCeilingHeight } from './auditorium-details';
import { firstWestMeetingCounter, firstWestMeetingFurniture } from './first-west-meetings';
import { imdLabLayout } from './imd-lab';
import { westSupportCounter } from './west-support';
import { WEST_HUDDLE_ROOMS } from './layout';
import { westHuddleFurniture } from './west-huddles';
import { FIFTH_SHARED_OFFICES } from './layout';
import { FIFTH_MIDDLE_OFFICES } from './layout';
import { FIFTH_SERVICE_SHAFT, FIFTH_SERVICE_ROOMS } from './layout';
import { FIFTH_PERIMETER_OFFICES, FIFTH_NORTH_OFFICE_ENTRY, FIFTH_NORTH_SUPPORT_ROOMS } from './layout';
import { WEST_LIFT, WEST_LIFT_FRONT } from './west-core';
import { FIRST_WEST_OFFICE_ENTRY, FIRST_WEST_MEETINGS, FIRST_WEST_OFFICES, WEST_SUPPORT_ROOMS } from './layout';
import { WEST_STAIR, WEST_STAIRS, WEST_STAIR_FLOORS, westStairForFloor } from './west-stair-layout';
import { buildWestStair } from './west-stairs';
import { seminarAVLayout, buildSeminarAV } from './seminar-av';
import { HATCHERY_COMMON, HATCHERY_ROOMS } from './layout';
import { HATCHERY_ITEMS, hatcheryItemFrame, hatcheryItemFootprint, buildHatchery } from './hatchery';
import { SANDBOX_COMMON, SANDBOX_STUDIOS, sandboxPlan, FIRST_RESTROOMS, SECOND_RESTROOMS } from './layout';
import { SANDBOX_STATIONS, sandboxStationFootprint, sandboxStationPoint } from './sandbox';
import { COMMUNICATING_STAIRS } from './communicating-layout';
import { FAMILY_BEDS,FAMILY_MAPLES } from './family-garden-layout';
import { FAMILY_GARDEN,FAMILY_GARDEN_DOOR,FAMILY_GARDEN_GUARD_EDGES,FAMILY_TERRACE,familyGardenPlan } from './layout';
import { amphitheaterHeight, AMPH_NORTH_AISLE } from './amphitheater';
import { AMPH_DEPTH, AMPH_DROP, AMPH_WIDTH, AMPH_V, amphPoint } from './layout';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildInteriorFloor, type InteriorModel } from './model';
import { plan, fourthPlan, westFourthPlan, footprintForFloor, roofPlan, ROOF_GALLERY, ROOF_PUBLIC_FOOTPRINT, type Point, type FloorId } from './layout';
import { ROOF_BEDS, ROOF_LAWN, ROOF_POOL, ROOF_DOORS, ROOF_FACADE, ROOF_FOYER, ROOF_OUTDOOR } from './roof-layout';
import { ATRIUM_LANDING, ATRIUM_FLIGHTS, ENCLOSED_FLIGHTS, flightHeight, stairEntry, FLOOR_ORDER, STAIR_CENTER, STAIR_HOLE, type Flight, type Position } from './circulation';
import { GANNON_FRONT_HEIGHT, gannonHeight, antonovDiagram, ANTONOV_BANDS, antonovWayfinding, antonovWayfindingCoordinates, antonovRowPlane, ANTONOV_AISLE_ROUTES, auditoriumSeats, antonovHeight } from './auditorium';
import { GANNON_AISLE_ROUTES, GANNON_CHAIRS, GANNON_TABLES } from './gannon-seating-layout';
import { GANNON_PAIR_THRESHOLDS, GANNON_DOOR_LEAVES, GANNON_STEP_EDGE } from './gannon-ground-layout';
import { walkStep3 } from './walk';
import { roomArrival } from './arrival';
import { labFrame, buildSmallArtifacts, DRONE_CAGE, DRONE_CAGE_AREA, DRONE_CAGE_HEIGHT, DRONE_CAGE_WIDTH, DRONE_CAGE_DEPTH, DRONE_CAMERAS, DRONE_GATE } from './labs';
import * as THREE from 'three';
import { buildRoboticsLab, ROBOT_STATIONS } from './robotics';
import { buildLobbySeating } from './lobby';
import { LOBBY_CHAIRS, LOBBY_SOFAS, LOBBY_TABLES } from './lobby-layout';
import { groundGuidePlan } from './ground-guide-layout';
import { COURTYARD_APRON, COURTYARD_APPROACH, COURTYARD_DOOR_ROWS, COURTYARD_LEAVES, COURTYARD_SIDE_FACES, courtyardOffset } from './lobby-entrance-layout';
import { supportHeight } from './circulation';
import { CANOPY_APRON, CANOPY_APPROACH, CANOPY_GLAZING, CANOPY_LEAVES, canopyOffset, canopyPairCenter } from './lobby-canopy-layout';
import { CANOPY_COLUMNS, CANOPY_SOFFIT_OUTLINE, CANOPY_SOFFIT_HEIGHT, CANOPY_PAVING_LIMIT, canopyColumnSection } from './canopy-structure-layout';
import { CANOPY_BENCHES, CANOPY_BENCH_HEIGHT, canopyBenchSlats } from './canopy-bench-layout';
import { SOUTH_APRON, SOUTH_APPROACH, SOUTH_GLAZING, SOUTH_LEAVES, SOUTH_STAIR_LEAVES, SOUTH_SOLIDS, southOffset, southPairCenter } from './lobby-south-layout';
import { NORTH_CORNER_GLAZING } from './ground-north-corner-layout';
import { structuralColumnLayout } from './structure';
import { FIRST_COLUMN_TRACE } from './first-column-trace';
import { firstGuidePlan } from './first-guide-layout';
import { FIRST_WEST_FACADE } from './first-facade-layout';
import { SECOND_COLUMN_TRACE } from './second-column-trace';
import { secondGuidePlan } from './second-guide-layout';
import { SECOND_SOURCE_FOOTPRINT, SECOND_WEST_FACADE } from './second-facade-layout';
import { FOURTH_COLUMN_TRACE } from './fourth-column-trace';
import { fourthGuidePlan } from './fourth-guide-layout';
import { FOURTH_SOURCE_FOOTPRINT } from './fourth-facade-layout';
import { FOURTH_LOUNGE_TABLE, FOURTH_LOUNGE_COUNTER, FOURTH_LOUNGE_ROUND_TABLES } from './fourth-lounge-layout';
import { buildRestroom, RESTROOM_PLANS, restroomFrame, restroomStalls } from './restrooms';
import { MEETING_CAPACITIES, meetingTable, meetingSeats, officeFurniture } from './furniture';
import { FIRST_CLASSROOM, FIRST_CLASSROOM_TABLES, SANDBOX_SUPPORT, FIRST_OFFICES, firstNorthPlan, ELEVATOR, firstCorePlan, secondCorePoint } from './layout';
import { supportCabinetFrame } from './support-rooms';
import { firstOfficeFrame, firstOfficeFurniture } from './first-offices';
import { ROOMS, FLOOR_HEIGHT, ANTONOV_FOOTPRINT, ENTRY, CAFE_LENGTH, cafePoint, groundPlan, pointInPolygon, distanceToSegment } from './layout';

const renderingErrors:string[]=[];
const models = new Map<FloorId, InteriorModel>();
beforeAll(() => {
 vi.spyOn(console,'error').mockImplementation((...args)=>renderingErrors.push(args.join(' '))); 
 vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, getContext: () => ({ fillRect() {}, fillText() {}, strokeRect() {} }) }) });
 for (const floor of FLOOR_ORDER) models.set(floor, buildInteriorFloor(floor));
});
afterAll(() => { models.forEach(model => model.dispose()); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
// Enter the first flight through its open bottom, rather than through a side guard.
function atriumStairApproach():Position {
 const {from,to}=ATRIUM_FLIGHTS[0],length=Math.hypot(to[0]-from[0],to[2]-from[2]);
 return [from[0]-(to[0]-from[0])/length*1.3,0,from[2]-(to[2]-from[2])/length*1.3];
}
function follow(flights: Flight[], reverse = false) {
 const segments=flights.flatMap(f=>f.route?f.route.slice(0,-1).map((from,i)=>({...f,from,to:f.route![i+1]})): [f]);
 const route = reverse ? [...segments].reverse().map(f => ({ ...f, from: f.to, to: f.from })) : segments;
 let position: Position = route[0].from;
 for (const flight of route) {
  const length = Math.hypot(flight.to[0] - flight.from[0], flight.to[2] - flight.from[2]);
  const count = Math.ceil(length / .04);
  for (let i = 0; i < count; i++) position = walkStep3(position, [(flight.to[0] - flight.from[0]) / count, (flight.to[2] - flight.from[2]) / count], floor => models.get(floor)!.barriers);
  expect(position[0],JSON.stringify({flight,position})).toBeCloseTo(flight.to[0], 1);
  expect(position[2]).toBeCloseTo(flight.to[2], 1);
  expect(position[1]).toBeCloseTo(flight.to[1], 1);
 }
}
describe('source south stair',()=>{
 const barriers=(f:FloorId)=>models.get(f)!.barriers;
 const level=(a:Point,end:Point,h:number):Flight=>({from:[a[0],h,a[1]],to:[end[0],h,end[1]],width:1,lower:'G',upper:'1'});
 it('ascends and descends all three connected flights and both turning landings',()=>{
  follow(SOUTH_STAIR_ROUTE);follow(SOUTH_STAIR_ROUTE,true);
 });
 it('walks continuously from the lobby-side stair door to Level 1 and back',()=>{
  const route=[
   level(groundGuidePlan(282,482),groundGuidePlan(282,493.7),0),
   level(groundGuidePlan(282,493.7),SOUTH_STAIR_GROUND_APPROACH,0),
   level(SOUTH_STAIR_GROUND_APPROACH,[SOUTH_STAIR_RUNS[0].from[0],SOUTH_STAIR_RUNS[0].from[2]],0),
   ...SOUTH_STAIR_ROUTE,SOUTH_STAIR_TOP_SUPPORT,
   level([SOUTH_STAIR_TOP_SUPPORT.to[0],SOUTH_STAIR_TOP_SUPPORT.to[2]],SOUTH_STAIR_FIRST_INNER,FLOOR_HEIGHT['1']),
   level(SOUTH_STAIR_FIRST_INNER,SOUTH_STAIR_FIRST_APPROACH,FLOOR_HEIGHT['1']),
  ];
  follow(route);follow(route,true);
 });
 it('has rendered support and standing headroom throughout the flights',()=>{
  models.forEach(model=>model.group.updateMatrixWorld(true));
  for(const [runIndex,run] of SOUTH_STAIR_RUNS.entries())for(let row=0;row<run.sections!.length-1;row++)for(const across of [.25,.5,.75]){
   const a=run.sections![row],b=run.sections![row+1],t=.45;
   const edgeA:Point=[a.a[0]+(b.a[0]-a.a[0])*t,a.a[1]+(b.a[1]-a.a[1])*t],edgeB:Point=[a.b[0]+(b.b[0]-a.b[0])*t,a.b[1]+(b.b[1]-a.b[1])*t];
   const p:Point=[edgeA[0]+(edgeB[0]-edgeA[0])*across,edgeA[1]+(edgeB[1]-edgeA[1])*across],h=a.height+(b.height-a.height)*t;
   expect(supportHeight(p,h),`support ${runIndex}/${row}/${across}`).toBeCloseTo(h,5);
   const down=new THREE.Raycaster(new THREE.Vector3(p[0],h+.4,p[1]),new THREE.Vector3(0,-1,0),0,.65);
   expect(down.intersectObject(models.get('G')!.group,true).length,`rendered tread ${runIndex}/${row}/${across}`).toBeGreaterThan(0);
   const hits=[...models.entries()].flatMap(([floor,model])=>new THREE.Raycaster(new THREE.Vector3(p[0],h-FLOOR_HEIGHT[floor]+.38,p[1]),new THREE.Vector3(0,1,0),0,1.5).intersectObject(model.group,true));
   expect(hits,`headroom ${runIndex}/${row}/${across}`).toHaveLength(0);
   expect(walkStep3([p[0],h,p[1]],[0,0],barriers)[1]).toBeCloseTo(h,5);
  }
 });
 it('closes the visible gap immediately above each preceding tread',()=>{
  const model=models.get('G')!;model.group.updateMatrixWorld(true);
  for(const run of SOUTH_STAIR_RUNS)for(let i=0;i<run.sections!.length-1;i++){
   const a=run.sections![i],end=run.sections![i+1],p:Point=[(a.a[0]+a.b[0])/2,(a.a[1]+a.b[1])/2],q:Point=[(end.a[0]+end.b[0])/2,(end.a[1]+end.b[1])/2],length=Math.hypot(q[0]-p[0],q[1]-p[1]),n:Point=[(q[0]-p[0])/length,(q[1]-p[1])/length];
   const ray=new THREE.Raycaster(new THREE.Vector3(p[0]-n[0]*.04,a.height+.008,p[1]-n[1]*.04),new THREE.Vector3(n[0],0,n[1]),0,.07);
   expect(ray.intersectObject(model.group,true).length,`open riser ${JSON.stringify({from:run.from,i})}`).toBeGreaterThan(0);
  }
 });
 it('walks across each tread without height changing sideways',()=>{
  for(const run of SOUTH_STAIR_RUNS)for(let row=0;row<run.sections!.length-1;row++){
   const a=run.sections![row],b=run.sections![row+1],start:Point=[(a.a[0]+b.a[0])/2,(a.a[1]+b.a[1])/2],end:Point=[(a.b[0]+b.b[0])/2,(a.b[1]+b.b[1])/2],h=(a.height+b.height)/2;
   const p:Point=[start[0]+(end[0]-start[0])*.3,start[1]+(end[1]-start[1])*.3];let position:Position=[p[0],h,p[1]];
   for(let i=0;i<10;i++)position=walkStep3(position,[(end[0]-start[0])*.04,(end[1]-start[1])*.04],barriers);
   expect(position[1]).toBeCloseTo(h,5);expect(position[0]).toBeCloseTo(start[0]+(end[0]-start[0])*.7,3);expect(position[2]).toBeCloseTo(start[1]+(end[1]-start[1])*.7,3);
  }
 });
 it('renders and blocks both guards on every stair flight',()=>{
  const model=models.get('G')!;model.group.updateMatrixWorld(true);
  for(const run of SOUTH_STAIR_RUNS){
   const a=run.sections![4],b=run.sections![5],h=(a.height+b.height)/2,mid:Point=[(a.a[0]+a.b[0]+b.a[0]+b.b[0])/4,(a.a[1]+a.b[1]+b.a[1]+b.b[1])/4];
   for(const side of ['a','b'] as const){
    const p:Point=[(a[side][0]+b[side][0])/2,(a[side][1]+b[side][1])/2],length=Math.hypot(p[0]-mid[0],p[1]-mid[1]),n:Point=[(p[0]-mid[0])/length,(p[1]-mid[1])/length];
    const ray=new THREE.Raycaster(new THREE.Vector3(mid[0],h+1.02,mid[1]),new THREE.Vector3(n[0],0,n[1]),0,length+.1);
    expect(ray.intersectObject(model.group,true).length).toBeGreaterThan(0);
    let position:Position=[mid[0],h,mid[1]];for(let i=0;i<30;i++)position=walkStep3(position,[n[0]*.04,n[1]*.04],barriers);
    expect((p[0]-position[0])*n[0]+(p[1]-position[2])*n[1]).toBeGreaterThan(.23);
   }
  }
 });
 it('keeps the first-floor door supported, clear above and visibly blocking at its open leaf',()=>{
  const model=models.get('1')!;model.group.updateMatrixWorld(true);
  const door=SOUTH_STAIR_FIRST_DOOR,mid:Point=[(door.hinge[0]+door.closedTip[0])/2,(door.hinge[1]+door.closedTip[1])/2];
  expect(supportHeight(mid,FLOOR_HEIGHT['1'])).toBe(FLOOR_HEIGHT['1']);
  const up=new THREE.Raycaster(new THREE.Vector3(mid[0],.38,mid[1]),new THREE.Vector3(0,1,0),0,1.5);expect(up.intersectObject(model.group,true)).toHaveLength(0);
  const a=door.hinge,b=door.openTip,length=Math.hypot(b[0]-a[0],b[1]-a[1]),n:Point=[-(b[1]-a[1])/length,(b[0]-a[0])/length],p:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2];
  const ray=new THREE.Raycaster(new THREE.Vector3(p[0]+n[0]*.6,1.1,p[1]+n[1]*.6),new THREE.Vector3(-n[0],0,-n[1]),0,.7);expect(ray.intersectObject(model.group,true).length).toBeGreaterThan(0);
 });
 it('keeps the stair visible when furnishings of Ground and Level 1 are hidden',()=>{
  const model=models.get('G')!;model.setDetailsVisible(false);model.group.updateMatrixWorld(true);
  const run=SOUTH_STAIR_RUNS[2],a=run.sections![4],b=run.sections![5],p:Point=[(a.a[0]+a.b[0]+b.a[0]+b.b[0])/4,(a.a[1]+a.b[1]+b.a[1]+b.b[1])/4],h=(a.height+b.height)/2;
  const ray=new THREE.Raycaster(new THREE.Vector3(p[0],h+.4,p[1]),new THREE.Vector3(0,-1,0),0,.65);
  expect(ray.intersectObject(model.group,true).some(hit=>hit.object.visible&&hit.object.userData.interiorLayer==='shell')).toBe(true);model.setDetailsVisible(true);
  for(const landing of SOUTH_STAIR_LANDINGS)for(const p of landing.route!)expect(pointInPolygon([p[0],p[2]],SOUTH_STAIR_OPENING)||pointInPolygon([p[0],p[2]],landing.polygon!)).toBe(true);
 });
});
describe('source south entrance',()=>{
 function supportedRoute(a:Point,end:Point){
  const route:Flight={from:[a[0],0,a[1]],to:[end[0],0,end[1]],width:1,lower:'G',upper:'G'};
  follow([route]);follow([route],true);
  const model=models.get('G')!;model.group.updateMatrixWorld(true);
  for(let i=0;i<=20;i++){
   const t=i/20,p:Point=[a[0]+(end[0]-a[0])*t,a[1]+(end[1]-a[1])*t];
   expect(supportHeight(p,0),`south support ${i}`).toBe(0);
   const up=new THREE.Raycaster(new THREE.Vector3(p[0],.02,p[1]),new THREE.Vector3(0,1,0),0,1.85);
   expect(up.intersectObject(model.group,true),`south headroom ${i}`).toHaveLength(0);
   const down=new THREE.Raycaster(new THREE.Vector3(p[0],.2,p[1]),new THREE.Vector3(0,-1,0),0,.23);
   expect(down.intersectObject(model.group,true).length,`south floor ${i}`).toBeGreaterThan(0);
  }
 }
 for(const index of [0,1])it(`walks through both rows of south door pair ${index+1} and back`,()=>{
  const a=southOffset(southPairCenter(index),-1.4),end=southOffset(southPairCenter(index+2),2.7);
  expect(pointInPolygon(a,footprintForFloor('G'))).toBe(true);expect(pointInPolygon(end,SOUTH_APRON)).toBe(true);
  supportedRoute(a,end);
 });
 for(const leaf of SOUTH_STAIR_LEAVES)it(`walks through the source ${leaf.id} opening with support and headroom`,()=>{
  const center:Point=[(leaf.hinge[0]+leaf.closedTip[0])/2,(leaf.hinge[1]+leaf.closedTip[1])/2];
  supportedRoute(southOffset(center,-1),southOffset(center,1.2));
 });
 it('keeps all native leaves and adjacent glazing visible and blocking',()=>{
  const model=models.get('G')!;model.group.updateMatrixWorld(true);
  for(const segment of [...SOUTH_LEAVES,...SOUTH_STAIR_LEAVES].map(l=>({a:l.hinge,b:l.openTip})).concat(SOUTH_GLAZING)){
   const {a,b}=segment,length=Math.hypot(b[0]-a[0],b[1]-a[1]),n:Point=[-(b[1]-a[1])/length,(b[0]-a[0])/length],mid:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2];
   const p:Point=[mid[0]+n[0]*.6,mid[1]+n[1]*.6];
   const ray=new THREE.Raycaster(new THREE.Vector3(p[0],1.1,p[1]),new THREE.Vector3(-n[0],0,-n[1]),0,.7);
   expect(ray.intersectObject(model.group,true).length,`south visible ${JSON.stringify(segment)}`).toBeGreaterThan(0);
   let position:Position=[p[0],0,p[1]];
   for(let i=0;i<30;i++)position=walkStep3(position,[-n[0]*.04,-n[1]*.04],f=>models.get(f)!.barriers);
   expect((position[0]-mid[0])*n[0]+(position[2]-mid[1])*n[1],`south blocking ${JSON.stringify(segment)}`).toBeGreaterThan(.23);
  }
 });
 it('renders and blocks the native vestibule and stair enclosure walls',()=>{
  const model=models.get('G')!;model.group.updateMatrixWorld(true);
  // Sample the broad side walls from the authoritative plan, rather than
  // merely asserting that generated boundary segments were added to a list.
  for(const pdf of [[218,493],[272,500],[333,500],[310,515]]){
   const p=groundGuidePlan(pdf[0],pdf[1]);
   expect(SOUTH_SOLIDS.some(s=>pointInPolygon(p,s.outer)&&!s.holes.some(h=>pointInPolygon(p,h)))).toBe(true);
   const next=groundGuidePlan(pdf[0]+(pdf[1]===515?0:1),pdf[1]+(pdf[1]===515?1:0)),length=Math.hypot(next[0]-p[0],next[1]-p[1]),n:Point=[(next[0]-p[0])/length,(next[1]-p[1])/length];
   const start:Point=[p[0]+n[0]*.8,p[1]+n[1]*.8];
   const ray=new THREE.Raycaster(new THREE.Vector3(start[0],1.1,start[1]),new THREE.Vector3(-n[0],0,-n[1]),0,1.6);
   expect(ray.intersectObject(model.group,true).some(hit=>SOUTH_SOLIDS.some(s=>s.outer.some((a,i)=>distanceToSegment([hit.point.x,hit.point.z],a,s.outer[(i+1)%s.outer.length])<.005))),`missing south wall ${pdf}`).toBe(true);
   let position:Position=[start[0],0,start[1]];
   for(let i=0;i<40;i++)position=walkStep3(position,[-n[0]*.04,-n[1]*.04],f=>models.get(f)!.barriers);
   expect((position[0]-p[0])*n[0]+(position[2]-p[1])*n[1],`nonblocking south wall ${pdf}`).toBeGreaterThan(.23);
  }
 });
 it('connects both vestibule approaches to the lounge and atrium stair',()=>{
  const lounge=ROOMS.find(r=>r.id==='lobby-lounge')!,arrival=roomArrival(lounge,models.get('G')!.barriers)!;
  const area={...lounge,polygon:[[178,298],[390,298],[390,529],[178,529]].map(([x,y])=>groundGuidePlan(x,y)),door:SOUTH_APPROACH};
  const stair=atriumStairApproach(),second=southOffset(southPairCenter(1),-1.4);
  walkInteriorTargets(area,[[arrival.point],[[stair[0],stair[2]]],[second]],.2,p=>pointInPolygon(p,footprintForFloor('G'))&&supportHeight(p,0)===0);
 });
 it('provides a clear shortcut and stops at the finite exterior landing',()=>{
  const p=SOUTH_APPROACH;
  expect(pointInPolygon(p,footprintForFloor('G'))).toBe(true);
  expect(models.get('G')!.barriers.every(b=>b.minY!==undefined&&b.minY>1.65||distanceToSegment(p,b.a,b.b)>=.24)).toBe(true);
  const center=southPairCenter(2),a=southOffset(center,2.7),end=southOffset(center,5);
  let position:Position=[a[0],0,a[1]];
  for(let i=0;i<100;i++)position=walkStep3(position,[(end[0]-a[0])/100,(end[1]-a[1])/100],f=>models.get(f)!.barriers);
  expect(pointInPolygon([position[0],position[2]],SOUTH_APRON)).toBe(true);expect(supportHeight(end,0)).toBeNull();
  expect(distanceToSegment([position[0],position[2]],SOUTH_APRON[2],SOUTH_APRON[3])).toBeLessThan(.04);
 });
});
describe('source canopy entrance',()=>{
 for(let index=0;index<3;index++)it(`walks through canopy door pair ${index+1} and back with standing headroom`,()=>{
  const center=canopyPairCenter(index),a=canopyOffset(center,-1.6),end=canopyOffset(center,2.7);
  const route:Flight={from:[a[0],-AMPH_DROP,a[1]],to:[end[0],-AMPH_DROP,end[1]],width:1,lower:'G',upper:'G'};
  expect(pointInPolygon(a,footprintForFloor('G'))).toBe(true);expect(pointInPolygon(end,CANOPY_APRON)).toBe(true);
  follow([route]);follow([route],true);
  const model=models.get('G')!;model.group.updateMatrixWorld(true);
  for(let i=0;i<=20;i++){
   const t=i/20,p:Point=[a[0]+(end[0]-a[0])*t,a[1]+(end[1]-a[1])*t];
   expect(supportHeight(p,-AMPH_DROP)).toBe(-AMPH_DROP);
   const up=new THREE.Raycaster(new THREE.Vector3(p[0],-AMPH_DROP+.02,p[1]),new THREE.Vector3(0,1,0),0,1.85);
   expect(up.intersectObject(model.group,true),`canopy ${index}/${i} headroom`).toHaveLength(0);
   const down=new THREE.Raycaster(new THREE.Vector3(p[0],-AMPH_DROP+.2,p[1]),new THREE.Vector3(0,-1,0),0,.23);
   expect(down.intersectObject(model.group,true).length,`canopy ${index}/${i} floor`).toBeGreaterThan(0);
  }
 });
 it('keeps native open leaves and adjoining glass visible and blocking',()=>{
  const model=models.get('G')!;model.group.updateMatrixWorld(true);
  for(const segment of [...CANOPY_LEAVES.map(l=>({a:l.hinge,b:l.openTip})),...CANOPY_GLAZING]){
   const {a,b}=segment,length=Math.hypot(b[0]-a[0],b[1]-a[1]),n:Point=[-(b[1]-a[1])/length,(b[0]-a[0])/length];
   const mid:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2],p:Point=[mid[0]+n[0]*.6,mid[1]+n[1]*.6];
   const ray=new THREE.Raycaster(new THREE.Vector3(p[0],-AMPH_DROP+1.1,p[1]),new THREE.Vector3(-n[0],0,-n[1]),0,.7);
   expect(ray.intersectObject(model.group,true).length).toBeGreaterThan(0);
   let position:Position=[p[0],-AMPH_DROP,p[1]];
   for(let i=0;i<30;i++)position=walkStep3(position,[-n[0]*.04,-n[1]*.04],f=>models.get(f)!.barriers);
   expect((position[0]-mid[0])*n[0]+(position[2]-mid[1])*n[1]).toBeGreaterThan(.23);
  }
 });
 it('connects all three canopy approaches to the furnished lounge and atrium stair',()=>{
  const lounge=ROOMS.find(r=>r.id==='lobby-lounge')!,arrival=roomArrival(lounge,models.get('G')!.barriers)!;
  const lower=amphPoint(8.5,4),upper=amphPoint(8.5,-.45);
  for(let i=0;i<3;i++){
   const p=canopyOffset(canopyPairCenter(i),-1.6),route:Flight={from:[lower[0],-AMPH_DROP,lower[1]],to:[p[0],-AMPH_DROP,p[1]],width:1,lower:'G',upper:'G'};follow([route]);follow([route],true);
  }
  const stairs:Flight={from:[lower[0],-AMPH_DROP,lower[1]],to:[upper[0],0,upper[1]],width:1,lower:'G',upper:'G'};follow([stairs]);follow([stairs],true);
  const area={...lounge,polygon:[[178,298],[390,298],[390,474],[178,474]].map(([x,y])=>groundGuidePlan(x,y)),door:upper};
  const stair=atriumStairApproach();
  walkInteriorTargets(area,[[arrival.point],[[stair[0],stair[2]]]],.2,p=>pointInPolygon(p,footprintForFloor('G'))&&supportHeight(p,0)===0);
 });
 it('provides a clear entrance shortcut and stops at the modeled exterior edge',()=>{
  const p=CANOPY_APPROACH;
  expect(pointInPolygon(p,footprintForFloor('G'))).toBe(true);
  expect(models.get('G')!.barriers.every(b=>b.minY!==undefined&&b.minY>1.65||distanceToSegment(p,b.a,b.b)>=.24)).toBe(true);
  // The clear eastbound aisle passes between the native curved seat outlines.
  const a=groundGuidePlan(420,455),end=groundGuidePlan(575,455);
  let position:Position=[a[0],-AMPH_DROP,a[1]];
  for(let i=0;i<100;i++)position=walkStep3(position,[(end[0]-a[0])/100,(end[1]-a[1])/100],f=>models.get(f)!.barriers);
  expect(pointInPolygon([position[0],position[2]],CANOPY_APRON)).toBe(true);
  expect(supportHeight(end,-AMPH_DROP)).toBeNull();
  expect(distanceToSegment([position[0],position[2]],...CANOPY_PAVING_LIMIT)).toBeLessThan(.04);
 });
});
describe('canopy structure',()=>{
 it('walks from the lobby entrance through the whole plaza aisle and back',()=>{
  const p=canopyPairCenter(1),points:Point[]=[canopyOffset(p,-1.6),canopyOffset(p,2.7),groundGuidePlan(406,446),groundGuidePlan(416,455),groundGuidePlan(452,455),groundGuidePlan(530,455)];
  const route:Flight[]=points.slice(0,-1).map((a,i)=>({from:[a[0],-AMPH_DROP,a[1]],to:[points[i+1][0],-AMPH_DROP,points[i+1][1]],width:1,lower:'G',upper:'G'}));
  follow(route);follow(route,true);
  for(const p of points.slice(1)){
   expect(supportHeight(p,-AMPH_DROP)).toBe(-AMPH_DROP);
   for(const [floor,model] of models){
    const up=new THREE.Raycaster(new THREE.Vector3(p[0],-AMPH_DROP-FLOOR_HEIGHT[floor]+.02,p[1]),new THREE.Vector3(0,1,0),0,1.85);
    expect(up.intersectObject(model.group,true),`headroom ${floor}/${p}`).toHaveLength(0);
   }
   const down=new THREE.Raycaster(new THREE.Vector3(p[0],-AMPH_DROP+.2,p[1]),new THREE.Vector3(0,-1,0),0,.23);
   expect(down.intersectObject(models.get('G')!.group,true).length).toBeGreaterThan(0);
  }
 });
 it('joins every horizontal upper column cut completely into the overhead surface',()=>{
  const model=models.get('G')!;
  for(const c of CANOPY_COLUMNS){
   const {center,direction:[dx,dz],cosine}=canopyColumnSection(c,CANOPY_SOFFIT_HEIGHT,-AMPH_DROP);
   for(let i=0;i<32;i++){
    const angle=i/32*Math.PI*2,x=center[0]+c.radius*(Math.cos(angle)*dx/cosine-Math.sin(angle)*dz),z=center[1]+c.radius*(Math.cos(angle)*dz/cosine+Math.sin(angle)*dx);
    const ray=new THREE.Raycaster(new THREE.Vector3(x,CANOPY_SOFFIT_HEIGHT-.05,z),new THREE.Vector3(0,1,0),0,.1);
    expect(ray.intersectObject(model.group,true).some(hit=>(hit.object as THREE.Mesh<THREE.BufferGeometry,THREE.Material>).material.name==='Canopy bronze soffit'),`upper attachment ${c.id}/${i}`).toBe(true);
   }
  }
 });
 for(const c of CANOPY_COLUMNS)it(`renders and blocks the leaning support ${c.id} at walking height`,()=>{
  const model=models.get('G')!;model.group.updateMatrixWorld(true);
  const y=-AMPH_DROP+1.1,{center,direction:[dx,dz]}=canopyColumnSection(c,y,-AMPH_DROP);
  // The south-west bench borders the positive side of this support. Exercise
  // its clear opposite side so the seat does not intercept the column walk.
  const sign=c.id==='column-pdf6-52305'?-1:1,n:Point=[-dz*sign,dx*sign];
  const start:Point=[center[0]+n[0]*(c.radius+1),center[1]+n[1]*(c.radius+1)];
  const ray=new THREE.Raycaster(new THREE.Vector3(start[0],y,start[1]),new THREE.Vector3(-n[0],0,-n[1]),0,1.2);
  expect(ray.intersectObject(model.group,true).some(hit=>(hit.object as THREE.Mesh).material instanceof THREE.Material&&(hit.object as THREE.Mesh<THREE.BufferGeometry,THREE.Material>).material.name==='Inclined canopy silver')).toBe(true);
  let position:Position=[start[0],-AMPH_DROP,start[1]];
  for(let i=0;i<50;i++)position=walkStep3(position,[-n[0]*.04,-n[1]*.04],f=>models.get(f)!.barriers);
  const clearance=(position[0]-center[0])*n[0]+(position[2]-center[1])*n[1];
  expect(clearance).toBeGreaterThan(c.radius+.2);expect(clearance).toBeLessThan(c.radius+.5);
  for(const t of [-1,1]){
   const p:Point=[c.center[0]+n[0]*(c.radius+.7)*t,c.center[1]+n[1]*(c.radius+.7)*t];
   const down=new THREE.Raycaster(new THREE.Vector3(p[0],-AMPH_DROP+.2,p[1]),new THREE.Vector3(0,-1,0),0,.23);
   expect(supportHeight(p,-AMPH_DROP)).toBe(-AMPH_DROP);expect(down.intersectObject(model.group,true).length).toBeGreaterThan(0);
  }
 });
 it('keeps the bronze overhead surface and inclined supports after room detail culling',()=>{
  const model=models.get('G')!,p=groundGuidePlan(440,450);expect(pointInPolygon(p,CANOPY_SOFFIT_OUTLINE)).toBe(true);
  model.setDetailsVisible(false);
  try{
   const meshes:THREE.Object3D[]=[];model.group.traverse(o=>{if(o instanceof THREE.Mesh&&o.visible)meshes.push(o);});
   const ray=new THREE.Raycaster(new THREE.Vector3(p[0],-AMPH_DROP+1.65,p[1]),new THREE.Vector3(0,1,0),0,10);
   const hit=ray.intersectObjects(meshes,false).find(hit=>(hit.object as THREE.Mesh<THREE.BufferGeometry,THREE.Material>).material.name==='Canopy bronze soffit');
   expect(hit).toBeDefined();expect(hit!.point.y).toBeCloseTo(CANOPY_SOFFIT_HEIGHT,4);
   expect(meshes.some(m=>(m as THREE.Mesh<THREE.BufferGeometry,THREE.Material>).material.name==='Inclined canopy silver')).toBe(true);
  }finally{model.setDetailsVisible(true);}
 });
});
describe('canopy benches',()=>{
 for(const bench of CANOPY_BENCHES){
  it(`walks through the ${bench.id} opening into its clear center and back`,()=>{
   const radius=Math.max(...bench.outerEdge.map(p=>Math.hypot(p[0]-bench.center[0],p[1]-bench.center[1]))),out:Point=[bench.center[0]+bench.openingDirection[0]*(radius+.6),bench.center[1]+bench.openingDirection[1]*(radius+.6)];
   const route:Flight={from:[out[0],-AMPH_DROP,out[1]],to:[bench.center[0],-AMPH_DROP,bench.center[1]],width:1,lower:'G',upper:'G'};
   follow([route]);follow([route],true);
   for(let i=0;i<=8;i++){
    const t=i/8,p:Point=[out[0]+(bench.center[0]-out[0])*t,out[1]+(bench.center[1]-out[1])*t];
    expect(supportHeight(p,-AMPH_DROP)).toBe(-AMPH_DROP);
    for(const [floor,model] of models){
     const ray=new THREE.Raycaster(new THREE.Vector3(p[0],-AMPH_DROP-FLOOR_HEIGHT[floor]+.02,p[1]),new THREE.Vector3(0,1,0),0,1.85);
     expect(ray.intersectObject(model.group,true),`clear center ${bench.id}/${floor}/${i}`).toHaveLength(0);
    }
   }
  });
  it(`renders the ${bench.id} timber seat at its height and prevents walking through it`,()=>{
   const slats=canopyBenchSlats(bench),slat=slats[Math.floor(slats.length/2)],p:Point=[slat.reduce((s,v)=>s+v[0],0)/slat.length,slat.reduce((s,v)=>s+v[1],0)/slat.length];
   const ray=new THREE.Raycaster(new THREE.Vector3(p[0],-AMPH_DROP+1,p[1]),new THREE.Vector3(0,-1,0),0,1.1);
   const hit=ray.intersectObject(models.get('G')!.group,true).find(h=>(h.object as THREE.Mesh<THREE.BufferGeometry,THREE.Material>).material.name==='Canopy bench timber');
   expect(hit).toBeDefined();expect(hit!.point.y).toBeCloseTo(-AMPH_DROP+CANOPY_BENCH_HEIGHT,5);
   const dx=p[0]-bench.center[0],dz=p[1]-bench.center[1],radius=Math.hypot(dx,dz),u:Point=[dx/radius,dz/radius];
   let position:Position=[bench.center[0],-AMPH_DROP,bench.center[1]];
   for(let i=0;i<100;i++)position=walkStep3(position,[u[0]*.04,u[1]*.04],f=>models.get(f)!.barriers);
   const distance=Math.hypot(position[0]-bench.center[0],position[2]-bench.center[1]);
   expect(distance).toBeGreaterThan(.5);expect(distance).toBeLessThan(radius-.1);expect(position[1]).toBe(-AMPH_DROP);
  });
 }
 it('retains the exterior benches when room details are culled',()=>{
  const model=models.get('G')!;model.setDetailsVisible(false);
  try{
   const materials:string[]=[];model.group.traverse(o=>{if(o instanceof THREE.Mesh&&o.visible)materials.push((o.material as THREE.Material).name);});
   expect(materials).toContain('Canopy bench timber');expect(materials).toContain('Canopy bench steel');
  }finally{model.setDetailsVisible(true);}
 });
});
describe('source courtyard entrance',()=>{
 for(const id of ['column-pdf6-52419','column-pdf6-52452'])it(`retains the complete interior footing beside ${id}`,()=>{
  const column=structuralColumnLayout('G').find(c=>c.id===id)!,model=models.get('G')!;
  model.group.updateMatrixWorld(true);
  for(let i=0;i<64;i++){
   const angle=i*Math.PI/32,p:Point=[column.center[0]+Math.cos(angle)*(column.radius+.015),column.center[1]+Math.sin(angle)*(column.radius+.015)];
   expect(pointInPolygon(p,footprintForFloor('G')),`facade cuts column ${id}/${i}`).toBe(true);
   const ray=new THREE.Raycaster(new THREE.Vector3(p[0],.2,p[1]),new THREE.Vector3(0,-1,0),0,.23);
   expect(ray.intersectObject(model.group,true).some(hit=>Math.abs(hit.point.y)<.005),`missing floor at ${id}/${i}`).toBe(true);
  }
 });
 for(const index of [0,1])it(`walks through courtyard door pair ${index+1} to the exterior landing and back`,()=>{
  const row=COURTYARD_DOOR_ROWS.find(r=>r.id==='inner')!,pair=row.pairs[index];
  const center:Point=[(pair[0][0]+pair[1][0])/2,(pair[0][1]+pair[1][1])/2];
  const a=courtyardOffset(center,1.4),end=courtyardOffset(center,-5.2);
  expect(pointInPolygon(a,footprintForFloor('G'))).toBe(true);
  expect(pointInPolygon(end,COURTYARD_APRON)).toBe(true);
  const route:Flight={from:[a[0],0,a[1]],to:[end[0],0,end[1]],width:1,lower:'G',upper:'G'};
  follow([route]);follow([route],true);
  const model=models.get('G')!;model.group.updateMatrixWorld(true);
  for(let i=0;i<=16;i++){
   const t=i/16,p:Point=[a[0]+(end[0]-a[0])*t,a[1]+(end[1]-a[1])*t];
   expect(supportHeight(p,0)).toBe(0);
   const roof=new THREE.Raycaster(new THREE.Vector3(p[0],.02,p[1]),new THREE.Vector3(0,1,0),0,1.85);
   expect(roof.intersectObject(model.group,true),`headroom ${index}/${i}`).toHaveLength(0);
   const down=new THREE.Raycaster(new THREE.Vector3(p[0],.2,p[1]),new THREE.Vector3(0,-1,0),0,.23);
   expect(down.intersectObject(model.group,true).length,`floor ${index}/${i}`).toBeGreaterThan(0);
  }
 });
 it('keeps source open door leaves and solid vestibule sides visible and blocking',()=>{
  const model=models.get('G')!;model.group.updateMatrixWorld(true);
  for(const segment of [...COURTYARD_LEAVES.map(l=>({a:l.hinge,b:l.openTip})),...COURTYARD_SIDE_FACES]){
   const a=segment.a,end=segment.b,length=Math.hypot(end[0]-a[0],end[1]-a[1]);
   const n:Point=[-(end[1]-a[1])/length,(end[0]-a[0])/length],mid:Point=[(a[0]+end[0])/2,(a[1]+end[1])/2];
   const p:Point=[mid[0]+n[0]*.6,mid[1]+n[1]*.6];
   const ray=new THREE.Raycaster(new THREE.Vector3(p[0],1.1,p[1]),new THREE.Vector3(-n[0],0,-n[1]),0,.7);
   expect(ray.intersectObject(model.group,true).length).toBeGreaterThan(0);
   let position:Position=[p[0],0,p[1]];
   for(let j=0;j<30;j++)position=walkStep3(position,[-n[0]*.04,-n[1]*.04],f=>models.get(f)!.barriers);
   expect((position[0]-mid[0])*n[0]+(position[2]-mid[1])*n[1]).toBeGreaterThan(.23);
  }
 });
 it('connects the courtyard vestibule to the lounge and atrium stair',()=>{
  const lounge=ROOMS.find(r=>r.id==='lobby-lounge')!,arrival=roomArrival(lounge,models.get('G')!.barriers)!;
  const area={...lounge,polygon:[[178,298],[368,298],[368,440],[178,440]].map(([x,y])=>groundGuidePlan(x,y)),door:COURTYARD_APPROACH};
  const stair=atriumStairApproach();
  walkInteriorTargets(area,[[arrival.point],[[stair[0],stair[2]]]],.2,p=>pointInPolygon(p,footprintForFloor('G')));
 });
 it('keeps the courtyard shortcut clear and stops at the edge of the modeled landing',()=>{
  const p=COURTYARD_APPROACH;
  expect(pointInPolygon(p,footprintForFloor('G'))).toBe(true);
  expect(models.get('G')!.barriers.every(b=>b.minY!==undefined&&b.minY>1.65||distanceToSegment(p,b.a,b.b)>=.24)).toBe(true);
  const pair=COURTYARD_DOOR_ROWS[0].pairs[0],center:Point=[(pair[0][0]+pair[1][0])/2,(pair[0][1]+pair[1][1])/2];
  const a=courtyardOffset(center,-2.7),end=courtyardOffset(center,-5);
  let position:Position=[a[0],0,a[1]];
  for(let i=0;i<100;i++)position=walkStep3(position,[(end[0]-a[0])/100,(end[1]-a[1])/100],f=>models.get(f)!.barriers);
  expect(pointInPolygon([position[0],position[2]],COURTYARD_APRON)).toBe(true);
  expect(supportHeight(end,0)).toBeNull();
  expect(distanceToSegment([position[0],position[2]],COURTYARD_APRON[2],COURTYARD_APRON[3])).toBeLessThan(.04);
 });
});
describe('central lift landings',()=>{
 for(const floor of LIFT_FLOORS)for(const car of [0,1] as const){
  const cab=liftLanding(floor)!.cabs[car];
  it(`blocks the closed ${floor}/${car} doorway and opens a walkable cab`,()=>{
   const lift=models.get(floor)!.lift!,outside=cab.at(0,-1.1),inside=cab.at(0,cab.depth*.55);
   const route:Flight={from:[outside[0],FLOOR_HEIGHT[floor],outside[1]],to:[inside[0],FLOOR_HEIGHT[floor],inside[1]],width:cab.opening,lower:floor,upper:floor};
   let blocked:Position=route.from;
   for(let i=0;i<60;i++)blocked=walkStep3(blocked,[(inside[0]-outside[0])/60,(inside[1]-outside[1])/60],f=>models.get(f)!.barriers);
   expect(insideLift(floor,[blocked[0],blocked[2]]),`closed ${floor}/${car}`).toBeNull();
   lift.setDoorProgress(car,1);
   try{follow([route]);follow([route],true);}finally{lift.setDoorProgress(car,0);}
  });
  it(`keeps the ${floor}/${car} landing shortcut clear and cab inside the core`,()=>{
   const p=cab.at(0,-1.1),height=FLOOR_HEIGHT[floor];
   expect(pointInPolygon(p,footprintForFloor(floor))).toBe(true);
   expect(ROOMS.some(r=>r.floor===floor&&pointInPolygon(p,r.polygon))).toBe(false);
   expect(walkStep3([p[0],height,p[1]],[.01,0],f=>models.get(f)!.barriers)[0]).toBeCloseTo(p[0]+.01,5);
   const core=liftLanding(floor)!.core;
   for(const corner of cab.polygon)expect(pointInPolygon(corner,core)||core.some((p,i)=>distanceToSegment(corner,p,core[(i+1)%core.length])<.000001)).toBe(true);
  });
 }
 it('does not invent a rooftop central lift stop',()=>expect(liftLanding('R')).toBeNull());
 it('gives every cab standing headroom and a visible interior ceiling',()=>{
  const meshes:THREE.Object3D[]=[],old=new Map<FloorId,number>();
  for(const [floor,model] of models){old.set(floor,model.group.position.y);model.group.position.y=FLOOR_HEIGHT[floor];model.group.updateMatrixWorld(true);model.group.traverse(o=>{if(o instanceof THREE.Mesh)meshes.push(o);});}
  try{for(const floor of LIFT_FLOORS)for(const cab of liftLanding(floor)!.cabs){
   const [x,z]=cab.at(0,cab.depth*.55),y=FLOOR_HEIGHT[floor];
   const space=new THREE.Raycaster(new THREE.Vector3(x,y+.03,z),new THREE.Vector3(0,1,0),0,1.85);
   expect(space.intersectObjects(meshes,false),`headroom ${floor}/${cab.car}`).toHaveLength(0);
   const ceiling=new THREE.Raycaster(new THREE.Vector3(x,y+1.65,z),new THREE.Vector3(0,1,0),0,1.1);
   expect(ceiling.intersectObjects(meshes,false).some(hit=>(hit.object as THREE.Mesh).material instanceof THREE.Material&&((hit.object as THREE.Mesh).material as THREE.Material).name==='Estimated lift cab lining'),`ceiling ${floor}/${cab.car}`).toBe(true);
  }}finally{for(const [floor,model] of models){model.group.position.y=old.get(floor)!;model.group.updateMatrixWorld(true);}}
 });
});
it('walks from both Level 1 lift landings onto the mezzanine floor',()=>{
 for(const c of liftLanding('1')!.cabs){
  const a=c.at(0,-1.1),end=c.at(0,-3.7),route:Flight={from:[a[0],FLOOR_HEIGHT['1'],a[1]],to:[end[0],FLOOR_HEIGHT['1'],end[1]],width:1.1,lower:'1',upper:'1'};
  follow([route]);follow([route],true);
 }
});
describe('continuous stair navigation', () => {
 for (const floor of FLOOR_ORDER.slice(0, -1)) {
  const flights = ENCLOSED_FLIGHTS.filter(f => f.lower === floor);
  it(`walks up from ${floor}`, () => follow(flights));
  it(`walks down to ${floor}`, () => follow(flights, true));
 }
 it('walks up the atrium stair', () => follow([...ATRIUM_FLIGHTS, ATRIUM_LANDING]));
 it('walks down the atrium stair', () => follow([...ATRIUM_FLIGHTS, ATRIUM_LANDING], true));
 it('walks sideways across both source-traced atrium flights without changing standing height',()=>{
  for(const flight of ATRIUM_FLIGHTS.filter(f=>f.sections)){
   const sections=flight.sections!;
   for(let i=0;i<sections.length-1;i++){
   const a:Point=[(sections[i].a[0]+sections[i+1].a[0])/2,(sections[i].a[1]+sections[i+1].a[1])/2];
   const b:Point=[(sections[i].b[0]+sections[i+1].b[0])/2,(sections[i].b[1]+sections[i+1].b[1])/2];
   const at=(t:number):Point=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],start=at(.3),end=at(.7),height=flightHeight(start,flight)!;
   expect(height).not.toBeNull();
   let p:Position=[start[0],height,start[1]];
   const count=Math.ceil(Math.hypot(end[0]-start[0],end[1]-start[1])/.04);
   for(let j=0;j<count;j++){
    p=walkStep3(p,[(end[0]-start[0])/count,(end[1]-start[1])/count],f=>models.get(f)!.barriers);
    expect(p[1],`lateral height on tread band ${i}`).toBeCloseTo(height,3);
   }
   expect(p[0],`lateral clearance on tread band ${i}`).toBeCloseTo(end[0],3);
   expect(p[2],`lateral clearance on tread band ${i}`).toBeCloseTo(end[1],3);
   }
  }
 });
 it('retains standing headroom through the registered atrium stair and landing',()=>{
  const meshes:THREE.Object3D[]=[],old=new Map<FloorId,number>();
  for(const [floor,model] of models){old.set(floor,model.group.position.y);model.group.position.y=FLOOR_HEIGHT[floor];model.group.updateMatrixWorld(true);model.group.traverse(o=>{if(o instanceof THREE.Mesh)meshes.push(o);});}
  try{for(const flight of [...ATRIUM_FLIGHTS,ATRIUM_LANDING]){
   const bands=flight.sections?flight.sections.slice(0,-1).map((row,i)=>({from:[(row.a[0]+row.b[0])/2,row.height,(row.a[1]+row.b[1])/2] as Position,to:[(flight.sections![i+1].a[0]+flight.sections![i+1].b[0])/2,flight.sections![i+1].height,(flight.sections![i+1].a[1]+flight.sections![i+1].b[1])/2] as Position})):flight.route?flight.route.slice(0,-1).map((from,i)=>({from,to:flight.route![i+1]})): [flight];
   for(const band of bands)for(const t of [.05,.5,.95]){
   const p:Position=[band.from[0]+(band.to[0]-band.from[0])*t,band.from[1]+(band.to[1]-band.from[1])*t,band.from[2]+(band.to[2]-band.from[2])*t];
   const ray=new THREE.Raycaster(new THREE.Vector3(p[0],p[1]+.2,p[2]),new THREE.Vector3(0,1,0),0,1.65);
   expect(ray.intersectObjects(meshes,false),`atrium headroom at ${p}`).toHaveLength(0);
   }
  }}finally{for(const [floor,model] of models){model.group.position.y=old.get(floor)!;model.group.updateMatrixWorld(true);}}
 });

 it('connects the entrance through the atrium to the mezzanine corridor',()=>{
  const first=ATRIUM_FLIGHTS[0].from,end=ATRIUM_LANDING.to;
  const path:Position[]=[[ENTRY[0],-AMPH_DROP,ENTRY[1]]];
  for(const [u,v,h] of [[5.3,AMPH_DEPTH+.8,-AMPH_DROP],[-.8,AMPH_DEPTH+.8,0]]){const p=amphPoint(u,v);path.push([p[0],h,p[1]]);}
  // Approach through the open area in front of the source-registered core;
  // the former straight line cut through its now correctly oriented cabs.
  const front=groundGuidePlan(243,392);path.push([front[0],0,front[1]]);
  path.push(atriumStairApproach(),first);
  const approach:Flight[]=path.slice(0,-1).map((from,i)=>({from,to:path[i+1],width:1.8,lower:'G',upper:'G'}));
  const exit:Flight={from:end,to:[end[0]-.8,end[1],end[2]],width:1.8,lower:'1',upper:'1'};
  follow([...approach,...ATRIUM_FLIGHTS,ATRIUM_LANDING,exit]);
  follow([...approach,...ATRIUM_FLIGHTS,ATRIUM_LANDING,exit],true);
 });
});

for(const stair of COMMUNICATING_STAIRS)describe(`Level ${stair.lower}–${stair.upper} communicating stair`,()=>{
 const {flights:COMMUNICATING_FLIGHTS,landing:COMMUNICATING_LANDING,path:COMMUNICATING_PATH,entry:COMMUNICATING_ENTRY,exit:COMMUNICATING_EXIT,void:COMMUNICATING_VOID,core:COMMUNICATING_CORE}=stair;
 const first=COMMUNICATING_FLIGHTS[0].from;
 const approach:Flight={from:[COMMUNICATING_ENTRY[0],FLOOR_HEIGHT[stair.lower],COMMUNICATING_ENTRY[1]],to:first,width:1.35,lower:stair.lower,upper:stair.upper};
 const route=[approach,...COMMUNICATING_FLIGHTS,COMMUNICATING_LANDING];
 it('walks from the lower corridor to the upper corridor',()=>follow(route));
 it('walks back down from the upper corridor',()=>follow(route,true));
 it('fits the new stair and core between the existing rooms',()=>{
  for(const floor of [stair.lower,stair.upper])for(const p of [...COMMUNICATING_PATH,...COMMUNICATING_CORE,COMMUNICATING_ENTRY,COMMUNICATING_EXIT]){
   expect(pointInPolygon(p,footprintForFloor(floor))).toBe(true);
   expect(ROOMS.some(r=>r.floor===floor&&pointInPolygon(p,r.polygon)),`room overlap at ${floor}/${p}`).toBe(false);
  }
 });
 it('cuts the ceiling and upper slab to provide headroom on the stair',()=>{
  const meshes:THREE.Object3D[]=[];
  for(const floor of [stair.lower,stair.upper]){const model=models.get(floor)!;model.group.position.y=FLOOR_HEIGHT[floor];model.group.updateMatrixWorld(true);model.group.traverse(o=>{if(o instanceof THREE.Mesh)meshes.push(o);});}
  try{
   for(const flight of COMMUNICATING_FLIGHTS){
    const x=(flight.from[0]+flight.to[0])/2,z=(flight.from[2]+flight.to[2])/2,y=(flight.from[1]+flight.to[1])/2;
    expect(pointInPolygon([x,z],COMMUNICATING_VOID)).toBe(true);
    const ray=new THREE.Raycaster(new THREE.Vector3(x,y+.2,z),new THREE.Vector3(0,1,0),0,1.7);
    expect(ray.intersectObjects(meshes,false),`ceiling at ${x}/${z}`).toHaveLength(0);
   }
  }finally{for(const floor of [stair.lower,stair.upper]){models.get(floor)!.group.position.y=0;models.get(floor)!.group.updateMatrixWorld(true);}}
 });
});

describe('rendered interior integrity',()=>{
 it('keeps all twenty-four Ground source column silhouettes inside the corrected floor',()=>{
  const columns=structuralColumnLayout('G');expect(columns).toHaveLength(24);
  for(const column of columns)for(let i=0;i<64;i++){
   const angle=i*Math.PI/32,p:Point=[column.center[0]+Math.cos(angle)*(column.radius+.015),column.center[1]+Math.sin(angle)*(column.radius+.015)];
   expect(pointInPolygon(p,footprintForFloor('G')),`Ground facade clips ${column.id}/${i}`).toBe(true);
  }
 });
 it('supports the complete north corner column footing beside source glazing',()=>{
  const column=structuralColumnLayout('G').find(c=>c.id==='column-pdf6-52303')!,model=models.get('G')!;model.group.updateMatrixWorld(true);
  for(let i=0;i<64;i++){
   const angle=i*Math.PI/32,p:Point=[column.center[0]+Math.cos(angle)*(column.radius+.015),column.center[1]+Math.sin(angle)*(column.radius+.015)];
   const ray=new THREE.Raycaster(new THREE.Vector3(p[0],.2,p[1]),new THREE.Vector3(0,-1,0),0,.23);
   expect(ray.intersectObject(model.group,true).some(hit=>Math.abs(hit.point.y)<.005),`north column floor ${i}`).toBe(true);
  }
 });
 it('renders the source north return and its three adjacent glazed panes',()=>{
  const model=models.get('G')!;model.group.updateMatrixWorld(true);
  for(const pane of NORTH_CORNER_GLAZING){
   const {a,b}=pane,length=Math.hypot(b[0]-a[0],b[1]-a[1]),n:Point=[-(b[1]-a[1])/length,(b[0]-a[0])/length],mid:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2];
   const ray=new THREE.Raycaster(new THREE.Vector3(mid[0]+n[0]*.8,1.1,mid[1]+n[1]*.8),new THREE.Vector3(-n[0],0,-n[1]),0,1.6);
   expect(ray.intersectObject(model.group,true).some(hit=>distanceToSegment([hit.point.x,hit.point.z],a,b)<.025),`missing north pane ${pane.path}`).toBe(true);
   expect(model.barriers.some(w=>Math.hypot(w.a[0]-a[0],w.a[1]-a[1])<1e-6&&Math.hypot(w.b[0]-b[0],w.b[1]-b[1])<1e-6&&w.minY===0&&w.maxY===6.3)).toBe(true);
  }
 });
 it('keeps all Level 1 source column silhouettes inside the corrected floor',()=>{
  const columns=structuralColumnLayout('1'),source=FIRST_COLUMN_TRACE.filter(c=>c.sourceBuilding==='inside');
  expect(columns).toHaveLength(source.length);
  for(const c of columns){
   const original=source.find(s=>s.id===c.id)!;
   expect(c.center).toEqual(firstGuidePlan(original.center[0],original.center[1]));
   for(let i=0;i<32;i++){
    const angle=i*Math.PI/16,p:Point=[c.center[0]+c.radius*Math.cos(angle),c.center[1]+c.radius*Math.sin(angle)];
    expect(pointInPolygon(p,footprintForFloor('1')),`${c.id} silhouette at ${angle}`).toBe(true);
   }
  }
 });
 it('keeps all Level 2 source columns at their registered positions inside the corrected floor',()=>{
  const columns=structuralColumnLayout('2'),source=SECOND_COLUMN_TRACE.filter(c=>c.sourceBuilding==='inside');
  expect(columns).toHaveLength(source.length);
  for(const c of columns){
   const original=source.find(s=>s.id===c.id)!;
   expect(c.center).toEqual(secondGuidePlan(original.center[0],original.center[1]));
   for(let i=0;i<32;i++){
    const angle=i*Math.PI/16,p:Point=[c.center[0]+c.radius*Math.cos(angle),c.center[1]+c.radius*Math.sin(angle)];
    expect(pointInPolygon(p,footprintForFloor('2')),`${c.id} silhouette at ${angle}`).toBe(true);
   }
  }
 });
 it('renders every Level 2 source column with matching full-height collision',()=>{
  const model=models.get('2')!,meshes:THREE.Object3D[]=[];
  model.group.updateMatrixWorld(true);model.group.traverse(o=>{if(o instanceof THREE.Mesh)meshes.push(o);});
  for(const c of structuralColumnLayout('2')){
   for(const direction of [new THREE.Vector3(1,0,0),new THREE.Vector3(-1,0,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,0,-1)]){
    const origin=new THREE.Vector3(c.center[0],1.8,c.center[1]).addScaledVector(direction,c.radius+.05);
    const ray=new THREE.Raycaster(origin,direction.clone().negate(),0,.1);
    const hit=ray.intersectObjects(meshes,false)[0];
    expect(hit,`${c.id} cylinder`).toBeDefined();expect(hit.distance,c.id).toBeCloseTo(.05,2);
   }
   // Nearby room walls can be tangent to the same circle. Identify the actual
   // sixteen-sided column by both endpoints and its apothem, not proximity.
   const columnEdges=model.barriers.filter(b=>b.minY===0&&b.maxY===4.2
    &&Math.abs(Math.hypot(b.a[0]-c.center[0],b.a[1]-c.center[1])-c.radius)<1e-6
    &&Math.abs(Math.hypot(b.b[0]-c.center[0],b.b[1]-c.center[1])-c.radius)<1e-6
    &&Math.abs(distanceToSegment(c.center,b.a,b.b)-c.radius*Math.cos(Math.PI/16))<1e-6);
   expect(columnEdges,c.id).toHaveLength(16);
  }
 });
 it('keeps all Level 4 source columns and room outlines inside its source facade',()=>{
  const footprint=footprintForFloor('4'),columns=structuralColumnLayout('4'),source=FOURTH_COLUMN_TRACE.filter(c=>c.sourceBuilding==='inside');
  expect(footprint).toHaveLength(196);expect(columns).toHaveLength(20);expect(columns).toHaveLength(source.length);
  for(const c of columns){
   const original=source.find(s=>s.id===c.id)!;
   expect(c.center).toEqual(fourthGuidePlan(original.center[0],original.center[1]));
   for(let i=0;i<64;i++){
    const angle=i*Math.PI/32,p:Point=[c.center[0]+c.radius*Math.cos(angle),c.center[1]+c.radius*Math.sin(angle)];
    expect(pointInPolygon(p,footprint),`${c.id} silhouette at ${angle}`).toBe(true);
   }
  }
  for(const room of ROOMS.filter(r=>r.floor==='4'))for(let i=0;i<room.polygon.length;i++){
   const a=room.polygon[i],b=room.polygon[(i+1)%room.polygon.length];
   // Check edge midpoints as well as junctions: a chord joining two facade
   // points can fall outside the envelope at a concave part of its curve.
   for(const p of [a,[(a[0]+b[0])/2,(a[1]+b[1])/2] as Point]){
    expect(pointInPolygon(p,footprint)||Math.min(...footprint.map((v,j)=>distanceToSegment(p,v,footprint[(j+1)%footprint.length])))<1e-8,`${room.id}: ${p}`).toBe(true);
   }
  }
 });
 it('renders every Level 4 source column with matching full-height collision',()=>{
  const model=models.get('4')!;model.group.updateMatrixWorld(true);
  for(const c of structuralColumnLayout('4')){
   for(const direction of [new THREE.Vector3(1,0,0),new THREE.Vector3(-1,0,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,0,-1)]){
    const origin=new THREE.Vector3(c.center[0],1.8,c.center[1]).addScaledVector(direction,c.radius+.05);
    const hit=new THREE.Raycaster(origin,direction.clone().negate(),0,.1).intersectObject(model.group,true)[0];
    expect(hit,`${c.id} cylinder`).toBeDefined();expect(hit.distance,c.id).toBeCloseTo(.05,2);
   }
   const edges=model.barriers.filter(b=>b.minY===0&&b.maxY===4.2
    &&Math.abs(Math.hypot(b.a[0]-c.center[0],b.a[1]-c.center[1])-c.radius)<1e-6
    &&Math.abs(Math.hypot(b.b[0]-c.center[0],b.b[1]-c.center[1])-c.radius)<1e-6
    &&Math.abs(distanceToSegment(c.center,b.a,b.b)-c.radius*Math.cos(Math.PI/16))<1e-6);
   expect(edges,c.id).toHaveLength(16);
  }
 });
 it('renders and contains walking along the Level 4 source facade',()=>{
  const model=models.get('4')!;model.group.updateMatrixWorld(true);
  for(const i of [2,15,40,48,52,70,101,118,140,165,180,190]){
   const a=FOURTH_SOURCE_FOOTPRINT[i],b=FOURTH_SOURCE_FOOTPRINT[(i+1)%FOURTH_SOURCE_FOOTPRINT.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
   const p:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2];let nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
   if(!pointInPolygon([p[0]+nx*.1,p[1]+nz*.1],FOURTH_SOURCE_FOOTPRINT)){nx=-nx;nz=-nz;}
   const hit=new THREE.Raycaster(new THREE.Vector3(p[0]+nx*.15,1.8,p[1]+nz*.15),new THREE.Vector3(-nx,0,-nz),0,.2).intersectObject(model.group,true)[0];
   expect(hit,`pane ${i}`).toBeDefined();expect(hit.distance,`pane ${i}`).toBeCloseTo(.08,2);
   let walker:Position=[p[0]+nx*.7,FLOOR_HEIGHT['4'],p[1]+nz*.7];
   for(let j=0;j<30;j++)walker=walkStep3(walker,[-nx*.04,-nz*.04],f=>models.get(f)!.barriers);
   expect(pointInPolygon([walker[0],walker[2]],FOURTH_SOURCE_FOOTPRINT),`pane ${i}`).toBe(true);
   expect(distanceToSegment([walker[0],walker[2]],a,b),`pane ${i}`).toBeGreaterThan(.2);
  }
 });
 it('renders and contains walking at the Level 2 north, east and south source glass',()=>{
  const model=models.get('2')!;
  for(const i of [70,101,118,140,165,180,190]){
   const a=SECOND_SOURCE_FOOTPRINT[i],b=SECOND_SOURCE_FOOTPRINT[(i+1)%SECOND_SOURCE_FOOTPRINT.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
   const p:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2];let nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
   if(!pointInPolygon([p[0]+nx*.1,p[1]+nz*.1],footprintForFloor('2'))){nx=-nx;nz=-nz;}
   const ray=new THREE.Raycaster(new THREE.Vector3(p[0]+nx*.15,1.8,p[1]+nz*.15),new THREE.Vector3(-nx,0,-nz),0,.2);
   const hit=ray.intersectObject(model.group,true)[0];expect(hit,`pane ${i}`).toBeDefined();expect(hit.distance,`pane ${i}`).toBeCloseTo(.08,2);
   let walker:Position=[p[0]+nx*.7,FLOOR_HEIGHT['2'],p[1]+nz*.7];
   for(let j=0;j<30;j++)walker=walkStep3(walker,[-nx*.04,-nz*.04],f=>models.get(f)!.barriers);
   expect(pointInPolygon([walker[0],walker[2]],footprintForFloor('2')),`pane ${i}`).toBe(true);
   expect(distanceToSegment([walker[0],walker[2]],a,b),`pane ${i}`).toBeGreaterThan(.2);
  }
 });
 it('places the Level 2 west glass and prevents walking through its source curve',()=>{
  const model=models.get('2')!;
  for(const i of [2,15,40,48,52]){
   const a=SECOND_WEST_FACADE[i],b=SECOND_WEST_FACADE[i+1],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
   const p:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2];let nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
   if(!pointInPolygon([p[0]+nx*.1,p[1]+nz*.1],footprintForFloor('2'))){nx=-nx;nz=-nz;}
   const ray=new THREE.Raycaster(new THREE.Vector3(p[0]+nx*.15,1.8,p[1]+nz*.15),new THREE.Vector3(-nx,0,-nz),0,.2);
   const hit=ray.intersectObject(model.group,true)[0];expect(hit).toBeDefined();expect(hit.distance).toBeCloseTo(.08,2);
   let walker:Position=[p[0]+nx*.7,FLOOR_HEIGHT['2'],p[1]+nz*.7];
   for(let j=0;j<30;j++)walker=walkStep3(walker,[-nx*.04,-nz*.04],f=>models.get(f)!.barriers);
   expect(pointInPolygon([walker[0],walker[2]],footprintForFloor('2'))).toBe(true);
   expect(distanceToSegment([walker[0],walker[2]],a,b)).toBeGreaterThan(.2);
  }
 });
 it('renders the newly enclosed west columns with matching collision',()=>{
  const model=models.get('1')!,meshes:THREE.Object3D[]=[];
  model.group.updateMatrixWorld(true);model.group.traverse(o=>{if(o instanceof THREE.Mesh)meshes.push(o);});
  for(const id of ['column-pdf8-92881','column-pdf8-93057']){
   const c=structuralColumnLayout('1').find(c=>c.id===id)!;
   // Cast from outside each face onto the actual cylinder at standing height.
   for(const direction of [new THREE.Vector3(1,0,0),new THREE.Vector3(-1,0,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,0,-1)]){
    const origin=new THREE.Vector3(c.center[0],1.8,c.center[1]).addScaledVector(direction,c.radius+.05);
    const ray=new THREE.Raycaster(origin,direction.clone().negate(),0,.1);
    const hit=ray.intersectObjects(meshes,false)[0];
    expect(hit,`${id} cylinder`).toBeDefined();
    expect(hit.distance).toBeCloseTo(.05,2);
   }
   expect(model.barriers.filter(b=>b.minY===0&&b.maxY===4.2&&Math.abs(distanceToSegment(c.center,b.a,b.b)-c.radius)<.01)).toHaveLength(16);
  }
 });
 it('places the west facade glass and stops walking through it',()=>{
  const model=models.get('1')!;
  // Check the curved cafe facade at multiple source pane joints, including
  // the former clipped column area. Collision and visuals use the same line.
  for(const i of [40,44,48,52]){
   const a=FIRST_WEST_FACADE[i],b=FIRST_WEST_FACADE[i+1],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
   const p:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2];let nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
   if(!pointInPolygon([p[0]+nx*.1,p[1]+nz*.1],footprintForFloor('1'))){nx=-nx;nz=-nz;}
   const ray=new THREE.Raycaster(new THREE.Vector3(p[0]+nx*.15,1.8,p[1]+nz*.15),new THREE.Vector3(-nx,0,-nz),0,.2);
   const hit=ray.intersectObject(model.group,true)[0];
   expect(hit).toBeDefined();expect(hit.distance).toBeCloseTo(.08,2); // wall thickness is .14
   let walker:Position=[p[0]+nx*.7,6.5,p[1]+nz*.7];
   for(let j=0;j<30;j++)walker=walkStep3(walker,[-nx*.04,-nz*.04],f=>models.get(f)!.barriers);
   expect(pointInPolygon([walker[0],walker[2]],footprintForFloor('1'))).toBe(true);
   expect(distanceToSegment([walker[0],walker[2]],a,b)).toBeGreaterThan(.2);
  }
 });
 it('extends the rendered entrance columns down to the sunken floor',()=>{
  const model=models.get('G')!,meshes:THREE.Object3D[]=[];
  model.group.updateMatrixWorld(true);model.group.traverse(o=>{if(o instanceof THREE.Mesh)meshes.push(o);});
  const columns=structuralColumnLayout('G').filter(c=>(amphitheaterHeight(c.center)??0)<0);
  expect(columns).not.toHaveLength(0);
  for(const c of columns){
   const [x,z]=c.center,base=amphitheaterHeight(c.center)!;
   const ray=new THREE.Raycaster(new THREE.Vector3(x+c.radius+.2,base+.12,z),new THREE.Vector3(-1,0,0),0,.25);
   const hits=ray.intersectObjects(meshes,false);
   expect(hits.length,`${c.id} base at ${base}`).toBeGreaterThan(0);
   expect(hits[0].distance,`${c.id} reaches the floor`).toBeCloseTo(.2,3);
   let p:Position=[x+c.radius+.5,base,z];
   for(let i=0;i<25;i++)p=walkStep3(p,[-.04,0],f=>models.get(f)!.barriers);
   expect(p[0]-x,`${c.id} lower-column collision`).toBeGreaterThan(c.radius+.2);
  }
 });
 it('merges every furniture material without dropping geometry',()=>expect(renderingErrors).toEqual([]));
 it('places every room shortcut clear of walls and furniture',()=>{
  for(const room of ROOMS){
   const barriers=models.get(room.floor)!.barriers;
   const arrival=roomArrival(room,barriers);
   expect(arrival,`${room.floor}/${room.id}`).not.toBeNull();
   if(arrival){const h=arrival.height-FLOOR_HEIGHT[room.floor];expect(barriers.every(b=>h>=(b.maxY??Infinity)||h+1.65<=(b.minY??-Infinity)||distanceToSegment(arrival.point,b.a,b.b)>=.42)).toBe(true);}
  }
 });
});

describe('building visibility from other floors',()=>{
 function visibleMeshes(model:InteriorModel){const meshes:THREE.Object3D[]=[];model.group.updateMatrixWorld(true);model.group.traverseVisible(o=>{if(o instanceof THREE.Mesh)meshes.push(o);});return meshes;}
 for(const floor of FLOOR_ORDER.slice(1))it(`keeps the ${floor} slab visible with distant furniture hidden`,()=>{
  const model=models.get(floor)!,[x,z]=plan(625,600);
  try{
   model.setDetailsVisible(false);
   const ray=new THREE.Raycaster(new THREE.Vector3(x,-1,z),new THREE.Vector3(0,1,0),0,2);
   const hit=ray.intersectObjects(visibleMeshes(model),false)[0];
   expect(hit).toBeDefined();expect(hit.point.y).toBeCloseTo(-.19,3);
   expect(((hit.object as THREE.Mesh).material as THREE.Material).name).toBe('Floor slab underside');
  }finally{model.setDetailsVisible(true);}
 });
 it('keeps the auditorium roof and garden deck visible from upper windows',()=>{
  for(const [floor,point,y] of [['G',groundPlan(1360,300),10.5],['1',familyGardenPlan(545,707),0]] as const){
   const model=models.get(floor)!;
   try{
    model.setDetailsVisible(false);
    const ray=new THREE.Raycaster(new THREE.Vector3(point[0],y+.3,point[1]),new THREE.Vector3(0,-1,0),0,.5);
    const hit=ray.intersectObjects(visibleMeshes(model),false)[0];
    expect(hit,`${floor} outdoor surface`).toBeDefined();expect(hit.point.y).toBeCloseTo(y,2);
   }finally{model.setDetailsVisible(true);}
  }
 });
 it('culls and restores furnished detail without rebuilding geometry or collision',()=>{
  const model=models.get('4')!,objects=[...model.group.children],barriers=model.barriers;
  const triangleCount=(objects:THREE.Object3D[])=>objects.reduce((sum,o)=>sum+(o instanceof THREE.Mesh?(o.geometry.index?.count??o.geometry.getAttribute('position').count)/3:0),0);
  const fullCount=triangleCount(visibleMeshes(model));
  try{
   model.setDetailsVisible(false);
   expect(triangleCount(visibleMeshes(model))).toBeLessThan(fullCount*.5);
   expect(model.group.visible).toBe(true);expect(model.barriers).toBe(barriers);
   model.setDetailsVisible(true);
   expect(model.group.children).toEqual(objects);expect(triangleCount(visibleMeshes(model))).toBe(fullCount);
  }finally{model.setDetailsVisible(true);}
 });
});

describe('auditorium seating and circulation',()=>{
 it('matches the drawn bank counts and the 25-degree side-bank fan',()=>{
  const seats=auditoriumSeats('0324').filter(s=>s.row>=0),central=seats.find(s=>s.bank===0)!;
  expect(auditoriumSeats('0324').filter(s=>s.row<0)).toHaveLength(1);
  for(const [bank,count] of [[-1,81],[0,137],[1,80]])expect(seats.filter(s=>s.bank===bank)).toHaveLength(count);
  expect(seats.filter(s=>s.row===1&&s.bank===0)).toHaveLength(11);
  for(const side of [-1,1]){
   const angled=seats.find(s=>s.bank===side)!,dot=angled.width[0]*central.width[0]+angled.width[1]*central.width[1];
   expect(Math.abs(Math.acos(dot)-25*Math.PI/180)).toBeLessThan(.002);
  }
 });
 it('retains standing clearance below the folded timber ceiling across all seating rows',()=>{
  for(const seat of auditoriumSeats('0324')){
   const x=antonovWayfindingCoordinates(seat.point)[0];
   expect(antonovCeilingHeight(x)-seat.height).toBeGreaterThan(1.9);
  }
  const objects=models.get('G')!.group.children;
  for(const x of [1249,1338,1479]){
   const p=antonovWayfinding(x,274),height=antonovHeight(p)!;
   const hits=new THREE.Raycaster(new THREE.Vector3(p[0],height+1.65,p[1]),new THREE.Vector3(0,1,0),0,11).intersectObjects(objects,true);
   const opaque=hits.find(hit=>!((hit.object as THREE.Mesh).material as THREE.Material).transparent);
   expect(((opaque?.object as THREE.Mesh).material as THREE.Material).name).toBe('Antonov folded timber ceiling');
   expect(opaque!.point.y-height).toBeGreaterThan(1.9);
  }
 });
 it('fits the guide chair symbols within the plan outlines',()=>{
  for(const [id,count] of [['0324',299],['0318',98]] as const){
   const seats=auditoriumSeats(id),room=ROOMS.find(r=>r.id===id)!;
   expect(seats).toHaveLength(count);
   for(const seat of seats)expect(pointInPolygon(seat.point,room.polygon)).toBe(true);
  }
 });
 for(const [aisle,route] of ANTONOV_AISLE_ROUTES.entries())for(const reverse of [false,true])it(`walks ${reverse?'down':'up'} the ${aisle===0?'north':'south'} aisle without crossing the room below`,()=>{
  const start=reverse?route.end:route.start,end=reverse?route.start:route.end;
  let position:Position=[start[0],reverse?5.5:0,start[1]];
  for(let i=0;i<1000;i++)position=walkStep3(position,[(end[0]-start[0])/1000,(end[1]-start[1])/1000],floor=>models.get(floor)!.barriers);
  expect(position[0]).toBeCloseTo(end[0],1);expect(position[2]).toBeCloseTo(end[1],1);expect(position[1]).toBeCloseTo(reverse?0:5.5,2);
  expect(pointInPolygon([position[0],position[2]],ANTONOV_FOOTPRINT)).toBe(true);
  expect(antonovHeight([position[0],position[2]])).toBeCloseTo(position[1]);
 });
 for(const [row,name] of [[6,'middle cross-aisle'],[10,'rear aisle']] as const)for(const reverse of [false,true])it(`walks ${reverse?'back through':'across'} the ${name} between all three banks`,()=>{
  const diagramYs=[114,138.7966,146.0016,204.6952,211.9827,242];
  const points=diagramYs.map(y=>{
   const band=ANTONOV_BANDS.find(b=>y>=b.minY&&y<=b.maxY)!,plane=antonovRowPlane(band,row);
   return antonovDiagram(plane.intercept+plane.slope*y-(row===6?2.6:0),y);
  });
  const path=points.map((p):Position=>[p[0],antonovHeight(p)!,p[1]]);
  follow(path.slice(0,-1).map((from,i)=>({from,to:path[i+1],width:1.2,lower:'G',upper:'G'})),reverse);
 });
 it('keeps Antonov desktops outside the mesh chair backs',()=>{
  const desktops:THREE.Mesh[]=[];
  models.get('G')!.group.traverse(object=>{
   if(object instanceof THREE.Mesh&&!Array.isArray(object.material)&&(object.material as THREE.MeshStandardMaterial).color?.getHex()===0xe9e9e4)desktops.push(object);
  });
  expect(desktops.length).toBeGreaterThan(0);
  for(const seat of auditoriumSeats('0324')){
   const p:Point=[seat.point[0]+seat.depth[0]*.28,seat.point[1]+seat.depth[1]*.28];
   const hits=new THREE.Raycaster(new THREE.Vector3(p[0],seat.height+1.13,p[1]),new THREE.Vector3(0,-1,0),0,.62).intersectObjects(desktops,false);
   expect(hits,`desktop through chair back in bank ${seat.bank}/row ${seat.row}`).toEqual([]);
  }
 });
});

describe('Antonov outdoor stair',()=>{
 it('preserves reddish masonry color independently of the recessed-joint height map',()=>{
  let masonry:THREE.MeshStandardMaterial|undefined;
  models.get('G')!.group.traverse(object=>{if(object instanceof THREE.Mesh&&!Array.isArray(object.material)&&object.material.name==='Iribe brick masonry')masonry=object.material;});
  expect(masonry).toBeDefined();expect(masonry!.map!.source).not.toBe(masonry!.bumpMap!.source);
  const pixels=(masonry!.map as THREE.DataTexture).image.data as Uint8Array;
  let red=0,green=0;for(let i=0;i<pixels.length;i+=4){red+=pixels[i];green+=pixels[i+1];}
  expect((red-green)/(pixels.length/4)).toBeGreaterThan(20);
 });
 for(const reverse of [false,true])it(`walks ${reverse?'down':'up'} all three flights and both intermediate landings`,()=>{
  const route=ANTONOV_EXTERIOR_ROUTE;
  follow(route.slice(0,-1).map((from,i)=>({from,to:route[i+1],width:1.2,lower:'G',upper:'G'})),reverse);
 });
 it('renders the support surface used for every tread and landing',()=>{
  const model=models.get('G')!;
  for(const [x,y,z] of ANTONOV_EXTERIOR_ROUTE){
   expect(antonovExteriorHeight([x,z])).toBeCloseTo(y,6);
   const hits=new THREE.Raycaster(new THREE.Vector3(x,y+.1,z),new THREE.Vector3(0,-1,0),0,.15).intersectObject(model.group,true);
   expect(hits.length).toBeGreaterThan(0);expect(hits[0].point.y).toBeCloseTo(y+.004,3);
  }
  expect(ANTONOV_EXTERIOR_ROUTE.at(-1)![1]).toBeCloseTo(ANTONOV_EXTERIOR_TOP,6);
 });
 it('keeps the stair open overhead instead of enclosing it with a slab or ceiling',()=>{
  const meshes:THREE.Mesh[]=[];
  const originalY=new Map([...models].map(([floor,model])=>[floor,model.group.position.y]));
  for(const [floor,model] of models){
   model.group.position.y=FLOOR_HEIGHT[floor];
   model.group.updateMatrixWorld(true);model.group.traverse(object=>{if(object instanceof THREE.Mesh&&!((object.material as THREE.Material).transparent))meshes.push(object);});
  }
  try{
   for(const [x,y,z] of ANTONOV_EXTERIOR_ROUTE){
    const hits=new THREE.Raycaster(new THREE.Vector3(x,y+.02,z),new THREE.Vector3(0,1,0),.01,1.85).intersectObjects(meshes,false);
    expect(hits.length,`headroom at ${x}/${y}/${z}`).toBe(0);
   }
  }finally{for(const [floor,model] of models){model.group.position.y=originalY.get(floor)!;model.group.updateMatrixWorld(true);}}
 });
 it('provides a clear start and guards the unfinished upper continuation',()=>{
  const barriers=models.get('G')!.barriers,[x,y,z]=ANTONOV_EXTERIOR_ROUTE[0];
  expect(barriers.some(b=>y+.18<(b.maxY??10.5)&&y+1.65>(b.minY??0)&&distanceToSegment([x,z],b.a,b.b)<.42)).toBe(false);
  const last=ANTONOV_EXTERIOR_PIECES.at(-1)!,a=last.to[0],b=last.to[1];
  expect(barriers.some(wall=>wall.a===a&&wall.b===b&&wall.minY===ANTONOV_EXTERIOR_TOP)).toBe(true);
 });
});

describe('Gannon tiered aisles',()=>{
 it('retains both native east pairs and the drawn step opening',()=>{
  expect(GANNON_PAIR_THRESHOLDS).toHaveLength(2);expect(GANNON_DOOR_LEAVES).toHaveLength(4);
  expect(GANNON_STEP_EDGE).toBeGreaterThanOrEqual(0);
  for(const leaf of GANNON_DOOR_LEAVES){expect(leaf.maxJoinGapPt).toBeLessThan(.002);expect(leaf.outline).toHaveLength(4);}
 });
 for(const reverse of [false,true])it(`walks ${reverse?'back to':'from'} the lobby through the east corridor`,()=>{
  const pair=GANNON_PAIR_THRESHOLDS[1],nx=-(pair.b[1]-pair.a[1])/pair.width,nz=(pair.b[0]-pair.a[0])/pair.width;
  const offset=(t:number):Point=>[pair.center[0]+nx*t,pair.center[1]+nz*t];
  const points=[groundGuidePlan(375,320),groundGuidePlan(395,290),groundGuidePlan(420,230),groundGuidePlan(429,195),offset(-3),offset(-.8),pair.center,offset(.8)];
  const path=reverse?[...points].reverse():points;
  let position:Position=[path[0][0],gannonHeight(path[0])??0,path[0][1]];
  for(const end of path.slice(1)){
   const start=position,count=Math.ceil(Math.hypot(end[0]-start[0],end[1]-start[2])/.03);
   for(let i=0;i<count;i++)position=walkStep3(position,[(end[0]-start[0])/count,(end[1]-start[2])/count],f=>models.get(f)!.barriers);
   expect(position[0],`corridor to ${end}: ${position}`).toBeCloseTo(end[0],1);expect(position[2]).toBeCloseTo(end[1],1);expect(position[1]).toBeCloseTo(0,2);
  }
 });
 for(const pair of GANNON_PAIR_THRESHOLDS)for(const reverse of [false,true])it(`walks ${reverse?'out':'in'} through the ${pair.id} native doorway`,()=>{
  const room=ROOMS.find(r=>r.id==='0318')!,{a,b,center,width}=pair;
  let nx=-(b[1]-a[1])/width,nz=(b[0]-a[0])/width;
  if(!pointInPolygon([center[0]+nx*.3,center[1]+nz*.3],room.polygon)){nx=-nx;nz=-nz;}
  const inside:Point=[center[0]+nx*1.2,center[1]+nz*1.2],outside:Point=[center[0]-nx,center[1]-nz];
  const start=reverse?inside:outside,end=reverse?outside:inside;
  let position:Position=[start[0],gannonHeight(start)??0,start[1]];
  for(let i=0;i<200;i++)position=walkStep3(position,[(end[0]-start[0])/200,(end[1]-start[1])/200],f=>models.get(f)!.barriers);
  expect(position[0],JSON.stringify({pair:pair.id,position,end})).toBeCloseTo(end[0],1);
  expect(position[2]).toBeCloseTo(end[1],1);expect(position[1]).toBeCloseTo(gannonHeight(end)??0,2);
 });
 it('uses the guide symbol count separately from published occupancy',()=>{
  expect(GANNON_CHAIRS.filter(c=>c.role==='student')).toHaveLength(97);
  expect(GANNON_CHAIRS.filter(c=>c.role==='presenter')).toHaveLength(1);expect(GANNON_TABLES).toHaveLength(19);
 });
 it('retains rendered support and standing headroom along both native aisles',()=>{
  const model=models.get('G')!;
  for(const {start,end} of GANNON_AISLE_ROUTES)for(let i=0;i<=24;i++){
   const p:Point=[start[0]+(end[0]-start[0])*i/24,start[1]+(end[1]-start[1])*i/24],h=gannonHeight(p)!;
   const up=new THREE.Raycaster(new THREE.Vector3(p[0],h+.18,p[1]),new THREE.Vector3(0,1,0),0,1.47);
   expect(up.intersectObject(model.group,true),`Gannon body at ${p}/${h}`).toHaveLength(0);
   const down=new THREE.Raycaster(new THREE.Vector3(p[0],h+.08,p[1]),new THREE.Vector3(0,-1,0),0,.1);
   expect(down.intersectObject(model.group,true).length,`Gannon floor at ${p}/${h}`).toBeGreaterThan(0);
  }
 });
 it('keeps the lower-room ceiling out of the upper Antonov standing volume',()=>{
  const shell=models.get('G')!.group.children.filter(o=>o.userData.interiorLayer==='shell');
  for(const seat of auditoriumSeats('0324').filter(s=>pointInPolygon(s.point,ROOMS.find(r=>r.id==='0318')!.polygon))){
   const up=new THREE.Raycaster(new THREE.Vector3(seat.point[0],seat.height+.18,seat.point[1]),new THREE.Vector3(0,1,0),0,1.47);
   expect(up.intersectObjects(shell,true).length,`Antonov standing body at ${seat.point}/${seat.height}`).toBe(0);
  }
 });
 for(const [index,aisle] of GANNON_AISLE_ROUTES.entries())for(const reverse of [false,true])it(`walks ${reverse?'down':'up'} the native ${index} aisle below Antonov`,()=>{
  const start=reverse?aisle.end:aisle.start,end=reverse?aisle.start:aisle.end;
  let position:Position=[start[0],GANNON_FRONT_HEIGHT+(reverse?.9:0),start[1]];
  for(let i=0;i<500;i++)position=walkStep3(position,[(end[0]-start[0])/500,(end[1]-start[1])/500],floor=>models.get(floor)!.barriers);
  expect(position[0]).toBeCloseTo(end[0],1);expect(position[2]).toBeCloseTo(end[1],1);expect(position[1]).toBeCloseTo(GANNON_FRONT_HEIGHT+(reverse?0:.9),2);
  expect(gannonHeight([position[0],position[2]])).toBeCloseTo(position[1]);
 });
 it('keeps seats on their platforms in both auditoriums',()=>{
  for(const id of ['0318','0324'])for(const seat of auditoriumSeats(id))expect((id==='0318'?gannonHeight:antonovHeight)(seat.point)).toBeCloseTo(seat.height);
 });
 it('keeps Gannon desktops out of the chair back area',()=>{
  const objects=models.get('G')!.group.children;
  for(const seat of auditoriumSeats('0318')){
   const point:Point=[seat.point[0]+seat.depth[0]*.28,seat.point[1]+seat.depth[1]*.28];
   const hits=new THREE.Raycaster(new THREE.Vector3(point[0],seat.height+1.13,point[1]),new THREE.Vector3(0,-1,0),0,.62).intersectObjects(objects,true);
   expect(hits.filter(hit=>((hit.object as THREE.Mesh).material as THREE.MeshStandardMaterial).color?.getHex()===0xe9e9e4),`desktop through row ${seat.row} back at ${seat.point}`).toEqual([]);
  }
 });
});


describe('rooftop circulation',()=>{
 function route(points:Point[]){
  let position:Position=[points[0][0],FLOOR_HEIGHT.R,points[0][1]];
  for(const end of points.slice(1)){
   const start=position,count=Math.ceil(Math.hypot(end[0]-start[0],end[1]-start[2])/.04);
   for(let i=0;i<count;i++)position=walkStep3(position,[(end[0]-start[0])/count,(end[1]-start[2])/count],f=>models.get(f)!.barriers);
   expect(position[0],`route to ${end}`).toBeCloseTo(end[0],1);
   expect(position[2],`route to ${end}`).toBeCloseTo(end[1],1);
  }
  return position;
 }
 it('keeps planting and the water feature within the roof outline',()=>{
  for(const polygon of [ROOF_LAWN,ROOF_POOL,...ROOF_BEDS])for(const point of polygon)expect(pointInPolygon(point,ROOF_PUBLIC_FOOTPRINT),`roof feature at ${point}`).toBe(true);
 });
 it('connects the stair landing to the foyer',()=>{
  const top=ENCLOSED_FLIGHTS.filter(f=>f.upper==='R').at(-1)!.to;
  const door=northStairDoor('R'),inside:Point=[door[0]-NORTH_STAIR_FRAME.u[0]*.65,door[1]-NORTH_STAIR_FRAME.u[1]*.65];
  // Leave the top flight across its east landing and actual doorway. The
  // former fitted waypoint was inside the new shaft's floor opening.
  const east=NORTH_STAIR_FRAME.length-.7;
  route([[top[0],top[2]],NORTH_STAIR_FRAME.at(NORTH_STAIR_FRAME.uv([top[0],top[2]])[0],east),NORTH_STAIR_FRAME.at(NORTH_STAIR_FRAME.uv(inside)[0],east),inside,door,stairEntry('R'),plan(578,925),plan(578,915)]);
 });
 for(const [index,side] of ['west','east'].entries())it(`walks through the ${side} terrace door onto the raised lawn and back`,()=>{
  const door=ROOF_DOORS[index],a=ROOF_FACADE[door.edge],b=ROOF_FACADE[door.edge+1],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  let nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
  if(pointInPolygon([door.center[0]+nx*.2,door.center[1]+nz*.2],ROOF_FOYER)){nx=-nx;nz=-nz;}
  const inside:Point=[door.center[0]-nx*1.4,door.center[1]-nz*1.4],outside:Point=[door.center[0]+nx*1.4,door.center[1]+nz*1.4];
  const pts:Point[]=index===0?[plan(578,915),plan(578,820),inside,door.center,outside,roofPlan(820,835),roofPlan(900,880)]:[plan(578,915),plan(722,900),inside,door.center,outside,roofPlan(700,977),roofPlan(820,970),roofPlan(900,900)];
  const end=route(pts);expect(end[1]).toBeCloseTo(FLOOR_HEIGHT.R+.15);
  let position=end;
  for(const target of pts.slice(0,-1).reverse()){
   const start=position;for(let i=0;i<400;i++)position=walkStep3(position,[(target[0]-start[0])/400,(target[1]-start[2])/400],f=>models.get(f)!.barriers);
   expect(position[0]).toBeCloseTo(target[0],1);expect(position[2]).toBeCloseTo(target[1],1);
  }
  expect(position[1]).toBeCloseTo(FLOOR_HEIGHT.R);
 });
 it('preserves the plan orientation and north stair alignment',()=>{
  const corner=roofPlan(1106,786),across=roofPlan(1088,1025),stair=roofPlan(575,750);
  expect(corner[0]).toBeCloseTo(plan(515,449)[0]);expect(corner[1]).toBeCloseTo(plan(515,449)[1]);
  expect(across[0]).toBeCloseTo(plan(740,449)[0]);expect(across[1]).toBeCloseTo(plan(740,449)[1]);
  expect(stair[0]).toBeCloseTo(plan(536,865)[0]);expect(stair[1]).toBeCloseTo(plan(536,865)[1]);
  const p=roofPlan(700,850),x=roofPlan(701,850),y=roofPlan(700,851);
  expect((x[0]-p[0])*(y[1]-p[1])-(x[1]-p[1])*(y[0]-p[0])).toBeGreaterThan(0);
 });
 it('keeps the pool and garden outside the gallery enclosure',()=>{
  for(const polygon of [ROOF_LAWN,ROOF_POOL,...ROOF_BEDS])for(const point of polygon)expect(pointInPolygon(point,ROOF_OUTDOOR),`outdoor feature at ${point}`).toBe(true);
 });
 it('prevents walking through the water-feature curb',()=>{
  const start=roofPlan(802,912),end=roofPlan(756,912);let position:Position=[start[0],FLOOR_HEIGHT.R,start[1]];
  for(let i=0;i<500;i++)position=walkStep3(position,[(end[0]-start[0])/500,(end[1]-start[1])/500],f=>models.get(f)!.barriers);
  expect(pointInPolygon([position[0],position[2]],ROOF_POOL)).toBe(false);
  expect(Math.hypot(position[0]-end[0],position[2]-end[1])).toBeGreaterThan(.4);
 });
 it('places the terrace shortcut on the raised lawn surface',()=>{
  const room=ROOMS.find(r=>r.id==='reisse-park')!,arrival=roomArrival(room,models.get('R')!.barriers)!;
  expect(pointInPolygon(arrival.point,ROOF_LAWN)).toBe(true);
  expect(arrival.height).toBeCloseTo(FLOOR_HEIGHT.R+.15);
 });
 it('reaches the gallery through its door',()=>{
  const door=ROOF_GALLERY.door;
  route([plan(578,915),[plan(578,791)[0],door[1]],door,[door[0]+.6,door[1]]]);
 });
});


describe('fourth-floor offices and corridors',()=>{
 for(const reverse of [false,true])it(`walks ${reverse?'back from':'to'} the far-west lounge along the office corridor`,()=>{
  // The source post at native [205.162,392.598] stands in this corridor.
  // Walk its north aisle between the post and the enclosed stair wall.
  let route:Point[]=[fourthPlan(650,801),fourthPlan(430,772),fourthPlan(390,772),...[[1045,710],[940,674],[692,550],[620,480],[312,210],[242,163]].map(([x,y])=>westFourthPlan(x,y))];
  if(reverse)route=[...route].reverse();
  let position:Position=[route[0][0],FLOOR_HEIGHT['4'],route[0][1]];
  for(const target of route.slice(1)){
   const start=position;for(let i=0;i<500;i++)position=walkStep3(position,[(target[0]-start[0])/500,(target[1]-start[2])/500],f=>models.get(f)!.barriers);
   const near=models.get('4')!.barriers.filter(b=>distanceToSegment([position[0],position[2]],b.a,b.b)<.5);
   expect(position[0],JSON.stringify({target,position,near})).toBeCloseTo(target[0],1);expect(position[2],JSON.stringify({target,position,near})).toBeCloseTo(target[1],1);
  }
 });

 const rooms=ROOMS.filter(r=>r.floor==='4'&&(r.kind==='office'||r.kind==='workroom'||r.kind==='restroom'||r.id.startsWith('4-core-room')));
 it('keeps office windows on the building envelope',()=>{
  const footprint=footprintForFloor('4');
  for(const room of rooms)for(const p of room.polygon)expect(pointInPolygon(p,footprint)||footprint.some((a,i)=>distanceToSegment(p,a,footprint[(i+1)%footprint.length])<.01),room.id).toBe(true);
 });
 for(const room of rooms)it(`walks through every doorway in ${room.id}`,()=>{
  for(const door of [room.door,...(room.additionalDoors??[])]){
   const edges=room.polygon.map((a,i)=>({a,b:room.polygon[(i+1)%room.polygon.length]}));
   const {a,b}=edges.sort((a,b)=>distanceToSegment(door,a.a,a.b)-distanceToSegment(door,b.a,b.b))[0];
   const length=Math.hypot(b[0]-a[0],b[1]-a[1]);let nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
   if(!pointInPolygon([door[0]+nx*.3,door[1]+nz*.3],room.polygon)){nx=-nx;nz=-nz;}
   const outside:Point=[door[0]-nx*.65,door[1]-nz*.65],inside:Point=[door[0]+nx*.65,door[1]+nz*.65];
   let position:Position=[outside[0],FLOOR_HEIGHT['4'],outside[1]];
   for(const target of [inside,outside]){
    const start=position;for(let i=0;i<100;i++)position=walkStep3(position,[(target[0]-start[0])/100,(target[1]-start[2])/100],f=>models.get(f)!.barriers);
    expect(position[0]).toBeCloseTo(target[0],1);expect(position[2]).toBeCloseTo(target[1],1);
   }
  }
 });
 for(const [name,from,to] of [
  ['west',[650,801],[1040,852.48]],['east',[620,953],[1040,953]],
 ] as const)it(`keeps the ${name} corridor open to the north lounge`,()=>{
  const a=fourthPlan(from[0],from[1]),b=fourthPlan(to[0],to[1]);let position:Position=[a[0],FLOOR_HEIGHT['4'],a[1]];
  for(let i=0;i<1000;i++)position=walkStep3(position,[(b[0]-a[0])/1000,(b[1]-a[1])/1000],f=>models.get(f)!.barriers);
  expect(position[0]).toBeCloseTo(b[0],1);expect(position[2]).toBeCloseTo(b[1],1);
 });
});


describe('Small Artifacts Lab circulation',()=>{
 const room=ROOMS.find(r=>r.id==='0102')!,f=labFrame(room);
 it('keeps every equipment footprint inside the traced room',()=>{
  const barriers:InteriorModel['barriers']=[],materials:THREE.Material[]=[];
  const base=new THREE.MeshBasicMaterial();
  buildSmallArtifacts(room,{box(){},cylinder(){},put(g){g.dispose();},palette:{white:base,oak:base,metal:base,glass:base,black:base,light:base},materials,barriers});
  for(const barrier of barriers)for(const p of [barrier.a,barrier.b])expect(pointInPolygon(p,room.polygon),`equipment at ${p}`).toBe(true);
  materials.forEach(m=>m.dispose());base.dispose();
 });
 for(const reverse of [false,true])it(`walks ${reverse?'out of':'into'} the lab and across its central aisle`,()=>{
  const route=[[4.1,-1],[4.1,2.4],[7.1,2.4],[4.1,2.4],[1.5,2.4]].map(([x,z])=>f.at(x,z));
  if(reverse)route.reverse();
  let position:Position=[route[0][0],0,route[0][1]];
  for(let j=1;j<route.length;j++){
   const a=route[j-1],end=route[j],count=Math.ceil(Math.hypot(end[0]-a[0],end[1]-a[1])/.04);
   for(let i=0;i<count;i++)position=walkStep3(position,[(end[0]-a[0])/count,(end[1]-a[1])/count],floor=>models.get(floor)!.barriers);
   expect(position[0]).toBeCloseTo(end[0],2);expect(position[2]).toBeCloseTo(end[1],2);expect(position[1]).toBe(0);
  }
 });
});


describe('Brin aerial robotics lab',()=>{
 const room=ROOMS.find(r=>r.id==='0108')!,f=labFrame(room);
 it('fits the published flight area and height into the room outline',()=>{
  const area=Math.abs(DRONE_CAGE.reduce((sum,a,i)=>{const b=DRONE_CAGE[(i+1)%DRONE_CAGE.length];return sum+a[0]*b[1]-b[0]*a[1];},0))/2;
  expect(area).toBeCloseTo(DRONE_CAGE_AREA,6);
  expect(DRONE_CAGE_WIDTH/.3048).toBeCloseTo(24,6);expect(DRONE_CAGE_DEPTH/.3048).toBeCloseTo(18,6);expect(DRONE_CAMERAS).toHaveLength(12);
  expect(DRONE_CAGE_HEIGHT).toBeCloseTo(4.572,6);
  for(const p of DRONE_CAGE)expect(pointInPolygon(f.at(...p),room.polygon)).toBe(true);
 });
 for(const reverse of [false,true])it(`walks ${reverse?'out of':'into'} the cage through the net opening`,()=>{
  const gate=(DRONE_GATE[0]+DRONE_GATE[1])/2;
  const doorU=(room.door[0]-room.polygon[0][0])*f.u[0]+(room.door[1]-room.polygon[0][1])*f.u[1];
  const route=[[doorU,-.8],[doorU,1.45],[gate,1.45],[gate,4]].map(([x,z])=>f.at(x,z));if(reverse)route.reverse();
  let position:Position=[route[0][0],0,route[0][1]];
  for(let j=1;j<route.length;j++){
   const a=route[j-1],end=route[j],count=Math.ceil(Math.hypot(end[0]-a[0],end[1]-a[1])/.04);
   for(let i=0;i<count;i++)position=walkStep3(position,[(end[0]-a[0])/count,(end[1]-a[1])/count],floor=>models.get(floor)!.barriers);
   expect(position[0]).toBeCloseTo(end[0],2);expect(position[2]).toBeCloseTo(end[1],2);
  }
 });
 it('leaves the side aisle to the repair bench clear',()=>{
  const route=[[4.6,.38],[7.75,.38],[7.75,4.9]].map(([x,z])=>f.at(x,z));let position:Position=[route[0][0],0,route[0][1]];
  for(let j=1;j<route.length;j++){
   const a=route[j-1],end=route[j],count=Math.ceil(Math.hypot(end[0]-a[0],end[1]-a[1])/.04);
   for(let i=0;i<count;i++)position=walkStep3(position,[(end[0]-a[0])/count,(end[1]-a[1])/count],floor=>models.get(floor)!.barriers);
   expect(position[0]).toBeCloseTo(end[0],2);expect(position[2]).toBeCloseTo(end[1],2);
  }
 });
 it('stops a walker at the closed portion of the net',()=>{
  const a=f.at(3.5,DRONE_CAGE[0][1]-.5),end=f.at(3.5,DRONE_CAGE[0][1]+.5);let position:Position=[a[0],0,a[1]];
  for(let i=0;i<100;i++)position=walkStep3(position,[(end[0]-a[0])/100,(end[1]-a[1])/100],floor=>models.get(floor)!.barriers);
  expect(Math.hypot(position[0]-end[0],position[2]-end[1])).toBeGreaterThan(.65);
 });
});


describe('Robotics Manipulator Lab',()=>{
 const room=ROOMS.find(r=>r.id==='0116')!,f=labFrame(room);
 it('includes the documented inventory with all station footprints inside the room',()=>{
  expect(ROBOT_STATIONS.map(s=>s.kind).sort()).toEqual(['baxter','kuka','kuka','sawyer','ur3e','ur3e','ur5e']);
  const barriers:InteriorModel['barriers']=[],materials:THREE.Material[]=[];const base=new THREE.MeshBasicMaterial();
  buildRoboticsLab(room,{box(){},cylinder(){},put(g){g.dispose();},palette:{white:base,oak:base,metal:base,glass:base,black:base,light:base},materials,barriers});
  for(const barrier of barriers)for(const p of [barrier.a,barrier.b])expect(pointInPolygon(p,room.polygon),`station at ${p}`).toBe(true);
  materials.forEach(m=>m.dispose());base.dispose();
 });
 for(const reverse of [false,true])it(`walks ${reverse?'out of':'into'} the lab and between the robot stations`,()=>{
  const doorU=(room.door[0]-room.polygon[0][0])*f.u[0]+(room.door[1]-room.polygon[0][1])*f.u[1];
  const route=[[doorU,-1],[doorU,1.6],[4.3,2.5],[4.3,4.4],[5.9,4.4],[5.9,7.3]].map(([x,z])=>f.at(x,z));if(reverse)route.reverse();
  let position:Position=[route[0][0],0,route[0][1]];
  for(let j=1;j<route.length;j++){
   const a=route[j-1],end=route[j],count=Math.ceil(Math.hypot(end[0]-a[0],end[1]-a[1])/.04);
   for(let i=0;i<count;i++)position=walkStep3(position,[(end[0]-a[0])/count,(end[1]-a[1])/count],floor=>models.get(floor)!.barriers);
   expect(position[0]).toBeCloseTo(end[0],2);expect(position[2]).toBeCloseTo(end[1],2);expect(position[1]).toBe(0);
  }
 });
});


describe('Breakpoint Café access',()=>{
 for(const reverse of [false,true])it(`walks ${reverse?'back':'along'} the full public counter aisle`,()=>{
  const a=cafePoint(reverse?CAFE_LENGTH-.4:.4,1.1),end=cafePoint(reverse?.4:CAFE_LENGTH-.4,1.1);let position:Position=[a[0],0,a[1]];
  for(let i=0;i<400;i++)position=walkStep3(position,[(end[0]-a[0])/400,(end[1]-a[1])/400],floor=>models.get(floor)!.barriers);
  expect(position[0]).toBeCloseTo(end[0],2);expect(position[2]).toBeCloseTo(end[1],2);expect(position[1]).toBe(0);
 });
 it('blocks walking through the counter and display glass',()=>{
  const a=cafePoint(3,.7),end=cafePoint(3,-.7);let position:Position=[a[0],0,a[1]];
  for(let i=0;i<100;i++)position=walkStep3(position,[(end[0]-a[0])/100,(end[1]-a[1])/100],floor=>models.get(floor)!.barriers);
  expect(Math.hypot(position[0]-end[0],position[2]-end[1])).toBeGreaterThan(.85);
 });
});


it('keeps all curved lounge seating and coffee tables inside the ground-floor envelope',()=>{
 const barriers:InteriorModel['barriers']=[],materials:THREE.Material[]=[],textures:THREE.Texture[]=[];const base=new THREE.MeshBasicMaterial();
 buildLobbySeating({box(){},cylinder(){},surface(){},wall(){},label(){},put(g){g.dispose();},contact(){},palette:{white:base,oak:base,metal:base,glass:base,black:base,light:base},materials,textures,barriers});
 for(const barrier of barriers)for(const p of [barrier.a,barrier.b])expect(pointInPolygon(p,footprintForFloor('G')),`lounge fixture at ${p}`).toBe(true);
 materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());base.dispose();
});

it('closes the lounge-side auditorium below the upper brick shell',()=>{
 const model=models.get('G')!;model.group.updateMatrixWorld(true);
 const lounge=ROOMS.find(r=>r.id==='lobby-lounge')!,arrival=roomArrival(lounge,model.barriers)!;
 const yaw=arrival.yaw+.25,direction=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
 // The reported view exposed upper tiers through the missing Ground curve.
 // These eye-height rays must meet masonry before those tiers and the far
 // Gannon enclosure, while the actual door-route tests check the open gaps.
 for(const height of [1.35,2.1,3.2]){
  const ray=new THREE.Raycaster(new THREE.Vector3(arrival.point[0],height,arrival.point[1]),direction,0,25);
  const hit=ray.intersectObject(model.group,true).find(h=>!(h.object as THREE.Mesh<THREE.BufferGeometry,THREE.Material>).material.transparent);
  expect(hit,`lounge auditorium face at ${height}`).toBeDefined();
  expect((hit!.object as THREE.Mesh<THREE.BufferGeometry,THREE.Material>).material.name).toBe('Iribe brick masonry');
 }
});

it('shows brick on the lobby and seating-bank faces of the amphitheater enclosure',()=>{
 const model=models.get('G')!;model.group.updateMatrixWorld(true);
 for(const side of [-1,1]){
  const p=amphPoint(3,side*.75),ray=new THREE.Raycaster(new THREE.Vector3(p[0],2.1,p[1]),new THREE.Vector3(-AMPH_V[0]*side,0,-AMPH_V[1]*side),0,2);
  const hit=ray.intersectObjects(model.group.children,false).find(h=>!(h.object as THREE.Mesh<THREE.BufferGeometry,THREE.Material>).material.transparent);
  expect(hit).toBeDefined();
  expect((hit!.object as THREE.Mesh<THREE.BufferGeometry,THREE.Material>).material.name).toBe('Iribe brick masonry');
 }
});


function walkInteriorTargets(room:typeof ROOMS[number],targets:Point[][],gridStep?:number,within?:(p:Point)=>boolean){
  const step=gridStep??(room.kind==='restroom'?.1:.25),minX=Math.min(...room.polygon.map(p=>p[0])),minZ=Math.min(...room.polygon.map(p=>p[1]));
  const maxX=Math.max(...room.polygon.map(p=>p[0])),maxZ=Math.max(...room.polygon.map(p=>p[1]));
  const local=FLOOR_ORDER.flatMap(f=>models.get(f)!.barriers.map(b=>({...b,minY:(b.minY??0)+FLOOR_HEIGHT[f]-FLOOR_HEIGHT[room.floor],maxY:(b.maxY??(f==='G'?10.5:f==='R'?1.2:4.2))+FLOOR_HEIGHT[f]-FLOOR_HEIGHT[room.floor]}))).filter(b=>(b.minY??0)<1.65&&(b.maxY??Infinity)>0&&Math.max(b.a[0],b.b[0])>=minX-.5&&Math.min(b.a[0],b.b[0])<=maxX+.5&&Math.max(b.a[1],b.b[1])>=minZ-.5&&Math.min(b.a[1],b.b[1])<=maxZ+.5);
  const free=new Map<string,Point>();
  for(let i=0;i*step<=maxX-minX;i++)for(let j=0;j*step<=maxZ-minZ;j++){
   const p:Point=[minX+i*step,minZ+j*step];
   if(pointInPolygon(p,room.polygon)&&(!within||within(p))&&local.every(b=>distanceToSegment(p,b.a,b.b)>.26))free.set(`${i},${j}`,p);
  }
  const start=[...free].sort((a,b)=>Math.hypot(a[1][0]-room.door[0],a[1][1]-room.door[1])-Math.hypot(b[1][0]-room.door[0],b[1][1]-room.door[1]))[0];
  expect(start).toBeDefined();expect(Math.hypot(start[1][0]-room.door[0],start[1][1]-room.door[1])).toBeLessThan(.55);
  const parents=new Map<string,string|null>([[start[0],null]]),queue=[start[0]];
  for(let head=0;head<queue.length;head++){
   const key=queue[head],[i,j]=key.split(',').map(Number);
   for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const next=`${i+di},${j+dj}`;
    if(free.has(next)&&!parents.has(next)){parents.set(next,key);queue.push(next);}
   }
  }
  for(const approaches of targets){
   const end=queue.find(key=>approaches.some(p=>Math.hypot(p[0]-free.get(key)![0],p[1]-free.get(key)![1])<.4));
   expect(end,`${room.id}: target group ${targets.indexOf(approaches)} is unreachable; ${JSON.stringify(approaches)}; reached ${queue.length}/${free.size}`).toBeDefined();
   const path:Point[]=[];let key:string|null=end!;
   while(key!==null){path.push(free.get(key)!);key=parents.get(key)!;}path.reverse();
   let position:Position=[path[0][0],FLOOR_HEIGHT[room.floor],path[0][1]];
   for(const target of (room.kind==='garden'?[...path.slice(1),...path.slice(0,-1).reverse()]:path.slice(1))){
    position=walkStep3(position,[target[0]-position[0],target[1]-position[2]],f=>models.get(f)!.barriers);
    expect(position[0]).toBeCloseTo(target[0],2);expect(position[2]).toBeCloseTo(target[1],2);
   }
  }
}

it('walks around every source-traced lobby furniture group',()=>{
 const lounge=ROOMS.find(r=>r.id==='lobby-lounge')!;
 // This open area has no room walls. The test includes the whole traced
 // furniture region, beyond the older semantic shortcut's smaller polygon.
 const area={...lounge,polygon:[[229,301],[365,301],[365,388],[229,388]].map(([x,y])=>groundGuidePlan(x,y)),door:lounge.door};
 const targets:Point[][]=LOBBY_CHAIRS.map(c=>[-.8,0,.8].map(offset=>[
  c.center[0]-Math.sin(c.angle+offset)*.72,c.center[1]-Math.cos(c.angle+offset)*.72,
 ] as Point));
 for(const sofa of LOBBY_SOFAS){
  const cx=sofa.seat.reduce((sum,p)=>sum+p[0],0)/sofa.seat.length,cz=sofa.seat.reduce((sum,p)=>sum+p[1],0)/sofa.seat.length;
  targets.push(sofa.seat.filter((_,i)=>i%8===0).map(p=>{const l=Math.hypot(p[0]-cx,p[1]-cz);return [p[0]+(p[0]-cx)/l*.55,p[1]+(p[1]-cz)/l*.55] as Point;}));
 }
 for(const table of LOBBY_TABLES)targets.push(Array.from({length:12},(_,i)=>[table.center[0]+Math.cos(i*Math.PI/6)*(table.radius+.55),table.center[1]+Math.sin(i*Math.PI/6)*(table.radius+.55)] as Point));
 walkInteriorTargets(area,targets,.2);
});

describe('conference seating circulation',()=>{
 for(const room of ROOMS.filter(r=>r.kind==='conference'&&MEETING_CAPACITIES[r.id]))it(`walks from the door to every seating position in ${room.id}`,()=>{
  const table=meetingTable(room);expect(table).not.toBeNull();if(!table)return;
  const targets=meetingSeats(room,table).map(({point,angle})=>[[point[0]+Math.sin(angle)*.58,point[1]+Math.cos(angle)*.58] as Point]);
  walkInteriorTargets(room,targets,.1);
 });
});

describe('fourth-floor shared workroom furniture',()=>{
 const rooms=ROOMS.filter(r=>r.floor==='4'&&r.deskBanks);
 for(const room of rooms)it(`reaches every desk bank from the doorway in ${room.id}`,()=>{
  walkInteriorTargets(room,room.deskBanks!.map(bank=>{
   const length=Math.hypot(bank.to[0]-bank.from[0],bank.to[1]-bank.from[1]),ux=(bank.to[0]-bank.from[0])/length,uz=(bank.to[1]-bank.from[1])/length;
   return [[bank.from[0]-ux*.65,bank.from[1]-uz*.65],[bank.to[0]+ux*.65,bank.to[1]+uz*.65]];
  }));
 });

 for(const room of rooms)it(`fits the traced desk banks and seating in ${room.id}`,()=>{
  const banks=room.deskBanks!.map(bank=>{
   const length=Math.hypot(bank.to[0]-bank.from[0],bank.to[1]-bank.from[1]),ux=(bank.to[0]-bank.from[0])/length,uz=(bank.to[1]-bank.from[1])/length;
   const at=(u:number,v:number):Point=>[(bank.from[0]+bank.to[0])/2+ux*u-uz*v,(bank.from[1]+bank.to[1])/2+uz*u+ux*v];
   return {...bank,length,at,polygon:[at(-length/2,-.625),at(length/2,-.625),at(length/2,.625),at(-length/2,.625)]};
  });
  banks.forEach((bank,index)=>{
   for(const p of bank.polygon)expect(pointInPolygon(p,room.polygon),`${room.id} bank ${index} corner ${p}`).toBe(true);
   for(const side of [-1,1])for(let i=0;i<bank.seatsPerSide;i++){
    const p=bank.at(((i+.5)/bank.seatsPerSide-.5)*bank.length,side*1.05);
    expect(pointInPolygon(p,room.polygon),`${room.id} chair ${index}/${side}/${i}`).toBe(true);
    expect(Math.min(...room.polygon.map((a,j)=>distanceToSegment(p,a,room.polygon[(j+1)%room.polygon.length]))),`${room.id} chair against wall`).toBeGreaterThan(.4);
    for(const other of banks.filter(b=>b!==bank)){
     expect(pointInPolygon(p,other.polygon),`${room.id} chair inside another desk`).toBe(false);
     for(const otherSide of [-1,1])for(let k=0;k<other.seatsPerSide;k++){
      const q=other.at(((k+.5)/other.seatsPerSide-.5)*other.length,otherSide*1.05);
      expect(Math.hypot(p[0]-q[0],p[1]-q[1]),`${room.id} overlapping chairs ${index}/${side}/${i} and ${banks.indexOf(other)}/${otherSide}/${k}`).toBeGreaterThan(.55);
     }
     expect(Math.min(...other.polygon.map((a,j)=>distanceToSegment(p,a,other.polygon[(j+1)%other.polygon.length]))),`${room.id} chair overlapping another desk`).toBeGreaterThan(.3);
    }
   }
  });
 });
});


describe('restroom fixtures',()=>{
 for(const room of ROOMS.filter(r=>r.kind==='restroom')){
  it(`keeps all fixtures and partitions inside ${room.id}`,()=>{
   const barriers:InteriorModel['barriers']=[],materials:THREE.Material[]=[],textures:THREE.Texture[]=[];
   const base=new THREE.MeshBasicMaterial();
   buildRestroom(room,{box(){},cylinder(){},surface(){},wall(a,b,h,_m,collision=true,base=0){if(collision)barriers.push({a,b,minY:base,maxY:base+h});},label(){},put(g){g.dispose();},palette:{white:base,oak:base,metal:base,glass:base,black:base,light:base},materials,textures,barriers});
   const outside=barriers.flatMap(wall=>[wall.a,wall.b]).filter(p=>!pointInPolygon(p,room.polygon)&&!room.polygon.some((a,i)=>distanceToSegment(p,a,room.polygon[(i+1)%room.polygon.length])<.02));
   expect(outside,`${room.id} fixtures outside walls`).toEqual([]);
   materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());base.dispose();
  });
  it(`connects the entry to all stalls and sinks in ${room.id}`,()=>{
   const data=RESTROOM_PLANS[room.id as keyof typeof RESTROOM_PLANS],row=restroomFrame(room,data.back[0],data.back[1]),sinks=restroomFrame(room,data.sinks[0],data.sinks[1]);
   const targets:Point[][]=restroomStalls(data,row.length).map(stall=>[row.at(stall.center,stall.depth-.3)]);
   for(let i=0;i<data.sinkCount;i++)targets.push([sinks.at((i+.5)*sinks.length/data.sinkCount,.98)]);
   walkInteriorTargets(room,targets);
  });
  it(`walks through every open stall doorway in ${room.id}`,()=>{
   const data=RESTROOM_PLANS[room.id as keyof typeof RESTROOM_PLANS],f=restroomFrame(room,data.back[0],data.back[1]);
   for(const [i,stall] of restroomStalls(data,f.length).entries()){
    const x=stall.center,start=f.at(x,stall.depth+.32),inside=f.at(x,stall.depth-.3);
    let position:Position=[start[0],FLOOR_HEIGHT[room.floor],start[1]];
    for(const target of [inside,start]){
     const from=position;for(let j=0;j<100;j++)position=walkStep3(position,[(target[0]-from[0])/100,(target[1]-from[2])/100],floor=>models.get(floor)!.barriers);
     expect(position[0],`${room.id} stall ${i}`).toBeCloseTo(target[0],1);expect(position[2],`${room.id} stall ${i}`).toBeCloseTo(target[1],1);
    }
   }
  });
 }
});


describe('amphitheater split-level floor',()=>{
 for(const [name,start,end] of [
  ['south',amphPoint(-.6,AMPH_DEPTH+.8),amphPoint(AMPH_WIDTH+.6,AMPH_DEPTH+.8)],
  ['north',amphPoint(AMPH_NORTH_AISLE+1,-.45),amphPoint(AMPH_NORTH_AISLE+1,3.6)],
 ] as const)for(const reverse of [false,true])it(`walks ${reverse?'up':'down'} the ${name} stair`,()=>{
  const from:Position=[start[0],0,start[1]],to:Position=[end[0],-AMPH_DROP,end[1]];
  follow([{from,to,width:1,lower:'G',upper:'G'}],reverse);
 });
 it('connects the lower entrance through the north return to the atrium in both directions',()=>{
  const path:Position[]=[[ENTRY[0],-AMPH_DROP,ENTRY[1]]];
  for(const [u,v,h] of [[8.5,4,-AMPH_DROP],[8.5,-.45,0]]){const p=amphPoint(u,v);path.push([p[0],h,p[1]]);}
  const route:Flight[]=path.slice(0,-1).map((from,i)=>({from,to:path[i+1],width:1,lower:'G',upper:'G'}));
  follow(route);follow(route,true);
  // Continue around the native enclosed shaft through clear, level lounge
  // floor. The former straight line crossed its walls. Find and actually walk
  // a route with the existing body clearance, in both directions.
  const upper=path.at(-1)!,approach=atriumStairApproach(),first=ATRIUM_FLIGHTS[0].from;
  const corridor={...ROOMS.find(r=>r.id==='lobby-lounge')!,kind:'garden' as const,door:[upper[0],upper[2]] as Point,
   polygon:[[175,315],[370,315],[370,450],[175,450]].map(([x,y])=>groundGuidePlan(x,y))};
  walkInteriorTargets(corridor,[[[approach[0],approach[2]]],[[first[0],first[2]]]],.2,p=>Math.abs(supportHeight(p,0)??Infinity)<.001);
 });
 it('collides with the column below the main lobby elevation',()=>{
  const start=amphPoint(6.4,2.5),end=amphPoint(6.4,-.1);let p:Position=[start[0],-AMPH_DROP,start[1]];
  for(let i=0;i<200;i++)p=walkStep3(p,[(end[0]-start[0])/200,(end[1]-start[1])/200],f=>models.get(f)!.barriers);
  const column=amphPoint(6.4,1);expect(Math.hypot(p[0]-column[0],p[2]-column[1])).toBeGreaterThanOrEqual(.54);
  expect(Math.hypot(p[0]-start[0],p[2]-start[1])).toBeLessThan(1.1);
 });
 it('starts at the lower entrance floor',()=>expect(amphitheaterHeight(ENTRY)).toBe(-AMPH_DROP));
 it('does not walk through the fronts of the seating tiers',()=>{
  const start=amphPoint(AMPH_WIDTH+.3,5);
  let p:Position=[start[0],-AMPH_DROP,start[1]];
  const target=amphPoint(-1,5);
  for(let i=0;i<300;i++)p=walkStep3(p,[(target[0]-start[0])/300,(target[1]-start[1])/300],f=>models.get(f)!.barriers);
  expect(Math.hypot(p[0]-target[0],p[2]-target[1])).toBeGreaterThan(3);
 });
});


describe('upper floor slab undersides',()=>{
 for(const floor of FLOOR_ORDER.filter(f=>f!=='G'))it(`blocks the view through the underside of level ${floor}`,()=>{
  const mesh=models.get(floor)!.group.children.find(c=>c instanceof THREE.Mesh&&(c.material as THREE.Material).name==='Floor slab underside') as THREE.Mesh;
  expect(mesh).toBeDefined();
  const p=plan(625,600),ray=new THREE.Raycaster(new THREE.Vector3(p[0],-.5,p[1]),new THREE.Vector3(0,1,0),0,1);
  const hits=ray.intersectObject(mesh);expect(hits.length).toBeGreaterThan(0);expect(hits[0].point.y).toBeCloseTo(-.19,4);
 });
});

describe('first-floor family garden',()=>{
 it('keeps planting beds on the deck and outside the auditorium',()=>{
  for(const bed of FAMILY_BEDS)for(const p of bed){
   expect(pointInPolygon(p,FAMILY_TERRACE),`bed vertex ${p}`).toBe(true);
   expect(pointInPolygon(p,ANTONOV_FOOTPRINT),`auditorium overlap ${p}`).toBe(false);
  }
 });
 it('places the maples inside their planting beds',()=>{
  FAMILY_MAPLES.forEach(p=>expect(FAMILY_BEDS.some(bed=>pointInPolygon(p,bed))).toBe(true));
 });
 it('connects the corridor and terrace through the open glazed doorway',()=>{
  const d=FAMILY_GARDEN_DOOR,path:Position[]=[[d[0]+1.5,6.5,d[1]],[d[0]-.01,6.5,d[1]],[d[0]-1.6,6.5,d[1]]];
  const route:Flight[]=path.slice(0,-1).map((from,i)=>({from,to:path[i+1],width:1,lower:'1',upper:'1'}));follow(route);follow(route,true);
 });
 it('walks around the planters from the entrance to the far terrace and back',()=>{
  const targets:Point[][]=[[545,707],[581,619],[729,627]].map(([x,y])=>[familyGardenPlan(x,y)]);
  // Public viewpoints are inside the outer guard, not in the planted strip.
  for(const {a,b} of FAMILY_GARDEN_GUARD_EDGES)for(const t of [.25,.6,.85]){
   const length=Math.hypot(b[0]-a[0],b[1]-a[1]),p:Point=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];let nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
   if(!pointInPolygon([p[0]+nx*.1,p[1]+nz*.1],FAMILY_TERRACE)){nx=-nx;nz=-nz;}
   targets.push([[p[0]+nx*.8,p[1]+nz*.8]]);
  }
  walkInteriorTargets(FAMILY_GARDEN,targets);
 });
});


it('opens the garden glazing through the auditorium wall',()=>{
 const center:Point=[ANTONOV_FOOTPRINT.reduce((s,p)=>s+p[0],0)/ANTONOV_FOOTPRINT.length,ANTONOV_FOOTPRINT.reduce((s,p)=>s+p[1],0)/ANTONOV_FOOTPRINT.length];
 for(const runId of ['northeast-to-east-return','east-middle-room-band','east-south-room-band']){
  const segments=ANTONOV_SHELL_EDGES.filter(e=>!e.join&&e.runId===runId),edge=segments[Math.floor(segments.length/2)];
  const {a,b}=edge,p:Point=[a[0]*.43+b[0]*.57,a[1]*.43+b[1]*.57],length=Math.hypot(b[0]-a[0],b[1]-a[1]);let nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
  if(nx*(p[0]-center[0])+nz*(p[1]-center[1])<0){nx=-nx;nz=-nz;}
  const ray=new THREE.Raycaster(new THREE.Vector3(p[0]+nx*.35,7.7,p[1]+nz*.35),new THREE.Vector3(-nx,0,-nz),0,.7);
  const hits=ray.intersectObject(models.get('G')!.group,true);
  expect(hits.length).toBeGreaterThan(0);expect(((hits[0].object as THREE.Mesh).material as THREE.Material).name).toBe('Auditorium garden glazing');
 }
});

describe('Sandbox studio layout and circulation',()=>{
 it('fits every workstation inside its documented studio or common area',()=>{
  for(const station of SANDBOX_STATIONS){
   const room=station.room==='1231'?SANDBOX_COMMON:SANDBOX_STUDIOS.find(r=>r.id===station.room)!;
   for(const point of sandboxStationFootprint(station))expect(pointInPolygon(point,room.polygon),`${station.kind} in ${station.room} at ${point}`).toBe(true);
  }
 });
 it('connects the suite entrance to every studio and equipment station and back',()=>{
  const suite={...SANDBOX_COMMON,kind:'garden' as const,polygon:[[205,25],[885,95],[835,593],[205,593]].map(([x,y])=>sandboxPlan(x,y))};
  const targets=SANDBOX_STATIONS.map(station=>[-1,1].map(side=>sandboxStationPoint(station,0,side*(station.depth/2+.6))));
  walkInteriorTargets(suite,targets);
 });
});


describe('Level 1 north corridor',()=>{
 it('registers the stair and elevator cores and keeps office walls outside the stair opening',()=>{
  expect(firstGuidePlan(607/2,760/2)).toEqual(STAIR_CENTER);
  const elevator=firstNorthPlan(392,859);expect(elevator[0]).toBeCloseTo(ELEVATOR[0],8);expect(elevator[1]).toBeCloseTo(ELEVATOR[1],8);
  for(const room of FIRST_OFFICES)for(const p of room.polygon)expect(pointInPolygon(p,STAIR_HOLE),room.id).toBe(false);
 });
 it('preserves the independent Level 2 core registration across the Level 1 seams',()=>{
  for(const x of [0,200,400,600,800,1000])for(const y of [0,200,400,650]){
   const actual=secondCorePoint(firstCorePlan(x,y)),expected=plan(585+(x-400)*12/450+(y-145)*144/492,838-(x-400)*103/450);
   expect(actual[0]).toBeCloseTo(expected[0],7);expect(actual[1]).toBeCloseTo(expected[1],7);
  }
 });

 for(const room of [...FIRST_OFFICES,...SANDBOX_SUPPORT.filter(r=>r.id==='1214')])it(`connects ${room.id} doorway to its desk and guest seating`,()=>{
  const f=firstOfficeFurniture(room);
  const targets=f.chairs.map(chair=>[0,1,2,3].map(i=>[chair.point[0]+Math.sin(i*Math.PI/2)*.55,chair.point[1]+Math.cos(i*Math.PI/2)*.55] as Point));
  walkInteriorTargets(room,targets,.1);
 });

 for(const [index,door] of [FIRST_CLASSROOM.door,...(FIRST_CLASSROOM.additionalDoors??[])].entries())it(`walks through classroom 1207 door ${index+1} in both directions`,()=>{
  const polygon=FIRST_CLASSROOM.polygon;
  const edge=polygon.map((a,i)=>({a,b:polygon[(i+1)%polygon.length]})).sort((a,b)=>distanceToSegment(door,a.a,a.b)-distanceToSegment(door,b.a,b.b))[0];
  const length=Math.hypot(edge.b[0]-edge.a[0],edge.b[1]-edge.a[1]),normal:Point=[-(edge.b[1]-edge.a[1])/length,(edge.b[0]-edge.a[0])/length];
  const sign=pointInPolygon([door[0]+normal[0]*.5,door[1]+normal[1]*.5],polygon)?1:-1;
  const from:Position=[door[0]-normal[0]*sign*.7,FLOOR_HEIGHT['1'],door[1]-normal[1]*sign*.7],to:Position=[door[0]+normal[0]*sign*.8,FLOOR_HEIGHT['1'],door[1]+normal[1]*sign*.8];
  const path:Flight[]=[{from,to,width:1.15,lower:'1',upper:'1'}];follow(path);follow(path,true);
 });
 it('connects classroom 1207, storage, the manager office, restrooms, and the Sandbox in both directions',()=>{
  const classroom=ROOMS.find(r=>r.id==='1207')!;
  const corridor={...classroom,kind:'garden' as const,polygon:[[516,450],[739,450],[811,1090],[506,1090]].map(([x,y])=>plan(x,y))};
  walkInteriorTargets(corridor,[...FIRST_RESTROOMS,SANDBOX_COMMON,...SANDBOX_SUPPORT,...FIRST_OFFICES].map(room=>[roomArrival(room,models.get('1')!.barriers)!.point]));
 });
 it('keeps classroom 1207 distinct from the service block',()=>{
  const rooms=[FIRST_CLASSROOM,...FIRST_RESTROOMS,...SANDBOX_SUPPORT,...SANDBOX_STUDIOS,...FIRST_OFFICES];
  for(const room of rooms)for(const other of rooms.filter(r=>r!==room)){
   for(let i=0;i<room.polygon.length;i++){
    const a=room.polygon[i],b=room.polygon[(i+1)%room.polygon.length];
    for(const t of [.1,.5,.9]){
     const p:Point=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
     const deep=pointInPolygon(p,other.polygon)&&other.polygon.every((c,j)=>distanceToSegment(p,c,other.polygon[(j+1)%other.polygon.length])>.12);
     expect(deep,`${room.id} overlaps ${other.id}`).toBe(false);
    }
   }
  }
 });
 it('connects both classroom doors and all nine table groups',()=>{
  const room=FIRST_CLASSROOM;
  const targets=FIRST_CLASSROOM_TABLES.map(p=>[0,1,2,3].map(i=>[p[0]+Math.sin(i*Math.PI/2)*1.7,p[1]+Math.cos(i*Math.PI/2)*1.7] as Point));
  for(const door of room.additionalDoors??[])targets.push([roomArrival({...room,door},models.get('1')!.barriers)!.point]);
  walkInteriorTargets(room,targets,.1);
 });
 for(const room of SANDBOX_SUPPORT.filter(r=>r.kind==='service'))it(`keeps ${room.id} cabinets inside and reachable`,()=>{
  const f=supportCabinetFrame(room)!;
  for(const x of [0,f.length])for(const z of [0,.52])expect(pointInPolygon(f.at(x,z),room.polygon)).toBe(true);
  walkInteriorTargets(room,[[f.at(f.length/2,1.05)]],.1);
 });
});


describe('Level 2 north corridor',()=>{
 it('connects classroom 2207 to both restrooms and back',()=>{
  const classroom=ROOMS.find(r=>r.id==='2207')!;
  const corridor={...classroom,kind:'garden' as const,polygon:[[516,450],[739,450],[805,1050],[508,1050]].map(([x,y])=>plan(x,y))};
  walkInteriorTargets(corridor,SECOND_RESTROOMS.map(room=>[roomArrival(room,models.get('2')!.barriers)!.point]));
 });
});


describe('Hatchery and Level 2 north offices',()=>{
 it('places the collaboration shortcut in the common area, outside enclosed rooms',()=>{
  const arrival=roomArrival(HATCHERY_COMMON,models.get('2')!.barriers)!;
  expect(arrival).toBeDefined();expect(pointInPolygon(arrival.point,HATCHERY_COMMON.polygon)).toBe(true);
  expect(HATCHERY_ROOMS.some(room=>pointInPolygon(arrival.point,room.polygon))).toBe(false);
  expect(pointInPolygon([arrival.point[0]-Math.sin(arrival.yaw)*2,arrival.point[1]-Math.cos(arrival.yaw)*2],HATCHERY_COMMON.polygon)).toBe(true);
 });
 it('keeps furniture and chairs within their rooms',()=>{
  for(const room of [HATCHERY_COMMON,...HATCHERY_ROOMS.filter(r=>r.kind==='workroom')]){
   const barriers:InteriorModel['barriers']=[],materials:THREE.Material[]=[],textures:THREE.Texture[]=[],base=new THREE.MeshBasicMaterial();
   buildHatchery(room.id,{box(){},cylinder(){},surface(){},wall(){},label(){},put(g){g.dispose();},palette:{white:base,oak:base,metal:base,glass:base,black:base,light:base},materials,textures,barriers});
   const outside=barriers.flatMap(wall=>[wall.a,wall.b]).filter(p=>!pointInPolygon(p,room.polygon));
   expect(outside,room.id).toEqual([]);
   for(const barrier of barriers){
    for(const p of [barrier.a,barrier.b])expect(pointInPolygon(p,footprintForFloor('2')),`${room.id} building boundary`).toBe(true);
    for(const column of structuralColumnLayout('2'))expect(distanceToSegment(column.center,barrier.a,barrier.b),`${room.id}/${column.id} furniture separation`).toBeGreaterThan(column.radius+.01);
   }
   materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());base.dispose();
  }
 });
 it('keeps common-area furniture clear of the offices and workrooms',()=>{
  for(const item of HATCHERY_ITEMS.filter(item=>item.room===HATCHERY_COMMON.id))for(const p of hatcheryItemFootprint(item))expect(HATCHERY_ROOMS.some(room=>pointInPolygon(p,room.polygon))).toBe(false);
 });
 it('connects classroom 2207 to both workrooms, every office, and every shared furniture zone',()=>{
  const classroom=ROOMS.find(r=>r.id==='2207')!,suite={...classroom,kind:'garden' as const,polygon:[[516,450],[739,450],[805,1050],[508,1050]].map(([x,y])=>plan(x,y))};
  const targets:Point[][]=HATCHERY_ROOMS.map(room=>[roomArrival(room,models.get('2')!.barriers)!.point]);
  for(const item of HATCHERY_ITEMS){const f=hatcheryItemFrame(item);targets.push(item.kind==='desk'?[f.at(0,item.depth/2+.95)]:item.kind==='windowbar'?[f.at(0,1.2)]:item.kind==='round'?[f.at(item.width/2+1,0),f.at(-item.width/2-1,0),f.at(0,item.depth/2+1),f.at(0,-item.depth/2-1)]:[f.at(0,item.depth/2+1),f.at(0,-item.depth/2-1)]);}
  for(const room of HATCHERY_ROOMS.filter(room=>room.kind==='office')){
   // Check approaches to the chairs actually rendered in each room. A fixed
   // point 2.4 m from the window can sit inside a meeting chair after alignment.
   for(const chair of officeFurniture(room).chairs)targets.push([0,1,2,3].map(i=>[chair.point[0]+Math.cos(i*Math.PI/2)*.6,chair.point[1]+Math.sin(i*Math.PI/2)*.6] as Point).filter(p=>pointInPolygon(p,room.polygon)));
  }
  walkInteriorTargets(suite,targets,.1);
 },60000);
});


describe('4105 large seminar presentation system',()=>{
 const room=ROOMS.find(r=>r.id==='4105')!;
 it('keeps the lectern and wall hardware inside and clear of the entrance',()=>{
  const f=seminarAVLayout(room);
  const points=[...f.lecternFootprint,f.projector,f.presenter,f.audience,...[-1.65,1.65].map(x=>f.front.at(x,.27)),...[-.96,.96].map(x=>f.rear.at(x,.28)),f.front.at(2.15,.38)];
  for(const p of points){expect(pointInPolygon(p,room.polygon)).toBe(true);expect(Math.hypot(p[0]-room.door[0],p[1]-room.door[1])).toBeGreaterThan(1);}
 });
 it('connects both corridor doorways to the presentation area and both sides of the lectern',()=>{
  const f=seminarAVLayout(room);
  walkInteriorTargets(room,[[f.presenter],[f.audience],...(room.additionalDoors??[]).map(p=>[p]),...[-1,1].map(side=>[f.front.at(f.lecternX+side*.95,f.lecternZ)])],.1);
 });
 it('models AV barriers at equipment height and a finite static control surface',()=>{
  const barriers:InteriorModel['barriers']=[],materials:THREE.Material[]=[],textures:THREE.Texture[]=[],base=new THREE.MeshBasicMaterial();
  let badGeometry=false;
  buildSeminarAV(room,{box(){},cylinder(){},surface(){},wall(){},label(){},put(g){const p=g.getAttribute('position');for(let i=0;i<p.count;i++)if(!Number.isFinite(p.getX(i)+p.getY(i)+p.getZ(i)))badGeometry=true;g.dispose();},palette:{white:base,oak:base,metal:base,glass:base,black:base,light:base},materials,textures,barriers});
  expect(badGeometry).toBe(false);expect(textures).toHaveLength(1);
  expect(barriers.filter(b=>b.minY===0)).toHaveLength(4);
  expect(barriers.filter(b=>b.minY!>1)).toHaveLength(3);
  expect(roomArrival(room,models.get('4')!.barriers)).not.toBeNull();
  materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());base.dispose();
 });
});


const westStairRoute=(s:typeof WEST_STAIR):Flight[]=>{
 const pos=(p:Point,f:FloorId):Position=>[p[0],FLOOR_HEIGHT[f],p[1]];
 const edge=(from:Position,to:Position):Flight=>({from,to,width:s.flightWidth,lower:s.lower,upper:s.upper});
 const bottom=pos(s.at(s.width*.75,s.doorZ),s.lower),top=pos(s.landing,s.upper);
 return [edge(pos(s.entry,s.lower),bottom),edge(bottom,s.flights[0].from),...s.flights,edge(s.flights.at(-1)!.to,top),edge(top,pos(s.entry,s.upper))];
};
for(const s of WEST_STAIRS)describe(`west enclosed stair ${s.lower}–${s.upper}`,()=>{
 const route=westStairRoute(s);
 it('walks from the lower corridor through both flights to the upper corridor',()=>follow(route));
 it('walks back down to the lower corridor',()=>follow(route,true));
 it('fits between rooms inside the building',()=>{
  for(const floor of [s.lower,s.upper])for(const p of [...s.shaft,s.entry,s.door]){
   expect(pointInPolygon(p,footprintForFloor(floor))).toBe(true);
   // A shaft corner may touch an adjoining room wall; entrances must remain outside rooms.
   expect(ROOMS.filter(r=>r.floor===floor&&pointInPolygon(p,r.polygon)&&(!s.shaft.includes(p)||Math.min(...r.polygon.map((a,i)=>distanceToSegment(p,a,r.polygon[(i+1)%r.polygon.length])))>1e-7)).map(r=>r.id),`room overlap ${floor}/${p}`).toEqual([]);
  }
 });
});
describe('continuous west stair',()=>{
 const route=WEST_STAIRS.flatMap(westStairRoute);
 it('walks from Ground through every intermediate landing to Level 5',()=>follow(route));
 it('walks back from Level 5 through every landing to Ground',()=>follow(route,true));
 it('keeps every corridor approach outside source column body clearance',()=>{
  for(const floor of WEST_STAIR_FLOORS){
   const s=westStairForFloor(floor)!;
   for(const column of structuralColumnLayout(floor))expect(Math.hypot(s.entry[0]-column.center[0],s.entry[1]-column.center[1]),`${floor}/${column.id}`).toBeGreaterThan(column.radius+.24);
  }
 });
 it('provides headroom through every upper slab, ceiling and stacked flight',()=>{
  const meshes:THREE.Object3D[]=[];
  for(const floor of WEST_STAIR_FLOORS){const m=models.get(floor)!;m.group.position.y=FLOOR_HEIGHT[floor];m.group.updateMatrixWorld(true);m.group.traverse(o=>{if(o instanceof THREE.Mesh)meshes.push(o);});}
  try{
   for(const f of WEST_STAIRS.flatMap(s=>s.flights))for(const t of [.1,.5,.9]){
    const p=f.from.map((v,i)=>v+(f.to[i]-v)*t);
    const ray=new THREE.Raycaster(new THREE.Vector3(p[0],p[1]+.2,p[2]),new THREE.Vector3(0,1,0),0,1.7);
    expect(ray.intersectObjects(meshes,false),`headroom at ${p}`).toHaveLength(0);
   }
  }finally{for(const floor of WEST_STAIR_FLOORS){const m=models.get(floor)!;m.group.position.y=0;m.group.updateMatrixWorld(true);}}
 });
});

describe('west stair fixture mounting',()=>{
 for(const floor of WEST_STAIR_FLOORS)it(`attaches the landing lights to actual walls on ${floor}`,()=>{
  const base=new THREE.MeshBasicMaterial(),light=new THREE.MeshBasicMaterial(),materials:THREE.Material[]=[];
  const fixtures:{point:Point;height:number}[]=[],walls:{a:Point;b:Point;base:number;top:number}[]=[];
  try{
   buildWestStair(floor,{
    box(x,y,z,_w,_h,_d,material){if(material===light)fixtures.push({point:[x,z],height:y});},
    cylinder(){},surface(){},label(){},put(g){g.dispose();},
    wall(a,b,h,_material,_collision,base=0){walls.push({a,b,base,top:base+h});},
    palette:{white:base,oak:base,metal:base,glass:base,black:base,light},materials,textures:[],barriers:[],
   });
   expect(fixtures.length).toBeGreaterThan(0);
   for(const f of fixtures)expect(walls.some(w=>f.height>w.base&&f.height<w.top&&distanceToSegment(f.point,w.a,w.b)<.25),`unsupported landing light at ${floor}/${f.point}/${f.height}`).toBe(true);
  }finally{materials.forEach(m=>m.dispose());base.dispose();light.dispose();}
 });
});


describe('west stair support rooms',()=>{
 for(const room of WEST_SUPPORT_ROOMS){
  it(`${room.id} is inside the floor and separate from neighboring rooms`,()=>{
   for(const p of room.polygon){
    expect(pointInPolygon(p,footprintForFloor('4'))).toBe(true);
    expect(pointInPolygon(p,WEST_STAIR.shaft)&&Math.min(...WEST_STAIR.shaft.map((a,i)=>distanceToSegment(p,a,WEST_STAIR.shaft[(i+1)%4])))>.02,`${room.id} overlaps the stair`).toBe(false);
    expect(ROOMS.filter(r=>r.floor==='4'&&r!==room&&pointInPolygon(p,r.polygon)&&Math.min(...r.polygon.map((a,i)=>distanceToSegment(p,a,r.polygon[(i+1)%r.polygon.length])))>.02).map(r=>r.id)).toEqual([]);
   }
  });
  it(`walks through ${room.id} to the center`,()=>{
   const center:Point=[room.polygon.reduce((s,p)=>s+p[0],0)/room.polygon.length,room.polygon.reduce((s,p)=>s+p[1],0)/room.polygon.length];
   walkInteriorTargets(room,[[center],...(room.additionalDoors??[]).map(p=>[p])]);
   const run=westSupportCounter(room.id);
   if(run){
    const side=(center[0]-run.center[0])*(-run.u[1])+(center[1]-run.center[1])*run.u[0]>0?1:-1;
    const approaches=[.2,.5,.8].map(t=>[run.a[0]+run.u[0]*run.length*t-run.u[1]*.65*side,run.a[1]+run.u[1]*run.length*t+run.u[0]*.65*side] as Point);
    for(const p of [run.a,run.b,...approaches])expect(pointInPolygon(p,room.polygon)).toBe(true);
    walkInteriorTargets(room,approaches.map(p=>[p]),.1);
   }
  });
 }
});


it('connects the west stair, support rooms, and shared workroom through the corridor',()=>{
 const corridor={...WEST_SUPPORT_ROOMS[0],id:'west-core-corridor',kind:'garden' as const,door:WEST_STAIR.entry,polygon:[[120,160],[850,160],[850,900],[120,900]].map(([x,y])=>westFourthPlan(x,y))};
 const targets=[...WEST_SUPPORT_ROOMS.flatMap(r=>[r.door,...r.additionalDoors??[]]),...WEST_HUDDLE_ROOMS.map(r=>r.door),ROOMS.find(r=>r.id==='4-west-shared-room')!.door];
 walkInteriorTargets(corridor,targets.map(p=>[p]));
},15000);


it('keeps the closed west lift solid and clear of the stair entrance',()=>{
 const f=WEST_LIFT_FRONT;
 for(const p of WEST_LIFT){expect(pointInPolygon(p,footprintForFloor('4'))).toBe(true);expect(pointInPolygon(p,WEST_STAIR.shaft)).toBe(false);}
 expect(models.get('4')!.barriers.some(b=>distanceToSegment(f.center,b.a,b.b)<.01&&(b.maxY??4.2)>1.65)).toBe(true);
 expect(Math.min(...WEST_LIFT.map((p,i)=>distanceToSegment(WEST_STAIR.entry,p,WEST_LIFT[(i+1)%4])))).toBeGreaterThan(.4);
});


describe('Level 5 north studio and storage island',()=>{
 for(const room of FIFTH_NORTH_SUPPORT_ROOMS){
  it(`keeps ${room.id} clear of other rooms`,()=>{
   for(const p of room.polygon){
    expect(pointInPolygon(p,footprintForFloor('5'))).toBe(true);
    expect(ROOMS.filter(r=>r.floor==='5'&&r!==room&&pointInPolygon(p,r.polygon)&&Math.min(...r.polygon.map((a,i)=>distanceToSegment(p,a,r.polygon[(i+1)%r.polygon.length])))>.02).map(r=>r.id)).toEqual([]);
   }
  });
  it(`provides a clear doorway and usable interior in ${room.id}`,()=>{
   const arrival=roomArrival(room,models.get('5')!.barriers);expect(arrival).not.toBeNull();
   const f=firstOfficeFrame(room);
   walkInteriorTargets(room,[[f.at(-1.45,1.65)],[f.at(1.45,1.65)]]);
  });
 }
});


it('connects all four Level 5 north support enclosures to room 5237',()=>{
 const corridor={...FIFTH_NORTH_SUPPORT_ROOMS[0],id:'5-north-support-corridor',kind:'garden' as const,door:ROOMS.find(r=>r.id==='5237')!.door,polygon:[[530,583],[750,583],[750,728],[530,728]].map(([x,y])=>plan(x,y))};
 walkInteriorTargets(corridor,FIFTH_NORTH_SUPPORT_ROOMS.map(r=>[r.door]));
},15000);


it('places the north office shortcut on clear corridor floor',()=>{
 expect(pointInPolygon(FIFTH_NORTH_OFFICE_ENTRY,footprintForFloor('5'))).toBe(true);
 expect(models.get('5')!.barriers.every(b=>(b.minY??0)>=1.65||(b.maxY??4.2)<=0||distanceToSegment(FIFTH_NORTH_OFFICE_ENTRY,b.a,b.b)>.42)).toBe(true);
});


describe('Level 5 perimeter office corridors',()=>{
 it('reaches every new office from the north corridor',()=>{
  const corridor={...FIFTH_NORTH_SUPPORT_ROOMS[0],id:'5-perimeter-corridor',kind:'garden' as const,door:FIFTH_NORTH_OFFICE_ENTRY,polygon:[[520,590],[800,590],[800,890],[520,890]].map(([x,y])=>plan(x,y))};
  walkInteriorTargets(corridor,FIFTH_PERIMETER_OFFICES.map(r=>[r.door]),.2);
 },20000);
 for(const room of FIFTH_PERIMETER_OFFICES)it(`${room.id} has a clear entrance without overlapping other rooms`,()=>{
  expect(roomArrival(room,models.get('5')!.barriers)).not.toBeNull();
  for(const p of room.polygon){
   expect(ROOMS.filter(r=>r.floor==='5'&&r!==room&&pointInPolygon(p,r.polygon)&&Math.min(...r.polygon.map((a,i)=>distanceToSegment(p,a,r.polygon[(i+1)%r.polygon.length])))>.02).map(r=>r.id)).toEqual([]);
  }
 });
});


for(const room of FIFTH_PERIMETER_OFFICES)it(`walks from the corridor into the working aisle in ${room.id}`,()=>{
 const f=firstOfficeFrame(room);
 walkInteriorTargets(room,[[f.at(-.9,2.55)],[f.at(.9,2.55)]]);
});


describe('Level 5 central service enclosures',()=>{
 for(const room of FIFTH_SERVICE_ROOMS)it(`enters ${room.id} without crossing furniture or walls`,()=>{
  const center:Point=[room.polygon.reduce((s,p)=>s+p[0],0)/4,room.polygon.reduce((s,p)=>s+p[1],0)/4];
  walkInteriorTargets(room,[[center]]);
  for(const p of room.polygon){
   expect(pointInPolygon(p,FIFTH_SERVICE_SHAFT)).toBe(false);
   expect(ROOMS.filter(r=>r.floor==='5'&&r!==room&&pointInPolygon(p,r.polygon)&&Math.min(...r.polygon.map((a,i)=>distanceToSegment(p,a,r.polygon[(i+1)%r.polygon.length])))>.02).map(r=>r.id)).toEqual([]);
  }
 });
 it('encloses the service shaft on all sides',()=>{
  const barriers=models.get('5')!.barriers;
  FIFTH_SERVICE_SHAFT.forEach((p,i)=>{const q=FIFTH_SERVICE_SHAFT[(i+1)%FIFTH_SERVICE_SHAFT.length],mid:Point=[(p[0]+q[0])/2,(p[1]+q[1])/2];expect(barriers.some(b=>distanceToSegment(mid,b.a,b.b)<.01)).toBe(true);});
 });
 it('connects the north stair approach and both service-room entrances',()=>{
  const corridor={...FIFTH_SERVICE_ROOMS[0],id:'5-service-corridor',kind:'garden' as const,door:stairEntry('5'),polygon:[[550,855],[749,855],[749,980],[550,980]].map(([x,y])=>plan(x,y))};
  walkInteriorTargets(corridor,FIFTH_SERVICE_ROOMS.map(r=>[r.door]));
 });
});


it('keeps the Level 5 service shaft visible with distant details hidden',()=>{
 const model=models.get('5')!,meshes:THREE.Object3D[]=[];
 try{
  model.setDetailsVisible(false);model.group.updateMatrixWorld(true);model.group.traverseVisible(o=>{if(o instanceof THREE.Mesh)meshes.push(o);});
  FIFTH_SERVICE_SHAFT.forEach((a,i)=>{
   const b=FIFTH_SERVICE_SHAFT[(i+1)%4],mid:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
   let n:Point=[-(b[1]-a[1])/len,(b[0]-a[0])/len];if(pointInPolygon([mid[0]+n[0]*.3,mid[1]+n[1]*.3],FIFTH_SERVICE_SHAFT))n=[-n[0],-n[1]];
   const ray=new THREE.Raycaster(new THREE.Vector3(mid[0]+n[0]*.4,1.5,mid[1]+n[1]*.4),new THREE.Vector3(-n[0],0,-n[1]),0,.6);
   expect(ray.intersectObjects(meshes,false).length).toBeGreaterThan(0);
  });
 }finally{model.setDetailsVisible(true);}
});


it('walks out of the Level 5 north stair to the service corridor and back',()=>{
 // The old schematic corridor point was inside the newly registered shaft
 // wall. Use the clear corridor beyond its actual source doorway.
 const p=stairEntry('5'),q=plan(580,920),height=FLOOR_HEIGHT['5'];
 const points:Position[]=[[p[0],height,p[1]],[p[0],height,p[1]+1.1],[q[0],height,q[1]]];
 const route:Flight[]=points.slice(0,-1).map((from,i)=>({from,to:points[i+1],width:1.2,lower:'5',upper:'5'}));
 follow(route);follow(route,true);
});


describe('Level 5 middle-wing offices',()=>{
 for(const room of FIFTH_MIDDLE_OFFICES)it(`enters and reaches both desk approaches in ${room.id}`,()=>{
  const f=firstOfficeFrame(room);walkInteriorTargets(room,[[f.at(-.9,2.5)],[f.at(.9,2.5)]]);
  for(const p of room.polygon)expect(ROOMS.filter(r=>r.floor==='5'&&r!==room&&pointInPolygon(p,r.polygon)&&Math.min(...r.polygon.map((a,i)=>distanceToSegment(p,a,r.polygon[(i+1)%r.polygon.length])))>.02).map(r=>r.id)).toEqual([]);
 });
 it('connects the service corridor to all four doors',()=>{
  const corridor={...FIFTH_MIDDLE_OFFICES[0],id:'5-middle-office-corridor',kind:'garden' as const,door:plan(580,970),polygon:[[555,960],[790,960],[790,1095],[555,1095]].map(([x,y])=>plan(x,y))};
  walkInteriorTargets(corridor,FIFTH_MIDDLE_OFFICES.map(r=>[r.door]));
 });
});


describe('Level 5 shared-office enclosures',()=>{
 for(const room of FIFTH_SHARED_OFFICES)it(`reaches the interior of ${room.id} without overlapping adjacent rooms`,()=>{
  const center:Point=[room.polygon.reduce((s,p)=>s+p[0],0)/room.polygon.length,room.polygon.reduce((s,p)=>s+p[1],0)/room.polygon.length];
  walkInteriorTargets(room,[[center]]);
  for(const p of room.polygon)expect(ROOMS.filter(r=>r.floor==='5'&&r!==room&&pointInPolygon(p,r.polygon)&&Math.min(...r.polygon.map((a,i)=>distanceToSegment(p,a,r.polygon[(i+1)%r.polygon.length])))>.02).map(r=>r.id)).toEqual([]);
 });
 it('keeps the central stair exit connected to both shared offices',()=>{
  const stair=COMMUNICATING_STAIRS.find(s=>s.upper==='5')!;
  const corridor={...FIFTH_SHARED_OFFICES[0],id:'5-shared-office-corridor',kind:'garden' as const,door:stair.exit,polygon:[[535,1065],[762,1065],[762,1205],[535,1205]].map(([x,y])=>plan(x,y))};
  walkInteriorTargets(corridor,FIFTH_SHARED_OFFICES.map(r=>[r.door]));
 });
});


describe('Level 4 west small meeting rooms',()=>{
 for(const room of WEST_HUDDLE_ROOMS){
  it(`keeps ${room.id} separate from neighboring rooms`,()=>{
   for(const p of room.polygon)expect(ROOMS.filter(r=>r.floor==='4'&&r!==room&&pointInPolygon(p,r.polygon)&&Math.min(...r.polygon.map((a,i)=>distanceToSegment(p,a,r.polygon[(i+1)%r.polygon.length])))>.02).map(r=>r.id)).toEqual([]);
  });
  it(`renders the ceiling underside in ${room.id}`,()=>{
   const meshes:THREE.Object3D[]=[];models.get('4')!.group.updateMatrixWorld(true);models.get('4')!.group.traverse(o=>{if(o instanceof THREE.Mesh)meshes.push(o);});
   const center=westHuddleFurniture(room).table;
   for(const vertex of room.polygon){
    const p:Point=[(center[0]+vertex[0])/2,(center[1]+vertex[1])/2];
    const ray=new THREE.Raycaster(new THREE.Vector3(p[0],1.65,p[1]),new THREE.Vector3(0,1,0),0,1.6);
    expect(ray.intersectObjects(meshes,false).some(hit=>Math.abs(hit.distance-1.5)<.001),`ceiling above ${p}`).toBe(true);
   }
  });
  it(`allows entry and access to every seat in ${room.id}`,()=>{
   const furniture=westHuddleFurniture(room);
   expect(furniture.chairs).toHaveLength(room.id==='4-west-huddle-4'?6:2);
   for(const p of [furniture.table,...furniture.chairs,...furniture.outline??[]])expect(pointInPolygon(p,room.polygon)).toBe(true);
   walkInteriorTargets(room,furniture.chairs.map(p=>Array.from({length:12},(_,i)=>[p[0]+Math.cos(i*Math.PI/6)*.55,p[1]+Math.sin(i*Math.PI/6)*.55] as Point)),.1);
  });
 }
});

describe('Level 4 north lounge furniture',()=>{
 const room=ROOMS.find(r=>r.id==='north-reset-zone')!,groups=[FOURTH_LOUNGE_TABLE,FOURTH_LOUNGE_COUNTER,...FOURTH_LOUNGE_ROUND_TABLES];
 it('follows the source table groups without occupying the adjacent corridor',()=>{
  expect(groups.map(g=>g.chairs.length)).toEqual([12,5,4,4,2]);
  for(const group of groups)for(const {point} of group.chairs)expect(pointInPolygon(point,room.polygon)).toBe(true);
  for(const table of [FOURTH_LOUNGE_TABLE,FOURTH_LOUNGE_COUNTER])for(const p of table.polygon)expect(pointInPolygon(p,room.polygon)).toBe(true);
 });
 it('reaches every table and counter seat from the south lounge entrance',()=>{
  walkInteriorTargets(room,groups.flatMap(g=>g.chairs.map(({point:p})=>Array.from({length:12},(_,i)=>[p[0]+Math.cos(i*Math.PI/6)*.55,p[1]+Math.sin(i*Math.PI/6)*.55] as Point))),.15);
 });
});


describe('Level 1 enclosed office ceilings',()=>{
 for(const room of [...FIRST_OFFICES,...SANDBOX_SUPPORT.filter(r=>r.id==='1214')]){
  it(`is visible from inside ${room.id}`,()=>{
   const model=models.get('1')!,meshes:THREE.Object3D[]=[];
   model.group.updateMatrixWorld(true);model.group.traverse(o=>{if(o instanceof THREE.Mesh)meshes.push(o);});
   const center:Point=[room.polygon.reduce((sum,p)=>sum+p[0],0)/room.polygon.length,room.polygon.reduce((sum,p)=>sum+p[1],0)/room.polygon.length];
   for(const vertex of room.polygon){
    const p:Point=[(center[0]+vertex[0])/2,(center[1]+vertex[1])/2];
    const ray=new THREE.Raycaster(new THREE.Vector3(p[0],1.65,p[1]),new THREE.Vector3(0,1,0),0,1.6);
    expect(ray.intersectObjects(meshes,false).some(hit=>Math.abs(hit.distance-1.5)<.001),`ceiling above ${p}`).toBe(true);
   }
  });
 }
});


describe('Immersive Media Design lab',()=>{
 const room=ROOMS.find(r=>r.id==='0110')!,layout=imdLabLayout(room);
 it('fits the photographed furniture types inside the room',()=>{
  for(const fixture of layout.fixtures)for(const p of layout.footprint(fixture))expect(pointInPolygon(p,room.polygon)).toBe(true);
 });
 it('keeps the counter, both display aisles and demonstration space reachable',()=>{
  walkInteriorTargets(room,layout.approaches.map(p=>[p]),.15);
 });
});


describe('Level 1 west offices',()=>{
 for(const room of FIRST_WEST_OFFICES){
  it(`${room.id} stays inside the building and separate from other rooms`,()=>{
   for(const p of room.polygon){
    expect(pointInPolygon(p,footprintForFloor('1'))||Math.min(...footprintForFloor('1').map((a,i)=>distanceToSegment(p,a,footprintForFloor('1')[(i+1)%footprintForFloor('1').length])))<.01).toBe(true);
    expect(ROOMS.filter(r=>r.floor==='1'&&r!==room&&pointInPolygon(p,r.polygon)&&Math.min(...r.polygon.map((a,i)=>distanceToSegment(p,a,r.polygon[(i+1)%r.polygon.length])))>.02).map(r=>r.id)).toEqual([]);
   }
  });
  it(`reaches the desk and seating approaches in ${room.id}`,()=>{
   const fitted=firstWestOfficeDesk(room);
   if(fitted){
    for(const p of [...fitted.outlines.flat(),...fitted.chairs,...fitted.approaches])expect(pointInPolygon(p,room.polygon)).toBe(true);
    walkInteriorTargets(room,fitted.approaches.map(p=>[p]),.1);
    return;
   }
   const [a,b]=room.polygon,len=Math.hypot(b[0]-a[0],b[1]-a[1]),u:Point=[(b[0]-a[0])/len,(b[1]-a[1])/len],m:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2];
   const sign=pointInPolygon([m[0]-u[1]*.3,m[1]+u[0]*.3],room.polygon)?1:-1;
   const depth=(room.officeDeskInset??.95)+.45,targets=[-1,1].map(side=>[m[0]+u[0]*1.15*side-u[1]*depth*sign,m[1]+u[1]*1.15*side+u[0]*depth*sign] as Point);
   for(const p of targets)expect(pointInPolygon(p,room.polygon)).toBe(true);
   walkInteriorTargets(room,targets.map(p=>[p]),.15);
  });
 }
});
it('connects the Level 1 west office and meeting entrances to the west-tip conference room',()=>{
 const conference=ROOMS.find(r=>r.id==='1134')!;
 const corridor={...conference,id:'1-west-office-corridor',kind:'garden' as const,polygon:footprintForFloor('1')};
 walkInteriorTargets(corridor,[[FIRST_WEST_OFFICE_ENTRY],...[...FIRST_WEST_OFFICES,...FIRST_WEST_MEETINGS].map(r=>[r.door])]);
},30000);


describe('Level 1 west meeting rooms',()=>{
 for(const [index,room] of FIRST_WEST_MEETINGS.entries()){
  it(`${room.id} preserves the drawn seats and keeps furniture inside`,()=>{
   const f=firstWestMeetingFurniture(room),counter=firstWestMeetingCounter(room);
   if(counter)for(const p of [counter.a,counter.b])expect(pointInPolygon(p,room.polygon)).toBe(true);
   expect(f.chairPoints).toHaveLength([3,6,12][index]);
   for(const p of [...f.outline,...f.chairPoints])expect(pointInPolygon(p,room.polygon)).toBe(true);
   for(const other of ROOMS.filter(r=>r.floor==='1'&&r!==room)){
    for(const [a,b] of [[room,other],[other,room]])for(const p of a.polygon){
     expect(pointInPolygon(p,b.polygon)&&Math.min(...b.polygon.map((v,i)=>distanceToSegment(p,v,b.polygon[(i+1)%b.polygon.length])))>.02,`${a.id} overlaps ${b.id}`).toBe(false);
    }
   }
  });
  it(`walks from ${room.id}'s entrance to every chair`,()=>{
   const f=firstWestMeetingFurniture(room),counter=firstWestMeetingCounter(room);
   if(counter){const p:Point=[counter.center[0]-counter.u[1]*.65,counter.center[1]+counter.u[0]*.65];expect(pointInPolygon(p,room.polygon)).toBe(true);walkInteriorTargets(room,[[p]],.1);}
   walkInteriorTargets(room,f.chairPoints.map(p=>Array.from({length:12},(_,i)=>[p[0]+Math.cos(i*Math.PI/6)*.55,p[1]+Math.sin(i*Math.PI/6)*.55] as Point)),.1);
  });
 }
});


it('places the Level 1 west office shortcut on clear corridor floor',()=>{
 expect(pointInPolygon(FIRST_WEST_OFFICE_ENTRY,footprintForFloor('1'))).toBe(true);
 expect(ROOMS.some(r=>r.floor==='1'&&pointInPolygon(FIRST_WEST_OFFICE_ENTRY,r.polygon))).toBe(false);
 expect(models.get('1')!.barriers.every(b=>(b.minY??0)>=1.65||(b.maxY??4.2)<=0||distanceToSegment(FIRST_WEST_OFFICE_ENTRY,b.a,b.b)>.42)).toBe(true);
});

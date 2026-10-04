import { SOUTH_STAIR_OPENING, SOUTH_STAIR_RUNS } from './iribe/lobby-south-stair-layout';
import { CANOPY_APRON } from './iribe/lobby-canopy-layout';
import { SOUTH_APRON } from './iribe/lobby-south-layout';
import { westStairForFloor } from './iribe/west-stair-layout';
import { ANTONOV_EXTERIOR_PIECES } from './iribe/antonov-exterior-layout';
import { COURTYARD_APRON } from './iribe/lobby-entrance-layout';
import { communicatingStairForFloor } from './iribe/communicating-layout';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, BookOpen, X } from 'lucide-react';
import { useInteriorStore } from './store';
import { createIribeScene, type LiftUIState } from './iribe/scene';
import { LIFT_FLOORS } from './iribe/lift-layout';
import { FLOOR_LABEL, FAMILY_TERRACE, footprintForFloor, ROOMS, roomTitle, pointInPolygon, type FloorId, type InteriorRoom } from './iribe/layout';
import { FAMILY_BEDS } from './iribe/family-garden-layout';
import { ROOF_BEDS, ROOF_LAWN, ROOF_POOL } from './iribe/roof-layout';
import { IRIBE_REFERENCES, INTERIOR_FIDELITY } from './iribe/reference';

export default function IribeInterior(){
 const host=useRef<HTMLDivElement>(null),scene=useRef<ReturnType<typeof createIribeScene>|null>(null);
 const sourcesDialog=useRef<HTMLDialogElement>(null);
 const exit=useInteriorStore(s=>s.exit);
 const [surroundings,setSurroundings]=useState<'loading'|'ready'|'unavailable'>('loading');
 const [startup,setStartup]=useState<number|null>(0);
 const [lift,setLift]=useState<LiftUIState|null>(null);
 const selectedSpace=useRef<InteriorRoom|null>(null);
 const [spaceName,setSpaceName]=useState<string|null>(null);
 const [floor,setFloor]=useState<FloorId>('G');const [location,setLocation]=useState([0,0]);const [sources,setSources]=useState(false);const [error,setError]=useState<string|null>(null);
 useEffect(()=>{if(!host.current)return;try{scene.current=createIribeScene(host.current,(x,z,f)=>{setLocation([x,z]);setFloor(f);const room=selectedSpace.current;if(room&&(room.floor!==f||!pointInPolygon([x,z],room.polygon))){selectedSpace.current=null;setSpaceName(null);}},setSurroundings,setStartup,setError,setLift);}catch(e){queueMicrotask(()=>setError(e instanceof Error?e.message:'Unable to start the interior.'));}return()=>{scene.current?.dispose();scene.current=null;};},[]);
 useEffect(()=>{
  if(!sources)return;
  const dialog=sourcesDialog.current;if(!dialog)return;
  scene.current?.setPaused(true);dialog.showModal();
  return ()=>{if(dialog.open)dialog.close();scene.current?.setPaused(false);};
 },[sources]);
 const changeFloor=(value:FloorId)=>{selectedSpace.current=null;setSpaceName(null);scene.current?.setFloor(value);setFloor(value);};
 const visitSpace=(value:string)=>{
  selectedSpace.current=null;setSpaceName(null);
  if(value==='central-lifts')scene.current?.visitLift();
  else if(value==='antonov-exterior')scene.current?.visitAntonovExterior();
  else if(value==='antonov-rear')scene.current?.visitAntonovRear();
  else if(value==='west-offices')scene.current?.visitWestOffices();
  else if(value==='north-offices')scene.current?.visitNorthOffices();
  else if(value==='west-stair')scene.current?.visitWestStair();
  else if(value==='communicating-stair')scene.current?.visitStair();
  else if(value==='atrium-stair')scene.current?.visitAtriumStair();
  else if(value==='canopy-entrance')scene.current?.visitCanopyEntrance();
  else if(value==='south-stair')scene.current?.visitSouthStair();
  else if(value==='south-entrance')scene.current?.visitSouthEntrance();
  else if(value==='courtyard-entrance')scene.current?.visitCourtyardEntrance();
  else if(scene.current?.visitRoom(floor,value)){
   const room=ROOMS.find(r=>r.floor===floor&&r.id===value);
   if(room){selectedSpace.current=room;setSpaceName(roomTitle(room));}
  }
 };
 const footprint=footprintForFloor(floor),communicating=communicatingStairForFloor(floor),westStair=westStairForFloor(floor);
 return <div className="fixed inset-0 z-50 bg-[#d5dedc] text-[#282b29]">
  <div ref={host} className="absolute inset-0" />
  {startup!==null&&!error&&<div role="status" className="absolute inset-0 flex items-center justify-center bg-[#faf7ee] px-8">
   <div className="w-full max-w-xs"><p className="font-serif text-2xl">Opening Iribe…</p><p className="mb-4 mt-2 text-sm text-black/55">{startup<1?'Preparing the floors':'Finishing the view'}</p><div role="progressbar" aria-label="Opening Iribe" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(startup*100)} className="h-1 overflow-hidden rounded-full bg-black/10"><div className="h-full bg-[#8b6548]" style={{width:`${Math.round(startup*100)}%`}}/></div></div>
  </div>}
  <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-5">
   <div className="pointer-events-auto rounded-xl border border-black/10 bg-[#faf7ee] p-3 shadow-sm">
    <button onClick={exit} className="flex min-h-10 items-center gap-2 text-xs"><ArrowLeft className="size-4"/>Campus map</button>
    <h1 className="font-serif text-2xl">Inside Iribe</h1><p className="mt-1 text-xs text-black/60">{FLOOR_LABEL[floor]} · Walk-through preview</p>
    {spaceName&&<p className="mt-2 max-w-64 text-xs font-medium" aria-label="Current space">{spaceName}</p>}
    {surroundings!=='ready'&&<p role="status" className="mt-1 text-xs text-black/55">{surroundings==='loading'?'Loading campus surroundings…':'Campus surroundings unavailable'}</p>}
   </div>
   <button onClick={()=>setSources(true)} className="pointer-events-auto rounded-xl bg-[#faf7ee] p-3 text-xs shadow-sm" aria-label="Interior references"><BookOpen className="size-4"/></button>
  </header>
  {lift&&startup===null&&<section aria-label="Lift controls" className="absolute right-3 top-36 w-60 rounded-xl border border-black/10 bg-[#faf7ee] p-4 shadow-sm sm:right-5">
   <div className="flex items-baseline justify-between gap-2"><h2 className="font-serif text-lg">Central lifts</h2><span className="text-xs text-black/55">Lift {lift.car+1}</span></div>
   <p className="mt-1 text-xs text-black/60">{FLOOR_LABEL[lift.floor]}</p>
   <p role="status" className="mt-3 text-sm">{lift.phase==='closed'?'Call a lift to enter':lift.phase==='opening'?'Opening doors…':lift.phase==='closing'?'Closing doors…':lift.phase==='moving'?`Travelling to ${FLOOR_LABEL[lift.destination!]}`:lift.inside?(lift.doorway?'Step fully inside':'Choose a floor'):'Doors open · walk inside'}</p>
   {lift.phase==='closed'&&<button onClick={()=>scene.current?.callLift()} className="mt-3 min-h-10 w-full rounded-lg bg-[#282b29] px-3 text-sm text-[#faf7ee]">Call lift</button>}
   {lift.inside&&lift.phase==='open'&&!lift.riding&&<div aria-label="Lift floors" className="mt-3 grid grid-cols-3 gap-2">{LIFT_FLOORS.map(f=><button key={f} disabled={f===lift.floor||lift.doorway} aria-label={`Go to ${FLOOR_LABEL[f]}`} onClick={()=>scene.current?.rideLift(f)} className="min-h-10 rounded-lg border border-black/15 text-sm hover:bg-black/5 disabled:bg-black/5 disabled:text-black/35">{f}</button>)}</div>}
   <p className="mt-3 text-[11px] leading-relaxed text-black/45">Cab dimensions and finishes are estimated.</p>
  </section>}
  <div className="absolute bottom-5 left-3 rounded-xl bg-[#faf7ee] p-3 shadow-sm sm:left-5">
   <label className="text-xs">Explore a floor<select disabled={startup!==null||lift?.riding} value={floor} onChange={e=>changeFloor(e.target.value as FloorId)} className="mt-2 block min-h-10 rounded-lg border border-black/15 bg-transparent px-3 text-sm disabled:opacity-40">{Object.entries(FLOOR_LABEL).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
   {(westStair||communicating||ROOMS.some(r=>r.floor===floor&&r.listed!==false))&&<label className="mt-3 block text-xs">Visit a space<select disabled={startup!==null||lift?.riding} value="" onChange={e=>visitSpace(e.target.value)} className="mt-2 block min-h-10 w-44 rounded-lg border border-black/15 bg-transparent px-2 text-sm"><option value="" disabled>Choose a space</option>{LIFT_FLOORS.includes(floor)&&<option value="central-lifts">Central lifts</option>}{(floor==='G'||floor==='1')&&<><option value="atrium-stair">Atrium stair</option><option value="south-stair">South stair</option></>}{floor==='G'&&<><option value="canopy-entrance">Canopy entrance</option><option value="south-entrance">South entrance</option><option value="courtyard-entrance">Courtyard entrance</option><option value="antonov-rear">Antonov · rear aisle</option><option value="antonov-exterior">Antonov · outdoor stair</option></>}{communicating&&<option value="communicating-stair">Stairs to Level {floor===communicating.lower?communicating.upper:communicating.lower}</option>}{floor==='1'&&<option value="west-offices">West office corridor</option>}{floor==='5'&&<option value="north-offices">North office corridor</option>}{westStair&&<option value="west-stair">West stair</option>}{ROOMS.filter(r=>r.floor===floor&&r.listed!==false).map(r=><option key={r.id} value={r.id}>{roomTitle(r)}</option>)}</select></label>}
   <svg viewBox="-50 -75 105 145" className="mt-2 hidden h-36 w-32 sm:block" aria-label="Interior position">
    {floor==='1'&&<><polygon points={FAMILY_TERRACE.map(p=>p.join(',')).join(' ')} fill="#d7cbb7" stroke="#858982" strokeWidth=".4"/>{FAMILY_BEDS.map((bed,i)=><polygon key={i} points={bed.map(p=>p.join(',')).join(' ')} fill="#77935c"/>)}</>}
    {floor==='G'&&ANTONOV_EXTERIOR_PIECES.map((p,i)=><polygon key={`exterior-${i}`} points={p.polygon.map(v=>v.join(',')).join(' ')} fill="#d7cbb7" stroke="#858982" strokeWidth=".2"/>)}
    {floor==='G'&&<polygon points={CANOPY_APRON.map(p=>p.join(',')).join(' ')} fill="#d7cbb7" stroke="#858982" strokeWidth=".2"/>}
    {floor==='G'&&<polygon points={SOUTH_APRON.map(p=>p.join(',')).join(' ')} fill="#d7cbb7" stroke="#858982" strokeWidth=".2"/>}
    {floor==='G'&&<polygon points={COURTYARD_APRON.map(p=>p.join(',')).join(' ')} fill="#d7cbb7" stroke="#858982" strokeWidth=".2"/>}
    <polygon points={footprint.map(p=>p.join(',')).join(' ')} fill="#e2ded2" stroke="#858982" strokeWidth=".4"/>
    {floor==='R'&&<>{[ROOF_LAWN,...ROOF_BEDS].map((p,i)=><polygon key={i} points={p.map(p=>p.join(',')).join(' ')} fill="#77935c"/>)}<polygon points={ROOF_POOL.map(p=>p.join(',')).join(' ')} fill="#587b87"/></>}
    {ROOMS.filter(r=>r.floor===floor&&r.kind!=='garden').map(r=><polygon key={r.id} points={r.polygon.map(p=>p.join(',')).join(' ')} fill="#b9bfb6" stroke="#faf7ee" strokeWidth=".35"/>)}
    {communicating&&<><polygon points={communicating.void.map(p=>p.join(',')).join(' ')} fill="#faf7ee" stroke="#858982" strokeWidth=".3"/><polygon points={communicating.core.map(p=>p.join(',')).join(' ')} fill="#b9bfb6"/><polyline points={communicating.path.map(p=>p.join(',')).join(' ')} fill="none" stroke="#858982" strokeWidth=".6"/></>}
    {westStair&&<><polygon points={westStair.shaft.map(p=>p.join(',')).join(' ')} fill="#faf7ee" stroke="#858982" strokeWidth=".3"/><polyline points={[westStair.flights[0].from,...westStair.flights.map(f=>f.to)].map(p=>`${p[0]},${p[2]}`).join(' ')} fill="none" stroke="#858982" strokeWidth=".5"/></>}
    {(floor==='G'||floor==='1')&&<><polygon points={SOUTH_STAIR_OPENING.map(p=>p.join(',')).join(' ')} fill="#faf7ee" stroke="#858982" strokeWidth=".3"/>{SOUTH_STAIR_RUNS.map((run,i)=><polyline key={i} points={`${run.from[0]},${run.from[2]} ${run.to[0]},${run.to[2]}`} fill="none" stroke="#858982" strokeWidth=".5"/>)}</>}
    <circle cx={location[0]} cy={location[1]} r="1.8" fill="#b51c32" stroke="white" strokeWidth=".5"/>
   </svg>
  </div>
  <p className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 rounded-full bg-[#faf7ee] px-4 py-2 text-xs md:block">Drag to look · WASD or arrow keys to walk</p>
  <div className="absolute bottom-5 right-3 grid grid-cols-3 gap-1 rounded-xl bg-[#faf7ee] p-2 shadow-sm sm:right-5" aria-label="Walking controls">
   {([[0,-1,ArrowUp,'Walk forward'],[-1,0,ArrowLeft,'Step left'],[0,1,ArrowDown,'Walk backward'],[1,0,ArrowRight,'Step right']] as const).map(([x,z,Icon,label],i)=><button key={label} disabled={startup!==null||lift?.riding} aria-label={label} className={`flex size-11 touch-none items-center justify-center rounded-lg bg-black/5 active:bg-black/15 ${i===0?'col-start-2':''} ${i===1?'col-start-1':''}`} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);scene.current?.setMove(x,z);}} onPointerUp={()=>scene.current?.setMove(0,0)} onPointerCancel={()=>scene.current?.setMove(0,0)} onLostPointerCapture={()=>scene.current?.setMove(0,0)}><Icon className="size-4"/></button>)}
  </div>
  {sources&&<dialog ref={sourcesDialog} onCancel={()=>setSources(false)} onClose={()=>setSources(false)} aria-label="Interior references" className="m-auto rounded-xl border-0 bg-[#faf7ee] p-0 text-[#282b29] shadow-xl backdrop:bg-black/40" style={{width:"min(32rem, calc(100vw - 2.5rem))"}}>
   <div className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-xl bg-[#faf7ee] p-5">
    <button onClick={()=>setSources(false)} className="float-right p-2" aria-label="Close references"><X/></button>
    <h2 className="font-serif text-2xl">Built from references</h2>
    <p className="my-3 text-sm text-black/65">A recreation in progress from public UMD plans and HDR photographs. Dimensions and unphotographed details are estimates.</p>
    <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-black/55">Accuracy and coverage</h3>
    {([
     ['Verified features',INTERIOR_FIDELITY.verified],
     ['Estimated details',INTERIOR_FIDELITY.estimated],
     ['Still incomplete',INTERIOR_FIDELITY.incomplete],
    ] as const).map(([title,items])=><details key={title} className="border-b border-black/10 py-3">
     <summary className="cursor-pointer text-sm font-medium">{title}</summary>
     <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-black/65">{items.map(item=><li key={item}>{item}</li>)}</ul>
    </details>)}
    <h3 className="mb-1 mt-6 text-xs font-semibold uppercase tracking-wider text-black/55">Source record</h3>
    {IRIBE_REFERENCES.map(s=><details key={s.title} className="border-b border-black/10 py-3">
     <summary className="cursor-pointer text-sm font-medium">{s.title}</summary>
     <p className="mb-3 mt-2 text-sm leading-relaxed text-black/65">{s.evidence}</p>
     <a href={s.url} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">View source ↗</a>
    </details>)}
   </div>
  </dialog>}
  {error&&<div role="alert" className="absolute inset-0 flex items-center justify-center bg-[#faf7ee] p-8"><div><p>The interior could not load: {error}</p><button onClick={exit} className="mt-4 underline">Return to campus</button></div></div>}
 </div>;
}

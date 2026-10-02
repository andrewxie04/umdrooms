import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, BookOpen, X } from 'lucide-react';
import { useInteriorStore } from './store';
import { createIribeScene } from './iribe/scene';
import { FLOOR_LABEL, FAMILY_TERRACE, footprintForFloor, ROOMS, roomTitle, type FloorId } from './iribe/layout';
import { FAMILY_BEDS } from './iribe/family-garden-layout';
import { ROOF_BEDS, ROOF_LAWN, ROOF_POOL } from './iribe/roof-layout';
import { IRIBE_REFERENCES } from './iribe/reference';

export default function IribeInterior(){
 const host=useRef<HTMLDivElement>(null),scene=useRef<ReturnType<typeof createIribeScene>|null>(null);
 const sourcesDialog=useRef<HTMLDialogElement>(null);
 const exit=useInteriorStore(s=>s.exit);
 const [surroundings,setSurroundings]=useState<'loading'|'ready'|'unavailable'>('loading');
 const [floor,setFloor]=useState<FloorId>('G');const [location,setLocation]=useState([0,0]);const [sources,setSources]=useState(false);const [error,setError]=useState<string|null>(null);
 useEffect(()=>{if(!host.current)return;try{scene.current=createIribeScene(host.current,(x,z,f)=>{setLocation([x,z]);setFloor(f);},setSurroundings);}catch(e){queueMicrotask(()=>setError(e instanceof Error?e.message:'Unable to start the interior.'));}return()=>{scene.current?.dispose();scene.current=null;};},[]);
 useEffect(()=>{
  if(!sources)return;
  const dialog=sourcesDialog.current;if(!dialog)return;
  scene.current?.setPaused(true);dialog.showModal();
  return ()=>{if(dialog.open)dialog.close();scene.current?.setPaused(false);};
 },[sources]);
 const changeFloor=(value:FloorId)=>{scene.current?.setFloor(value);setFloor(value);};
 const footprint=footprintForFloor(floor);
 return <div className="fixed inset-0 z-50 bg-[#d5dedc] text-[#282b29]">
  <div ref={host} className="absolute inset-0" />
  <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-5">
   <div className="pointer-events-auto rounded-xl border border-black/10 bg-[#faf7ee] p-3 shadow-sm">
    <button onClick={exit} className="flex min-h-10 items-center gap-2 text-xs"><ArrowLeft className="size-4"/>Campus map</button>
    <h1 className="font-serif text-2xl">Inside Iribe</h1><p className="mt-1 text-xs text-black/60">{FLOOR_LABEL[floor]} · Walk-through preview</p>
    {surroundings!=='ready'&&<p role="status" className="mt-1 text-xs text-black/55">{surroundings==='loading'?'Loading campus surroundings…':'Campus surroundings unavailable'}</p>}
   </div>
   <button onClick={()=>setSources(true)} className="pointer-events-auto rounded-xl bg-[#faf7ee] p-3 text-xs shadow-sm" aria-label="Interior references"><BookOpen className="size-4"/></button>
  </header>
  <div className="absolute bottom-5 left-3 rounded-xl bg-[#faf7ee] p-3 shadow-sm sm:left-5">
   <label className="text-xs">Explore a floor<select value={floor} onChange={e=>changeFloor(e.target.value as FloorId)} className="mt-2 block min-h-10 rounded-lg border border-black/15 bg-transparent px-3 text-sm">{Object.entries(FLOOR_LABEL).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
   {ROOMS.some(r=>r.floor===floor&&r.listed!==false)&&<label className="mt-3 block text-xs">Visit a space<select value="" onChange={e=>scene.current?.visitRoom(floor,e.target.value)} className="mt-2 block min-h-10 w-44 rounded-lg border border-black/15 bg-transparent px-2 text-sm"><option value="" disabled>Choose a space</option>{ROOMS.filter(r=>r.floor===floor&&r.listed!==false).map(r=><option key={r.id} value={r.id}>{roomTitle(r)}</option>)}</select></label>}
   <svg viewBox="-50 -75 105 145" className="mt-2 hidden h-36 w-32 sm:block" aria-label="Interior position">
    {floor==='1'&&<><polygon points={FAMILY_TERRACE.map(p=>p.join(',')).join(' ')} fill="#d7cbb7" stroke="#858982" strokeWidth=".4"/>{FAMILY_BEDS.map((bed,i)=><polygon key={i} points={bed.map(p=>p.join(',')).join(' ')} fill="#77935c"/>)}</>}
    <polygon points={footprint.map(p=>p.join(',')).join(' ')} fill="#e2ded2" stroke="#858982" strokeWidth=".4"/>
    {floor==='R'&&<>{[ROOF_LAWN,...ROOF_BEDS].map((p,i)=><polygon key={i} points={p.map(p=>p.join(',')).join(' ')} fill="#77935c"/>)}<polygon points={ROOF_POOL.map(p=>p.join(',')).join(' ')} fill="#587b87"/></>}
    {ROOMS.filter(r=>r.floor===floor&&r.kind!=='garden').map(r=><polygon key={r.id} points={r.polygon.map(p=>p.join(',')).join(' ')} fill="#b9bfb6" stroke="#faf7ee" strokeWidth=".35"/>)}
    <circle cx={location[0]} cy={location[1]} r="1.8" fill="#b51c32" stroke="white" strokeWidth=".5"/>
   </svg>
  </div>
  <p className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 rounded-full bg-[#faf7ee] px-4 py-2 text-xs md:block">Drag to look · WASD or arrow keys to walk</p>
  <div className="absolute bottom-5 right-3 grid grid-cols-3 gap-1 rounded-xl bg-[#faf7ee] p-2 shadow-sm sm:right-5" aria-label="Walking controls">
   {([[0,-1,ArrowUp,'Walk forward'],[-1,0,ArrowLeft,'Step left'],[0,1,ArrowDown,'Walk backward'],[1,0,ArrowRight,'Step right']] as const).map(([x,z,Icon,label],i)=><button key={label} aria-label={label} className={`flex size-11 touch-none items-center justify-center rounded-lg bg-black/5 active:bg-black/15 ${i===0?'col-start-2':''} ${i===1?'col-start-1':''}`} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);scene.current?.setMove(x,z);}} onPointerUp={()=>scene.current?.setMove(0,0)} onPointerCancel={()=>scene.current?.setMove(0,0)} onLostPointerCapture={()=>scene.current?.setMove(0,0)}><Icon className="size-4"/></button>)}
  </div>
  {sources&&<dialog ref={sourcesDialog} onCancel={()=>setSources(false)} onClose={()=>setSources(false)} aria-label="Interior references" className="m-auto rounded-xl border-0 bg-[#faf7ee] p-0 text-[#282b29] shadow-xl backdrop:bg-black/40" style={{width:"min(32rem, calc(100vw - 2.5rem))"}}><div className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-xl bg-[#faf7ee] p-5"><button onClick={()=>setSources(false)} className="float-right p-2" aria-label="Close references"><X/></button><h2 className="font-serif text-2xl">Built from references</h2><p className="my-3 text-sm">A recreation in progress from public UMD plans and HDR photographs. Dimensions and unphotographed details are estimates.</p>{IRIBE_REFERENCES.map(s=><a key={s.title} href={s.url} target="_blank" rel="noreferrer" className="mt-4 block text-sm underline">{s.title}</a>)}</div></dialog>}
  {error&&<div role="alert" className="absolute inset-0 flex items-center justify-center bg-[#faf7ee] p-8"><div><p>The interior could not load: {error}</p><button onClick={exit} className="mt-4 underline">Return to campus</button></div></div>}
 </div>;
}

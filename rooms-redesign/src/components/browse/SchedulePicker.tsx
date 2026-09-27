import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useCampusStore } from '@/lib/store';
import { campusDateTime, campusFormat, scheduleEnd, validSchedule } from '@/lib/schedule';

export function SchedulePicker() {
  const start = useCampusStore(s => s.scheduleDate);
  const duration = useCampusStore(s => s.scheduleDurationMin);
  const apply = useCampusStore(s => s.setScheduleWindow);
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState(campusFormat(start, 'yyyy-MM-dd'));
  const [month, setMonth] = useState(new Date(`${day}T12:00:00`));
  const [time, setTime] = useState(campusFormat(start, 'HH:mm'));
  const [minutes, setMinutes] = useState(String(duration));
  const [hour, minute] = time.split(':').map(Number);
  const setClock = (h: number, m: number) => setTime(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  const proposed = campusDateTime(day, time);
  const valid = proposed && validSchedule(proposed, Number(minutes));
  const field = 'h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-foreground';
  function edit() {
    const date = campusFormat(start, 'yyyy-MM-dd');
    setDay(date); setMonth(new Date(`${date}T12:00:00`));
    setTime(campusFormat(start, 'HH:mm')); setMinutes(String(duration)); setOpen(true);
  }
  return <>
    <button onClick={edit} className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-3 text-left hover:bg-muted">
      <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
      <span className="flex-1 text-sm"><span className="block font-medium">{campusFormat(start, 'EEE, MMM d')}</span>
        <span className="text-xs text-muted-foreground">{campusFormat(start, 'h:mm a')} – {campusFormat(scheduleEnd(start, duration), 'h:mm a')} · {duration / 60}h</span>
      </span><span className="text-xs underline underline-offset-4">Edit</span>
    </button>
    <p className="text-[11px] text-muted-foreground">Availability for your whole visit · Eastern time</p>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-[420px] overflow-y-auto rounded-xl p-5 sm:max-w-[420px]">
        <div className="pr-5"><DialogTitle className="font-serif text-3xl font-normal tracking-tight">Plan your visit.</DialogTitle>
          <DialogDescription className="mt-2 text-sm">Choose when you’ll arrive and how long you need.</DialogDescription></div>
        <div className="flex gap-2">{[0, 1].map(offset => {
          const today = new Date(`${campusFormat(new Date(), 'yyyy-MM-dd')}T12:00:00`);
          today.setDate(today.getDate() + offset);
          const key = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
          return <button key={offset} onClick={() => {setDay(key); setMonth(today);}} className="min-h-10 rounded-md border border-border px-4 text-xs hover:bg-muted">{offset ? 'Tomorrow' : 'Today'}</button>;
        })}</div>
        <DayPicker mode="single" required selected={new Date(`${day}T12:00:00`)} month={month} onMonthChange={setMonth}
          onSelect={date => {if(date) setDay(`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`);}}
          className="relative w-full rounded-lg border border-border p-3"
          classNames={{months:'relative', month:'w-full', month_caption:'flex h-10 items-center justify-center text-sm font-medium',
            nav:'absolute inset-x-0 top-0 flex justify-between', button_previous:'flex size-10 items-center justify-center rounded-md hover:bg-muted', button_next:'flex size-10 items-center justify-center rounded-md hover:bg-muted',
            month_grid:'w-full table-fixed border-collapse', weekday:'h-8 text-[11px] font-normal text-muted-foreground', day:'p-0 text-center', day_button:'h-10 w-full rounded-md text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary',
            selected:'rounded-md bg-foreground text-background [&_button:hover]:bg-foreground', today:'font-bold underline underline-offset-4', outside:'text-muted-foreground', hidden:'invisible'}}
          components={{Chevron: ({orientation}) => orientation === 'left' ? <ChevronLeft className="size-4"/> : <ChevronRight className="size-4"/>}} />
        <div className="space-y-2">
          <p className="text-xs font-medium">Arrive at</p>
          <div className="grid grid-cols-3 gap-2">
            <select aria-label="Arrival hour" value={hour % 12 || 12} onChange={e => setClock(Number(e.target.value) % 12 + (hour >= 12 ? 12 : 0), minute)} className={field}>
              {Array.from({length:12},(_,i)=>i+1).map(h=><option key={h} value={h}>{h}</option>)}
            </select>
            <select aria-label="Arrival minute" value={minute} onChange={e => setClock(hour, Number(e.target.value))} className={field}>
              {Array.from({length:60},(_,i)=>i).map(m=><option key={m} value={m}>{String(m).padStart(2,'0')}</option>)}
            </select>
            <select aria-label="Arrival AM or PM" value={hour >= 12 ? 'PM':'AM'} onChange={e=>setClock(hour % 12 + (e.target.value === 'PM' ? 12:0),minute)} className={field}><option>AM</option><option>PM</option></select>
          </div>
        </div>
        <label className="flex items-center justify-between gap-3 text-sm">I need a space for
          <span className="flex items-center gap-2"><input aria-label="Visit duration in hours" type="number" min="0.25" max="12" step="0.25" value={minutes === '' ? '' : Number(minutes)/60} onChange={e => setMinutes(e.target.value === '' ? '' : String(Number(e.target.value)*60))} className={`${field} !w-20`} /> hours</span>
        </label>
        <div className="flex gap-2" aria-label="Visit duration presets">{[30,60,120,180].map(n => <button key={n} aria-pressed={Number(minutes) === n} onClick={()=>setMinutes(String(n))} className="min-h-10 flex-1 rounded-md border border-border text-xs aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background">{n<60 ? '30 min' : `${n/60} ${n===60?'hour':'hours'}`}</button>)}</div>
        <p className="text-xs leading-relaxed text-muted-foreground" role="status">{valid && proposed ? `${campusFormat(proposed, 'EEE, MMM d')} · ${campusFormat(proposed, 'h:mm a')}–${campusFormat(scheduleEnd(proposed, Number(minutes)), 'h:mm a')} Eastern time` : 'Choose 0.25–12 hours, ending before midnight on the same day.'}</p>
        <button disabled={!valid} onClick={() => {if(valid && proposed) {apply(proposed, Number(minutes)); setOpen(false);}}} className="flex h-11 items-center justify-between rounded-lg bg-foreground px-4 text-sm font-medium text-background disabled:opacity-40">Find a space <ArrowRight className="size-4"/></button>
        <p className="text-center text-[11px] text-muted-foreground">Checks the full time window. Does not reserve a room.</p>
      </DialogContent>
    </Dialog>
  </>;
}

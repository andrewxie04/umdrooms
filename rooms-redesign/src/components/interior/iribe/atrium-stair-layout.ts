import { ATRIUM_LOWER_SOURCE_ROWS } from './atrium-stair-trace';
import { ATRIUM_UPPER_SOURCE_ROWS, ATRIUM_UPPER_UNRESOLVED_GAP } from './atrium-upper-stair-trace';
import { groundGuidePlan } from './ground-guide-layout';
import { firstGuidePlan } from './first-guide-layout';
import type { Point, Polygon } from './layout';

/** Source outlines fix the flared lower flight, without furniture/column offsets.
 * Rise allocation is an estimate: no dimensioned stair section is available. */
export function atriumLowerFlight(rise:number){
 const sections=ATRIUM_LOWER_SOURCE_ROWS.map((row,i)=>({a:groundGuidePlan(row.a[0],row.a[1]),b:groundGuidePlan(row.b[0],row.b[1]),height:rise*i/(ATRIUM_LOWER_SOURCE_ROWS.length-1)}));
 const center=(row:typeof sections[number]):Point=>[(row.a[0]+row.b[0])/2,(row.a[1]+row.b[1])/2];
 const from=center(sections[0]),to=center(sections.at(-1)!);
 const polygon:Polygon=[...sections.map(s=>s.a),...sections.map(s=>s.b).reverse()];
 return {sections,polygon,from,to,width:Math.min(...sections.map(s=>Math.hypot(s.a[0]-s.b[0],s.a[1]-s.b[1])))};
}

/** The known upper rows preserve their source outlines. Three interpolated
 * cross-sections bridge the unresolved broad drawing gap; their count and
 * elevations are estimates, not a claim about a physical landing or risers. */
export function atriumUpperFlight(base:number,rise:number){
 const rows:{a:Point;b:Point;estimated:boolean}[]=[];
 for(let i=0;i<ATRIUM_UPPER_SOURCE_ROWS.length;i++){
  const row=ATRIUM_UPPER_SOURCE_ROWS[i];
  rows.push({a:firstGuidePlan(row.a[0],row.a[1]),b:firstGuidePlan(row.b[0],row.b[1]),estimated:false});
  if(row.path===ATRIUM_UPPER_UNRESOLVED_GAP[0]){
   const next=ATRIUM_UPPER_SOURCE_ROWS[i+1];
   for(const t of [.25,.5,.75])rows.push({
    a:firstGuidePlan(row.a[0]+(next.a[0]-row.a[0])*t,row.a[1]+(next.a[1]-row.a[1])*t),
    b:firstGuidePlan(row.b[0]+(next.b[0]-row.b[0])*t,row.b[1]+(next.b[1]-row.b[1])*t),estimated:true,
   });
  }
 }
 const sections=rows.reverse().map((row,i)=>({...row,height:base+rise*i/(rows.length-1)}));
 const center=(row:typeof sections[number]):Point=>[(row.a[0]+row.b[0])/2,(row.a[1]+row.b[1])/2];
 const from=center(sections[0]),to=center(sections.at(-1)!);
 return {sections,from,to,polygon:[...sections.map(s=>s.a),...sections.map(s=>s.b).reverse()] as Polygon,width:Math.min(...sections.map(s=>Math.hypot(s.a[0]-s.b[0],s.a[1]-s.b[1])))};
}

import { groundGuidePlan } from './ground-guide-layout';
import { LOBBY_SOFA_TRACE, LOBBY_CHAIR_TRACE, LOBBY_TABLE_TRACE } from './lobby-seating-trace';
import type { Point } from './layout';

const point=(p:Point)=>groundGuidePlan(...p);
const origin=groundGuidePlan(0,0),unit=groundGuidePlan(1,0);
const scale=Math.hypot(unit[0]-origin[0],unit[1]-origin[1]);
/** All fixtures use the same Ground registration, without individual offsets. */
export const LOBBY_SOFAS=LOBBY_SOFA_TRACE.map(s=>({id:s.id,seat:s.seat.map(point),back:s.back.map(point)}));
export const LOBBY_CHAIRS=LOBBY_CHAIR_TRACE.map((c,i)=>{
 const center=point(c.center),back=point(c.back),angle=Math.atan2(back[0]-center[0],back[1]-center[1]);
 // UMD/HDR photos also show green accent chairs; individual assignments are
 // estimates because the floor-plan symbols carry no upholstery information.
 return {id:c.id,center,angle,width:c.symbolWidthPt*scale,depth:c.symbolDepthPt*scale,color:i===3||i===12?'green' as const:i%2?'teal' as const:'blue' as const};
});
// The plan shows overlapping circular outlines in pairs. Their heights and
// exact product interpretation are not specified; staggered tops are estimated.
export const LOBBY_TABLES=LOBBY_TABLE_TRACE.map((t,i)=>({id:t.id,pairId:t.pairId,center:point(t.center),radius:t.radius*scale,height:i%2?.44:.55}));

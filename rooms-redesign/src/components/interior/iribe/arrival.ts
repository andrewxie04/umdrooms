import { amphitheaterHeight } from './amphitheater';
import { roofTerrainHeight } from './roof-layout';
import { antonovHeight, gannonHeight } from './auditorium';
import { FLOOR_HEIGHT, distanceToSegment, pointInPolygon, type InteriorRoom, type Point } from './layout';
import type { Barrier } from './model';

const localHeight=(room:InteriorRoom,p:Point)=>room.floor==='R'?roofTerrainHeight(p):room.id==='0324'?(antonovHeight(p)??0):room.id==='0318'?(gannonHeight(p)??0):room.floor==='G'?(amphitheaterHeight(p)??0):0;

/** A room shortcut must arrive on clear floor, never inside furniture or a wall. */
export function roomArrival(room:InteriorRoom,barriers:Barrier[]):{point:Point;yaw:number;height:number}|null {
 const xs=room.polygon.map(p=>p[0]),zs=room.polygon.map(p=>p[1]);
 const center:Point=[xs.reduce((a,b)=>a+b,0)/xs.length,zs.reduce((a,b)=>a+b,0)/zs.length];
 const minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs);
 const nearby=barriers.filter(b=>Math.max(b.a[0],b.b[0])>=minX-.42&&Math.min(b.a[0],b.b[0])<=maxX+.42&&Math.max(b.a[1],b.b[1])>=minZ-.42&&Math.min(b.a[1],b.b[1])<=maxZ+.42);
 let best:Point|null=null,score=Infinity;
 for(let x=minX+.4;x<maxX-.4;x+=.35)for(let z=minZ+.4;z<maxZ-.4;z+=.35){
  const distance=Math.hypot(x-room.door[0],z-room.door[1]);
  // Stand just inside the door, leaving a comfortable view into the room.
  const cost=Math.abs(distance-1.35)+.05*Math.hypot(x-center[0],z-center[1]);
  if(cost>=score)continue;
  const p:Point=[x,z];if(!pointInPolygon(p,room.polygon))continue;
  const height=localHeight(room,p);
  if(nearby.some(b=>height<(b.maxY??Infinity)&&height+1.65>(b.minY??-Infinity)&&distanceToSegment(p,b.a,b.b)<.42))continue;
  if(cost<score){best=p;score=cost;}
 }
 const focus=room.arrivalFocus??center;
 return best?{point:best,yaw:Math.atan2(best[0]-focus[0],best[1]-focus[1]),height:FLOOR_HEIGHT[room.floor]+localHeight(room,best)}:null;
}

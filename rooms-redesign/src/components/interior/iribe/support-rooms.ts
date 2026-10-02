import { firstCorePlan, pointInPolygon, type InteriorRoom, type Point } from './layout';
import type { RoofBuilder } from './roof';

const STORAGE_BACKS:Record<string,readonly [Point,Point]>={
 '1213':[firstCorePlan(60,301),firstCorePlan(210,318)],
 '1209':[firstCorePlan(24,614),firstCorePlan(206,614)],
};
export function supportCabinetFrame(room:InteriorRoom){
 const back=STORAGE_BACKS[room.id];if(!back)return null;
 const [a,b]=back,length=Math.hypot(b[0]-a[0],b[1]-a[1]),u:Point=[(b[0]-a[0])/length,(b[1]-a[1])/length];
 const mid:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2],side=pointInPolygon([mid[0]-u[1]*.75,mid[1]+u[0]*.75],room.polygon)?1:-1;
 const n:Point=[-u[1]*side,u[0]*side];
 return {length,angle:-Math.atan2(u[1],u[0]),at:(x:number,z:number):Point=>[a[0]+u[0]*x+n[0]*z,a[1]+u[1]*x+n[1]*z]};
}
export function buildSupportStorage(room:InteriorRoom,b:RoofBuilder){
 const f=supportCabinetFrame(room);if(!f)return false;
 const m=b.palette,box=(x:number,y:number,z:number,w:number,h:number,d:number,material:typeof m.white)=>{const p=f.at(x,z);b.box(p[0],y,p[1],w,h,d,material,f.angle);};
 // Cabinet runs follow the HDR furniture symbols. Finishes and enclosed
 // contents are not documented; use neutral cabinet faces, without props.
 box(f.length/2,.47,.24,f.length,.88,.48,m.white);
 box(f.length/2,.925,.25,f.length+.02,.05,.5,m.metal);
 box(f.length/2,.065,.2,f.length-.08,.13,.39,m.black);
 const bays=Math.max(2,Math.round(f.length/.65)),width=f.length/bays;
 for(let i=0;i<bays;i++){
  box((i+.5)*width,.49,.489,width-.025,.76,.015,m.white);
  box((i+.8)*width,.68,.51,.025,.15,.025,m.metal);
 }
 const footprint=[[0,0],[f.length,0],[f.length,.52],[0,.52]].map(([x,z])=>f.at(x,z));
 footprint.forEach((a,i)=>b.barriers.push({a,b:footprint[(i+1)%4],minY:0,maxY:.95}));
 return true;
}

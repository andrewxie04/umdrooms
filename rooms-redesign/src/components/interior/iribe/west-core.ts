import { westFourthPlan, type Point, type Polygon } from './layout';
import type { RoofBuilder } from './roof';

// Enclosed lift adjoining the stair in the HDR Level 4 spread. The plan
// documents its enclosure and corridor-facing doors, not the cab interior.
const trace=(x:number,y:number)=>westFourthPlan(300+x*.375,396+y*.375);
export const WEST_LIFT:Polygon=[[455,531],[570,415],[693,527],[577,641]].map(([x,y])=>trace(x,y));
const a=WEST_LIFT[3],c=WEST_LIFT[0],length=Math.hypot(c[0]-a[0],c[1]-a[1]);
const u:Point=[(c[0]-a[0])/length,(c[1]-a[1])/length];
const center:Point=[(a[0]+c[0])/2,(a[1]+c[1])/2];
export const WEST_LIFT_FRONT={center,u,angle:-Math.atan2(u[1],u[0]),at:(x:number):Point=>[center[0]+u[0]*x,center[1]+u[1]*x]};
export function buildWestLift(b:RoofBuilder){
 const f=WEST_LIFT_FRONT,m=b.palette;
 for(let i=0;i<3;i++)b.wall(WEST_LIFT[i],WEST_LIFT[i+1],4.2,m.white);
 const left=f.at(-.85),right=f.at(.85);
 b.wall(a,left,4.2,m.white);b.wall(right,c,4.2,m.white);
 b.wall(left,right,1.8,m.white,false,2.4);
 // Closed paired doors are solid, so a visitor cannot walk into an unmodeled shaft.
 b.wall(left,right,2.4,m.metal,true,0,.07);
 const [x,z]=f.center;
 b.box(x,1.2,z,.018,2.4,.08,m.black,f.angle);
 for(const offset of [-.91,.91]){const p=f.at(offset);b.box(p[0],1.24,p[1],.09,2.48,.13,m.metal,f.angle);}
 b.box(x,2.47,z,1.91,.1,.13,m.metal,f.angle);
 const inward:Point=[WEST_LIFT.reduce((sum,p)=>sum+p[0],0)/4-x,WEST_LIFT.reduce((sum,p)=>sum+p[1],0)/4-z];
 const sign=(-u[1]*inward[0]+u[0]*inward[1])>0?-1:1;
 b.box(x-u[1]*.16*sign,2.72,z+u[0]*.16*sign,.32,.14,.08,m.black,f.angle);
}

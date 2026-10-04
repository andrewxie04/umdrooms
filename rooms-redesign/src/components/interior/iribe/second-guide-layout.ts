import { SECOND_COLUMN_POTENTIAL_FIRST_LEVEL_CORRESPONDENCES } from './second-column-trace';
import { firstGuidePlan } from './first-guide-layout';
import type { Point } from './layout';

/** Equal-weight similarity from twenty visually paired original Level 2/1
 * column markers. This registers the shared CAD underlay, not survey axes.
 * Source coordinates and IDs remain in second-column-trace.ts. */
const anchors=SECOND_COLUMN_POTENTIAL_FIRST_LEVEL_CORRESPONDENCES;
const mean=(key:'secondSourceCenter'|'firstSourceCenter'):Point=>anchors.reduce<Point>((sum,p)=>[sum[0]+p[key][0]/anchors.length,sum[1]+p[key][1]/anchors.length],[0,0]);
const s=mean('secondSourceCenter'),g=mean('firstSourceCenter');
let denominator=0,real=0,imaginary=0;
for(const p of anchors){
 const x=p.secondSourceCenter[0]-s[0],y=p.secondSourceCenter[1]-s[1],u=p.firstSourceCenter[0]-g[0],v=p.firstSourceCenter[1]-g[1];
 denominator+=x*x+y*y;real+=x*u+y*v;imaginary+=x*v-y*u;
}
const a=real/denominator,b=imaginary/denominator;
export function secondGuideFirst(x:number,y:number):Point{
 return [g[0]+a*(x-s[0])-b*(y-s[1]),g[1]+b*(x-s[0])+a*(y-s[1])];
}
export function secondGuidePlan(x:number,y:number):Point{
 const p=secondGuideFirst(x,y);return firstGuidePlan(p[0],p[1]);
}
const residuals=anchors.map(p=>{const q=secondGuideFirst(p.secondSourceCenter[0],p.secondSourceCenter[1]);return Math.hypot(q[0]-p.firstSourceCenter[0],q[1]-p.firstSourceCenter[1]);});
export const SECOND_GUIDE_REGISTRATION={
 anchorCount:anchors.length,scale:Math.hypot(a,b),rotationRadians:Math.atan2(b,a),
 rmsResidualPt:Math.sqrt(residuals.reduce((sum,d)=>sum+d*d,0)/residuals.length),maxResidualPt:Math.max(...residuals),
 evidence:'shared historical CAD underlay; unsurveyed diagram registration',
} as const;

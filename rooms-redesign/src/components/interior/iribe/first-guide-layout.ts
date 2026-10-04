import { groundGuidePlan } from './ground-guide-layout';
import type { Point } from './layout';

/** Corresponding column-symbol centers: Level 1 original guide page 8 to
 * Ground original page 6. A shared CAD underlay, not surveyed shaft alignment.
 * See atrium-stair-review-2026-10-03.md for source paths and fit residuals. */
export const FIRST_GUIDE_ANCHORS = [
 {path:92855,source:[170.184509,386.060211],ground:[182.038406,387.128311]},
 {path:92832,source:[216.839401,395.813599],ground:[229.454300,397.041107]},
 {path:92836,source:[207.852097,465.948792],ground:[220.320404,468.319595]},
 {path:92865,source:[150.324905,453.921219],ground:[161.854500,456.096817]},
] as const;
const mean=(key:'source'|'ground'):Point=>FIRST_GUIDE_ANCHORS.reduce<Point>((p,r)=>[p[0]+r[key][0]/FIRST_GUIDE_ANCHORS.length,p[1]+r[key][1]/FIRST_GUIDE_ANCHORS.length],[0,0]);
const s=mean('source'),g=mean('ground');
let denom=0,real=0,imag=0;
for(const row of FIRST_GUIDE_ANCHORS){
 const x=row.source[0]-s[0],y=row.source[1]-s[1],u=row.ground[0]-g[0],v=row.ground[1]-g[1];
 denom+=x*x+y*y;real+=x*u+y*v;imag+=x*v-y*u;
}
const a=real/denom,b=imag/denom;
export function firstGuideGround(x:number,y:number):Point {
 return [g[0]+a*(x-s[0])-b*(y-s[1]),g[1]+b*(x-s[0])+a*(y-s[1])];
}
export function firstGuidePlan(x:number,y:number):Point {
 const p=firstGuideGround(x,y);return groundGuidePlan(p[0],p[1]);
}
// Invert the same similarity for clipping and support queries. Keeping one
// source frame avoids fitting furniture and circulation to separate envelopes.
const worldOrigin=firstGuidePlan(0,0),worldX=firstGuidePlan(1,0),worldY=firstGuidePlan(0,1);
const ux=worldX[0]-worldOrigin[0],uz=worldX[1]-worldOrigin[1];
const vx=worldY[0]-worldOrigin[0],vz=worldY[1]-worldOrigin[1];
const determinant=ux*vz-vx*uz;
export const FIRST_GUIDE_METRIC=Math.hypot(ux,uz);
export function firstGuideNativePoint(point:Point):Point {
 const x=point[0]-worldOrigin[0],z=point[1]-worldOrigin[1];
 return [(x*vz-z*vx)/determinant,(ux*z-uz*x)/determinant];
}

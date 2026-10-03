import { westFourthPlan, type Point } from './layout';
import type { RoofBuilder } from './roof';

// Built-in runs visible in HDR's Level 4 west-wing plan. Dimensions, cabinet
// fronts, worktop finishes and faucet form are estimates from plan symbols.
const runs:Readonly<Record<string,{from:Point;to:Point;sink:boolean}>>={
 '4-west-support-counter':{from:[385,294],to:[420,326],sink:true},
 '4-west-support-long':{from:[270,396],to:[340,326],sink:false},
};
export function westSupportCounter(id:string){
 const run=runs[id];if(!run)return;
 const a=westFourthPlan(...run.from),b=westFourthPlan(...run.to),length=Math.hypot(b[0]-a[0],b[1]-a[1]);
 const u:Point=[(b[0]-a[0])/length,(b[1]-a[1])/length];
 return {a,b,u,length,sink:run.sink,center:[(a[0]+b[0])/2,(a[1]+b[1])/2] as Point,angle:-Math.atan2(u[1],u[0]),depth:.5};
}
export function buildWestSupport(id:string,b:RoofBuilder,run=westSupportCounter(id)){
 if(!run)return;
 const {a,center:[x,z],u,length,angle,depth,sink}=run,m=b.palette;
 b.box(x,.43,z,length,.8,depth,m.white,angle);
 if(!sink)b.box(x,.855,z,length+.03,.05,depth+.04,m.metal,angle);
 else{
  // Split the worktop around the basin so it has an actual recessed opening.
  const cut=length*.12,halfWidth=.20,halfDepth=.135;
  const top=(along:number,across:number,width:number,d:number)=>b.box(x+u[0]*along-u[1]*across,.855,z+u[1]*along+u[0]*across,width,.05,d,m.metal,angle);
  const left=cut-halfWidth+length/2+.015,right=length/2+.015-cut-halfWidth;
  top(-length/2-.015+left/2,0,left,depth+.04);
  top(cut+halfWidth+right/2,0,right,depth+.04);
  const strip=(depth+.04)/2-halfDepth;
  for(const side of [-1,1])top(cut,side*(halfDepth+strip/2),halfWidth*2,strip);
 }
 const footprint:Point[]=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([along,across])=>[x+u[0]*length/2*along-u[1]*depth/2*across,z+u[1]*length/2*along+u[0]*depth/2*across]);
 for(let i=0;i<4;i++)b.barriers.push({a:footprint[i],b:footprint[(i+1)%4],minY:0,maxY:.88});
 // Modest cabinet divisions keep the run legible at eye level.
 const count=Math.max(2,Math.round(length/.6));
 for(let i=1;i<count;i++)b.box(a[0]+u[0]*length*i/count,.43,a[1]+u[1]*length*i/count,.012,.76,depth+.006,m.metal,angle);
 if(sink){
  const sx=x+u[0]*length*.12,sz=z+u[1]*length*.12;
  b.box(sx,.837,sz,.40,.008,.27,m.metal,angle);
  b.cylinder(sx,.843,sz,.028,.003,m.black);
  const fx=sx+u[1]*.19,fz=sz-u[0]*.19;
  b.cylinder(fx,1.00,fz,.018,.25,m.metal);
  b.box(fx-u[1]*.07,1.12,fz+u[0]*.07,.035,.035,.16,m.metal,angle);
 }
}

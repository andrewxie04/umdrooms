import * as THREE from 'three';
import { CAFE_ORIGIN, CAFE_LENGTH, CAFE_U, cafePoint, type Polygon } from './layout';
import type { RoofBuilder } from './roof';

interface CafeBuilder extends RoofBuilder {
 chair(x:number,z:number,angle:number,m:THREE.Material):void;
 table(x:number,z:number,r:number,m:THREE.Material):void;
}
/** Materials and fixtures reference HDR's café photograph. No photographed
 * pixels, menu prices or product claims are embedded in the model. */
export function buildCafe(b:CafeBuilder){
 const {palette:m}=b,angle=-Math.atan2(CAFE_U[1],CAFE_U[0]),length=CAFE_LENGTH;
 const material=(color:number,roughness=.65)=>{const mat=new THREE.MeshStandardMaterial({color,roughness,side:THREE.DoubleSide});b.materials.push(mat);return mat;};
 const backsplash=material(0xe7b63e),wood=material(0x87623a),woodBacking=material(0x3a3028),soffit=material(0xe1dfd5),green=material(0x8ab82e),gray=material(0x575c5c),steel=material(0xaaaead,.32);
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material,rotation=0)=>{const p=cafePoint(x,z);b.box(p[0],y,p[1],w,h,d,mat,angle+rotation);};
 const cylinder=(x:number,y:number,z:number,r:number,h:number,mat:THREE.Material)=>{const p=cafePoint(x,z);b.cylinder(p[0],y,p[1],r,h,mat);};
 const polygon=(p:Polygon)=>p.map(([x,z])=>cafePoint(x,z));
 const obstacle=(p:Polygon,height:number)=>{const world=polygon(p);world.forEach((a,i)=>b.barriers.push({a,b:world[(i+1)%world.length],minY:0,maxY:height}));};
 const volume=(outline:Polygon,base:number,height:number,mat:THREE.Material)=>{
  const shape=new THREE.Shape(outline.map(([x,z])=>new THREE.Vector2(x,-z))),g=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});
  g.rotateX(-Math.PI/2);g.rotateY(angle);g.translate(CAFE_ORIGIN[0],base,CAFE_ORIGIN[1]);b.put(g,mat);
 };
 const roundedCounter=(end:number,inset=0):Polygon=>[
  [inset,-.62],[inset+.035,-.24],[inset+.12,-.09],[inset+.27,-inset],[end-.22,-inset],[end-.07,-.07-inset],[end,-.22-inset],[end,-.72+inset],[inset,-.72+inset],
 ];
 const end=length-1.45,outline=roundedCounter(end);
 volume(roundedCounter(end-.035,.035),.06,.24,steel);volume(outline,.3,.7,m.white);volume(outline,1,.055,m.white);obstacle(outline,1.55);
 // Recessed stainless toe kick and metal seams below the white counter front.
 for(let x=.6;x<end-.2;x+=1.4)box(x,.17,-.012,.009,.2,.01,m.black);
 // Glass sneeze guard, with a metal rail and serving trays behind it.
 for(let x=.35;x<end-1;x+=1.4){cylinder(x,1.29,-.13,.021,.47,steel);box(x+.66,1.51,-.13,1.32,.028,.028,steel);}
 box((end-1)/2+.1,1.29,-.13,end-1.25,.43,.015,m.glass);
 box((end-1)/2+.1,1.52,-.34,end-1.25,.015,.43,m.glass);
 for(let x=.8;x<end-1.4;x+=.75){box(x,1.07,-.42,.59,.035,.35,steel);box(x,1.095,-.42,.51,.015,.28,m.black);}
 // Back worktop, yellow backsplash and white storage doors.
 box(length/2,.49,-2.02,length,.94,.66,m.white);box(length/2,.99,-2.02,length,.06,.72,steel);
 obstacle([[0,-2.35],[length,-2.35],[length,-1.66],[0,-1.66]],1.03);
 const backA=cafePoint(0,-2.43),backB=cafePoint(length,-2.43);b.wall(backA,backB,6.3,soffit);
 box(length/2,1.61,-2.338,length,.98,.035,backsplash);
 for(let x=.55;x<length;x+=.85){box(x,.51,-1.677,.012,.78,.015,steel);box(x+.25,.79,-1.656,.23,.02,.025,steel);}
 // Coffee machine and cup stacks, as small three-dimensional fixtures.
 box(6.1,1.31,-1.93,1.04,.57,.5,steel);box(6.1,1.36,-1.657,.93,.31,.025,m.black);
 for(const x of [5.85,6.35]){cylinder(x,1.46,-1.59,.018,.2,steel);box(x,1.16,-1.63,.22,.04,.16,steel);}
 for(const x of [6.85,7.1])for(let j=0;j<5;j++)cylinder(x,1.07+j*.04,-2.02,.045,.05,m.white);
 box(7.65,1.22,-2.02,.38,.38,.36,m.black);cylinder(7.65,1.53,-2.02,.1,.25,steel);
 // Checkout terminal and black refrigerated case at the end of the service line.
 box(end-.48,1.09,-.42,.32,.04,.27,m.black);box(end-.48,1.22,-.42,.035,.26,.035,steel);box(end-.48,1.38,-.42,.39,.25,.035,m.black);
 box(length-.65,.63,-.45,1.13,1.2,.89,m.black);obstacle([[length-1.215,-.895],[length-.085,-.895],[length-.085,-.005],[length-1.215,-.005]],1.25);
 box(length-.65,.76,.006,.99,.87,.018,m.glass);for(const y of [.35,.65,.95])box(length-.65,y,-.4,.97,.025,.7,steel);
 // Menu screens use a tiny locally drawn graphic, not an image overlay.
 const menuCenters=[1.5,3.55,5.6,7.65,9.45];
 menuCenters.forEach((x,index)=>{
  const width=index===4?1.12:1.82,height=.94;
  box(x,2.56,-2.23,width+.07,height+.07,.08,m.black);
  const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d')!;
  ctx.fillStyle=index===0?'#183d69':'#f0eee5';ctx.fillRect(0,0,512,256);
  if(index===0){
   ctx.fillStyle='#4876a0';for(let i=0;i<14;i++)ctx.fillRect(20+i*36,18+(i%3)*18,1,215);
   ctx.fillStyle='#ffffff';ctx.font='500 37px Arial';ctx.textAlign='center';ctx.fillText('BREAKPOINT',256,124);ctx.font='24px Arial';ctx.fillText('CAFÉ',256,164);
  }else{
   ctx.fillStyle='#306281';ctx.fillRect(0,0,512,46);
   for(let col=0;col<2;col++)for(let row=0;row<6;row++){
    ctx.fillStyle=row%3===0?'#657581':'#b7b8b3';ctx.fillRect(26+col*251,65+row*28,row%2?160:184,row%3===0?5:3);
   }
  }
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;b.textures.push(map);
  const mat=new THREE.MeshBasicMaterial({map});b.materials.push(mat);
  const p=cafePoint(x,-2.18),g=new THREE.PlaneGeometry(width,height);g.rotateY(angle);g.translate(p[0],2.56,p[1]);b.put(g,mat);
 });
 // Rounded canopy with a light underside and a tall timber-slat fascia above.
 const canopy:Polygon=[[0,.32],[length-.22,.32],[length+.08,.23],[length+.27,.02],[length+.3,-2.5],[-.15,-2.5],[-.15,.05]];
 volume(canopy,3.09,.15,soffit);
 for(let i=0;i<canopy.length;i++){
  const a=canopy[i],end=canopy[(i+1)%canopy.length];if(i===3||i===4||i===5)continue;
  const pa=cafePoint(...a),pb=cafePoint(...end),len=Math.hypot(pb[0]-pa[0],pb[1]-pa[1]),count=Math.ceil(len/.08);
  b.wall(pa,pb,3.05,woodBacking,false,3.24,.05);
  for(let j=0;j<count;j++){const t=(j+.5)/count;b.box(pa[0]+(pb[0]-pa[0])*t,4.765,pa[1]+(pb[1]-pa[1])*t,.04,3.05,.09,wood,-Math.atan2(pb[1]-pa[1],pb[0]-pa[0]));}
 }
 for(let x=.55;x<length;x+=1.35)cylinder(x,3.071,-.3,.075,.025,m.light);
 // Round white café tables with the lime and charcoal chairs in HDR's photo.
 for(const [x,z] of [[2.1,2.65],[6,2.7],[9,2.75]]){
  const p=cafePoint(x,z);b.table(p[0],p[1],.56,m.white);
  for(const side of [-1,1]){const q=cafePoint(x+side*.9,z);b.chair(q[0],q[1],angle+(side===1?Math.PI/2:-Math.PI/2),side===1?green:gray);}
 }
}

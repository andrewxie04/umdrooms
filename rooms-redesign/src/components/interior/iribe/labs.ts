import * as THREE from 'three';
import { pointInPolygon, type InteriorRoom, type Point } from './layout';
import type { RoofBuilder } from './roof';

/** Local coordinates start at the lobby-facing edge. Placement is interpreted
 * from smartlab.cs.umd.edu/gallery; the photos do not provide dimensions. */
export function labFrame(room:InteriorRoom){
 const a=room.polygon[0],b=room.polygon[1],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
 const u:Point=[(b[0]-a[0])/length,(b[1]-a[1])/length];
 let v:Point=[-u[1],u[0]];
 if(!pointInPolygon([(a[0]+b[0])/2+v[0]*.2,(a[1]+b[1])/2+v[1]*.2],room.polygon))v=[-v[0],-v[1]];
 return {length,u,v,angle:-Math.atan2(u[1],u[0]),at:(x:number,z:number):Point=>[a[0]+u[0]*x+v[0]*z,a[1]+u[1]*x+v[1]*z]};
}

type LabBuilder=Pick<RoofBuilder,'box'|'cylinder'|'put'|'palette'|'materials'|'barriers'>;
export function buildSmallArtifacts(room:InteriorRoom,b:LabBuilder){
 const f=labFrame(room),m=b.palette;
 const make=(color:number,roughness=.65)=>{const mat=new THREE.MeshStandardMaterial({color,roughness});b.materials.push(mat);return mat;};
 const yellow=make(0xe0ad32),red=make(0xc24934),cuttingMat=make(0x344e4d),orange=make(0xbc6524,.25);
 const localBox=(x:number,y:number,z:number,w:number,h:number,d:number,material:THREE.Material,rotation=0)=>{
  const p=f.at(x,z);b.box(p[0],y,p[1],w,h,d,material,f.angle+rotation);
 };
 const cylinder=(x:number,y:number,z:number,r:number,h:number,material:THREE.Material)=>{const p=f.at(x,z);b.cylinder(p[0],y,p[1],r,h,material);};
 const tube=(a:[number,number,number],end:[number,number,number],r:number,material:THREE.Material)=>{
  const pa=f.at(a[0],a[2]),pb=f.at(end[0],end[2]),start=new THREE.Vector3(pa[0],a[1],pa[1]),finish=new THREE.Vector3(pb[0],end[1],pb[1]);
  const g=new THREE.CylinderGeometry(r,r,start.distanceTo(finish),12);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),finish.clone().sub(start).normalize()));g.translate(...start.add(finish).multiplyScalar(.5).toArray());b.put(g,material);
 };
 const obstacle=(x:number,z:number,w:number,d:number,rotation=0)=>{
  const c=Math.cos(rotation),s=Math.sin(rotation);
  const corners=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([u,v])=>f.at(x+u*c+v*s,z-u*s+v*c));
  corners.forEach((a,i)=>b.barriers.push({a,b:corners[(i+1)%4],minY:0,maxY:1.9}));
 };
 const bench=(x:number,z:number,w:number,d:number,rotation=0)=>{
  localBox(x,.84,z,w,.065,d,m.oak,rotation);
  const c=Math.cos(rotation),s=Math.sin(rotation);
  for(const u of [-w/2+.09,w/2-.09])for(const v of [-d/2+.09,d/2-.09]){
   const px=x+u*c+v*s,pz=z-u*s+v*c;
   localBox(px,.425,pz,.045,.79,.045,m.metal);cylinder(px,.045,pz,.045,.06,m.black);
  }
  localBox(x,.25,z,w-.12,.04,.035,m.metal,rotation);obstacle(x,z,w,d,rotation);
 };
 const printer=(x:number,z:number,covered=false)=>{
  // Enclosed white desktop printer with an open front, gantry and build plate.
  localBox(x,.91,z,.44,.11,.43,m.white);
  for(const side of [-1,1])localBox(x+side*.205,1.13,z,.035,.4,.43,m.white);
  localBox(x,1.35,z,.44,.045,.43,m.white);localBox(x,1.13,z+.2,.38,.4,.035,m.white);
  localBox(x,1.025,z,.33,.025,.3,m.black);
  tube([x-.18,1.27,z],[x+.18,1.27,z],.008,m.metal);localBox(x,1.23,z,.075,.085,.065,m.black);
  if(covered)localBox(x,1.15,z-.206,.36,.34,.016,orange);
  localBox(x+.13,.919,z-.224,.075,.04,.01,m.black);
 };
 const monitor=(x:number,z:number,rotation=0)=>{
  localBox(x,.88,z,.28,.025,.19,m.black,rotation);localBox(x,1.01,z,.035,.24,.035,m.metal);
  localBox(x,1.19,z,.46,.29,.035,m.black,rotation);
 };
 const stool=(x:number,z:number)=>{
  cylinder(x,.52,z,.21,.06,m.black);cylinder(x,.265,z,.025,.49,m.metal);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5; tube([x,.1,z],[x+Math.cos(a)*.23,.06,z+Math.sin(a)*.23],.016,m.metal);}
  obstacle(x,z,.44,.44);
 };
 // Perimeter workbenches follow the sloping window wall, rather than a world-
 // aligned grid. The central circulation zone is deliberately left open.
 const toLocal=(p:Point):Point=>{const dx=p[0]-room.polygon[0][0],dz=p[1]-room.polygon[0][1];return [dx*f.u[0]+dz*f.u[1],dx*f.v[0]+dz*f.v[1]];};
 const rearA=toLocal(room.polygon[2]),rearB=toLocal(room.polygon[3]);
 const rearSlope=(rearA[1]-rearB[1])/(rearA[0]-rearB[0]),rearZ=(x:number)=>rearB[1]+rearSlope*(x-rearB[0])-.55;
 const rearAngle=-Math.atan(rearSlope);
 for(const x of [1.35,3.3,5.25,7.2])bench(x,rearZ(x),1.82,.72,rearAngle);
 monitor(1.3,rearZ(1.3)+.05,rearAngle);printer(3.3,rearZ(3.3));printer(5.25,rearZ(5.25),true);
 // Small machine with a vertical spindle, as visible on the window bench.
 localBox(7.2,.93,rearZ(7.2),.35,.1,.38,m.black);cylinder(7.3,1.23,rearZ(7.2)+.12,.032,.57,m.metal);
 localBox(7.22,1.46,rearZ(7.2),.24,.13,.23,m.white);cylinder(7.17,1.32,rearZ(7.2)-.03,.014,.16,m.metal);
 for(const x of [1.35,5.25])stool(x,rearZ(x)-.85);
 // Lobby-side tool bench, black pegboard and red/blue handled tools.
 bench(1.2,.67,2,.78);localBox(1.2,1.36,.34,2,.91,.045,m.black);
 for(let row=0;row<7;row++)for(let col=0;col<17;col++)localBox(.32+col*.11,1.02+row*.1,.366,.012,.012,.009,m.metal);
 for(let i=0;i<7;i++){localBox(.55+i*.2,1.37,.4,.025,.18,.025,m.metal);localBox(.55+i*.2,1.28,.4,.044,.11,.04,i%2?red:cuttingMat);}
 localBox(1.2,.88,.75,1.4,.012,.5,cuttingMat);
 // Mobile whiteboard beside the bench, edge-on to the lobby glazing.
 localBox(2.55,1.22,1.05,.055,1.45,1.05,m.white);
 for(const z of [.57,1.53]){localBox(2.55,.9,z,.035,1.72,.035,m.black);localBox(2.55,.1,z,.65,.035,.055,m.black);}
 obstacle(2.55,1.05,.65,1.08);
 // Front-right printer table, leaving the actual door centered and unobstructed.
 bench(6.65,.72,1.85,.8);printer(6.45,.72);stool(7.05,1.55);
 // Oak storage, inset black worktop and sink along the solid end wall.
 localBox(8.48,.43,2.45,.61,.82,2.05,m.oak);localBox(8.48,.87,2.45,.67,.065,2.13,m.black);
 obstacle(8.48,2.45,.67,2.13);
 localBox(8.49,1.84,2.45,.5,.7,1.95,m.oak);
 for(const z of [1.8,2.45,3.1]){
  localBox(8.162,.43,z,.012,.73,.014,m.black);localBox(8.232,1.84,z,.012,.66,.014,m.black);
  localBox(8.135,.65,z+.16,.025,.025,.14,m.metal);localBox(8.218,1.59,z+.16,.025,.025,.14,m.metal);
 }
 localBox(8.41,.907,2.8,.39,.02,.48,m.metal);localBox(8.41,.92,2.8,.3,.016,.37,m.black);
 tube([8.64,.91,2.8],[8.64,1.15,2.8],.019,m.metal);tube([8.64,1.15,2.8],[8.42,1.15,2.8],.019,m.metal);
 // Articulated silver fume extraction arm and vertical service riser.
 tube([8.65,5.9,2],[8.65,3.1,2],.12,m.metal);tube([8.65,3.1,2],[7.8,2.8,2.15],.08,m.metal);tube([7.8,2.8,2.15],[7.45,1.45,2.3],.075,m.metal);
 // Tall yellow small-parts drawers and a floor-standing green machine.
 localBox(.35,1.02,3.6,.56,2.04,.42,m.black);obstacle(.35,3.6,.56,.42);
 for(let row=0;row<10;row++)for(const dx of [-.14,.14]){localBox(.35+dx,.14+row*.19,3.376,.245,.145,.035,yellow);localBox(.35+dx,.16+row*.19,3.352,.065,.022,.016,m.black);}
 localBox(.42,.53,2.55,.64,1.06,.6,m.black);localBox(.42,1.1,2.55,.69,.17,.63,cuttingMat);obstacle(.42,2.55,.69,.63);
}

export const DRONE_CAGE_HEIGHT=15*.3048;
// The lab overview rounds this to 430 sq ft; the equipment page gives the
// stronger dimensional reference of 18 × 24 ft (432 sq ft).
export const DRONE_CAGE_WIDTH=24*.3048;
export const DRONE_CAGE_DEPTH=18*.3048;
export const DRONE_CAGE_AREA=DRONE_CAGE_WIDTH*DRONE_CAGE_DEPTH;
export const DRONE_NET_PITCH=1.875*.0254;
export const DRONE_CAGE:readonly Point[]=[[.05,.8],[.05+DRONE_CAGE_WIDTH,.8],[.05+DRONE_CAGE_WIDTH,.8+DRONE_CAGE_DEPTH],[.05,.8+DRONE_CAGE_DEPTH]];
export const DRONE_GATE:readonly [number,number]=[4.05,5.15];
export const DRONE_CAMERAS:readonly Point[]=DRONE_CAGE.flatMap((a,i)=>{
 const end=DRONE_CAGE[(i+1)%4];return [0,1/3,2/3].map(t=>[a[0]+(end[0]-a[0])*t,a[1]+(end[1]-a[1])*t] as Point);
});
export function buildDroneLab(room:InteriorRoom,b:LabBuilder&Pick<RoofBuilder,'textures'|'label'>){
 const f=labFrame(room),m=b.palette;
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,material:THREE.Material,rotation=0)=>{const p=f.at(x,z);b.box(p[0],y,p[1],w,h,d,material,f.angle+rotation);};
 // Mipmapped alpha net: one material batch instead of thousands of wires.
 const pixels=new Uint8Array(64*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){const i=(y*64+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=35;pixels[i+3]=x<2||y<2?230:0;}
 const map=new THREE.DataTexture(pixels,64,64);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.generateMipmaps=true;map.minFilter=THREE.LinearMipmapLinearFilter;map.magFilter=THREE.LinearFilter;map.anisotropy=4;map.needsUpdate=true;b.textures.push(map);
 const net=new THREE.MeshStandardMaterial({map,transparent:true,depthWrite:false,side:THREE.DoubleSide,roughness:1});b.materials.push(net);
 const netWall=(a:Point,end:Point,base=0,height=DRONE_CAGE_HEIGHT,collision=true)=>{
  const pa=f.at(...a),pb=f.at(...end),length=Math.hypot(pb[0]-pa[0],pb[1]-pa[1]);
  const g=new THREE.PlaneGeometry(length,height);const uv=g.getAttribute('uv');
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*length/DRONE_NET_PITCH,uv.getY(i)*height/DRONE_NET_PITCH);
  g.rotateY(-Math.atan2(pb[1]-pa[1],pb[0]-pa[0]));g.translate((pa[0]+pb[0])/2,base+height/2,(pa[1]+pb[1])/2);b.put(g,net);
  if(collision)b.barriers.push({a:pa,b:pb,minY:base,maxY:base+height});
 };
 DRONE_CAGE.forEach((a,i)=>{
  const end=DRONE_CAGE[(i+1)%DRONE_CAGE.length];
  if(i===0){
   netWall(a,[DRONE_GATE[0],a[1]]);netWall([DRONE_GATE[1],a[1]],end);
   netWall([DRONE_GATE[0],a[1]],[DRONE_GATE[1],a[1]],2.15,DRONE_CAGE_HEIGHT-2.15,false);
   for(const x of DRONE_GATE)box(x,1.075,a[1],.045,2.15,.045,m.black);
  }else netWall(a,end);
  box(a[0],DRONE_CAGE_HEIGHT/2,a[1],.05,DRONE_CAGE_HEIGHT,.05,m.black);
  const pa=f.at(...a),pb=f.at(...end),len=Math.hypot(pb[0]-pa[0],pb[1]-pa[1]);
  b.box((pa[0]+pb[0])/2,DRONE_CAGE_HEIGHT,(pa[1]+pb[1])/2,len,.045,.045,m.black,-Math.atan2(pb[1]-pa[1],pb[0]-pa[0]));
 });
 for(const p of DRONE_CAMERAS){
  box(p[0],(DRONE_CAGE_HEIGHT+4.01)/2,p[1],.025,DRONE_CAGE_HEIGHT-4.01,.025,m.black);
  box(p[0],3.95,p[1],.16,.11,.15,m.black);
  box(p[0],3.95,p[1]-.08,.06,.065,.025,m.metal);
 }
 const foam=new THREE.MeshStandardMaterial({color:0x454342,roughness:1});b.materials.push(foam);
 box(.05+DRONE_CAGE_WIDTH/2,.017,.8+DRONE_CAGE_DEPTH/2,DRONE_CAGE_WIDTH,.034,DRONE_CAGE_DEPTH,foam);

 const shape=new THREE.Shape(DRONE_CAGE.map(([x,z])=>{const p=f.at(x,z);return new THREE.Vector2(p[0],-p[1]);}));
 const roof=new THREE.ShapeGeometry(shape),uv=roof.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/DRONE_NET_PITCH,uv.getY(i)/DRONE_NET_PITCH);roof.rotateX(-Math.PI/2);roof.translate(0,DRONE_CAGE_HEIGHT,0);b.put(roof,net);
 const obstacle=(x:number,z:number,w:number,d:number)=>{const corners=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([u,v])=>f.at(x+u,z+v));corners.forEach((a,i)=>b.barriers.push({a,b:corners[(i+1)%4],minY:0,maxY:1.8}));};
 // Repair station occupies the side aisle beside the net. Its location is
 // estimated because the public room diagram is not dimensioned.
 const benchBox=(u:number,y:number,v:number,w:number,h:number,d:number,material:THREE.Material,rotation=0)=>box(8.45-v,y,.8+u,d,h,w,material,rotation);
 benchBox(1.9,.8,0,3.8,.075,.65,m.oak);obstacle(8.45,2.7,.65,3.8);
 for(const u of [.1,1.9,3.7])for(const v of [-.24,.24])benchBox(u,.4,v,.055,.78,.055,m.metal);
 // The reference repair bench has a tall perforated tool panel and shelf.
 benchBox(2.05,1.4,-.28,2.8,.86,.045,m.metal);benchBox(2.05,1.88,-.2,2.85,.055,.57,m.white);
 for(const u of [.66,3.44])benchBox(u,1.34,-.28,.04,1.05,.04,m.metal);
 for(let row=0;row<6;row++)for(let col=0;col<24;col++)benchBox(.72+col*.115,1.06+row*.13,-.251,.012,.025,.008,m.black);
 for(let i=0;i<8;i++){benchBox(.9+i*.25,1.43,-.225,.026,.2,.025,m.black);benchBox(.9+i*.25,1.32,-.224,.044,.09,.034,i%2?m.white:m.black);}
 for(const u of [.9,1.55]){benchBox(u,.99,0,.46,.32,.25,m.white);benchBox(u,1.045,.134,.34,.085,.012,m.black);}
 benchBox(3.2,.85,.04,.75,.018,.5,m.black);
 // Two tucked-in chairs leave the narrow side aisle traversable.
 for(const z of [1.4,4.05]){
  box(8.27,.46,z,.44,.065,.44,m.black);box(8.07,.75,z,.045,.5,.43,m.black);
  for(const dx of [-.17,.17])for(const dz of [-.17,.17])box(8.27+dx,.225,z+dz,.025,.45,.025,m.metal);
  obstacle(8.27,z,.46,.46);
 }
 // Small quadrotor on the bench: frame, four motors and propellers.
 box(8.43,.92,3.6,.15,.085,.15,m.black);
 for(const angle of [Math.PI/4,-Math.PI/4])box(8.43,.91,3.6,.48,.025,.025,m.black,angle);
 for(const dx of [-.16,.16])for(const dz of [-.16,.16]){
  const p=f.at(8.43+dx,3.6+dz);b.cylinder(p[0],.945,p[1],.025,.06,m.metal);box(8.43+dx,.985,3.6+dz,.19,.009,.022,m.black,dx*3);
 }
 // Storage is outside the flight volume, along the tapering rear window wall.
 for(const y of [.18,.65,1.1,1.6])box(1.4,y,7.15,1.05,.035,.5,m.black);
 for(const x of [.9,1.9])for(const z of [6.92,7.38])box(x,.86,z,.035,1.7,.035,m.black);
 for(const y of [.35,.85])box(1.4,y,7.15,.63,.27,.36,m.oak);obstacle(1.4,7.15,1.05,.5);
 const p=f.at(2.45,DRONE_CAGE[0][1]-.04);b.label('MARYLAND ROBOTICS CENTER',p[0],2.85,p[1],f.angle,2.65);
}

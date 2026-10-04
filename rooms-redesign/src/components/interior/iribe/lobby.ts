import * as THREE from 'three';
import { createLobbyFurniture, type LobbyFurnitureBuilder } from './lobby-furniture';
import { LOBBY_SOFAS, LOBBY_CHAIRS, LOBBY_TABLES } from './lobby-layout';
import { ATRIUM_VOID, pointInPolygon, type Point } from './layout';
import { groundGuidePlan } from './ground-guide-layout';
import type { RoofBuilder } from './roof';

/** Source contours and positions follow the published Ground drawing.
 * Heights, hardware and color assignment are interpreted from the photograph. */
export function buildLobbySeating(b:LobbyFurnitureBuilder){
 const furniture=createLobbyFurniture(b);
 for(const sofa of LOBBY_SOFAS)furniture.sofa(sofa.seat,sofa.back);
 for(const chair of LOBBY_CHAIRS)furniture.chair(chair.center,chair.angle,chair.color,chair.width,chair.depth);
 for(const table of LOBBY_TABLES)furniture.table(table.center,table.radius,table.height);
}

/** The pale lounge ceiling and pendant tubes are visible in UMD's public lobby
 * photo. This is a separate finish below the darker circulation soffit. Fixture
 * spacing is interpreted, not a surveyed lighting/reflected-ceiling plan. */
export function buildLobbyCeiling(b:RoofBuilder){
 // The older semantic shortcut polygon omits several traced furniture groups.
 // Use the photographed open lounge's approximate finish region in the common
 // drawing frame. No reflected-ceiling plan is available for exact boundaries.
 const region=[[229,299],[368,299],[368,388],[229,388]].map(([x,y])=>groundGuidePlan(x,y));
 // Stop before the atrium opening so this lower finish cannot cap the
 // staircase or its landing.
 const edge=Math.min(...ATRIUM_VOID.map(p=>p[0]))-.12;
 const clipped:Point[]=[];
 region.forEach((a,i)=>{
  const end=region[(i+1)%region.length];
  if(a[0]<=edge)clipped.push(a);
  if((a[0]<=edge)!==(end[0]<=edge)){
   const t=(edge-a[0])/(end[0]-a[0]);clipped.push([edge,a[1]+(end[1]-a[1])*t]);
  }
 });
 const finish=new THREE.MeshStandardMaterial({color:0xdcdad2,roughness:.78,side:THREE.DoubleSide});
 const seam=new THREE.MeshStandardMaterial({color:0xb7b7af,roughness:.8});
 b.materials.push(finish,seam);
 // A positive separation from the main soffit prevents overlapping coplanar faces.
 b.surface(clipped,6.25,finish);
 const segment=(a:Point,end:Point,y:number,w:number,m:THREE.Material)=>{
  let start=groundGuidePlan(...a),finish=groundGuidePlan(...end);
  if(start[0]>edge&&finish[0]>edge)return;
  if((start[0]>edge)!==(finish[0]>edge)){
   const t=(edge-start[0])/(finish[0]-start[0]),cut:Point=[edge,start[1]+(finish[1]-start[1])*t];
   if(start[0]>edge)start=cut;else finish=cut;
  }
  b.wall(start,finish,.012,m,false,y,w);
 };
 for(let x=231;x<367;x+=11){
  const start=groundGuidePlan(x,300),finish=groundGuidePlan(x,387);
  if(pointInPolygon(start,region)&&pointInPolygon(finish,region))segment([x,300],[x,387],6.235,.008,seam);
 }
 for(let row=0;row<5;row++){
  const z=308+row*15;
  for(const offset of [-.3,.3])segment([230,z+offset],[366,z+offset],6.226,.025,b.palette.black);
  for(let column=0;column<6;column++){
   const x=237+column*22+(row%2)*4,p=groundGuidePlan(x,z+5);
   if(!pointInPolygon(p,clipped))continue;
   const length=.62+(column%3)*.12,bottom=5.16-(row%2)*.14,top=bottom+length;
   b.cylinder(p[0],6.225,p[1],.062,.027,b.palette.white);
   b.cylinder(p[0],(top+6.22)/2,p[1],.009,6.22-top,b.palette.metal);
   b.cylinder(p[0],top+.025,p[1],.027,.05,b.palette.metal);
   b.cylinder(p[0],bottom+length/2,p[1],.021,length,b.palette.light);
   const spot=groundGuidePlan(x+8,z+1);
   if(pointInPolygon(spot,clipped)){
    b.cylinder(spot[0],6.231,spot[1],.066,.018,b.palette.metal);
    b.cylinder(spot[0],6.219,spot[1],.044,.009,b.palette.light);
   }
  }
 }
}

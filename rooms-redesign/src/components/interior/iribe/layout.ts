/** Plan coordinates trace UMD wayfinding's first-floor sheet (1080 × 1920).
 * Positive Z is down that sheet. All floors share this local building frame.
 * Scale is an estimate pending dimensioned drawings; topology follows the plans.
 */
export type Point = readonly [number, number];
export type Polygon = readonly Point[];
export type FloorId = 'G' | '1' | '2' | '3' | '4' | '5' | 'R';
export type RoomKind = 'classroom' | 'lounge' | 'lab' | 'conference' | 'cafe' | 'auditorium' | 'service' | 'garden' | 'office' | 'workroom' | 'restroom';
export interface InteriorRoom { id: string; name: string; floor: FloorId; polygon: Polygon; door: Point; kind: RoomKind; evidence: 'plan' | 'photo'; listed?: boolean; exteriorEdges?: readonly number[]; glazedEdges?: readonly number[]; timberEdges?: readonly number[]; doorWidth?: number; arrivalFocus?:Point; additionalDoors?: Point[]; officeMeeting?: boolean; officeMeetingRadius?:number; officeMeetingSeats?:2|4; deskBanks?: readonly { from:Point; to:Point; seatsPerSide:number }[]; }
export const PLAN_SCALE = .085;
export const plan = (x: number, y: number): Point => [(x - 660) * PLAN_SCALE, (y - 1100) * PLAN_SCALE];
const trace = (points: Polygon): Polygon => points.map(([x,y]) => plan(x,y));
export const MAIN_FOOTPRINT = trace([[515,449],[740,449],[827,1230],[835,1320],[819,1400],[787,1463],[750,1508],[408,1760],[220,1620],[380,1414],[432,1340],[470,1250],[497,1155],[505,1090]]);
export const FLOOR_HEIGHT: Record<FloorId,number> = {G:0,'1':6.5,'2':10.9,'3':15.3,'4':19.7,'5':24.1,R:28.5};
export const FLOOR_LABEL: Record<FloorId,string> = {G:'Ground floor','1':'Level 1','2':'Level 2','3':'Level 3','4':'Level 4','5':'Level 5',R:'Rooftop'};
function room(floor:FloorId,id:string,name:string,kind:RoomKind,points:Polygon,door:Point): InteriorRoom {
 return {floor,id,name,kind,polygon:trace(points),door:plan(...door),evidence:'plan'};
}
export const ROOMS: InteriorRoom[] = [
 room('1','1207','Collaborative classroom','classroom',[[558,863],[710,863],[713,1019],[557,1019]],[630,1019]),
 room('1','1104','DICE lounge','lounge',[[732,1090],[790,1082],[801,1174],[732,1168]],[732,1128]),
 room('1','1108','Tutoring','lounge',[[738,1180],[802,1190],[822,1305],[720,1268]],[727,1228]),
 room('1','1116','Collaborative classroom','classroom',[[715,1284],[811,1325],[801,1380],[773,1437],[735,1477],[674,1528],[616,1480]],[671,1370]),
 room('1','1150','Undergraduate desk','service',[[521,1148],[566,1172],[550,1214],[503,1182]],[532,1188]),
 room('1','1156','Undergraduate lounge','lounge',[[506,1194],[548,1225],[521,1300],[480,1277]],[534,1255]),
 room('1','1119','Conference room','conference',[[565,1369],[619,1398],[597,1431],[549,1400]],[586,1423]),
 room('1','1127','Conference room','conference',[[429,1544],[499,1596],[450,1641],[388,1597]],[480,1613]),
 room('1','1134','Conference room','conference',[[390,1658],[445,1700],[407,1731],[365,1699]],[427,1714]),
 room('2','2207','Collaborative classroom','classroom',[[583,863],[723,863],[739,1019],[582,1019]],[652,1019]),
 room('2','2107','Collaborative classroom','classroom',[[576,1160],[747,1184],[700,1330],[543,1271]],[660,1172]),
 room('2','2109','Staffworld','service',[[543,1276],[700,1336],[672,1418],[520,1333]],[535,1310]),
 room('2','2119','Conference & huddle rooms','conference',[[511,1347],[668,1427],[641,1468],[486,1384]],[574,1431]),
 room('2','2143','Conference room','conference',[[392,1488],[439,1522],[412,1560],[366,1526]],[425,1544]),
 room('2','2137','Conference room','conference',[[355,1532],[494,1638],[448,1695],[310,1599]],[471,1660]),
];

export function pointInPolygon([x,z]:Point,polygon:Polygon):boolean {
 let inside=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
  const [ax,az]=polygon[i], [bx,bz]=polygon[j];
  if((az>z)!==(bz>z) && x < (bx-ax)*(z-az)/(bz-az)+ax) inside=!inside;
 }
 return inside;
}
export function distanceToSegment(p:Point,a:Point,b:Point):number {
 const dx=b[0]-a[0], dz=b[1]-a[1];
 const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz || 1)));
 return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);
}

// Align the ground-floor wayfinding sheet to the Level 1 sheet using the
// western tip and central elevator core as reference points.
export const groundPlan = (x:number,y:number):Point => plan(640 + .832*(y-810) - .069*(x-1080),1120 - .832*(x-1080) - .069*(y-810));
const groundTrace = (p:Polygon):Polygon => p.map(([x,y])=>groundPlan(x,y));
export const GROUND_FOOTPRINT = groundTrace([[550,240],[390,413],[385,448],[430,547],[535,734],[605,838],[690,907],[802,954],[895,970],[1218,970],[1212,998],[1350,998],[1352,970],[1375,969],[1625,160],[1602,149],[1560,145],[1562,128],[1535,126],[1520,94],[1490,66],[1430,44],[1360,39],[1300,42],[1250,56],[1230,97],[1167,62],[1145,157],[1136,252],[1140,365],[1178,465],[1160,485],[1137,451],[1060,510],[1080,535],[992,605],[921,574],[837,511]]);
const gRoom=(id:string,name:string,kind:RoomKind,p:Polygon,door:Point):InteriorRoom=>({id,name,kind,floor:'G',polygon:groundTrace(p),door:groundPlan(...door),evidence:'plan'});
export const ANTONOV_PLAN:Polygon=[[1394,65],[1460,67],[1497,89],[1515,118],[1520,206],[1520,341],[1510,430],[1480,468],[1394,480],[1344,480],[1290,480],[1249,467],[1216,436],[1188,380],[1173,307],[1179,235],[1200,166],[1240,102],[1288,78],[1340,65]];
export const ANTONOV_FOOTPRINT=groundTrace(ANTONOV_PLAN);
ROOMS.push(
 gRoom('lobby-lounge','Lobby lounge','lounge',[[1060,620],[1360,620],[1360,795],[1110,795]],[1360,705]),
 gRoom('0116','Robotics Manipulator Lab','lab',[[648,691],[746,775],[661,875],[586,756]],[699,746]),
 gRoom('0110','Immersive Media Design Lab','lab',[[748,779],[852,834],[797,949],[665,882]],[800,807]),
 gRoom('0108','Brin Family Aerial Robotics Lab','lab',[[858,839],[973,884],[949,963],[803,954]],[917,864]),
 gRoom('0102','Small Artifacts Lab','lab',[[977,887],[1104,907],[1091,964],[955,964]],[1035,897]),
 gRoom('0324','Michael Antonov Auditorium','auditorium',ANTONOV_PLAN,[1216,436]),
 gRoom('0318','Gannon Auditorium','auditorium',[[1405,66],[1460,67],[1497,89],[1515,118],[1520,206],[1520,341],[1510,373],[1406,373]],[1416,373]),
);
ROOMS.push(
 room('5','5237','Conference room','conference',[[560,500],[718,500],[724,588],[558,588]],[640,588]),
 room('5','5165','Conference room','conference',[[567,1143],[651,1173],[624,1253],[541,1228]],[636,1213]),
 room('5','5105','Conference room','conference',[[660,1178],[747,1203],[711,1289],[633,1260]],[644,1220]),
 room('5','5161','Conference room','conference',[[537,1236],[615,1265],[591,1323],[516,1294]],[604,1294]),
 room('5','5107','Conference room','conference',[[626,1271],[709,1298],[682,1355],[602,1327]],[613,1300]),
 room('5','5111','Conference room','conference',[[511,1303],[585,1333],[566,1383],[492,1344]],[577,1355]),
 room('5','5109','Mailroom','service',[[594,1339],[679,1367],[650,1429],[574,1388]],[584,1361]),
 room('5','5119','Conference & huddle rooms','conference',[[485,1358],[642,1446],[620,1484],[463,1397]],[545,1446]),
 room('5','5137','Conference room','conference',[[350,1537],[484,1638],[436,1697],[300,1600]],[460,1664]),
);
// Café front follows the diagonal counter on UMD's ground-floor diagram.
export const CAFE_ORIGIN=groundPlan(773,729),CAFE_END=groundPlan(902,653);
export const CAFE_LENGTH=Math.hypot(CAFE_END[0]-CAFE_ORIGIN[0],CAFE_END[1]-CAFE_ORIGIN[1]);
export const CAFE_U:Point=[(CAFE_END[0]-CAFE_ORIGIN[0])/CAFE_LENGTH,(CAFE_END[1]-CAFE_ORIGIN[1])/CAFE_LENGTH];
export const CAFE_V:Point=[-CAFE_U[1],CAFE_U[0]];
export const cafePoint=(x:number,z:number):Point=>[CAFE_ORIGIN[0]+CAFE_U[0]*x+CAFE_V[0]*z,CAFE_ORIGIN[1]+CAFE_U[1]*x+CAFE_V[1]*z];
export const CAFE_SPACE:InteriorRoom={id:'breakpoint-cafe',name:'Breakpoint Café',floor:'G',kind:'cafe',evidence:'photo',polygon:[[0,.9],[CAFE_LENGTH,.9],[CAFE_LENGTH,4],[0,4]].map(([x,z])=>cafePoint(x,z)),door:cafePoint(CAFE_LENGTH/2,4)};
ROOMS.push(CAFE_SPACE);
export const ELEVATOR = plan(657,1114);
export const ENTRY = groundPlan(1380,850);
// The HDR guide shows the central elevator enclosure and two-flight stair.
// The opening is fitted to that topology; metric dimensions remain estimated.
export const ATRIUM_CENTER=plan(665,1120);
export const atriumPoint=(x:number,z:number):Point=>[ATRIUM_CENTER[0]+x,ATRIUM_CENTER[1]+z];
export const ATRIUM_VOID:Polygon=[[-4.7,-6.1],[-3.6,-6.4],[4.7,-4.55],[4.7,.4],[4.2,3],[2.7,4.8],[0,5.1],[-2.7,4.8],[-4.7,2]].map(([x,z])=>atriumPoint(x,z));

// Align the rooftop spread to the same building frame using the northern
// exterior corners and western stair. Preserve handedness: guide +Y is building
// +X, while guide +X is building -Z. This is a diagram alignment, not a survey.
export const roofPlan=(x:number,y:number):Point=>plan(-.102848138*x+.933676709*y-105.119852,-.779447619*x-.058703168*y+1357.20976);
export const ROOF_PUBLIC_FOOTPRINT:Polygon=[plan(515,449),plan(740,449),plan(807,940),plan(507,940)];
export const ROOF_GALLERY:InteriorRoom={floor:'R',id:'6217',name:'Andre Reisse Gallery',kind:'conference',evidence:'plan',polygon:[[635,835],[741,852],[720,930],[626,926]].map(([x,y])=>roofPlan(x,y)),door:roofPlan(650,837.4056604)};
export const ROOF_LAWN_PLAN:Polygon=[[827,850],[870,842],[960,846],[994,857],[1010,898],[977,925],[895,954],[866,947],[838,916]];
export const ROOF_PARK:InteriorRoom={floor:'R',id:'reisse-park',name:'Reisse Park terrace',kind:'garden',evidence:'plan',polygon:ROOF_LAWN_PLAN.map(([x,y])=>roofPlan(x,y)),door:roofPlan(865,933)};
ROOMS.push(ROOF_GALLERY,ROOF_PARK);
export const footprintForFloor=(floor:FloorId):Polygon=>floor==='G'?GROUND_FOOTPRINT:floor==='R'?ROOF_PUBLIC_FOOTPRINT:MAIN_FOOTPRINT;


// HDR Level 4 sheet, aligned independently by its north corners and north-west
// stair. The public wayfinding sheets are schematic, so this is not a survey.
const fourthNorthPlan=(x:number,y:number):Point=>plan(-.10140141*x+.92056662*y-96.11915764,-.759457617*x-.097689569*y+1374.95531);
// The public diagrams stretch the west wing differently. Two affine triangles
// align its exterior corners while preserving the north-wing stair connection.
// This is registration of undimensioned diagrams, not a measured floor survey.
const fourthSeamA:Point=[650,727],fourthSeamB:Point=[619,1027];
const fourthWestA:Point=[-137,310],fourthWestB:Point=[-314,497];
const barycentric=(p:Point,a:Point,b:Point,c:Point):Point=>{
 const ux=b[0]-a[0],uy=b[1]-a[1],vx=c[0]-a[0],vy=c[1]-a[1],dx=p[0]-a[0],dy=p[1]-a[1],det=ux*vy-uy*vx;
 return [(dx*vy-dy*vx)/det,(ux*dy-uy*dx)/det];
};
const blendTriangle=(u:number,v:number,a:Point,b:Point,c:Point):Point=>[a[0]+u*(b[0]-a[0])+v*(c[0]-a[0]),a[1]+u*(b[1]-a[1])+v*(c[1]-a[1])];
export function fourthPlan(x:number,y:number):Point{
 const p:Point=[x,y],[u,v]=barycentric(p,fourthSeamA,fourthSeamB,fourthWestA);
 if(v<=0)return fourthNorthPlan(x,y);
 const a=fourthNorthPlan(...fourthSeamA),b=fourthNorthPlan(...fourthSeamB),c=plan(220,1620),d=plan(408,1760);
 if(u+v<=1)return blendTriangle(u,v,a,b,c);
 const [w,t]=barycentric(p,fourthSeamB,fourthWestB,fourthWestA);
 return blendTriangle(w,t,b,d,c);
}
const fourthTrace=(p:Polygon):Polygon=>p.map(([x,y])=>fourthPlan(x,y));
ROOMS.push(
 {floor:'4',id:'4105',name:'Room 4105',kind:'service',evidence:'plan',polygon:fourthTrace([[196,735],[310,765],[273,902],[142,844]]),door:fourthPlan(263,898)},
 {floor:'4',id:'north-reset-zone',name:'North study lounge',kind:'lounge',evidence:'plan',polygon:fourthTrace([[998,840],[1104,852],[1085,1021],[1040,1021],[1040,957],[981,951]]),door:fourthPlan(1022,953)},
);
export const roomTitle=(room:InteriorRoom)=>/^\d+$/.test(room.id)&&room.name!==`Room ${room.id}`?`${room.id} · ${room.name}`:room.name;


// Office partitions traced from HDR's Level 4 plan. Room numbers are not
// printed on that plan: these internal IDs are deliberately absent from signs
// and the destination picker. Window edges meet the existing building envelope.
const upperWindow=(p:Point,side:'west'|'east'):Point=>{
 const py=p[1]/PLAN_SCALE+1100;
 const px=side==='west'?515+(505-515)*(py-449)/(1090-449):740+(827-740)*(py-449)/(1230-449);
 return [plan(px,py)[0],p[1]];
};
const westOfficeBreaks=[650,688.5,727.5,767,805.5,844.5,882,920.5,959,997,1035.5,1074.5];
const officeTop=(x:number)=>727.5+(x-650)*.132;
const officeMeetingIndices=new Set([0,1,4,7,8,9]);
for(let i=0;i<westOfficeBreaks.length-1;i++){
 const a=westOfficeBreaks[i],b=westOfficeBreaks[i+1];
 const points:Polygon=[upperWindow(fourthPlan(a,officeTop(a)),'west'),upperWindow(fourthPlan(b,officeTop(b)),'west'),fourthPlan(b-6,officeTop(b)+62),fourthPlan(a-6,officeTop(a)+62)];
 const t=i%2?.23:.77,door:Point=[points[3][0]+(points[2][0]-points[3][0])*t,points[3][1]+(points[2][1]-points[3][1])*t];
 ROOMS.push({floor:'4',id:`4-west-office-${i+1}`,name:'Office',kind:'office',polygon:points,door,doorWidth:.9,exteriorEdges:[0],officeMeeting:officeMeetingIndices.has(i),evidence:'plan',listed:false});
}
const eastOfficeBreaks=[619.5,654,691.5,731,770.5,809.5,847.5,886.5,926,965,1005,1044];
for(let i=0;i<eastOfficeBreaks.length-1;i++){
 const a=eastOfficeBreaks[i],b=eastOfficeBreaks[i+1];
 const points:Polygon=[fourthPlan(a,966),fourthPlan(b,966),upperWindow(fourthPlan(b,1027),'east'),upperWindow(fourthPlan(a,1027),'east')];
 const t=i%2?.77:.23,door:Point=[points[0][0]+(points[1][0]-points[0][0])*t,points[0][1]+(points[1][1]-points[0][1])*t];
 ROOMS.push({floor:'4',id:`4-east-office-${i+1}`,name:'Office',kind:'office',polygon:points,door,doorWidth:.9,exteriorEdges:[2],officeMeeting:officeMeetingIndices.has(i),evidence:'plan',listed:false});
}
ROOMS.push(
 {floor:'4',id:'4-north-workroom-west',name:'Shared workroom (west)',kind:'workroom',evidence:'plan',polygon:fourthTrace([[817,834],[903,845],[891,941],[808,941]]),door:fourthPlan(829,835.535),doorWidth:.95},
 {floor:'4',id:'4-north-workroom-east',name:'Shared workroom (east)',kind:'workroom',evidence:'plan',polygon:fourthTrace([[903,845],[992,856],[982,941],[891,941]]),door:fourthPlan(977,854.146),additionalDoors:[fourthPlan(965,941)],doorWidth:.95},
);

// West-wing partitions traced across HDR's two-page spread. These coordinates
// use the joined reference crop (left-page origin 820,300, scaled 1.5).
export const westFourthPlan=(x:number,y:number):Point=>fourthPlan(x/1.5-332,y/1.5+300);
const onEnvelope=(p:Point):Point=>{
 let best:Point=p,distance=Infinity;
 MAIN_FOOTPRINT.forEach((a,i)=>{
  const b=MAIN_FOOTPRINT[(i+1)%MAIN_FOOTPRINT.length],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));
  const q:Point=[a[0]+t*dx,a[1]+t*dz],d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<distance){best=q;distance=d;}
 });
 return best;
};
const westUpperFacade:Polygon=[[336,60],[380,101],[421,142],[465,182],[507,221],[551,264],[592,299],[634,340],[675,381],[723,422],[774,463],[828,494],[884,530],[944,549],[1008,580]];
const westUpperInside:Polygon=[[274,127],[314,166],[357,208],[400,249],[439,288],[485,329],[529,368],[570,408],[611,447],[662,491],[720,536],[785,574],[847,608],[909,633],[978,658]];
const westLowerFacade:Polygon=[[62,356],[91,408],[120,460],[150,512],[180,566],[210,618]];
const westLowerInside:Polygon=[[118,320],[170,360],[203,411],[235,463],[269,516],[305,569]];
for(const [side,facade,inside] of [['upper',westUpperFacade,westUpperInside],['lower',westLowerFacade,westLowerInside]] as const){
 for(let i=0;i<facade.length-1;i++){
  const points:Polygon=[onEnvelope(westFourthPlan(...facade[i])),onEnvelope(westFourthPlan(...facade[i+1])),westFourthPlan(...inside[i+1]),westFourthPlan(...inside[i])];
  const t=i%2?.22:.78,door:Point=[points[3][0]+(points[2][0]-points[3][0])*t,points[3][1]+(points[2][1]-points[3][1])*t];
  ROOMS.push({floor:'4',id:`4-far-west-${side}-office-${i+1}`,name:'Office',kind:'office',evidence:'plan',listed:false,polygon:points,door,doorWidth:.9,exteriorEdges:[0],officeMeeting:side==='lower'||i===3||i>=8});
 }
}
ROOMS.push({floor:'4',id:'west-reset-zone',name:'West study lounge',kind:'lounge',evidence:'plan',polygon:[[294,22],[331,61],[270,129],[235,177],[161,247],[120,316],[27,298]].map(([x,y])=>westFourthPlan(x,y)),door:westFourthPlan(240,174)});


// Shared rooms along the curved west facade. Desk banks follow the symbols on
// the HDR plan; dimensions and finishes remain interpreted from the diagram.
const westWorkrooms:readonly {id:string;name:string;outline:Polygon;door:Point;facade?:boolean;banks:readonly [Point,Point,number][]}[]=[
 {id:'4-west-shared-room',name:'West shared room',outline:[[166,268],[254,179],[374,277],[278,375]],door:[353,256],banks:[[[213,270],[278,334],5],[[260,225],[324,289],5]]},
 {id:'4-west-workroom-a',name:'West workroom A',outline:[[210,618],[308,775],[402,687],[305,569]],door:[387,672],facade:true,banks:[[[283,628],[319,665],3],[[299,686],[332,720],3]]},
 {id:'4-west-workroom-b',name:'West workroom B',outline:[[308,775],[368,876],[434,960],[536,803],[402,687]],door:[518,787],facade:true,banks:[[[385,767],[420,804],3],[[441,814],[476,852],3],[[413,866],[448,902],3]]},
 {id:'4-west-workroom-c',name:'West workroom C',outline:[[434,960],[490,1005],[562,1050],[630,1072],[696,904],[536,803]],door:[676,891],facade:true,banks:[[[532,907],[552,956],3],[[596,926],[616,975],3],[[554,980],[574,1027],3]]},
 {id:'4-west-workroom-d',name:'West workroom D',outline:[[630,1072],[741,1086],[856,1088],[884,977],[696,904]],door:[862,968],facade:true,banks:[[[732,981],[730,1025],3],[[798,997],[796,1041],3]]},
 {id:'4-west-workroom-e',name:'West workroom E',outline:[[856,1088],[1068,1090],[1068,979],[884,977]],door:[917,977.36],facade:true,banks:[[[933,1024],[933,1055],2],[[1007,1024],[1007,1055],2]]},
];
for(const r of westWorkrooms){
 const lastExterior=r.outline.length-3;
 ROOMS.push({floor:'4',id:r.id,name:r.name,kind:'workroom',evidence:'plan',polygon:r.outline.map((p,i)=>r.facade&&i<=lastExterior?onEnvelope(westFourthPlan(...p)):westFourthPlan(...p)),door:westFourthPlan(...r.door),doorWidth:1.05,exteriorEdges:r.facade?Array.from({length:lastExterior},(_,i)=>i):undefined,deskBanks:r.banks.map(([a,b,seatsPerSide])=>({from:westFourthPlan(...a),to:westFourthPlan(...b),seatsPerSide}))});
}

// Enlarged HDR service-core crop: PDF page 13, x205–405 / y390–480,
// rendered at 6x. Fixtures use this same registration in restrooms.ts.
export const fourthCorePlan=(x:number,y:number):Point=>fourthPlan(410+x/3,780+y/3);
const coreTrace=(p:Polygon):Polygon=>p.map(([x,y])=>fourthCorePlan(x,y));
ROOMS.push(
 {floor:'4',id:'4-restroom-west',name:'Restroom (west)',kind:'restroom',evidence:'plan',polygon:coreTrace([[772,99],[846,108],[842,137],[1060,164],[1048,294],[800,278],[809,210],[758,205]]),door:fourthCorePlan(812,104),doorWidth:1.05},
 {floor:'4',id:'4-restroom-east',name:'Restroom (east)',kind:'restroom',evidence:'plan',polygon:coreTrace([[798,294],[1044,322],[1025,448],[857,428],[859,416],[735,398],[744,343],[791,348]]),door:fourthCorePlan(739,371),doorWidth:1.05},
 {floor:'4',id:'4-core-room-west',name:'Service room',kind:'service',listed:false,evidence:'plan',polygon:coreTrace([[115,54],[558,111],[511,448],[65,445]]),door:fourthCorePlan(494,448),doorWidth:1.05},
 {floor:'4',id:'4-core-room-center',name:'Service room',kind:'service',listed:false,evidence:'plan',polygon:coreTrace([[570,112],[702,128],[674,335],[538,322]]),door:fourthCorePlan(699,157),doorWidth:1.05},
 {floor:'4',id:'4-core-room-southwest',name:'Service room',kind:'service',listed:false,evidence:'plan',polygon:coreTrace([[531,337],[666,355],[650,448],[515,448]]),door:fourthCorePlan(663,375),doorWidth:1.05},
 {floor:'4',id:'4-core-room-northeast',name:'Service room',kind:'service',listed:false,evidence:'plan',polygon:coreTrace([[1071,151],[1168,153],[1156,278],[1055,267]]),door:fourthCorePlan(1161,242),doorWidth:1.05},
 {floor:'4',id:'4-core-room-east',name:'Service room',kind:'service',listed:false,evidence:'plan',polygon:coreTrace([[1055,279],[1154,291],[1146,373],[1043,358]]),door:fourthCorePlan(1151,317),doorWidth:1.05},
 {floor:'4',id:'4-core-room-southeast',name:'Service room',kind:'service',listed:false,evidence:'plan',polygon:coreTrace([[1042,374],[1140,389],[1128,485],[1030,485]]),door:fourthCorePlan(1136,423),doorWidth:1.05},
);

// The ground-floor guide and UMD amphitheater photograph show the lobby stepping
// down toward the cantilever entrance. Plan trace fixes the orientation; the
// 1.8 m drop is a visual estimate, not a surveyed elevation.
export const AMPH_ORIGIN=groundPlan(1281,738);
const amphEnd=groundPlan(1261,900);
export const AMPH_DEPTH=Math.hypot(amphEnd[0]-AMPH_ORIGIN[0],amphEnd[1]-AMPH_ORIGIN[1]);
export const AMPH_V:Point=[(amphEnd[0]-AMPH_ORIGIN[0])/AMPH_DEPTH,(amphEnd[1]-AMPH_ORIGIN[1])/AMPH_DEPTH];
export const AMPH_U:Point=[AMPH_V[1],-AMPH_V[0]];
export const AMPH_WIDTH=4.44,AMPH_DROP=1.8,AMPH_SOUTH_AISLE=1.6,AMPH_NORTH_RUN=3;
export const amphPoint=(u:number,v:number):Point=>[AMPH_ORIGIN[0]+AMPH_U[0]*u+AMPH_V[0]*v,AMPH_ORIGIN[1]+AMPH_U[1]*u+AMPH_V[1]*v];
export const amphLocal=(p:Point):Point=>[(p[0]-AMPH_ORIGIN[0])*AMPH_U[0]+(p[1]-AMPH_ORIGIN[1])*AMPH_U[1],(p[0]-AMPH_ORIGIN[0])*AMPH_V[0]+(p[1]-AMPH_ORIGIN[1])*AMPH_V[1]];
const amphFacadeA=amphLocal(groundPlan(1625,160)),amphFacadeB=amphLocal(groundPlan(1375,969));
export const amphFacade=(v:number)=>amphFacadeA[0]+(amphFacadeB[0]-amphFacadeA[0])*(v-amphFacadeA[1])/(amphFacadeB[1]-amphFacadeA[1])-.025;
// A 25 mm inset leaves a valid hole inside the curtain-wall floor outline.
export const AMPH_LOWER:Polygon=[[0,0],[amphFacade(0),0],[amphFacade(AMPH_DEPTH+AMPH_SOUTH_AISLE),AMPH_DEPTH+AMPH_SOUTH_AISLE],[0,AMPH_DEPTH+AMPH_SOUTH_AISLE]].map(([u,v])=>amphPoint(u,v));
export const AMPH_SPACE:InteriorRoom={id:'amphitheater',name:'Amphitheater',floor:'G',kind:'lounge',evidence:'photo',polygon:AMPH_LOWER,door:amphPoint(6.2,AMPH_DEPTH*.55)};
ROOMS.push(AMPH_SPACE);

// Level 1 garden: register the HDR spread at its corridor doorway and the
// auditorium's south/east wall. Dimensions are interpreted from the diagram.
export const FAMILY_GARDEN_DOOR=onEnvelope(plan(508.3849737,927.4092956));
const gardenGuide:Polygon=[[302,670],[490,542],[644,595],[793,493],[805,265],[886,262],[737,745],[537,718]];
const gardenWorld:Polygon=[onEnvelope(plan(488.4218,1123.7397)),groundPlan(1216,436),groundPlan(1344,480),groundPlan(1480,468),groundPlan(1520,206),[groundPlan(1520,206)[0],groundPlan(1520,206)[1]-6.5],onEnvelope(plan(511.9475,761.2109)),FAMILY_GARDEN_DOOR];
const gardenTriangles=[[6,7,1],[7,0,1],[6,1,2],[6,2,3],[6,3,5],[3,4,5]] as const;
export function familyGardenPlan(x:number,y:number):Point {
 // The public sheets disagree in their relative auditorium/corridor scale.
 // A continuous piecewise registration fixes both boundaries without folding
 // the terrace over the auditorium or placing planters inside the corridor.
 let best:Point=[0,0],penalty=Infinity;
 for(const [a,b,c] of gardenTriangles){
  const [u,v]=barycentric([x,y],gardenGuide[a],gardenGuide[b],gardenGuide[c]);
  const outside=Math.max(0,-u)+Math.max(0,-v)+Math.max(0,u+v-1);
  if(outside<penalty){penalty=outside;best=blendTriangle(u,v,gardenWorld[a],gardenWorld[b],gardenWorld[c]);}
 }
 return best;
}
const theaterCenter:Point=[ANTONOV_FOOTPRINT.reduce((s,p)=>s+p[0],0)/ANTONOV_FOOTPRINT.length,ANTONOV_FOOTPRINT.reduce((s,p)=>s+p[1],0)/ANTONOV_FOOTPRINT.length];
export function theaterOffset(p:Point,d:number):Point {
 const dx=p[0]-theaterCenter[0],dz=p[1]-theaterCenter[1],length=Math.hypot(dx,dz);return [p[0]+dx/length*d,p[1]+dz/length*d];
}
export const FAMILY_THEATER_EDGE:Polygon=ANTONOV_FOOTPRINT.slice(4,13).reverse().map(p=>theaterOffset(p,.19));
export const FAMILY_TERRACE:Polygon=[
 onEnvelope(familyGardenPlan(302,670)),...FAMILY_THEATER_EDGE,
 familyGardenPlan(886,262),onEnvelope(familyGardenPlan(739,746)),
 ...[[550,721],[537,718],[443,711],[361,693]].map(([x,y])=>onEnvelope(familyGardenPlan(x,y))),
];
export const FAMILY_GARDEN:InteriorRoom={floor:'1',id:'family-garden',name:'Margulis–Antonov Family Garden',kind:'garden',evidence:'plan',polygon:FAMILY_TERRACE,door:FAMILY_GARDEN_DOOR};
ROOMS.push(FAMILY_GARDEN);

// Sandbox wiki's labeled 900 × 629 studio diagram, fitted to the north end
// of the Level 1 envelope. Diagram registration and dimensions are estimates.
export function sandboxPlan(x:number,y:number):Point {
 const [u,v]=barycentric([x,y],[877,103],[825,581],[217,581]);
 return blendTriangle(u,v,plan(515,449),plan(740,449),plan(774.2,756));
}
const sandboxStudio=(id:string,name:string,outline:Polygon,door:Point,exterior?:number,kind:RoomKind='lab'):InteriorRoom=>({
 floor:'1',id,name,kind,evidence:'plan',door:sandboxPlan(...door),doorWidth:1.15,
 polygon:outline.map((p,i)=>exterior!==undefined&&(i===exterior||i===(exterior+1)%outline.length)?onEnvelope(sandboxPlan(...p)):sandboxPlan(...p)),
 exteriorEdges:exterior===undefined?undefined:[exterior],
});
export const SANDBOX_STUDIOS:InteriorRoom[]=[
 sandboxStudio('1246','Sandbox · Electronics',[[286,35],[417,50],[405,169],[277,151]],[350,161],0),
 sandboxStudio('1242','Sandbox · Crafting',[[434,53],[535,65],[522,185],[420,172]],[480,179],0),
 sandboxStudio('1238','Sandbox · Sewing',[[546,68],[647,80],[633,202],[533,187]],[587,195],0),
 sandboxStudio('1245','Sandbox · Staff office',[[320,211],[416,224],[406,310],[308,295]],[396,221],undefined,'office'),
 sandboxStudio('1223','Sandbox · Laser cutting',[[308,310],[406,322],[395,414],[297,400]],[360,409]),
 sandboxStudio('1220','Sandbox · Projects',[[217,457],[372,457],[372,581],[217,581]],[329,457],2),
 sandboxStudio('1222','Sandbox · CNC',[[378,457],[479,457],[479,581],[378,581]],[437,457],2),
 sandboxStudio('1224','Sandbox · Woodworking',[[485,457],[588,457],[588,581],[485,581]],[536,457],2),
];
export const SANDBOX_COMMON:InteriorRoom={floor:'1',id:'1231',name:'Singh Sandbox · Open work area',kind:'workroom',evidence:'plan',
 polygon:[[277,174],[415,190],[637,215],[652,85],[870,110],[819,575],[596,575],[596,449],[310,449],[310,421],[407,428],[431,209],[314,199]].map(([x,y])=>sandboxPlan(x,y)),door:sandboxPlan(310,439)};
ROOMS.push(SANDBOX_COMMON,...SANDBOX_STUDIOS);

// HDR Level 1, PDF page 9: crop (300,402)–(410,479), rendered at 10×.
// Register the restroom block between the wayfinding sheet's classroom and
// Sandbox zones. The public diagrams differ in scale; metric fit is estimated.
export const firstCorePlan=(x:number,y:number):Point=>plan(563+(x-400)*12/450+(y-145)*144/492,838-(x-400)*103/450);
const firstCoreTrace=(points:Polygon)=>points.map(([x,y])=>firstCorePlan(x,y));
export const FIRST_RESTROOMS:InteriorRoom[]=[
 {floor:'1',id:'1218',name:'Restroom (west)',kind:'restroom',evidence:'plan',polygon:firstCoreTrace([[402,143],[520,159],[524,136],[860,170],[836,387],[452,342],[460,253],[382,245]]),door:firstCorePlan(421,249),doorWidth:1.05},
 {floor:'1',id:'1219',name:'Restroom (east)',kind:'restroom',evidence:'plan',polygon:firstCoreTrace([[449,377],[834,425],[808,637],[445,599],[449,574],[340,554],[350,473],[431,484]]),door:firstCorePlan(390,478.4321),doorWidth:1.05},
];
ROOMS.push(...FIRST_RESTROOMS);

// HDR Level 2 (PDF page 11) repeats this fixture/partition topology. Its
// wayfinding sheet places the block 22 plan units east of the Level 1 fit.
export const secondCorePoint=([x,z]:Point):Point=>[x+22*PLAN_SCALE,z];
export const SECOND_RESTROOMS:InteriorRoom[]=FIRST_RESTROOMS.map((room,i)=>({...room,floor:'2',id:i===0?'2-restroom-west':'2-restroom-east',polygon:room.polygon.map(secondCorePoint),door:secondCorePoint(room.door)}));
ROOMS.push(...SECOND_RESTROOMS);

// HDR Level 2 north-end crop (404,365)–(560,513), rendered at 8×.
// North façade corners fix the orientation. The south registration is fitted
// to the Level 2 wayfinding restroom block; dimensions remain estimates.
export function hatcheryPlan(x:number,y:number):Point {
 const [u,v]=barycentric([x,y],[1198,230],[1077,1158],[14,1158]);
 return blendTriangle(u,v,plan(515,449),plan(740,449),plan(768.5,705));
}
const hatcheryTrace=(points:Polygon)=>points.map(([x,y])=>hatcheryPlan(x,y));
export const HATCHERY_ROOMS:InteriorRoom[]=[
 {floor:'2',id:'2237',name:'Mokhtarzada Hatchery',kind:'workroom',evidence:'plan',polygon:hatcheryTrace([[376,459],[731,500],[693,830],[337,830]]),door:hatcheryPlan(648,490.42),additionalDoors:[hatcheryPlan(618,830)],doorWidth:1.15,glazedEdges:[1,2],timberEdges:[3]},
 {floor:'2',id:'hatchery-west-workroom',name:'West project workroom',kind:'workroom',evidence:'plan',polygon:hatcheryTrace([[75,422],[365,456],[326,830],[16,830]]),door:hatcheryPlan(101,425.048),additionalDoors:[hatcheryPlan(46,830)],doorWidth:1.15},
];
const hatcheryNorthOuter:Polygon=[[148,100],[298,117],[444,137],[590,157],[737,178],[885,196],[1034,217]];
const hatcheryNorthInner:Polygon=[[113,337],[272,359],[414,379],[562,398],[711,417],[857,435],[1002,454]];
for(let i=0;i<6;i++){
 const a=hatcheryNorthOuter[i],b=hatcheryNorthOuter[i+1],c=hatcheryNorthInner[i+1],d=hatcheryNorthInner[i];
 HATCHERY_ROOMS.push({floor:'2',id:`2-north-west-office-${i+1}`,name:'Office',kind:'office',listed:false,evidence:'plan',exteriorEdges:[0],glazedEdges:[2],officeMeeting:[false,false,true,true,false,true][i],officeMeetingRadius:.36,officeMeetingSeats:4,
 polygon:[onEnvelope(hatcheryPlan(a[0]+6,a[1])),onEnvelope(hatcheryPlan(b[0]-6,b[1])),hatcheryPlan(c[0]-6,c[1]),hatcheryPlan(d[0]+6,d[1])],door:hatcheryPlan(d[0]+(c[0]-d[0])*.77,d[1]+(c[1]-d[1])*.77),doorWidth:1.05});
}
const hatcherySouthCuts=[14,167,318,469,619,768,911];
for(let i=0;i<6;i++){
 const a=hatcherySouthCuts[i]+6,b=hatcherySouthCuts[i+1]-6;
 HATCHERY_ROOMS.push({floor:'2',id:`2-north-east-office-${i+1}`,name:'Office',kind:'office',listed:false,evidence:'plan',exteriorEdges:[0],glazedEdges:[2],officeMeeting:i!==5,officeMeetingRadius:.36,officeMeetingSeats:4,
 polygon:[onEnvelope(hatcheryPlan(a,1158)),onEnvelope(hatcheryPlan(b,1158)),hatcheryPlan(b,917),hatcheryPlan(a,917)],door:hatcheryPlan(a+(b-a)*.24,917),doorWidth:1.05});
}
export const HATCHERY_COMMON:InteriorRoom={floor:'2',id:'north-collaboration',name:'North collaboration area',kind:'lounge',evidence:'plan',polygon:hatcheryTrace([[125,355],[1005,458],[1037,227],[1190,235],[1072,1150],[919,1150],[919,906],[25,906],[25,844],[699,844],[735,504],[125,437]]),door:hatcheryPlan(750,870),arrivalFocus:hatcheryPlan(1020,690)};
ROOMS.push(HATCHERY_COMMON,...HATCHERY_ROOMS);

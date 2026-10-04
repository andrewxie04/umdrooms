import { plan, type FloorId, type Point } from './layout';
import { GROUND_COLUMN_TRACE } from './ground-column-trace';
import { FIRST_COLUMN_TRACE } from './first-column-trace';
import { groundGuidePlan } from './ground-guide-layout';
import { firstGuidePlan } from './first-guide-layout';
import { SECOND_COLUMN_TRACE } from './second-column-trace';
import { secondGuidePlan } from './second-guide-layout';
import { FOURTH_COLUMN_TRACE } from './fourth-column-trace';
import { fourthGuidePlan } from './fourth-guide-layout';

const origin=groundGuidePlan(0,0),unit=groundGuidePlan(1,0),scale=Math.hypot(unit[0]-origin[0],unit[1]-origin[1]);
const groundColumns=GROUND_COLUMN_TRACE.filter(c=>c.sourceBuilding==='inside').map(c=>({id:c.id,center:groundGuidePlan(c.center[0],c.center[1]),radius:c.markerRadiusPt*scale}));
const firstOrigin=firstGuidePlan(0,0),firstUnit=firstGuidePlan(1,0),firstScale=Math.hypot(firstUnit[0]-firstOrigin[0],firstUnit[1]-firstOrigin[1]);
const firstColumns=FIRST_COLUMN_TRACE.filter(c=>c.sourceBuilding==='inside').map(c=>({id:c.id,center:firstGuidePlan(c.center[0],c.center[1]),radius:c.markerRadiusPt*firstScale}));
const secondOrigin=secondGuidePlan(0,0),secondUnit=secondGuidePlan(1,0),secondScale=Math.hypot(secondUnit[0]-secondOrigin[0],secondUnit[1]-secondOrigin[1]);
const secondColumns=SECOND_COLUMN_TRACE.filter(c=>c.sourceBuilding==='inside').map(c=>({id:c.id,center:secondGuidePlan(c.center[0],c.center[1]),radius:c.markerRadiusPt*secondScale}));
const fourthOrigin=fourthGuidePlan(0,0),fourthUnit=fourthGuidePlan(1,0),fourthScale=Math.hypot(fourthUnit[0]-fourthOrigin[0],fourthUnit[1]-fourthOrigin[1]);
const fourthColumns=FOURTH_COLUMN_TRACE.filter(c=>c.sourceBuilding==='inside').map(c=>({id:c.id,center:fourthGuidePlan(c.center[0],c.center[1]),radius:c.markerRadiusPt*fourthScale}));

// Shared by the shell and furniture placement. Ground markers use the common
// drawing registration; Level 1 shares its four-anchor registration and Level
// 2 and 4 each use twenty corresponding markers. Levels 3/5 await integration.
export function structuralColumns(floor:FloorId):Point[]{
 if(floor==='R')return [];
 if(floor==='G')return groundColumns.map(column=>column.center);
 if(floor==='1')return firstColumns.map(column=>column.center);
 if(floor==='2')return secondColumns.map(column=>column.center);
 if(floor==='4')return fourthColumns.map(column=>column.center);
 const columns:Point[]=[[540,680],[745,680],[544,940],[772,940],[733,1195],[701,1390],[529,1535],[360,1600]].map(([x,y])=>plan(x,y));
 // Levels 3/5 still lack an integrated column plan. Continue the adjacent
 // Level 4 core column provisionally, rather than placing the old schematic
 // marker inside the original north stair flight. This is an inferred column
 // alignment, not independent verification of either floor.
 columns[2]=fourthColumns.find(c=>c.id==='column-pdf12-33793')!.center;
 return columns;
}

/** Ground/Levels 1/2/4 diameters follow marker silhouettes, not measured dimensions.
 * Heights/materials remain photograph-informed estimates. Levels 3/5 retain
 * estimated markers, with their north core column inferred from Level 4. */
export function structuralColumnLayout(floor:FloorId){
 return floor==='G'?groundColumns:floor==='1'?firstColumns:floor==='2'?secondColumns:floor==='4'?fourthColumns:structuralColumns(floor).map((center,i)=>({id:`${floor}-column-${i}`,center,radius:.3}));
}

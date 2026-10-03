import { ANTONOV_FOOTPRINT, firstWestPlan, groundPlan, plan, pointInPolygon, type FloorId, type Point } from './layout';

// Shared by the shell and furniture placement so equipment cannot obscure or
// intersect a rendered column. Registration follows the existing traced model.
export function structuralColumns(floor:FloorId):Point[]{
 if(floor==='R')return [];
 if(floor==='G')return [[740,770],[905,840],[1180,897],[1180,655],[1100,610],[1400,620],[1460,435]].map(([x,y])=>groundPlan(x,y)).filter(p=>!pointInPolygon(p,ANTONOV_FOOTPRINT));
 const columns:Point[]=[[540,680],[745,680],[544,940],[772,940],[733,1195],[701,1390],[529,1535],[360,1600]].map(([x,y])=>plan(x,y));
 // The Level 1 architectural plan locates this column at the inner office
 // corner; the earlier schematic point incorrectly sat in its access aisle.
 if(floor==='1')columns[columns.length-1]=firstWestPlan(435,288);
 return columns;
}

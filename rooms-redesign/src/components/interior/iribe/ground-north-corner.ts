import { NORTH_CORNER_GLAZING, NORTH_CORNER_WALL_JOIN } from './ground-north-corner-layout';
import type { Point } from './layout';
import type { RoofBuilder } from './roof';

/** Local source pane lines; vertical dimensions and profiles are estimates.
 * The rest of the adjoining auditorium/vestibule wall remains fitted. */
export function buildGroundNorthCorner(b:RoofBuilder){
 const {wall,box,palette:m}=b,height=6.3,posts:Point[]=[];
 for(const pane of [...NORTH_CORNER_GLAZING,NORTH_CORNER_WALL_JOIN]){
  wall(pane.a,pane.b,height,m.glass,true,0,.035);
  for(const y of [.08,3.4,height-.05])wall(pane.a,pane.b,.065,m.metal,false,y,.065);
  // Native adjacent pane endpoints differ by fractions of a millimeter. One
  // estimated mullion avoids overlapping posts; glass endpoints stay native.
  for(const p of [pane.a,pane.b])if(!posts.some(q=>Math.hypot(p[0]-q[0],p[1]-q[1])<.003))posts.push(p);
 }
 for(const p of posts)box(p[0],height/2,p[1],.055,height,.065,m.metal);
}

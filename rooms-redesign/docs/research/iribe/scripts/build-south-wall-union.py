import json
from pathlib import Path
from shapely.geometry import Polygon, LineString
from shapely.ops import unary_union, polygonize

import argparse, hashlib, pymupdf
parser=argparse.ArgumentParser(description='Regenerate south vestibule solids from the unchanged UMD/HDR architectural guide.')
parser.add_argument('pdf',type=Path)
parser.add_argument('--output',type=Path,default=Path(__file__).resolve().parents[4]/'src/components/interior/iribe/lobby-south-solids.ts')
args=parser.parse_args()
assert hashlib.sha256(args.pdf.read_bytes()).hexdigest()=='c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474'
pdf=pymupdf.open(args.pdf); page=pdf[6]
assert page.rect.width==576 and page.rect.height==576 and page.rotation==0
original=page.get_drawings(); assert len(original)==56651
ids=[52363,52366,52373,52375,52376,52379,52380,52405,52407,52408,52409,52410,52411,52412,52413,52414,52416,52417,52420,52421,52426,52427,52431,52432,52437,52441,52442,52443,52444,52445,52446,52447,52450]
pane_names=['page-upper-left','page-upper-between-pairs','page-upper-right','page-lower-left','page-lower-between-pairs','page-lower-right','stair-page-right-near','stair-page-right-far','stair-page-right-return','vestibule-page-left-upper-return','vestibule-page-left-exterior']
data={'opaqueFillPathIndices':ids,'adjacentGlazing':[{'id':id} for id in pane_names]}
paths={}
for id in set(ids+[49302,49298,49296,49196,49416,49412,49325,49292,49329,49268,49443,13443,13441]):
    native=original[id]
    if id in ids: assert native['fill']==(0,0,0) and native['fill_opacity']==1 and not native['even_odd']
    items=[]
    for i,command in enumerate(native['items']):
        assert command[0]=='l'
        items.append({'itemIndex':i,'command':['l',list(command[1]),list(command[2])]})
    paths[id]={'pathIndex':id,'items':items}

contours=[]
for path_id in data['opaqueFillPathIndices']:
    path=paths[path_id]
    current=[]
    last=None
    start_item=None
    for item in path['items']:
        command=item['command']
        assert command[0]=='l'
        a,b=command[1:]
        if last is not None and a!=last:
            assert last==current[0],(path_id,start_item,last,current[0])
            contours.append(dict(path=path_id,startItem=start_item,points=current))
            current=[]
        if not current: start_item=item['itemIndex']
        current.append(a)
        last=b
    assert last==current[0],(path_id,start_item,last,current[0])
    contours.append(dict(path=path_id,startItem=start_item,points=current))
def winding(point,ring):
    x,y=point; result=0
    for a,b in zip(ring,ring[1:]+ring[:1]):
        cross=(b[0]-a[0])*(y-a[1])-(x-a[0])*(b[1]-a[1])
        if a[1]<=y<b[1] and cross>0: result+=1
        elif b[1]<=y<a[1] and cross<0: result-=1
    return result
# Native 52373 contains a small returning/self-crossing wall detail. Interpret
# the PDF's nonzero paint rule on noded cells; do not 'repair' or buffer the raw
# contours into a different region, and keep its two original subpaths separate.
painted=[]
cell_counts={}
for path_id in data['opaqueFillPathIndices']:
    rings=[c['points'] for c in contours if c['path']==path_id]
    cells=list(polygonize(unary_union([LineString(r+[r[0]]) for r in rings])))
    filled=[cell for cell in cells if sum(winding(tuple(cell.representative_point().coords)[0],r) for r in rings)!=0]
    painted.append(unary_union(filled))
    cell_counts[path_id]=len(filled)
merged=unary_union(painted)
pieces=list(merged.geoms) if merged.geom_type=='MultiPolygon' else [merged]
assert merged.is_valid
source_area=sum(p.area for p in painted)
report=dict(inputPaths=len(data['opaqueFillPathIndices']),inputContours=len(contours),nonSimpleContourPaths=[c['path'] for c in contours if not Polygon(c['points']).is_valid],nonzeroPaintCells=sum(cell_counts.values()),inputPaintAreaPt2=source_area,unionAreaPt2=merged.area,overlapAreaPt2=source_area-merged.area,unionPolygons=len(pieces),holes=sum(len(p.interiors) for p in pieces),symDiffAreaPt2=merged.symmetric_difference(unary_union(painted)).area)
def number(x):
    n,d=float(x).as_integer_ratio()
    assert abs(n)<=2**53
    return str(n) if d==1 else f'{n}/{d}'
def ring(points): return '['+','.join('['+','.join(number(x) for x in p)+']' for p in points)+']'
text='''/** Boolean union of the south vestibule/stair wall fills in original PDF pt.
 * Derived from 33 unchanged paths / 34 separate closed contours in
 * lobby-south-door-trace.ts; no snapping or simplified fitted rectangles.
 * Overlapping source paint becomes one solid boundary, avoiding coplanar faces.
 * Intersections are derived coordinates; raw evidence remains in the trace.
 * Native nonzero winding is evaluated on noded cells, including path 52373.
 * Generated with Shapely 2.1.2 / GEOS; see the integration research note.
 */
import type { Point, Polygon } from './layout';
export interface SouthWallUnion { outer:Polygon; holes:readonly Polygon[]; }
export const SOUTH_WALL_UNION:readonly SouthWallUnion[]=[
'''
for p in pieces:
    text+=' {outer:'+ring(list(p.exterior.coords)[:-1])+',holes:['+','.join(ring(list(h.coords)[:-1]) for h in p.interiors)+']},\n'
text+='];\n'
def command(id): return paths[id]['items'][0]['command']
def point(id,item): return paths[id]['items'][item]['command'][1]
pane_ids=[49302,49298,49296,49196,49416,49412,49325,49292,49329,49268,49443]
text+='export const SOUTH_SOURCE_PANES:readonly {id:string;path:number;a:Polygon[number];b:Polygon[number]}[]=[\n'
for pane,id in zip(data['adjacentGlazing'],pane_ids):
    c=command(id); a,b=c[1:]
    if pane['id'].startswith('page-') and a[0]>b[0]: a,b=b,a
    text+=' {id:'+json.dumps(pane['id'])+',path:'+str(id)+',a:'+ring([a])[1:-1]+',b:'+ring([b])[1:-1]+'},\n'
text+='];\n'
# Ground perimeter runs page-left to page-right here. Preserve the native
# projecting pier heel and continuous pale facade runs; the source does not
# establish an independent sill for every opening.
def intersection(a,b,c,d):
    u=(b[0]-a[0],b[1]-a[1]);v=(d[0]-c[0],d[1]-c[1]);delta=(c[0]-a[0],c[1]-a[1]);cross=lambda p,q:p[0]*q[1]-p[1]*q[0]
    t=cross(delta,v)/cross(u,v);s=cross(delta,u)/cross(u,v);assert 0<=t<=1 and 0<=s<=1
    return [a[0]+t*u[0],a[1]+t*u[1]]
# Independently drawn source pane A lies just behind the corner wall face.
# Join their actual segments at the analytic intersection instead of creating
# a self-crossing microtriangle or moving either original source segment.
corner=intersection(point(52373,63),point(52373,62),*command(49325)[1:])
shell=[*command(49443)[1:]]+[point(52443,i) for i in range(23,-1,-1)]+[command(13443)[2],command(13443)[1],point(52407,16),point(52407,15),command(13441)[2],command(13441)[1],point(52373,63),corner,command(49325)[2],command(49292)[2],*command(49329)[1:],point(52363,0)]
text+='/** Native pane, pier, continuous facade-baseline and corner points.\n * The 52373 wall / 49325 pane join is their derived segment intersection;\n * other short joins between independently rounded strokes remain estimates. */\n'
text+='export const SOUTH_SOURCE_SHELL_CHAIN:Polygon='+ring(shell)+';\n'
text=text.replace('import type { Point, Polygon }','import type { Polygon }')
args.output.write_text(text)
print(json.dumps(report,indent=2))

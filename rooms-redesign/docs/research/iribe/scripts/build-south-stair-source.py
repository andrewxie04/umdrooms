"""Regenerate compact Level 1 south-stair coordinates without a new registration.
Dependencies: PyMuPDF 1.28.2, Shapely 2.1.2. Native evidence is separately kept
in first-south-stair-trace.ts. Only filled path union vertices are derived.
"""
import argparse, hashlib, json
from pathlib import Path
import pymupdf
from shapely.geometry import LineString
from shapely.ops import unary_union, polygonize
parser=argparse.ArgumentParser()
parser.add_argument('pdf',type=Path)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args()
assert hashlib.sha256(args.pdf.read_bytes()).hexdigest()=='c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474'
d=pymupdf.open(args.pdf)[8].get_drawings();assert len(d)==97843
upper=[[87473]]+[[i] for i in range(87221,87252,3)]+[[87476]]
lower=[[87467],[87199],[87196],[87193],[87177],[87219,87161],[87217,87160,87215,87158],[87214,87156],[87211],[87208],[87205],[87202],[87470]]
def number(x):
 n,den=float(x).as_integer_ratio();assert abs(n)<=2**53
 return str(n) if den==1 else f'{n}/{den}'
def point(p):return '['+','.join(number(x) for x in p)+']'
def ring(points):return '['+','.join(point(p) for p in points)+']'
def rows(groups):
 result=[]
 for ids in groups:
  pts=[]
  for i in ids:
   assert len(d[i]['items'])==1 and d[i]['items'][0][0]=='l';pts+=list(d[i]['items'][0][1:])
  assert len({p.x for p in pts})==1
  result.append(dict(paths=ids,a=[pts[0].x,min(p.y for p in pts)],b=[pts[0].x,max(p.y for p in pts)]))
 return result
text="""/** Compact native Level 1 south-stair rows and nonzero wall-paint union.
 * Generated from original guide page index 8; coordinates remain PDF points.
 * Raw complete records and original IDs are in first-south-stair-trace.ts.
 * This supplies plan geometry only. Flight allocation/elevations are estimates.
 */
import type { Point, Polygon } from './layout';
"""
for name,groups in [('SOUTH_FIRST_NORTH_ROWS',upper),('SOUTH_FIRST_RETURN_ROWS',lower)]:
 text+=f'export const {name}:readonly {{paths:readonly number[];a:Point;b:Point}}[]=[\n'
 for r in rows(groups):text+=' {paths:'+json.dumps(r['paths'])+',a:'+point(r['a'])+',b:'+point(r['b'])+'},\n'
 text+='];\n'
wall_ids=[92691,92692,92693,92700,92766,92772,92775,92777]
def winding(p,ring):
 x,y=p;v=0
 for a,b in zip(ring,ring[1:]+ring[:1]):
  cross=(b[0]-a[0])*(y-a[1])-(x-a[0])*(b[1]-a[1])
  if a[1]<=y<b[1] and cross>0:v+=1
  elif b[1]<=y<a[1] and cross<0:v-=1
 return v
paint=[]
for i in wall_ids:
 v=d[i];assert v['fill']==(0,0,0) and not v['even_odd'];rings=[];current=[];last=None
 for it in v['items']:
  if it[0]=='re':
   if current:
    assert last==current[0];rings.append(current);current=[];last=None
   rect,orientation=it[1:];r=[list(rect.tl),list(rect.bl),list(rect.br),list(rect.tr)]
   rings.append(r if orientation==1 else r[::-1]);continue
  assert it[0]=='l';a,b=[list(p) for p in it[1:]]
  if last is not None and a!=last:
   assert last==current[0];rings.append(current);current=[]
  current.append(a);last=b
 if current:
  assert last==current[0];rings.append(current)
 cells=list(polygonize(unary_union([LineString(r+[r[0]]) for r in rings])))
 paint.append(unary_union([c for c in cells if sum(winding(tuple(c.representative_point().coords)[0],r) for r in rings)]))
union=unary_union(paint);assert union.is_valid
pieces=list(union.geoms) if union.geom_type=='MultiPolygon' else [union]
text+='export const SOUTH_FIRST_WALLS:readonly {outer:Polygon;holes:readonly Polygon[]}[]=[\n'
for p in pieces:text+=' {outer:'+ring(list(p.exterior.coords)[:-1])+',holes:['+','.join(ring(list(h.coords)[:-1]) for h in p.interiors)+']},\n'
text+='];\n'
leaf=d[85248]['items'][0];curve=d[85252]['items'][0];assert leaf[0]=='l' and curve[0]=='c'
text+='export const SOUTH_FIRST_DOOR={hinge:'+point(leaf[1])+',openTip:'+point(leaf[2])+',closedTip:'+point(curve[1])+'} as const;\n'
# Native apron outer/side edges; consumers may close their open boundaries
# explicitly as estimated surfaces, without relabeling those closures as source.
text+='export const SOUTH_FIRST_APRON_EDGES=[\n'
for i in [87505,87506,87502,87501,87536,87539,87540,87541,87542,87544]:
 it=d[i]['items'][0];assert it[0]=='l'
 text+=f' {{path:{i},a:{point(it[1])},b:{point(it[2])}}},\n'
text+='];\n'
args.output.write_text(text)
print(json.dumps(dict(nativeNorthRows=len(upper),nativeReturnRows=len(lower),wallPaths=len(wall_ids),wallPolygons=len(pieces),wallHoles=sum(len(p.interiors) for p in pieces),paintAreaPt2=sum(p.area for p in paint),unionAreaPt2=union.area)))

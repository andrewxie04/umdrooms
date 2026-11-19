"""Trace the Ground northwest service wing from the HDR/UMD guide (pages 6-7 spread).
Coordinates are page-7 PDF points (page 6 shifted by -576), the frame groundGuidePlan() accepts."""
import sys, json, hashlib, math, pymupdf
from shapely.geometry import Polygon, LineString, Point, MultiLineString
from shapely.ops import unary_union
pdf_path, existing_path, out_path = sys.argv[1:4]
assert hashlib.sha256(open(pdf_path,'rb').read()).hexdigest()=='c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474'
ctx=json.load(open(existing_path))
footprint=Polygon(ctx['fp']).buffer(-0.45)
clip=Polygon([(-130,140),(60,140),(175,300),(175,335),(130,345),(60,382),(22,374),(-45,402),(-130,402)])
holes=[Polygon(p).buffer(1.2) for i,p in ctx['rooms'] if i in ('0116','0110','0108','0102','breakpoint-cafe')]
holes.append(Polygon(ctx['westStair']['shaft']).buffer(0.9))
keep=ctx.get('keepClear',{})
holes+= [LineString(p).buffer(keep['pathHalfWidth']) for p in keep.get('paths',[])]+[Polygon(p).buffer(2.5) for p in keep.get('polygons',[])]
region=footprint.intersection(clip).difference(unary_union(holes))
existing=[LineString([a,b]) for a,b,lo,hi in ctx['bars'] if (hi is None or hi>2.5) and lo<0.5]
columns=[(c[0],c[1]) for c in ctx['columns']]
def near_existing(seg,tol=1.1):
    return any(seg.hausdorff_distance(e)<tol or (e.length>seg.length and e.buffer(tol).contains(seg)) for e in existing if e.distance(seg)<tol)
def polyline(item,off):
    pts=[]
    for it in item['items']:
        k=it[0]
        if k=='l': a,b=it[1],it[2]; seg=[(a.x+off,a.y),(b.x+off,b.y)]
        elif k=='c':
            p0,p1,p2,p3=it[1:5]; seg=[]
            for t in [i/8 for i in range(9)]:
                u=1-t; seg.append((u**3*p0.x+3*u*u*t*p1.x+3*u*t*t*p2.x+t**3*p3.x+off, u**3*p0.y+3*u*u*t*p1.y+3*u*t*t*p2.y+t**3*p3.y))
        elif k=='re': r=it[1]; seg=[(r.x0+off,r.y0),(r.x1+off,r.y0),(r.x1+off,r.y1),(r.x0+off,r.y1),(r.x0+off,r.y0)]
        elif k=='qu': q=it[1]; seg=[(q.ul.x+off,q.ul.y),(q.ur.x+off,q.ur.y),(q.lr.x+off,q.lr.y),(q.ll.x+off,q.ll.y),(q.ul.x+off,q.ul.y)]
        else: continue
        if pts and math.dist(pts[-1][-1],seg[0])<1e-3: pts[-1].extend(seg[1:])
        else: pts.append(seg)
    return pts
doc=pymupdf.open(pdf_path)
partitions=[];solids=[];provenance={'partitions':[],'solids':[]}
for page_index,off in ((5,-576),(6,0)):
    drawings=doc[page_index].get_drawings()
    for idx,d in enumerate(drawings):
        r=d['rect']
        if not region.intersects(Polygon([(r.x0+off,r.y0),(r.x1+off,r.y0),(r.x1+off,r.y1),(r.x0+off,r.y1)]).buffer(.5)): continue
        black_fill=d['type'] in ('f','fs') and d.get('fill') and max(d['fill'])<0.05
        black_wall=d['type']=='s' and d.get('color') and max(d['color'])<0.05 and abs((d.get('width') or 0)-0.34)<0.02
        if black_fill:
            shape=None
            for ring in polyline(d,off):
                if len(ring)<4: continue
                ring_poly=Polygon(ring).buffer(0)
                if ring_poly.is_empty: continue
                shape=ring_poly if shape is None else shape.symmetric_difference(ring_poly)
            if shape is None: continue
            for poly in getattr(shape,'geoms',[shape]):
                if poly.geom_type!='Polygon' or poly.area<0.6: continue
                c=poly.centroid; circ=4*math.pi*poly.area/(poly.exterior.length**2)
                if poly.area<30 and any(math.dist((c.x,c.y),q)<4 for q in columns): continue  # modeled column
                part=poly.intersection(region)
                for g in getattr(part,'geoms',[part]):
                    if g.geom_type!='Polygon' or g.area<0.6: continue
                    g=g.simplify(0.05)
                    solids.append({'outer':[[round(x,2),round(y,2)] for x,y in list(g.exterior.coords)[:-1]],'holes':[[[round(x,2),round(y,2)] for x,y in list(h.coords)[:-1]] for h in g.interiors]}); provenance['solids'].append([page_index,idx])
        elif black_wall:
            for line in polyline(d,off):
                for a,b in zip(line,line[1:]):
                    seg=LineString([a,b])
                    if seg.length<0.3: continue
                    part=seg.intersection(region)
                    for g in getattr(part,'geoms',[part]):
                        if g.geom_type!='LineString' or g.length<0.8 or near_existing(g): continue
                        (x1,y1),(x2,y2)=g.coords[0],g.coords[-1]
                        partitions.append([round(x1,2),round(y1,2),round(x2,2),round(y2,2)]); provenance['partitions'].append([page_index,idx])
walls=unary_union([Polygon(x['outer'],x['holes']) for x in solids]+[LineString([(a,b),(c,d)]).buffer(0.5,cap_style='flat',join_style='mitre') for a,b,c,d in partitions]).intersection(region)
walls=[g.simplify(0.08) for g in getattr(walls,'geoms',[walls]) if g.geom_type=='Polygon' and g.area>1.0]
walls=[g for g in walls if not (g.area<30 and any(math.dist((g.centroid.x,g.centroid.y),q)<4 for q in columns))]  # already-modeled column symbols
merged=[{'outer':[[round(x,2),round(y,2)] for x,y in list(g.exterior.coords)[:-1]],'holes':[[[round(x,2),round(y,2)] for x,y in list(h.coords)[:-1]] for h in g.interiors if Polygon(h).area>0.5]} for g in walls]
print('merged walls',len(merged),'area',round(sum(g.area for g in walls),1),'verts',sum(len(m['outer'])+sum(len(h) for h in m['holes']) for m in merged))
print('partitions',len(partitions),'solids',len(solids),'solid area',round(sum(Polygon(s['outer'],s['holes']).area for s in solids),1))
# Dropped ceiling: the enclosed wing northwest of the restroom block's lobby face.
lobby_side=Polygon([(113.6,306.4),(56,375.3),(200,500),(300,300)])
ceiling=region.difference(lobby_side)
ceiling=max(getattr(ceiling,'geoms',[ceiling]),key=lambda g:g.area).simplify(0.1)
lights=[]
minx,miny,maxx,maxy=ceiling.bounds
import itertools
for gx,gy in itertools.product(range(int(minx),int(maxx)+1,22),range(int(miny),int(maxy)+1,22)):
    p=Point(gx,gy)
    if ceiling.buffer(-4).contains(p) and not any(Polygon(w['outer']).buffer(1.5).contains(p) for w in merged): lights.append([gx,gy])
print('ceiling area',round(ceiling.area,1),'lights',len(lights))
json.dump({'ceiling':[[round(x,2),round(y,2)] for x,y in list(ceiling.exterior.coords)[:-1]],'ceilingHoles':[[[round(x,2),round(y,2)] for x,y in list(h.coords)[:-1]] for h in ceiling.interiors],'lights':lights,'walls':merged,'partitions':partitions,'solids':solids,'provenance':provenance,'region':[[round(x,2),round(y,2)] for x,y in region.exterior.coords] if region.geom_type=='Polygon' else None},open(out_path,'w'))

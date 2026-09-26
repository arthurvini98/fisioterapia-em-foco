"""Run with Blender bpy: python export-scanned-pieces.py DIRECTORY_WITH_STLS.
Downloads are documented in dist/LICENCA-digitalizacoes.txt. No synthetic detail.
Coordinates are manually selected on orthographic inspection renders (800 px,
1.25 times maximum bounding dimension), then raycast to the actual scan surface.
"""
import bpy, json, struct, sys
from pathlib import Path
from mathutils import Vector, Matrix
root=Path(__file__).resolve().parent; inputs=Path(sys.argv[-1]);out=root/'dist/pecas'
configs={
 'l5':dict(key='l5-real',bone='Vertebra L5',scale=.075,matrix=[[-.95294863,-.12270869,-.27718487],[-.23596594,-.27372026,.93241477],[-.19028652,.95394957,.23188630]],author='UNCG Imaging Lab · Keri Newsome',source='https://commons.wikimedia.org/wiki/File:Fifth_Lumbar_Vertebra.stl',views={},initial='top',points=[
  ('Vertebral body','Corpo vertebral','front',396,482,'Porção anterior e volumosa da vértebra.'),
  ('Vertebral foramen','Forame vertebral','top',392,402,'Abertura delimitada pelo corpo e pelo arco vertebral. O ponto fica no espaço da abertura.'),
  ('Spinous process','Processo espinhoso','top',364,172,'Projeção posterior, na linha mediana.'),
  ('Transverse process','Processo transverso','top',640,410,'Projeção lateral da vértebra.'),
  ('Pedicle','Pedículo do arco vertebral','top',506,440,'Ponte óssea entre o corpo e a região posterior do arco.'),
  ('Lamina','Lâmina do arco vertebral','top',436,286,'Parte do arco entre o processo espinhoso e a região dos processos articulares.'),
  ('Superior articular process','Processo articular superior','top',510,346,'Projeção com a face articular voltada para a vértebra superior.'),
  ('Vertebral arch','Arco vertebral','back',414,418,'Conjunto formado pelos pedículos e pelas lâminas. O ponto indica apenas uma referência do conjunto.')]),
 'pelvis':dict(key='quadril-real',bone='Hip bone.l',scale=.22,matrix=[[0,0,-1],[-.88443565,.46666211,0],[.46666211,.88443565,0]],author='Eric Bauer · laboratório de anatomia da Elon University',source='https://commons.wikimedia.org/wiki/File:Human_pelvis.stl',views={'lateral':[1,0,0],'medial':[-1,0,0]},initial='lateral',points=[
  ('Iliac crest','Crista ilíaca','lateral',470,100,'Borda superior do ílio.'),
  ('Anterior superior iliac spine','Espinha ilíaca anterossuperior','lateral',344,264,'Proeminência anterior na extremidade da crista ilíaca.'),
  ('Anterior inferior iliac spine','Espinha ilíaca anteroinferior','lateral',350,370,'Proeminência anterior abaixo da espinha ilíaca anterossuperior.'),
  ('Gluteal surface','Face glútea','lateral',480,335,'Face externa do ílio, acima do acetábulo.'),
  ('Iliac fossa','Fossa ilíaca','medial',376,253,'Depressão na face interna do ílio.'),
  ('Auricular surface','Face auricular','medial',266,310,'Área de articulação do osso do quadril com o sacro.'),
  ('Acetabulum','Acetábulo','lateral',475,508,'Cavidade que recebe a cabeça do fêmur.'),
  ('Acetabular fossa','Fossa do acetábulo','lateral',398,500,'Região central não articular do acetábulo.'),
  ('Acetabular notch','Incisura do acetábulo','lateral',436,566,'Interrupção inferior da margem do acetábulo.'),
  ('Obturator foramen','Forame obturado','lateral',385,624,'Abertura entre o púbis e o ísquio. O ponto fica no espaço da abertura.'),
  ('Ischial tuberosity','Túber isquiático','lateral',523,666,'Região espessa e rugosa na porção inferior do ísquio.'),
  ('Superior pubic ramus','Ramo superior do púbis','lateral',270,563,'Porção superior do púbis, acima do forame obturado.'),
  ('Inferior pubic ramus','Ramo inferior do púbis','lateral',253,649,'Porção do púbis que segue inferiormente em direção ao ramo do ísquio.')])
}
def arrays(mesh):
 mesh.calc_loop_triangles();return [list(v.co) for v in mesh.vertices],[list(t.vertices) for t in mesh.loop_triangles]
for name,cfg in configs.items():
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.wm.stl_import(filepath=str(inputs/(name+'.stl')));o=bpy.context.object;m=o.data
 lo=Vector([min(v.co[i] for v in m.vertices) for i in range(3)]);hi=Vector([max(v.co[i] for v in m.vertices) for i in range(3)]);center=(lo+hi)/2;size=max(hi-lo);mat=Matrix(cfg['matrix'])
 for v in m.vertices:v.co=mat@((v.co-center)/size)*cfg['scale']
 original=len(m.polygons);mod=o.modifiers.new('Reduce transfer size','DECIMATE');mod.ratio=min(1,100000/original);bpy.ops.object.modifier_apply(modifier=mod.name);m=o.data
 vertices,triangles=arrays(m);lo=Vector([min(v[i] for v in vertices) for i in range(3)]);hi=Vector([max(v[i] for v in vertices) for i in range(3)]);center=(lo+hi)/2;size=max(hi-lo)
 views={'front':[0,0,1],'back':[0,0,-1],'lateral':[-1,0,0],'medial':[1,0,0],'top':[0,1,0],'bottom':[0,-1,0],**cfg['views']};points=[]
 for id,label,view,px,py,note in cfg['points']:
  d=Vector(views[view]);up=Vector((0,0,-1) if view=='top' else (0,0,1) if view=='bottom' else (0,1,0));right=up.cross(d).normalized();up=d.cross(right);plane=center+right*(px/800-.5)*size*1.25+up*(.5-py/800)*size*1.25
  hole=id in ['Vertebral foramen','Obturator foramen'];hit,p,normal,index=o.ray_cast(plane+d*size*3,-d)
  if hole:p=plane
  else:assert hit,(name,id,px,py)
  points.append(dict(id=id,name=label,bone=cfg['bone'],position=list(p),view=view,kind='landmark',source='manual scan annotation',anchor='opening' if hole else 'surface',note=note))
 collision=o.copy();collision.data=o.data.copy();bpy.context.scene.collection.objects.link(collision);bpy.context.view_layer.objects.active=collision;mod=collision.modifiers.new('Occlusion proxy','DECIMATE');mod.ratio=.05;bpy.ops.object.modifier_apply(modifier=mod.name);cv,ct=arrays(collision.data)
 # Both meshes share bounds and unsigned-16-bit quantization, max error < 4 micrometres at display scale.
 chunks=[struct.pack('<5I6f',0x31454641,len(vertices),len(triangles)*3,len(cv),len(ct)*3,*lo,*hi)]
 for vs,ts in [(vertices,triangles),(cv,ct)]:
  assert len(vs)<65536
  packed=[max(0,min(65535,round((v[i]-lo[i])/(hi[i]-lo[i])*65535))) for v in vs for i in range(3)]
  chunks += [struct.pack('<%dH'%len(packed),*packed),struct.pack('<%dH'%(len(ts)*3),*(i for t in ts for i in t))]
 binary=b''.join(chunks);(out/(cfg['key']+'.bin')).write_bytes(binary)
 meta=dict(source=cfg['author'],sourceUrl=cfg['source'],license='CC BY 4.0',geometry=cfg['key']+'.bin',bone=cfg['bone'],points=points,viewDirections=cfg['views'],initialView=cfg['initial'],triangleCount=len(triangles),originalTriangleCount=original,note='Digitalização de peça anatômica. Geometria otimizada e orientada; marcações didáticas adicionadas no app. Cor ilustrativa, sem textura fotográfica. Escala de exibição normalizada; não usar para medições.')
 (out/(cfg['key']+'.json')).write_text(json.dumps(meta,ensure_ascii=False,separators=(',',':')))
 print(cfg['key'],len(points),'points',len(binary),'bytes',flush=True)

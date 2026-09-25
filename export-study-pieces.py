import bpy,json,os,sys
from mathutils.bvhtree import BVHTree
source=sys.argv[-2]
output=sys.argv[-1]
keys=['Iliac crest','Anterior superior iliac spine','Anterior inferior iliac spine','Posterior superior iliac spine','Posterior inferior iliac spine','Iliac fossa','Gluteal surface of ilium','Auricular surface of ilium','Arcuate line','Acetabulum','Obturator foramen','Ischial spine','Greater sciatic notch','Lesser sciatic notch','Ischial tuberosity','Pubic crest','Pubic tubercle','Superior pubic ramus','Inferior pubic ramus','Pecten pubis','Iliopubic eminence','Acetabular fossa','Acetabular notch','Ala of sacrum','Promontory','Vertebral body','Vertebral arch','Pedicle of vertebral arch','Lamina of vertebral arch','Vertebral foramen','Spinous process','Transverse process','Superior articular process of vertebra','Inferior articular process of vertebra','Superior vertebral notch','Inferior vertebral notch','Sternal end','Acromial end']
bones=['Hip bone.r','Hip bone.l','Sacrum','Clavicle.r']+['Vertebra L'+str(i) for i in range(1,6)]
manifest=json.load(open('dist/skeleton.json'))
bones += [m['name'] for m in manifest['meshes'] if m['topic']=='sternum' or (m['topic'] in ['hand','foot'] and m['name'].endswith('.r'))]
with bpy.data.libraries.load(source,link=False) as (src,dst):dst.objects=[n for n in src.objects if n in bones or n in [k+'.j' for k in keys]]
for o in dst.objects:
 if o and o.name not in bpy.context.scene.objects:bpy.context.scene.collection.objects.link(o)
bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get()
bvhs={};objs={}
for o in dst.objects:
 if o and o.name in bones:
  v=[o.matrix_world@p.co for p in o.data.vertices];o.data.calc_loop_triangles();tri=[list(t.vertices) for t in o.data.loop_triangles]
  bvhs[o.name]=BVHTree.FromPolygons(v,tri,all_triangles=True);objs[o.name]={'vertices':[[round(p.x,7),round(p.z,7),round(-p.y,7)] for p in v],'triangles':tri}
points=[]
for o in dst.objects:
 if not o or not o.name.endswith('.j'):continue
 e=o.evaluated_get(deps);mesh=e.to_mesh();p=e.matrix_world@mesh.vertices[1].co
 distances=sorted([(b,bvh.find_nearest(p)[3]) for b,bvh in bvhs.items()],key=lambda x:x[1])
 points.append({'source':o.name,'position':[p.x,p.z,-p.y],'near':distances[:2], 'raw':list(o.matrix_world@o.data.vertices[1].co)})
 e.to_mesh_clear()
json.dump({'bones':objs,'points':points},open(output,'w'))
print('EXPORT',len(objs),len(points),flush=True)

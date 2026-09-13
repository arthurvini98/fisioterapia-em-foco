"""Extract original Z-Anatomy bones into a compact, attributed web mesh.
Run with Blender 4.2 in background; source .blend path is supplied after --.
"""
import bpy,sys,re,json,struct,os
from mathutils import Vector
source=sys.argv[sys.argv.index('--')+1]
bpy.ops.wm.open_mainfile(filepath=source)
def classify(o):
    n=o.name.lower(); cols={c.name for c in o.users_collection}
    if o.type!='MESH' or not cols.intersection({'Axial skeleton','Appendicular skeleton'}):return None
    if '.' in n and not re.search(r'\.[lr]$',n):return None
    if any(s in n for s in ['cartilage','sinus','incisor','canine','molar','premolar','sesamoid','malleus','incus','stapes']):return None
    for word,key in [('mandible','mandible'),('hyoid','hyoid'),('sacrum','sacrum'),('clavicle','clavicle'),('scapula','scapula'),('humerus','humerus'),('radius','radius'),('ulna','ulna'),('hip bone','pelvis'),('femur','femur'),('patella','patella'),('tibia','tibia'),('fibula','fibula')]:
        if word in n:return key
    if 'rib' in n:return 'ribs'
    if 'sternum' in n or 'xiphoid' in n:return 'sternum'
    if 'vertebra' in n or 'atlas (' in n or 'axis (' in n or 'coccyx' in n:return 'spine'
    if 'Cranium' in cols:return 'skull'
    if 'Left foot' in cols or 'Right foot' in cols or any(s in n for s in ['foot','metatars','calcaneus','talus','cuneiform','navicular','cuboid']):return 'foot'
    if cols.intersection({'Bones of upper limb','Left hand','Right hand','Left upper limb','Right upper limb'}):return 'hand'
    return None
original=[(o,classify(o)) for o in bpy.data.objects if classify(o)]
scene=bpy.data.scenes.new('Export');bpy.context.window.scene=scene
items=[]
for old,topic in original:
    new=bpy.data.objects.new(old.name,old.data.copy());new.matrix_world=old.matrix_world.copy();scene.collection.objects.link(new)
    # Original raw meshes already describe complete bilateral bones; no label geometry is copied.
    new.data.transform(new.matrix_world);new.matrix_world.identity();new['source_name']=old.name
    count=len(new.data.polygons);limit=7000 if topic=='skull' else 3500
    if count>limit:
        mod=new.modifiers.new('Web simplification','DECIMATE');mod.ratio=limit/count
        bpy.context.view_layer.objects.active=new
        bpy.ops.object.modifier_apply(modifier=mod.name)
    items.append((new,topic))
coords=[v.co for o,t in items for v in o.data.vertices]
lo=Vector([min(v[i] for v in coords) for i in range(3)]);hi=Vector([max(v[i] for v in coords) for i in range(3)])
center=(lo+hi)/2;scale=2/(hi.z-lo.z)
out=os.path.join(os.path.dirname(os.path.abspath(__file__)),'dist');blob=bytearray();manifest={'source':'Z-Anatomy / BodyParts3D','license':'CC BY-SA 4.0','meshes':[]}
for o,topic in items:
    mesh=o.data;mesh.calc_loop_triangles();positions=[];indices=[]
    for v in mesh.vertices:
        p=(v.co-center)*scale;positions.extend([p.x,p.z,-p.y])
    for tri in mesh.loop_triangles:indices.extend(tri.vertices)
    po=len(blob);blob.extend(struct.pack('<%sf'%len(positions),*positions));io=len(blob);blob.extend(struct.pack('<%sI'%len(indices),*indices))
    manifest['meshes'].append({'name':o['source_name'],'topic':topic,'positionOffset':po,'vertexCount':len(mesh.vertices),'indexOffset':io,'indexCount':len(indices)})
    if o['source_name'] in ['Mandible','Sacrum','Femur.l','Femur.r','Manubrium of sternum']:print('LOCATION',o.name,[round(sum(v.co[i] for v in mesh.vertices)/len(mesh.vertices),3) for i in range(3)],flush=True)
open(out+'/skeleton.bin','wb').write(blob);open(out+'/skeleton.json','w').write(json.dumps(manifest))
print('EXPORTED',len(items),'meshes',len(blob),'bytes','bounds',list(lo),list(hi),flush=True)

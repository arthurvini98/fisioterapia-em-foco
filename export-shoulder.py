"""Export shoulder meshes and original right-femur annotation anchors.
Uses the exact normalization of the original skeleton export.
"""
import bpy,json,struct,os
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath='/tmp/z-anatomy/Z-Anatomy/Startup.blend')
out=os.path.join(os.path.dirname(os.path.abspath(__file__)),'dist')
center=Vector((0,(-0.1373080015182495+0.11282356083393097)/2,(0.009203300811350346+1.7054541110992432)/2))
scale=2/(1.7054541110992432-0.009203300811350346)
def web(p):
 p=(p-center)*scale;return [p.x,p.z,-p.y]
parts={'deltoid':['Acromial part of deltoid muscle','Clavicular part of deltoid muscle','Scapular spinal part of deltoid muscle'], 'supraspinatus':['Supraspinatus muscle'],'infraspinatus':['Infraspinatus muscle'],'teres_minor':['Teres minor muscle'],'subscapularis':['Subscapularis muscle']}
blob=bytearray();meta={'source':'Z-Anatomy / BodyParts3D','license':'CC BY-SA 4.0','meshes':[]}
for key,names in parts.items():
 for side in ['l','r']:
  for name in names:
   obj=bpy.data.objects.get(name+'.'+side);assert obj and obj.type=='MESH',name
   mesh=obj.data;mesh.calc_loop_triangles();coords=[];indices=[]
   for v in mesh.vertices:coords.extend(web(obj.matrix_world@v.co))
   for tri in mesh.loop_triangles:indices.extend(tri.vertices)
   po=len(blob);blob.extend(struct.pack('<%sf'%len(coords),*coords));io=len(blob);blob.extend(struct.pack('<%sI'%len(indices),*indices))
   meta['meshes'].append({'name':obj.name,'id':'muscle:'+key+':'+side,'muscle':key,'side':side,'positionOffset':po,'vertexCount':len(mesh.vertices),'indexOffset':io,'indexCount':len(indices)})
open(out+'/shoulder.bin','wb').write(blob);open(out+'/shoulder.json','w').write(json.dumps(meta))
anchors={'Femur.r':[],'Femur.l':[]}
for name in ['Head of femur','Neck of femur','Greater trochanter','Lesser trochanter','Medial condyle of femur','Lateral condyle of femur']:
 obj=bpy.data.objects.get(name+'.j');assert obj and len(obj.data.vertices)==2
 # The second vertex is the anatomical end of the original leader line.
 point=web(obj.matrix_world@obj.data.vertices[1].co)
 anchors['Femur.r'].append({'key':name,'position':point,'source':obj.name,'vertex_index':1})
 anchors['Femur.l'].append({'key':name,'position':[-point[0],point[1],point[2]],'source':obj.name,'vertex_index':1,'transformation':'Reflection across sagittal midline; bilateral source femurs are mirrored.'})
open(out+'/landmarks.json','w').write(json.dumps({'source':'Z-Anatomy original annotation leader endpoints; no AI-generated anchor positions','license':'CC BY-SA 4.0','bones':anchors}))
print('MUSCLES',len(meta['meshes']),len(blob),'bytes; 12 femur annotation anchors',flush=True)

import json, pathlib, sys
root=pathlib.Path(__file__).resolve().parent;raw=json.load(open(sys.argv[1]))
translations={
'Iliac crest':'Crista ilíaca','Anterior superior iliac spine':'Espinha ilíaca anterossuperior (EIAS)','Anterior inferior iliac spine':'Espinha ilíaca anteroinferior (EIAI)','Posterior superior iliac spine':'Espinha ilíaca posterossuperior (EIPS)','Posterior inferior iliac spine':'Espinha ilíaca posteroinferior (EIPI)','Iliac fossa':'Fossa ilíaca','Gluteal surface of ilium':'Face glútea','Auricular surface of ilium':'Face auricular do ílio','Acetabulum':'Acetábulo','Obturator foramen':'Forame obturado','Ischial spine':'Espinha isquiática','Greater sciatic notch':'Incisura isquiática maior','Lesser sciatic notch':'Incisura isquiática menor','Ischial tuberosity':'Tuberosidade isquiática (túber isquiático)','Pubic crest':'Crista púbica','Pubic tubercle':'Tubérculo púbico','Superior pubic ramus':'Ramo superior do púbis','Inferior pubic ramus':'Ramo inferior do púbis','Pecten pubis':'Pecten do púbis (linha pectínea)','Iliopubic eminence':'Eminência iliopúbica','Acetabular fossa':'Fossa do acetábulo','Acetabular notch':'Incisura do acetábulo','Ala of sacrum':'Asa do sacro','Promontory':'Promontório do sacro','Vertebral body':'Corpo vertebral','Vertebral arch':'Arco vertebral','Pedicle of vertebral arch':'Pedículo','Lamina of vertebral arch':'Lâmina','Vertebral foramen':'Forame vertebral','Spinous process':'Processo espinhoso','Transverse process':'Processo transverso','Superior articular process of vertebra':'Processo articular superior','Superior vertebral notch':'Incisura vertebral superior','Inferior vertebral notch':'Incisura vertebral inferior','Sternal end':'Extremidade esternal (medial)','Acromial end':'Extremidade acromial (lateral)'}
views={k:'front' for k in translations}
for k in ['Iliac fossa','Auricular surface of ilium','Pecten pubis']:views[k]='medial'
for k in ['Acetabulum','Gluteal surface of ilium','Acetabular notch','Acetabular fossa']:views[k]='lateral'
for k in ['Posterior superior iliac spine','Posterior inferior iliac spine','Greater sciatic notch','Lesser sciatic notch','Ischial spine','Ischial tuberosity','Spinous process','Lamina of vertebral arch']:views[k]='back'
for k in ['Vertebral arch','Vertebral foramen','Pedicle of vertebral arch','Transverse process','Superior articular process of vertebra','Superior vertebral notch']:views[k]='top'
views['Inferior vertebral notch']='bottom'
sets={'pelve':['Hip bone.r','Sacrum'],'lombar':['Vertebra L3'],'clavicula':['Clavicle.r'],'esterno':[b for b in raw['bones'] if 'sternum' in b or b=='Xiphoid process'],'mao':[m['name'] for m in json.load(open(root/'dist/skeleton.json'))['meshes'] if m['topic']=='hand' and m['name'].endswith('.r')],'pe':[m['name'] for m in json.load(open(root/'dist/skeleton.json'))['meshes'] if m['topic']=='foot' and m['name'].endswith('.r')]}
for key,names in sets.items():
 bones={b:raw['bones'][b] for b in names};points=[]
 for p in raw['points']:
  bone,dist=p['near'][0];source=p['source'][:-2]
  if bone not in bones:continue
  assert source in translations
  assert dist<.001 or source in ['Vertebral foramen','Obturator foramen'], (source,dist)
  points.append({'id':source,'name':translations[source],'bone':bone,'position':[round(v,7) for v in p['position']],'view':views[source],'source':p['source'],'surfaceDistance':round(dist,7),'kind':'landmark'})
 # Individual whole-bone labels for wrist, foot and sternum. Surface nearest the centroid.
 if key in ['mao','pe','esterno']:
  for b,m in bones.items():
   if 'phalanx' in b:continue
   vertices=m['vertices'];center=[sum(p[i] for p in vertices)/len(vertices) for i in range(3)];p=min(vertices,key=lambda p:sum((p[i]-center[i])**2 for i in range(3)))
   points.append({'id':b,'name':b,'bone':b,'position':p,'view':'front','source':'mesh vertex nearest centroid; identifies the whole bone','kind':'bone'})
 data={'source':'Z-Anatomy / BodyParts3D','license':'CC BY-SA 4.0','note':'Original geometry; no added subdivision. Landmark endpoints evaluated with original Hook modifiers. Whole-bone labels use mesh vertices.','bones':bones,'points':points}
 (root/f'dist/pecas/{key}.json').write_text(json.dumps(data,separators=(',',':'),ensure_ascii=False))
 print(key,len(points),sum(len(m['triangles']) for m in bones.values()),(root/f'dist/pecas/{key}.json').stat().st_size)

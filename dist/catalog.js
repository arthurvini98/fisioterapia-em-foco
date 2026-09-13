import { topics } from './content.js';

const names = {
  'Atlas (C1)':['Atlas (C1)','m'], 'Axis (C2)':['Áxis (C2)','m'],
  'Body of sternum':['Corpo do esterno','m'], 'Manubrium of sternum':['Manúbrio do esterno','m'], 'Xiphoid process':['Processo xifoide','m'],
  'Calcaneus':['Calcâneo','m'], 'Capitate bone':['Capitato','m'], 'Clavicle':['Clavícula','f'], 'Coccyx':['Cóccix','m'],
  'Cuboid bone':['Cuboide','m'], 'Ethmoid bone':['Etmoide','m'], 'Femur':['Fêmur','m'], 'Fibula':['Fíbula','f'],
  'Frontal bone':['Osso frontal','m'], 'Hamate bone':['Hamato','m'], 'Hip bone':['Osso do quadril','m'], 'Humerus':['Úmero','m'],
  'Hyoid bone':['Hioide','m'], 'Inferior nasal concha bone':['Concha nasal inferior','f'],
  'Intermediate cuneiform bone':['Cuneiforme intermédio','m'], 'Lacrimal bone':['Osso lacrimal','m'],
  'Lateral cuneiform bone':['Cuneiforme lateral','m'], 'Lunate bone':['Semilunar','m'], 'Mandible':['Mandíbula','f'],
  'Maxilla':['Maxila','f'], 'Medial cuneiform bone':['Cuneiforme medial','m'], 'Nasal bone':['Osso nasal','m'],
  'Navicular bone':['Navicular','m'], 'Occipital bone':['Osso occipital','m'], 'Palatine bone':['Osso palatino','m'],
  'Parietal bone':['Osso parietal','m'], 'Patella':['Patela','f'], 'Pisiform bone':['Pisiforme','m'], 'Radius':['Rádio','m'],
  'Sacrum':['Sacro','m'], 'Scaphoid bone':['Escafoide','m'], 'Scapula':['Escápula','f'], 'Sphenoid bone':['Esfenoide','m'],
  'Talus':['Tálus','m'], 'Temporal bone':['Osso temporal','m'], 'Tibia':['Tíbia','f'], 'Trapezium bone':['Trapézio','m'],
  'Trapezoid bone':['Trapezoide','m'], 'Triquetrum bone':['Piramidal','m'], 'Ulna':['Ulna','f'], 'Vomer':['Vômer','m'], 'Zygomatic bone':['Osso zigomático','m']
};
const ordinals={first:1,second:2,third:3,fourth:4,fifth:5,sixth:6,seventh:7,eighth:8,ninth:9,tenth:10,eleventh:11,twelfth:12};
const skullNotes={
 'Frontal bone':'Forma a testa e parte do teto das órbitas.',
 'Parietal bone':'Forma parte do teto e da parede lateral do crânio.',
 'Occipital bone':'Forma a região posterior e parte da base do crânio; contém o forame magno.',
 'Temporal bone':'Fica na lateral e na base do crânio; participa da articulação com a mandíbula.',
 'Ethmoid bone':'Situa-se entre as órbitas e participa da cavidade nasal.',
 'Sphenoid bone':'Ocupa a região central da base do crânio.',
 'Maxilla':'Participa da face, do palato duro e das órbitas; sustenta os dentes superiores.',
 'Zygomatic bone':'Forma a saliência da bochecha e parte da órbita.',
 'Nasal bone':'Forma a parte óssea superior do dorso do nariz.',
 'Lacrimal bone':'É um pequeno osso da parede medial da órbita.',
 'Palatine bone':'Participa da porção posterior do palato duro.',
 'Vomer':'Forma parte do septo nasal ósseo.',
 'Inferior nasal concha bone':'Projeta-se da parede lateral da cavidade nasal.'
};

export function boneRecord(mesh){
  const side=mesh.name.endsWith('.l')?'l':mesh.name.endsWith('.r')?'r':null;
  const base=mesh.name.replace(/\.[lr]$/,'');
  let pair=names[base];
  let m;
  if(!pair && (m=base.match(/^Vertebra ([CTL])(\d+)$/)))pair=[`Vértebra ${m[1]}${m[2]}`,'f'];
  if(!pair && (m=base.match(/^(\w+) rib$/i)))pair=[`${ordinals[m[1].toLowerCase()]}ª costela`,'f'];
  if(!pair && (m=base.match(/^(\w+) metacarpal bone$/i)))pair=[`${ordinals[m[1].toLowerCase()]}º metacarpal`,'m'];
  if(!pair && (m=base.match(/^(\w+) metatarsal bone$/i)))pair=[`${ordinals[m[1].toLowerCase()]}º metatarsal`,'m'];
  if(!pair && (m=base.match(/^(Proximal|Middle|Distal) phalanx of (\w+) finger of (hand|foot)$/))){
    const part={Proximal:'proximal',Middle:'média',Distal:'distal'}[m[1]],digit=ordinals[m[2]];
    pair=[`Falange ${part} do ${digit}º dedo ${m[3]==='hand'?'da mão':'do pé'}`,m[3]==='hand'?'f':'m'];
  }
  if(!pair)throw new Error('Osso sem tradução: '+mesh.name);
  let suffix='';
  if(side){const female=pair[1]==='f';suffix=' '+(side==='l'?(female?'esquerda':'esquerdo'):(female?'direita':'direito'));}
  const t=topics[mesh.topic];
  const record={id:mesh.name,name:pair[0]+suffix,side,topic:mesh.topic,kind:'bone',region:t[1],description:t[2],location:t[3],action:t[4],tip:t[5],base};
  if(mesh.topic==='skull'){record.description=skullNotes[base];record.location=skullNotes[base];record.action=['Frontal bone','Parietal bone','Occipital bone','Temporal bone','Ethmoid bone','Sphenoid bone'].includes(base)?'Participa da estrutura óssea que envolve e protege o encéfalo.':'Participa do arcabouço ósseo da face e de suas cavidades.';record.tip='Os ossos do crânio têm formas e relações diferentes. Gire o modelo para observar suas faces.';}
  if(mesh.topic==='spine'){
    if(base==='Coccyx'){record.description='Pequeno conjunto de vértebras fundidas na extremidade inferior da coluna.';record.location='Abaixo do sacro.';record.action='Oferece fixação a estruturas do assoalho pélvico.';}
    else{const code=base.match(/[CTL]\d+/)?.[0];record.description=code?`Vértebra da região ${{C:'cervical',T:'torácica',L:'lombar'}[code[0]]}, identificada como ${code}.`:t[2];record.tip=code?.[0]==='C'?'C1 é o atlas; C2 é o áxis. A região cervical possui sete vértebras.':code?.[0]==='T'?'A região torácica possui 12 vértebras e se articula com as costelas.':'A região lombar possui cinco vértebras.';}
  }
  if(mesh.topic==='ribs'){const n=ordinals[base.split(' ')[0].toLowerCase()];record.description=`${n}ª costela: pertence às ${n<=7?'costelas verdadeiras':n<=10?'costelas falsas, ligadas indiretamente ao esterno':'costelas flutuantes'}.`;}
  if(mesh.topic==='hand'||mesh.topic==='foot'){
    record.description=`Estrutura óssea ${mesh.topic==='hand'?'da mão':'do pé'}.`;
    if(base.includes('phalanx')){record.description='Uma das falanges que formam o esqueleto dos dedos.';record.location=base.startsWith('Proximal')?'Na base do dedo, junto ao metacarpo ou metatarso.':base.startsWith('Middle')?'Entre as falanges proximal e distal.':'Na ponta do dedo.';}
    else if(base.includes('metacarpal'))record.location='Na palma da mão, entre o carpo e a falange proximal.';
    else if(base.includes('metatarsal'))record.location='Entre o tarso e a falange proximal do dedo correspondente.';
    else record.location=mesh.topic==='hand'?'No carpo, na região do punho.':'No tarso, na região posterior do pé.';
  }
  if(side)record.tip+=' Direita e esquerda referem-se ao corpo observado, não à sua tela.';
  // Deep internal cranial bones are available to explore but excluded from click-only review.
  record.quizEligible=!['Ethmoid bone','Sphenoid bone','Vomer','Palatine bone','Lacrimal bone','Inferior nasal concha bone'].includes(base);
  return record;
}

export const muscleInfo={
 deltoid:{name:'Deltoide',description:'Músculo superficial que forma o contorno do ombro.',origin:'Terço lateral da clavícula, acrômio e espinha da escápula.',insertion:'Tuberosidade deltoidea do úmero.',action:'A porção média abduz o braço. A anterior ajuda na flexão e rotação medial; a posterior, na extensão e rotação lateral.',tip:'As três porções têm ações distintas. O deltoide não faz parte do manguito rotador.'},
 supraspinatus:{name:'Supraespinal',description:'Um dos quatro músculos do manguito rotador.',origin:'Fossa supraespinal da escápula.',insertion:'Faceta superior do tubérculo maior do úmero.',action:'Ajuda a iniciar a abdução do braço e estabiliza a cabeça do úmero.',tip:'Fica acima da espinha da escápula.'},
 infraspinatus:{name:'Infraespinal',description:'Músculo do manguito rotador situado na face posterior da escápula.',origin:'Fossa infraespinal da escápula.',insertion:'Faceta média do tubérculo maior do úmero.',action:'Rotação lateral do braço e estabilização glenoumeral.',tip:'Fica abaixo da espinha da escápula.'},
 teres_minor:{name:'Redondo menor',description:'Músculo do manguito rotador junto à borda lateral da escápula.',origin:'Região superior da borda lateral da escápula.',insertion:'Faceta inferior do tubérculo maior do úmero.',action:'Rotação lateral do braço; auxilia a adução e a estabilidade glenoumeral.',tip:'Redondo menor pertence ao manguito; redondo maior não.'},
 subscapularis:{name:'Subescapular',description:'Músculo do manguito rotador na face anterior da escápula.',origin:'Fossa subescapular.',insertion:'Tubérculo menor do úmero.',action:'Rotação medial do braço; auxilia a adução e estabiliza a cabeça do úmero.',tip:'Fica entre a escápula e o tórax. Use a transparência para observar sua posição.'}
};

export const landmarkInfo={
 'Head of femur':{name:'Cabeça do fêmur',text:'Porção arredondada que se articula com o acetábulo do quadril.'},
 'Neck of femur':{name:'Colo do fêmur',text:'Região que conecta a cabeça ao corpo do fêmur.'},
 'Greater trochanter':{name:'Trocânter maior',text:'Projeção lateral que recebe inserções de músculos do quadril.'},
 'Lesser trochanter':{name:'Trocânter menor',text:'Projeção posteromedial onde se insere o iliopsoas. Gire para observar a face posterior.'},
 'Medial condyle of femur':{name:'Côndilo medial',text:'Superfície articular distal do lado medial, em contato com a tíbia.'},
 'Lateral condyle of femur':{name:'Côndilo lateral',text:'Superfície articular distal do lado lateral, em contato com a tíbia.'}
};

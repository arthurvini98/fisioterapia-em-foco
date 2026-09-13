export const lessonId='ombro-inicial';
export const lessonTitle='Conheça o ombro';
export const lessonSteps=[
 {title:'1. A base do ombro',text:'A escápula é o osso plano atrás do tórax. Ela oferece apoio a vários músculos e participa da articulação com o úmero. Observe a escápula direita destacada e gire o modelo para vê-la por trás.',layer:'bones',focus:'Scapula.r'},
 {title:'2. Encontre a escápula',text:'Agora é sua vez: clique na escápula direita. Direita e esquerda são as do esqueleto, não as da tela. Você pode girar e aproximar.',layer:'bones',target:'Scapula.r',region:['Scapula.r','Clavicle.r','Humerus.r']},
 {title:'3. O osso do braço',text:'O úmero forma o esqueleto do braço. Sua cabeça se articula com a cavidade glenoidal da escápula. Observe como esses dois ossos se encontram no ombro.',layer:'bones',focus:'Humerus.r'},
 {title:'4. A ligação com o tronco',text:'A clavícula fica na frente e acima do tórax. Ela se articula com o esterno e com o acrômio da escápula, ajudando a manter o ombro afastado do tronco.',layer:'bones',focus:'Clavicle.r'},
 {title:'5. Encontre a clavícula',text:'Clique na clavícula direita. Procure o osso alongado na parte superior do peito.',layer:'bones',target:'Clavicle.r',region:['Scapula.r','Clavicle.r','Humerus.r']},
 {title:'6. O contorno do ombro',text:'O deltoide é superficial e dá forma arredondada ao ombro. A porção média ajuda a afastar o braço do tronco. As porções anterior e posterior participam de outros movimentos. Observe a origem, a inserção e a ação no painel.',layer:'shoulder',focus:'muscle:deltoid:r'},
 {title:'7. O manguito rotador',text:'Supraespinal, infraespinal, redondo menor e subescapular formam o manguito rotador. Em conjunto, ajudam a manter a cabeça do úmero centrada na articulação. O deltoide foi escondido para facilitar a observação.',layer:'shoulder',cuff:true,focus:'muscle:supraspinatus:r'},
 {title:'8. A face posterior',text:'Infraespinal e redondo menor ajudam a girar o braço para fora. O infraespinal fica abaixo da espinha da escápula. Use a vista posterior para observar a posição dele.',layer:'shoulder',cuff:true,focus:'muscle:infraspinatus:r'},
 {title:'9. O redondo menor',text:'O redondo menor fica próximo à borda lateral da escápula. Ele pertence ao manguito e auxilia a rotação lateral. Compare sua posição com a do infraespinal.',layer:'shoulder',cuff:true,focus:'muscle:teres_minor:r'},
 {title:'10. A face anterior da escápula',text:'O subescapular fica entre a escápula e o tórax e participa da rotação medial. Ajuste a transparência dos ossos para entender essa relação.',layer:'shoulder',cuff:true,focus:'muscle:subscapularis:r'},
 {title:'11. Localize o supraespinal',text:'Encontre o supraespinal direito. Ele fica acima da espinha da escápula. Gire o modelo e use o zoom se precisar.',layer:'shoulder',cuff:true,target:'muscle:supraspinatus:r',region:['muscle:supraspinatus:r','muscle:infraspinatus:r','muscle:teres_minor:r','muscle:subscapularis:r']},
 {title:'12. Revise as relações',text:'Escápula, clavícula e úmero formam a base óssea estudada aqui. O deltoide participa dos movimentos do braço; o manguito também contribui para a estabilidade do ombro. Termine a aula e use “Revisar meus erros” para retomar as estruturas que precisaram de outra tentativa.',layer:'bones',focus:'group:scapula'}
];

const kneeSteps=[
 {title:'1. Conheça a região do joelho',text:'Observe o encontro do fêmur com a tíbia, com a patela à frente. A fíbula fica ao lado da tíbia. Nesta aula vamos localizar esses ossos no lado direito do esqueleto.',layer:'bones',frame:'knee:r'},
 {title:'2. Fêmur: acima do joelho',text:'O fêmur é o osso da coxa. Sua extremidade inferior se articula com a tíbia. Selecione as marcações dos côndilos no painel para observar essa região; você também pode girar o modelo.',layer:'bones',focus:'Femur.r'},
 {title:'3. Encontre o fêmur',text:'Clique no fêmur direito, o osso que chega ao joelho vindo da coxa. Direita e esquerda são as do esqueleto.',layer:'bones',target:'Femur.r',frame:'knee:r'},
 {title:'4. Patela: à frente',text:'A patela fica na frente do joelho e se articula com o fêmur. Ela está incluída no tendão do quadríceps e ajuda esse músculo a estender o joelho.',layer:'bones',focus:'Patella.r'},
 {title:'5. Encontre a patela',text:'Localize a patela direita. Procure o pequeno osso à frente da extremidade inferior do fêmur.',layer:'bones',target:'Patella.r',frame:'knee:r'},
 {title:'6. Tíbia: o apoio da perna',text:'A tíbia é o osso mais robusto da perna, entre joelho e tornozelo. Fica no lado medial, mais perto da linha central do corpo, e recebe a maior parte da carga que vem do fêmur.',layer:'bones',focus:'Tibia.r'},
 {title:'7. Encontre a tíbia',text:'Clique na tíbia direita. Compare os dois ossos abaixo do joelho e procure o mais robusto.',layer:'bones',target:'Tibia.r',frame:'knee:r'},
 {title:'8. Fíbula: o osso lateral',text:'A fíbula é mais fina e fica no lado lateral da perna, mais afastado da linha central. Sua cabeça se articula com a tíbia. Ela não se articula diretamente com o fêmur.',layer:'bones',focus:'Fibula.r'},
 {title:'9. Encontre a fíbula',text:'Clique na fíbula direita. Procure o osso fino ao lado da tíbia; use o zoom para distinguir sua extremidade superior.',layer:'bones',target:'Fibula.r',frame:'knee:r'},
 {title:'10. Junte as peças',text:'Fêmur e tíbia se encontram na articulação tibiofemoral; patela e fêmur, na patelofemoral. O joelho permite principalmente flexão e extensão: dobrar e esticar. Meniscos, cartilagens e ligamentos também participam da articulação, mas não estão representados nesta camada óssea.',layer:'bones',frame:'knee:r'}
];
const ankleSteps=[
 {title:'1. Da perna ao pé',text:'Vamos explorar o tornozelo direito. Tíbia e fíbula se articulam com o tálus. Abaixo dele fica o calcâneo. Gire o modelo para perceber como os ossos se encaixam.',layer:'bones',frame:'ankle:r'},
 {title:'2. O lado medial',text:'A extremidade inferior da tíbia forma o maléolo medial: a saliência do lado de dentro do tornozelo. Medial significa mais perto da linha central do corpo.',layer:'bones',focus:'Tibia.r'},
 {title:'3. Encontre a tíbia',text:'Clique na tíbia direita, reconhecendo sua extremidade junto ao tornozelo. Os lados são os do esqueleto.',layer:'bones',target:'Tibia.r',frame:'ankle:r'},
 {title:'4. O lado lateral',text:'A extremidade inferior da fíbula forma o maléolo lateral: a saliência do lado de fora do tornozelo.',layer:'bones',focus:'Fibula.r'},
 {title:'5. Encontre a fíbula',text:'Clique na fíbula direita. Procure o osso mais fino, no lado lateral da perna.',layer:'bones',target:'Fibula.r',frame:'ankle:r'},
 {title:'6. Tálus: entre perna e pé',text:'O tálus recebe a carga da tíbia. Ele se articula com tíbia e fíbula acima e com o calcâneo abaixo. Observe a estrutura destacada e ajuste a transparência para enxergar as relações.',layer:'bones',focus:'Talus.r'},
 {title:'7. Encontre o tálus',text:'Localize o tálus direito. Gire ou aproxime o modelo para distinguir o osso logo abaixo da tíbia.',layer:'bones',target:'Talus.r',frame:'ankle:r'},
 {title:'8. Calcâneo: o calcanhar',text:'O calcâneo forma o calcanhar e fica abaixo do tálus. Ambos pertencem ao tarso, o conjunto de sete ossos da parte posterior do pé.',layer:'bones',focus:'Calcaneus.r'},
 {title:'9. Encontre o calcâneo',text:'Clique no calcâneo direito. Use a vista lateral se precisar observar melhor o calcanhar.',layer:'bones',target:'Calcaneus.r',frame:'ankle:r'},
 {title:'10. Revise o encaixe',text:'Tíbia no lado medial, fíbula no lateral, tálus entre a perna e o pé e calcâneo no calcanhar. Use essa sequência para se orientar. Esta aula mostra os ossos; não inclui os ligamentos do tornozelo.',layer:'bones',frame:'ankle:r'}
];
// Paired observation and identification steps keep each introductory lesson predictable.
function boneLesson({id,name,intro,region,units,summary}){
 const steps=[{title:'1. '+name,text:intro,layer:'bones',region}];
 for(const unit of units){
  steps.push({title:`${steps.length+1}. ${unit.name}`,text:unit.text,layer:'bones',focus:unit.id});
  steps.push({title:`${steps.length+1}. Agora encontre`,text:unit.task,layer:'bones',target:unit.id,region:unit.region||region});
 }
 steps.push({title:`${steps.length+1}. Junte as relações`,text:summary,layer:'bones',region});
 return {id,name,title:'Conheça '+name.toLowerCase(),steps,summary};
}
const additionalLessons=[
 boneLesson({id:'quadril-inicial',name:'Quadril e pelve',region:['Hip bone.r','Hip bone.l','Sacrum','Coccyx'],
  intro:'A pelve conecta o tronco aos membros inferiores. Observe os dois ossos do quadril e o sacro entre eles. Vamos reconhecer também o fêmur e o cóccix.',
  units:[
   {id:'Hip bone.r',name:'Osso do quadril',text:'Cada osso do quadril resulta da união de ílio, ísquio e púbis. O acetábulo é a cavidade que recebe a cabeça do fêmur.',task:'Clique no osso do quadril direito. Lembre que os lados pertencem ao esqueleto.'},
   {id:'Sacrum',name:'Sacro',text:'O sacro fica na base da coluna, entre os ossos do quadril. Ele participa da transmissão do peso do tronco para a pelve.',task:'Encontre o sacro, no centro posterior da pelve. Gire o modelo se precisar.'},
   {id:'Femur.r',name:'Cabeça e colo do fêmur',text:'A cabeça arredondada do fêmur se encaixa no acetábulo. Use as marcações de cabeça e colo no painel para acompanhar essa relação.',task:'Clique no fêmur direito. Nesta atividade, selecione o osso inteiro, não uma marcação.',region:['Hip bone.r','Femur.r']},
   {id:'Coccyx',name:'Cóccix',text:'O cóccix fica abaixo do sacro, na extremidade inferior da coluna.',task:'Encontre o cóccix. Procure a pequena estrutura abaixo do sacro; a vista posterior pode ajudar.'}
  ],summary:'Você reconheceu osso do quadril, sacro, fêmur e cóccix. A articulação do quadril une a cabeça do fêmur ao acetábulo. Pelve e articulação do quadril não são a mesma coisa.'}),
 boneLesson({id:'coluna-inicial',name:'Coluna vertebral',region:['group:spine','Sacrum'],
  intro:'A coluna possui regiões cervical, torácica, lombar, sacral e coccígea. Vamos localizar referências de cima para baixo. Você pode usar a vista posterior para observar as vértebras.',
  units:[
   {id:'Atlas (C1)',name:'Atlas: C1',text:'O atlas é a primeira vértebra cervical e sustenta o crânio. Tem formato de anel.',task:'Encontre o atlas, logo abaixo do crânio.',region:['Atlas (C1)','Axis (C2)','Vertebra C3']},
   {id:'Axis (C2)',name:'Áxis: C2',text:'O áxis é a segunda vértebra cervical. Seu dente participa da articulação que permite girar a cabeça.',task:'Clique no áxis, a segunda vértebra cervical, abaixo do atlas.',region:['Atlas (C1)','Axis (C2)','Vertebra C3']},
   {id:'Vertebra L5',name:'L5: a última lombar',text:'São cinco vértebras lombares. L5 é a mais inferior, logo acima do sacro.',task:'Localize L5. Comece pelo sacro e procure a vértebra imediatamente acima.',region:['Vertebra L3','Vertebra L4','Vertebra L5','Sacrum']},
   {id:'Sacrum',name:'A base sacral',text:'O sacro resulta da fusão de cinco vértebras sacrais. Fica abaixo de L5 e acima do cóccix.',task:'Encontre o sacro. Compare seu formato com as vértebras lombares.',region:['Vertebra L5','Sacrum','Coccyx']}
  ],summary:'Guarde a sequência: cervical, torácica, lombar, sacral e coccígea. As regiões cervical, torácica e lombar têm 7, 12 e 5 vértebras. Os discos intervertebrais não estão representados nesta camada.'}),
 boneLesson({id:'torax-inicial',name:'Caixa torácica',region:['group:ribs','group:sternum'],
  intro:'Costelas, esterno e vértebras torácicas participam da caixa torácica. Vamos observar a frente do tórax e uma costela flutuante.',
  units:[
   {id:'Manubrium of sternum',name:'Manúbrio',text:'O manúbrio é a parte superior do esterno. As clavículas se articulam com ele.',task:'Clique no manúbrio, na parte superior do esterno.',region:['group:sternum','Clavicle.r','Clavicle.l']},
   {id:'Body of sternum',name:'Corpo do esterno',text:'O corpo é a parte alongada do esterno, entre o manúbrio e o processo xifoide.',task:'Encontre o corpo do esterno, na linha central anterior do peito.'},
   {id:'Xiphoid process',name:'Processo xifoide',text:'O processo xifoide é a pequena parte inferior do esterno.',task:'Clique no processo xifoide, abaixo do corpo do esterno.',region:['group:sternum']},
   {id:'Twelfth rib.r',name:'12ª costela',text:'As costelas 11 e 12 são flutuantes: não se ligam ao esterno. Observe a 12ª costela direita.',task:'Localize a 12ª costela direita, a mais inferior desse lado. Gire o modelo para acompanhar sua posição.'}
  ],summary:'São 12 pares de costelas. O esterno tem manúbrio, corpo e processo xifoide: as partes aparecem separadas para estudo. As cartilagens costais não estão incluídas nesta camada.'}),
 boneLesson({id:'cranio-inicial',name:'Crânio e face',region:['group:skull'],
  intro:'O crânio reúne vários ossos. Alguns envolvem o encéfalo; outros formam a face. Começaremos por quatro referências visíveis de frente.',
  units:[
   {id:'Frontal bone',name:'Osso frontal',text:'O frontal forma a testa e parte do teto das órbitas, as cavidades onde ficam os olhos.',task:'Clique no osso frontal, acima das órbitas.'},
   {id:'Zygomatic bone.r',name:'Osso zigomático',text:'O zigomático forma a saliência da bochecha e parte da órbita.',task:'Encontre o zigomático direito. Procure a saliência lateral à órbita.'},
   {id:'Maxilla.r',name:'Maxila',text:'As maxilas sustentam os dentes superiores e participam do palato duro, das órbitas e da cavidade nasal.',task:'Clique na maxila direita. Procure a região acima dos dentes superiores, do lado direito do esqueleto.'},
   {id:'Mandible',name:'Mandíbula',text:'A mandíbula sustenta os dentes inferiores e se articula com os ossos temporais. Ela se movimenta ao abrir e fechar a boca.',task:'Encontre a mandíbula, na parte inferior da face.'}
  ],summary:'Frontal: testa. Zigomático: bochecha. Maxila: dentes superiores. Mandíbula: dentes inferiores. Essas referências ajudam a começar a leitura do crânio; não representam todos os seus ossos.'}),
 boneLesson({id:'cotovelo-inicial',name:'Cotovelo e antebraço',region:['Humerus.r','Radius.r','Ulna.r'],
  intro:'O úmero encontra rádio e ulna na região do cotovelo. Na posição anatômica, as palmas estão voltadas para a frente.',
  units:[
   {id:'Humerus.r',name:'Úmero',text:'O úmero é o osso do braço. Sua extremidade inferior se articula com rádio e ulna.',task:'Clique no úmero direito, acima do cotovelo.'},
   {id:'Radius.r',name:'Rádio',text:'O rádio fica no lado do polegar, lateralmente, na posição anatômica.',task:'Encontre o rádio direito. Use o lado do polegar como referência.',region:['Radius.r','Ulna.r']},
   {id:'Ulna.r',name:'Ulna',text:'A ulna fica medialmente, do lado do dedo mínimo. O olécrano forma a ponta óssea do cotovelo.',task:'Clique na ulna direita, o osso medial do antebraço.',region:['Radius.r','Ulna.r']}
  ],summary:'Braço: úmero. Antebraço: rádio e ulna. Lembre dos lados do polegar e do dedo mínimo na posição anatômica. O modelo não simula a rotação do antebraço.'}),
 boneLesson({id:'mao-inicial',name:'Punho e mão',region:['Scaphoid bone.r','Fifth metacarpal bone.r','First metacarpal bone.r','Proximal phalanx of first finger of hand.r','Distal phalanx of first finger of hand.r','Distal phalanx of third finger of hand.r'],
  intro:'A mão tem carpo, metacarpo e falanges. Vamos seguir do punho ao polegar direito. Gire o modelo para distinguir os pequenos ossos.',
  units:[
   {id:'Scaphoid bone.r',name:'Escafoide',text:'O escafoide é um dos ossos do carpo, no lado do polegar.',task:'Encontre o escafoide direito. Observe o carpo junto à extremidade do rádio.',region:['Scaphoid bone.r','Lunate bone.r','Trapezium bone.r','Capitate bone.r','Hamate bone.r']},
   {id:'First metacarpal bone.r',name:'1º metacarpal',text:'O primeiro metacarpal pertence ao polegar e fica entre o carpo e a falange proximal.',task:'Clique no primeiro metacarpal direito, na base do polegar.'},
   {id:'Proximal phalanx of first finger of hand.r',name:'Falange proximal do polegar',text:'O polegar tem duas falanges: proximal e distal.',task:'Encontre a falange proximal do polegar direito, logo após o primeiro metacarpal.'},
   {id:'Distal phalanx of first finger of hand.r',name:'Falange distal do polegar',text:'A falange distal fica na ponta do polegar.',task:'Clique na falange distal do polegar direito.'}
  ],summary:'Você seguiu do carpo ao metacarpo e às falanges. O polegar tem duas falanges; os demais dedos da mão têm três.'})
];
export const lessons={
 ...Object.fromEntries(additionalLessons.map(lesson=>[lesson.id,lesson])),
 [lessonId]:{id:lessonId,name:'Ombro',title:lessonTitle,steps:lessonSteps,summary:'Você estudou os ossos do ombro, o deltoide e o manguito rotador.'},
 'tornozelo-inicial':{id:'tornozelo-inicial',name:'Tornozelo e pé',title:'Conheça o tornozelo e o pé',steps:ankleSteps,summary:'Você identificou tíbia, fíbula, tálus e calcâneo e estudou os lados medial e lateral do tornozelo.'},
 'joelho-inicial':{id:'joelho-inicial',name:'Joelho',title:'Conheça o joelho',steps:kneeSteps,summary:'Você localizou fêmur, patela, tíbia e fíbula e estudou suas relações no joelho.'}
};

export const lessonOrder=['cranio-inicial','coluna-inicial','torax-inicial','ombro-inicial','cotovelo-inicial','mao-inicial','quadril-inicial','joelho-inicial','tornozelo-inicial'];

export const lessonSources={
 'cranio-inicial':['Crânio','7-2-the-skull'],
 'coluna-inicial':['Coluna vertebral','7-3-the-vertebral-column'],
 'torax-inicial':['Caixa torácica','7-4-the-thoracic-cage'],
 'ombro-inicial':['Músculos do membro superior','11-5-muscles-of-the-pectoral-girdle-and-upper-limbs'],
 'cotovelo-inicial':['Ossos do membro superior','8-2-bones-of-the-upper-limb'],
 'mao-inicial':['Ossos do membro superior','8-2-bones-of-the-upper-limb'],
 'quadril-inicial':['Pelve e quadril','8-3-the-pelvic-girdle-and-pelvis'],
 'joelho-inicial':['Ossos do membro inferior','8-4-bones-of-the-lower-limb'],
 'tornozelo-inicial':['Ossos do membro inferior','8-4-bones-of-the-lower-limb']
};

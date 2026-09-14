import { downloadStudy } from './export-study.js';
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { topics, planeText } from './content.js';
import { boneRecord, muscleInfo, landmarkInfo } from './catalog.js';
import { focusFrame, lessonRegionBounds, landmarkRegionBounds, adjustedOrbit } from './focus.js';
import { lessonNavigation, lessonPracticeIds, learnedStructureIds } from './study.js';
import { matchesStructure, matchesSide, oppositeStructure, structureLink, linkedStructure } from './explore.js';
import { FrameScheduler } from './render-loop.js';
import { ReviewSession } from './review.js';
import { NotesStore } from './notes.js';
import { ProgressStore } from './progress.js';
import { lessons, lessonOrder, lessonSources } from './lesson-data.js';

const $=id=>document.getElementById(id);
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const records=new Map(),meshById=new Map(),meshes=[];
let scene,camera,renderer,controls,planes,marker,renderLoop;
function requestRender(){if(ready&&renderLoop)renderLoop.request();}
let selected=null,isolated=false,quiz=false,review=null,ready=false;
let layer='bones',contextOpacity=.35,transition=null,landmarks={},activeLandmark=null;
let activeLessonId='ombro-inicial',lessonSteps=lessons[activeLessonId].steps,initialLessonRestored=false;
let lessonActive=false,lessonIndex=0,lessonAttempt=null,lessonBusy=false,errorReview=false;
let reviewLessonId=null,reviewCollection=null;
const progress=new ProgressStore(updateProgress);
const notes=new NotesStore(id=>{if(id===selected)renderNote(id);});
const groupIds=Object.keys(topics).map(key=>'group:'+key);
const collator=new Intl.Collator('pt-BR',{numeric:true,sensitivity:'base'});
const isMuscle=r=>r?.kind==='muscle';
const current=()=>records.get(selected);
const muscleAllowed=r=>!$('cuff-only').checked||r.topic!=='deltoid';

function selectedMeshes(id=selected){
  const r=records.get(id);if(!r)return [];
  if(r.kind==='group')return meshes.filter(m=>m.userData.kind==='bone'&&(m.userData.topic===r.topic||(r.topic==='skull'&&m.userData.topic==='mandible')));
  return meshById.get(id)||[];
}
function boundsFor(id){const box=new THREE.Box3();for(const m of selectedMeshes(id))box.expandByObject(m);return box;}
function allBounds(){const box=new THREE.Box3();for(const m of meshes)if(m.userData.kind==='bone')box.expandByObject(m);return box;}
function focusBox(box,label,direction=new THREE.Vector3(0,0,1),animate=true){
  if(!ready||box.isEmpty())return;
  controls.enableDamping=false;controls.update();controls.enableDamping=true;
  camera.up.set(0,1,0);
  const frame=focusFrame(box,camera,direction);
  const endOrbit=new THREE.Spherical().setFromVector3(frame.position.clone().sub(frame.center));
  const fromOrbit=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
  // Use the shortest turn around the body without travelling through it.
  while(endOrbit.theta-fromOrbit.theta>Math.PI)endOrbit.theta-=Math.PI*2;
  while(endOrbit.theta-fromOrbit.theta< -Math.PI)endOrbit.theta+=Math.PI*2;
  if(!animate||matchMedia('(prefers-reduced-motion: reduce)').matches){transition=null;camera.position.copy(frame.position);controls.target.copy(frame.center);controls.update();}
  else transition={center:frame.center,fromTarget:controls.target.clone(),fromOrbit,endOrbit,start:performance.now()};
  requestRender();$('view-label').textContent=label;
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('active'));
}
function selectionBounds(){return activeLandmark?landmarkRegionBounds(activeLandmark.position,boundsFor(selected)):boundsFor(selected);}
function focusSelection(){if(selected)focusBox(selectionBounds(),(activeLandmark?landmarkInfo[activeLandmark.key].name:current().name)+' · Vista anterior');}
function setView(which,full=false){
  if(!ready)return;
  const direction=which==='back'?new THREE.Vector3(0,0,-1):which==='side'?new THREE.Vector3(1,0,0):new THREE.Vector3(0,0,1);
  let box=(!full&&selected)?selectionBounds():allBounds();
  if(!full&&quiz&&!selected&&review?.current)box=questionBounds();
  if(!full&&lessonActive&&!selected)box=lessonBounds();
  focusBox(box,{front:'Vista anterior',back:'Vista posterior',side:'Vista lateral esquerda'}[which],direction);
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===which));
}
function paint(){
  const chosen=new Set(selectedMeshes());
  for(const m of meshes){
    const r=records.get(m.userData.id),muscle=m.userData.kind==='muscle',hit=chosen.has(m);
    let visible=!muscle||(layer==='shoulder'&&muscleAllowed(r));
    if(isolated)visible=visible&&hit;
    let opacity=1;
    if(selected&&!hit)opacity=contextOpacity;
    else if(!selected&&layer==='shoulder'&&!muscle)opacity=contextOpacity;
    if(opacity===0)visible=false;
    m.visible=visible;
    m.material.color.set(hit?0x55cdc2:muscle?0xb85960:0xe8e4d7);
    m.material.emissive.set(hit?0x103e3b:0);
    const transparent=opacity<1;
    if(m.material.transparent!==transparent){m.material.transparent=transparent;m.material.needsUpdate=true;}
    m.material.opacity=opacity;m.material.depthWrite=!transparent;
  }
  requestRender();$('isolate').textContent=isolated?'Mostrar contexto':'Isolar estrutura';
}
function clearLandmark(){
  activeLandmark=null;if(marker)marker.visible=false;requestRender();
  $('landmark-label').hidden=true;$('clear-landmark').hidden=true;$('landmark-description').textContent='';
  document.querySelectorAll('.landmark-button').forEach(b=>b.classList.remove('active'));
}
function resetDetails(){
  $('bone-info').hidden=true;$('landmarks-panel').hidden=true;$('opposite-side').hidden=true;
  if(lessonActive){$('detail-eyebrow').textContent='OBSERVE NO MODELO';$('bone-title').textContent=lessonSteps[lessonIndex].target?'Use as pistas da aula.':'Visão da região.';$('bone-description').textContent='Arraste para girar. Role para aproximar. Ao selecionar uma estrutura, ela será destacada de frente.';return;}
  $('detail-eyebrow').textContent=quiz?'REVISÃO POR IDENTIFICAÇÃO':'SEU PONTO DE PARTIDA';
  $('bone-title').textContent=quiz?'Teste sua memória.':'Escolha uma estrutura.';
  $('bone-description').textContent=quiz?'Clique na estrutura pedida. Direita e esquerda são as do corpo observado.':'Clique no modelo ou abra uma região na lista. Cada osso pode ser estudado separadamente.';
}
function showDetails(id){
  const r=records.get(id);if(!r)return;
  $('detail-eyebrow').textContent=r.region.toUpperCase();$('bone-title').textContent=r.name;$('bone-description').textContent=r.description;
  $('location-heading').textContent=isMuscle(r)?'ORIGEM':'ONDE FICA';
  $('bone-location').textContent=isMuscle(r)?r.origin:r.location;
  $('insertion-fact').hidden=!isMuscle(r);$('muscle-insertion').textContent=r.insertion||'';
  $('action-heading').textContent=isMuscle(r)?'AÇÃO':'PARA QUE SERVE';$('bone-function').textContent=r.action;
  $('bone-tip').textContent=r.tip;$('bone-info').hidden=false;
  $('copy-structure').hidden=quiz||lessonActive;$('structure-link-status').textContent='';$('structure-link-field').hidden=true;
  const opposite=oppositeStructure(r,records);$('opposite-side').hidden=quiz||lessonActive||!opposite;if(opposite)$('opposite-side').textContent='Ver '+records.get(opposite).name.toLowerCase();
  $('personal-notes').hidden=r.kind==='group';if(r.kind!=='group'){renderNote(id);if($('personal-notes').open)notes.load(id);}
  const anchors=landmarks[id]||[];$('landmarks-panel').hidden=anchors.length===0;
  $('landmark-buttons').replaceChildren();
  for(const item of anchors){const b=document.createElement('button');b.className='landmark-button';b.textContent=landmarkInfo[item.key].name;b.onclick=()=>selectLandmark(item,b);$('landmark-buttons').append(b);}
}
function selectLandmark(item,button){
  clearLandmark();activeLandmark=item;
  marker.position.fromArray(item.position);marker.visible=true;
  $('landmark-label').textContent=landmarkInfo[item.key].name;$('landmark-label').hidden=false;
  $('landmark-description').textContent=landmarkInfo[item.key].text;
  $('clear-landmark').hidden=false;button.classList.add('active');
  // The frontal view remains the default; the marker can be seen through the bone.
  focusSelection();
}
function choose(id){
  if(!ready||!records.has(id))return;
  if(quiz){answer(id);return;}
  if(lessonActive&&lessonSteps[lessonIndex].target){answerLesson(id);return;}
  selected=id;clearLandmark();paint();list();showDetails(id);focusSelection();
}
function row(r,group=false){
  const b=document.createElement('button');b.className='bone-button'+(group?' group-overview':'')+(selected===r.id?' active':'');
  b.textContent=group?'Ver conjunto em 3D':r.name;b.setAttribute('aria-pressed',String(selected===r.id));b.onclick=()=>choose(r.id);return b;
}
function list(){
  const host=$('bones'),term=$('search').value,side=$('list-side').value;let count=0;
  $('clear-search').hidden=!term&&side==='all';
  const expanded=new Set([...host.querySelectorAll('details[open]')].map(e=>e.dataset.group));host.replaceChildren();
  if(layer==='shoulder'){
    for(const r of [...records.values()].filter(r=>isMuscle(r)&&muscleAllowed(r)&&matchesSide(r,side)&&matchesStructure(r,term)).sort((a,b)=>collator.compare(a.name,b.name))){host.append(row(r));count++;}
  }else{
    for(const id of groupIds){
      const group=records.get(id);if(!group)continue;
      const members=[...records.values()].filter(r=>r.kind==='bone'&&r.topic===group.topic&&matchesSide(r,side)&&matchesStructure(r,term,group.name)).sort((a,b)=>collator.compare(a.name,b.name));
      if(!members.length)continue;
      const d=document.createElement('details');d.className='bone-group';d.dataset.group=id;
      d.open=!!term||expanded.has(id)||current()?.topic===group.topic;
      const summary=document.createElement('summary');summary.textContent=group.name+' · '+members.length;d.append(summary);if(side==='all')d.append(row(group,true));count+=members.length;
      for(const r of members)d.append(row(r));host.append(d);
    }
  }
  $('search-count').textContent=count===1?'1 estrutura encontrada':count+' estruturas encontradas';
  if(!host.children.length){const p=document.createElement('p');p.className='small-note';p.textContent='Tente outro nome ou limpe o filtro de lado.';host.append(p);}
}
function reviewCandidates(){
  const region=$('review-region').value;
  return [...records.values()].filter(r=>r.quizEligible && (layer==='shoulder'?isMuscle(r)&&muscleAllowed(r):r.kind==='bone') && (region==='all'||r.topic===region)).map(r=>r.id);
}
function populateReviewRegions(){
  const select=$('review-region');select.replaceChildren(new Option('Todas as regiões','all'));
  const opts=layer==='bones'?Object.entries(topics):Object.entries(muscleInfo).map(([key,r])=>[key,[r.name]]);
  for(const [key,t] of opts)select.add(new Option(t[0],key));
}
function stats(){if(!review)return;$('round-progress').max=review.initialCount||1;$('round-progress').value=review.initialCompleted;$('review-stats').textContent=`Rodada: ${review.initialCompleted}/${review.initialCount} estruturas. ${review.initialFirstTry} acertos na primeira apresentação. ${review.retries} retomadas pendentes.`;}
function questionBounds(){
  const r=records.get(review?.current?.id);if(!r)return allBounds();
  if(reviewLessonId){const step=lessons[reviewLessonId].steps.find(step=>step.target===r.id);if(step){const box=lessonRegionBounds(step,boundsFor);if(!box.isEmpty())return box;}}
  if(isMuscle(r)){const box=new THREE.Box3();for(const m of meshes)if(m.userData.kind==='muscle'&&records.get(m.userData.id)?.side===r.side)box.expandByObject(m);return box;}
  return boundsFor('group:'+r.topic);
}
function nextQuestion(){
  if(!review)return;$('review-summary').hidden=true;const question=review.next();if(question&&errorReview)applyLayer(isMuscle(records.get(question.id))?'shoulder':'bones',records.get(question.id)?.topic!=='deltoid');selected=null;isolated=false;clearLandmark();paint();resetDetails();
  $('next-question').disabled=true;$('reveal-answer').disabled=!question;$('quiz-region').disabled=!question;
  if(!question){$('quiz-question').textContent=review.initialCount?'Rodada concluída!':'Nenhuma estrutura disponível';$('quiz-feedback').textContent='Você concluiu as estruturas e as retomadas. Comece outra rodada quando quiser.';stats();showReviewSummary();return;}
  $('quiz-question').textContent=records.get(question.id).name;
  $('quiz-feedback').textContent=question.retry?'Vamos rever uma estrutura que precisou de outra tentativa.':'Encontre no modelo. Arraste para girar e use o zoom.';
  focusBox(questionBounds(),'Região da questão · Vista anterior');stats();
}
function startReview(){if(!ready)return;if(reviewCollection){startCollectionReview(reviewCollection);return;}if(reviewLessonId){startLessonReview(reviewLessonId);return;}errorReview=false;$('review-scope').textContent='Revisão livre · camada e região escolhidas';review=createReview(reviewCandidates());nextQuestion();}
function answer(id){
  if(!review?.current||review.current.done)return;
  const r=records.get(id);if(!r||r.kind==='group')return;
  const correct=review.answer(id);progress.recordReview(review.current);selected=id;clearLandmark();paint();
  if(correct){$('quiz-feedback').textContent='Correto! '+r.name+'.';showDetails(id);focusSelection();$('next-question').disabled=false;$('reveal-answer').disabled=true;}
  else{selected=null;paint();$('quiz-feedback').textContent='Você clicou em '+r.name+'. Tente novamente.';resetDetails();}
  stats();
}
function reveal(){
  if(!review?.current||review.current.done)return;review.reveal();progress.recordReview(review.current);selected=review.current.id;paint();showDetails(selected);focusSelection();
  $('quiz-feedback').textContent='A resposta está destacada. Ela voltará para revisão.';$('next-question').disabled=false;$('reveal-answer').disabled=true;stats();
}
function setMode(value,startRound=true){
  $('review-summary').hidden=true;reviewLessonId=null;reviewCollection=null;$('review-region').disabled=false;$('return-lesson').hidden=true;
  lessonActive=false;errorReview=false;$('next-lesson').hidden=true;$('lesson-panel').hidden=true;$('lesson-mode').classList.remove('active');$('lesson-mode').setAttribute('aria-pressed','false');$('layer').disabled=false;$('cuff-only').disabled=false;
  quiz=value;selected=null;isolated=false;clearLandmark();paint();resetDetails();
  document.querySelector('.viewer').classList.toggle('quiz-active',value);
  $('study').classList.toggle('active',value);$('explore').classList.toggle('active',!value);
  $('study').setAttribute('aria-pressed',String(value));$('explore').setAttribute('aria-pressed',String(!value));
  $('quiz-banner').hidden=!value;$('review-tools').hidden=!value;$('explore-tools').hidden=value;
  if(value){if(startRound)startReview();}else{list();setView('front',true);}
}
function changeLayer(){
  layer=$('layer').value;selected=null;isolated=false;clearLandmark();paint();resetDetails();
  $('cuff-control').hidden=layer!=='shoulder';$('system-label').textContent=layer==='bones'?'SISTEMA ESQUELÉTICO':'MÚSCULOS DO OMBRO';
  $('model-count').textContent=layer==='bones'?'202 estruturas ósseas':'5 músculos · dois lados';populateReviewRegions();list();
  if(quiz)startReview();else if(layer==='shoulder'){const box=new THREE.Box3();for(const m of meshes)if(m.userData.kind==='muscle')box.expandByObject(m);focusBox(box,'Ombros · Vista anterior');}else setView('front',true);
}
function restore(){
  if(lessonActive){showLessonStep();return;}
  selected=null;isolated=false;clearLandmark();paint();list();resetDetails();selectPlane('none');
  if(quiz&&review?.current)focusBox(questionBounds(),'Região da questão · Vista anterior');else setView('front',true);
}
function makePlanes(){
  planes=new THREE.Group();scene.add(planes);
  for(const [key,color] of [['sagittal',0x52dad0],['coronal',0x61a5ff],['transverse',0xffc574]]){
    const geo=new THREE.PlaneGeometry(key==='sagittal'?.9:1.6,key==='transverse'?.9:2.15);
    const plane=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false}));
    if(key==='sagittal')plane.rotation.y=Math.PI/2;if(key==='transverse')plane.rotation.x=-Math.PI/2;
    plane.name=key;plane.visible=false;plane.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color,transparent:true,opacity:.7})));planes.add(plane);
  }
}
function selectPlane(key){requestRender();if(planes)planes.children.forEach(p=>p.visible=p.name===key);$('plane-description').textContent=planeText[key];document.querySelectorAll('[data-plane]').forEach(b=>b.classList.toggle('active',b.dataset.plane===key));}
async function fetchJSON(path){const r=await fetch(path);if(!r.ok)throw new Error(path+': '+r.status);return r.json();}
async function fetchBuffer(path){const r=await fetch(path);if(!r.ok)throw new Error(path+': '+r.status);return r.arrayBuffer();}
function addMesh(item,buffer,record){
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(buffer,item.positionOffset,item.vertexCount*3),3));
  geo.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer,item.indexOffset,item.indexCount),1));geo.computeVertexNormals();geo.computeBoundingSphere();
  const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:record.kind==='muscle'?0xb85960:0xe8e4d7,roughness:.72,metalness:0,side:THREE.DoubleSide}));
  mesh.name=item.name;mesh.userData={id:record.id,kind:record.kind,topic:record.topic};scene.add(mesh);meshes.push(mesh);
  if(!meshById.has(record.id))meshById.set(record.id,[]);meshById.get(record.id).push(mesh);records.set(record.id,record);
}
function animate(){
  if(transition){const t=Math.min(1,(performance.now()-transition.start)/650),e=t*t*(3-2*t),a=transition.fromOrbit,b=transition.endOrbit;
    controls.target.lerpVectors(transition.fromTarget,transition.center,e);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(new THREE.Spherical(THREE.MathUtils.lerp(a.radius,b.radius,e),THREE.MathUtils.lerp(a.phi,b.phi,e),THREE.MathUtils.lerp(a.theta,b.theta,e))));
    if(t===1)transition=null;
  }
  const moving=controls.update();
  if(marker?.visible){const distance=marker.position.distanceTo(camera.position);marker.scale.setScalar(Math.max(.002,distance*.009));}
  renderer.render(scene,camera);return !!transition||moving;
}
async function start(){
  try{
    const host=$('canvas-wrap');scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(38,1,.005,50);
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;host.append(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Modelo anatômico 3D. Setas giram, mais e menos ajustam o zoom e zero reenquadra de frente.');renderer.domElement.addEventListener('keydown',cameraKey);
    controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.zoomToCursor=true;controls.minDistance=.06;controls.maxDistance=8;renderLoop=new FrameScheduler(animate);controls.addEventListener('change',requestRender);
    controls.addEventListener('start',()=>{transition=null;$('view-label').textContent='Vista livre';document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('active'));});
    scene.add(new THREE.HemisphereLight(0xe3f4ff,0x5e6b75,2.4));
    const light=new THREE.DirectionalLight(0xfff3dc,3.2);light.position.set(-2,3,4);scene.add(light);
    const fill=new THREE.DirectionalLight(0x99d7ef,1.8);fill.position.set(2,1,-3);scene.add(fill);
    const [skeleton,boneBuffer,shoulder,muscleBuffer,anchors]=await Promise.all([fetchJSON('skeleton.json'),fetchBuffer('skeleton.bin'),fetchJSON('shoulder.json'),fetchBuffer('shoulder.bin'),fetchJSON('landmarks.json')]);
    landmarks=anchors.bones;
    for(const item of skeleton.meshes)addMesh(item,boneBuffer,boneRecord(item));
    for(const [topic,t] of Object.entries(topics))records.set('group:'+topic,{id:'group:'+topic,topic,kind:'group',name:t[0],region:t[1],description:t[2],location:t[3],action:t[4],tip:t[5]});
    for(const item of shoulder.meshes){const info=muscleInfo[item.muscle];addMesh(item,muscleBuffer,{...info,id:item.id,name:info.name+(item.side==='l'?' esquerdo':' direito'),side:item.side,topic:item.muscle,kind:'muscle',region:'Músculos do ombro',quizEligible:true});}
    marker=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),new THREE.MeshBasicMaterial({color:0xffd66d,depthTest:false,depthWrite:false}));marker.renderOrder=999;marker.visible=false;scene.add(marker);
    makePlanes();
    const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();requestRender();};
    new ResizeObserver(resize).observe(host);resize();ready=true;updateProgress();
    camera.position.set(0,0,3.3);controls.update();changeLayer();$('loading').hidden=true;
    const pointer=new THREE.Vector2(),raycaster=new THREE.Raycaster();let down=null;
    renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,id:e.pointerId};});
    renderer.domElement.addEventListener('pointercancel',()=>{down=null;});
    renderer.domElement.addEventListener('pointerup',e=>{
      const start=down;down=null;if(!start||start.id!==e.pointerId||Math.hypot(e.clientX-start.x,e.clientY-start.y)>6)return;
      const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
      const candidates=meshes.filter(m=>m.visible&&m.material.opacity>0&&(layer==='shoulder'?m.userData.kind==='muscle':m.userData.kind==='bone'));
      const hit=raycaster.intersectObjects(candidates,false)[0];if(hit)choose(hit.object.userData.id);
    });
    requestRender();openLinkedStructure();
  }catch(error){
    $('loading').replaceChildren();const title=document.createElement('strong');title.textContent='O modelo 3D não carregou.';
    const msg=document.createElement('span');msg.textContent='Verifique a conexão e a aceleração gráfica do navegador.';
    const retry=document.createElement('button');retry.textContent='Tentar novamente';retry.onclick=()=>location.reload();$('loading').append(title,msg,retry);console.error(error);
  }
}
$('search').addEventListener('input',list);$('layer').onchange=changeLayer;
$('cuff-only').onchange=()=>{selected=null;isolated=false;clearLandmark();paint();list();resetDetails();if(quiz)startReview();};
$('study').onclick=()=>setMode(true);$('explore').onclick=()=>setMode(false);
$('review-region').onchange=startReview;$('restart-review').onclick=startReview;
$('next-question').onclick=nextQuestion;$('reveal-answer').onclick=reveal;
$('quiz-region').onclick=()=>{if(review?.current)focusBox(questionBounds(),'Região da questão · Vista anterior');};
$('context-opacity').oninput=()=>{contextOpacity=Number($('context-opacity').value)/100;$('opacity-value').textContent=Math.round(contextOpacity*100)+'%';paint();};
$('isolate').onclick=()=>{if(!selected)return;isolated=!isolated;paint();focusSelection();};
$('clear-landmark').onclick=()=>{clearLandmark();focusSelection();};$('reset').onclick=restore;
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
document.querySelectorAll('[data-plane]').forEach(b=>b.onclick=()=>selectPlane(b.dataset.plane));
$('credits-open').onclick=e=>{e.preventDefault();$('credits').showModal();};$('credits-close').onclick=()=>$('credits').close();
progress.load();
start();

function updateProgress(){
 if(progress.loaded&&!initialLessonRestored){initialLessonRestored=true;const id=progress.data.lastLessonId;if(id&&Object.hasOwn(lessons,id)){activeLessonId=id;lessonSteps=lessons[id].steps;}}
 const data=progress.data,done=progress.lesson(activeLessonId).completedSteps.length;
 const completed=lessonOrder.filter(id=>progress.lesson(id).completedSteps.length===lessons[id].steps.length).length;
 $('resume-label').textContent=progress.loaded?(done===lessonSteps.length?'Rever: ':done?'Retomar: ':'Começar: ')+lessons[activeLessonId].name:'';
 $('course-summary').textContent=`${completed} de ${lessonOrder.length} aulas concluídas`;
 populateLessons();
 const attempts=data.reviews.reduce((n,r)=>n+Number(r.attempts),0),correct=data.reviews.reduce((n,r)=>n+Number(r.first_try),0);
 $('saved-summary').textContent=`${lessons[activeLessonId].name}: ${done}/${lessonSteps.length} etapas · Histórico geral: ${correct}/${attempts} acertos de primeira`;
 $('save-status').textContent=progress.status==='error'?progress.error:progress.status==='saved'?'Progresso salvo na sua conta.':progress.status==='loading'?'Carregando seu progresso…':'Salvando progresso…';
 if(progress.status==='error')$('progress-panel').open=true;
 $('retry-save').hidden=progress.status!=='error';$('save-status').classList.toggle('error',progress.status==='error');
 if(lessonActive)renderLessonOutline();
 $('resume-lesson').textContent=(done===lessonSteps.length?'Rever aula de ':done?'Retomar aula de ':'Começar aula de ')+lessons[activeLessonId].name.toLowerCase();
 $('review-errors').textContent=`Revisar meus erros (${progress.mistakes.length})`;
 $('review-errors').disabled=!ready||!progress.loaded||!progress.mistakes.length;
 const learned=learnedStructureIds(lessons,id=>progress.lesson(id),records);
 $('review-learned').disabled=!ready||!progress.loaded||!learned.length;
 $('learned-summary').textContent=!progress.loaded?'':learned.length?`${learned.length} estruturas disponíveis para revisão geral.`:'Conclua etapas das aulas para liberar a revisão geral.';
 renderMistakes();
}
function applyLayer(value,cuff=false){
 layer=value;$('layer').value=value;$('cuff-only').checked=cuff;
 $('cuff-control').hidden=value!=='shoulder';$('system-label').textContent=value==='bones'?'SISTEMA ESQUELÉTICO':'MÚSCULOS DO OMBRO';
 $('model-count').textContent=value==='bones'?'202 estruturas ósseas':'5 músculos · dois lados';populateReviewRegions();
}
function lessonBounds(){return lessonRegionBounds(lessonSteps[lessonIndex],boundsFor);}
function showLessonStep(){
 renderLessonOutline();
 const step=lessonSteps[lessonIndex];$('next-lesson').hidden=true;lessonAttempt=step.target?{id:step.target,hadError:false,done:false}:null;
 applyLayer(step.layer,!!step.cuff);selected=step.focus||null;isolated=false;clearLandmark();paint();list();resetDetails();
 const source=lessonSources[activeLessonId];$('lesson-source').href='https://openstax.org/books/anatomy-and-physiology-2e/pages/'+source[1];$('lesson-source').textContent='OpenStax · '+source[0]+' ↗';
 $('lesson-eyebrow').textContent='AULA GUIADA · '+lessons[activeLessonId].name.toUpperCase();$('lesson-progress').max=lessonSteps.length;
 $('lesson-title').textContent=step.title;$('lesson-text').textContent=step.text;$('lesson-feedback').textContent='';
 $('lesson-progress').value=progress.lesson(activeLessonId).completedSteps.length;
 $('lesson-back').disabled=lessonIndex===0;$('lesson-next').disabled=!!step.target;
 $('lesson-next').textContent=lessonIndex===lessonSteps.length-1?'Concluir aula':'Entendi, continuar';
 $('lesson-reveal').hidden=!step.target;
 if(selected){showDetails(selected);focusSelection();}else focusBox(lessonBounds(),(step.target?'Atividade':'Região da aula')+' · Vista anterior');
}
async function enterLesson(){
 if(!ready||lessonBusy)return;
 if(!progress.loaded&&!(await progress.retry()))return;
 setMode(false);lessonActive=true;lessonIndex=progress.lesson(activeLessonId).completedSteps.length===lessonSteps.length?0:progress.lesson(activeLessonId).currentStep;
 $('explore').classList.remove('active');$('explore').setAttribute('aria-pressed','false');$('lesson-mode').classList.add('active');$('lesson-mode').setAttribute('aria-pressed','true');
 $('lesson-panel').hidden=false;$('explore-tools').hidden=true;$('layer').disabled=true;$('cuff-only').disabled=true;
 showLessonStep();progress.saveLesson(lessonIndex,[],activeLessonId);
}
function answerLesson(id,revealed=false){
 if(!lessonAttempt||lessonAttempt.done)return;
 const correct=id===lessonAttempt.id;
 if(!correct||revealed)lessonAttempt.hadError=true;
 progress.recordReview(lessonAttempt);
 if(correct){lessonAttempt.done=true;selected=id;paint();showDetails(id);focusSelection();$('lesson-next').disabled=false;$('lesson-reveal').hidden=true;$('lesson-feedback').textContent=revealed?'Resposta destacada. Esta estrutura foi adicionada aos seus erros para revisão.':'Correto! Observe a estrutura destacada e continue.';}
 else $('lesson-feedback').textContent='Você clicou em '+records.get(id).name+'. Tente novamente; os lados são os do esqueleto.';
}
async function moveLesson(back=false){
 if(lessonBusy||!lessonActive||(!back&&lessonAttempt&&!lessonAttempt.done))return;
 lessonBusy=true;renderLessonOutline();$('lesson-back').disabled=true;$('lesson-next').disabled=true;
 const finished=!back&&lessonIndex===lessonSteps.length-1,next=back?Math.max(0,lessonIndex-1):Math.min(lessonSteps.length-1,lessonIndex+1);
 $('lesson-select').disabled=true;
 const saved=await progress.saveLesson(next,back?[]:[lessonIndex],activeLessonId);lessonBusy=false;$('lesson-select').disabled=false;renderLessonOutline();
 if(!lessonActive)return;
 if(!saved){$('lesson-feedback').textContent='A etapa ainda não foi confirmada. Use “Tentar salvar novamente” e depois continue.';$('lesson-back').disabled=lessonIndex===0;$('lesson-next').disabled=false;return;}
 if(finished){const pending=lessonNavigation(progress.lesson(activeLessonId),lessonSteps.length).firstPending;if(pending!==null){lessonIndex=pending;showLessonStep();$('lesson-feedback').textContent='Vamos concluir as etapas que ainda faltam.';return;}$('lesson-progress').value=lessonSteps.length;$('lesson-title').textContent='Aula concluída!';$('lesson-text').textContent=lessons[activeLessonId].summary+' Seu progresso está salvo. Escolha outra aula ou use “Revisar meus erros”.';$('lesson-feedback').textContent='';$('lesson-next').disabled=true;$('lesson-back').disabled=false;const nextId=nextLessonId();$('next-lesson').hidden=!nextId;if(nextId)$('next-lesson').textContent='Continuar: '+lessons[nextId].name;return;}
 lessonIndex=next;showLessonStep();
}
$('lesson-mode').onclick=enterLesson;$('resume-lesson').onclick=enterLesson;
$('lesson-back').onclick=()=>moveLesson(true);$('lesson-next').onclick=()=>moveLesson();
$('lesson-reveal').onclick=()=>answerLesson(lessonAttempt.id,true);
$('retry-save').onclick=()=>progress.retry();
$('review-errors').onclick=()=>startCollectionReview('mistakes');
$('review-learned').onclick=()=>startCollectionReview('learned');

$('lesson-select').onchange=()=>{if(lessonBusy)return;initialLessonRestored=true;activeLessonId=$('lesson-select').value;lessonSteps=lessons[activeLessonId].steps;updateProgress();if(lessonActive)enterLesson();};

function populateLessons(){
 const select=$('lesson-select');
 if(select.options.length!==lessonOrder.length){
  select.replaceChildren();
  for(const [label,ids] of [['Cabeça e tronco',lessonOrder.slice(0,3)],['Membro superior',lessonOrder.slice(3,6)],['Pelve e membro inferior',lessonOrder.slice(6)]]){
   const group=document.createElement('optgroup');group.label=label;
   for(const id of ids)group.append(new Option('',id));select.append(group);
  }
 }
 for(const option of select.options){const l=lessons[option.value],done=progress.lesson(l.id).completedSteps.length;option.textContent=l.name+' · '+(done===l.steps.length?'Concluída':done?`${done}/${l.steps.length} etapas`:`${l.steps.length} etapas`);}
 select.value=activeLessonId;
}
function nextLessonId(){
 const index=lessonOrder.indexOf(activeLessonId),ordered=[...lessonOrder.slice(index+1),...lessonOrder.slice(0,index)];
 return ordered.find(id=>progress.lesson(id).completedSteps.length<lessons[id].steps.length)||null;
}
$('next-lesson').onclick=()=>{const id=nextLessonId();if(!id||lessonBusy)return;activeLessonId=id;lessonSteps=lessons[id].steps;updateProgress();enterLesson();};
populateLessons();

function renderLessonOutline(){
 const host=$('lesson-steps');host.replaceChildren();
 for(const item of lessonNavigation(progress.lesson(activeLessonId),lessonSteps.length).steps){
  const b=document.createElement('button');b.type='button';b.textContent=(item.completed?'✓ ':'')+lessonSteps[item.index].title;
  b.disabled=lessonBusy||!item.available;b.classList.toggle('current',item.index===lessonIndex);if(item.index===lessonIndex)b.setAttribute('aria-current','step');
  b.onclick=()=>jumpLesson(item.index);host.append(b);
 }
}
async function jumpLesson(index){
 if(!lessonActive||lessonBusy||index===lessonIndex||!lessonNavigation(progress.lesson(activeLessonId),lessonSteps.length).steps[index]?.available)return;
 lessonBusy=true;$('lesson-select').disabled=true;$('lesson-back').disabled=true;$('lesson-next').disabled=true;renderLessonOutline();
 const saved=await progress.saveLesson(index,[],activeLessonId);lessonBusy=false;$('lesson-select').disabled=false;
 if(!lessonActive)return;
 if(saved){lessonIndex=index;showLessonStep();$('lesson-outline').open=false;}
 else{$('lesson-feedback').textContent='Não foi possível confirmar a retomada. Tente salvar novamente.';$('lesson-back').disabled=lessonIndex===0;$('lesson-next').disabled=!!lessonAttempt&&!lessonAttempt.done;renderLessonOutline();}
}
function startLessonReview(id){
 if(!ready||lessonBusy)return;
 const ids=lessonPracticeIds(lessons[id],records);if(!ids.length)return;
 setMode(true,false);reviewLessonId=id;errorReview=true;
 $('review-scope').textContent='Revisão de '+lessons[id].name+' · '+ids.length+' estruturas';
 $('return-lesson').hidden=false;$('layer').disabled=true;$('cuff-only').disabled=true;$('review-region').disabled=true;
 review=createReview(ids);nextQuestion();
}
$('practice-lesson').onclick=()=>startLessonReview(activeLessonId);
$('return-lesson').onclick=()=>{if(!reviewLessonId)return;activeLessonId=reviewLessonId;lessonSteps=lessons[activeLessonId].steps;updateProgress();enterLesson();};

function startCollectionReview(kind){
 if(!ready||lessonBusy||!progress.loaded)return;
 const ids=kind==='learned'?learnedStructureIds(lessons,id=>progress.lesson(id),records):progress.mistakes.filter(id=>records.has(id));
 setMode(true,false);reviewCollection=kind;errorReview=true;
 $('review-scope').textContent=(kind==='learned'?'Revisão do que você estudou':'Revisão dos seus erros')+' · '+ids.length+' estruturas';
 $('layer').disabled=true;$('cuff-only').disabled=true;$('review-region').disabled=true;
 review=createReview(ids);nextQuestion();
}
function renderMistakes(){
 const host=$('mistake-list');host.replaceChildren();
 if(!progress.loaded||!ready){const p=document.createElement('p');p.className='small-note';p.textContent='Aguardando o histórico e o modelo.';host.append(p);return;}
 const mistakes=progress.data.reviews.filter(r=>Number(r.last_correct)===0&&records.has(r.structure_id)).sort((a,b)=>collator.compare(records.get(a.structure_id).name,records.get(b.structure_id).name));
 if(!mistakes.length){const p=document.createElement('p');p.className='small-note';p.textContent='Nenhuma estrutura pendente no histórico salvo.';host.append(p);return;}
 for(const item of mistakes){
  const r=records.get(item.structure_id),b=document.createElement('button');b.type='button';b.textContent=r.name+' ↗';b.setAttribute('aria-label','Abrir '+r.name+' no modelo 3D');
  b.onclick=()=>{if(lessonBusy)return;setMode(false);applyLayer(isMuscle(r)?'shoulder':'bones',r.topic!=='deltoid');choose(r.id);};host.append(b);
 }
}

function createReview(ids){return new ReviewSession(ids,Math.random,Number($('round-size').value)||Infinity);}
function showReviewSummary(){
 $('review-summary').hidden=false;
 $('round-result').textContent=review.initialCount?`${review.initialFirstTry} de ${review.initialCount} acertos de primeira`:'Nenhuma estrutura disponível';
 $('round-detail').textContent=review.initialCount?`Você concluiu ${review.initialCount} estruturas e ${review.completed-review.initialCount} tentativas extras. Os acertos de primeira consideram apenas a apresentação inicial de cada estrutura.`:'Escolha outra região ou conclua etapas das aulas para liberar estruturas.';
 const host=$('round-difficult');host.replaceChildren();
 if(review.difficultIds.size){
  const p=document.createElement('p');p.textContent='Precisaram de outra tentativa nesta rodada:';host.append(p);
  for(const id of review.difficultIds){const b=document.createElement('button');b.type='button';b.textContent=records.get(id).name+' ↗';b.onclick=()=>{const r=records.get(id);setMode(false);applyLayer(isMuscle(r)?'shoulder':'bones',r.topic!=='deltoid');choose(id);};host.append(b);}
 }else if(review.initialCount){const p=document.createElement('p');p.textContent='Todas as estruturas foram identificadas de primeira.';host.append(p);}
 $('bone-title').textContent='Rodada encerrada.';$('bone-description').textContent='Use o resumo para escolher o que observar novamente.';
}
$('summary-restart').onclick=startReview;

$('list-side').onchange=list;
$('clear-search').onclick=()=>{$('search').value='';$('list-side').value='all';list();$('search').focus();};
$('opposite-side').onclick=()=>{if(quiz||lessonActive)return;const id=oppositeStructure(current(),records);if(!id)return;$('list-side').value=records.get(id).side;$('search').value='';choose(id);};

function adjustCamera(options){
 if(!ready)return;
 transition=null;controls.enableDamping=false;controls.update();
 camera.position.copy(adjustedOrbit(camera.position,controls.target,{...options,minDistance:controls.minDistance,maxDistance:controls.maxDistance}));
 controls.update();controls.enableDamping=true;
 $('view-label').textContent='Vista livre';document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('active'));
}
function cameraKey(event){
 if(event.ctrlKey||event.altKey||event.metaKey)return;
 const rotations={ArrowLeft:{theta:-.15},ArrowRight:{theta:.15},ArrowUp:{phi:-.15},ArrowDown:{phi:.15}};
 if(rotations[event.key]){event.preventDefault();adjustCamera(rotations[event.key]);}
 else if(['+','='].includes(event.key)){event.preventDefault();adjustCamera({scale:.82});}
 else if(['-','_'].includes(event.key)){event.preventDefault();adjustCamera({scale:1/.82});}
 else if(event.key==='0'){event.preventDefault();setView('front');}
 else if(event.key.toLowerCase()==='f'){event.preventDefault();if(!event.repeat)toggleFullscreen();}
}
async function toggleFullscreen(){
 try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('main').requestFullscreen();}
 catch{$('camera-status').textContent='Não foi possível abrir a tela cheia neste navegador.';}
}
$('zoom-in').onclick=()=>adjustCamera({scale:.82});$('zoom-out').onclick=()=>adjustCamera({scale:1/.82});
$('fullscreen').onclick=toggleFullscreen;
if(!document.fullscreenEnabled)$('fullscreen').hidden=true;
document.addEventListener('fullscreenchange',()=>{const active=!!document.fullscreenElement;$('fullscreen').setAttribute('aria-label',active?'Sair da tela cheia':'Abrir em tela cheia');$('fullscreen').title=active?'Sair da tela cheia':'Tela cheia';$('fullscreen').setAttribute('aria-pressed',String(active));});
$('camera-help').onclick=()=>{const expanded=$('camera-shortcuts').hidden;$('camera-shortcuts').hidden=!expanded;$('camera-help').setAttribute('aria-expanded',String(expanded));};

function updateProgressPanel(){document.querySelector('.library').classList.toggle('progress-collapsed',!$('progress-panel').open);}
$('progress-panel').addEventListener('toggle',updateProgressPanel);updateProgressPanel();

function openLinkedStructure(){
 if(!ready||lessonBusy)return;
 const id=linkedStructure(location.hash,records);if(!id)return;
 const r=records.get(id);setMode(false);applyLayer(isMuscle(r)?'shoulder':'bones',r.topic!=='deltoid');$('search').value='';$('list-side').value='all';choose(id);
}
window.addEventListener('hashchange',openLinkedStructure);
$('copy-structure').onclick=async()=>{
 if(!selected||quiz||lessonActive)return;
 const id=selected,url=structureLink(location.href,id);
 try{await navigator.clipboard.writeText(url);if(selected===id)$('structure-link-status').textContent='Link copiado. Ele abre esta estrutura em 3D.';}
 catch{if(selected!==id)return;$('structure-link-field').hidden=false;$('structure-link-field').value=url;$('structure-link-field').focus();$('structure-link-field').select();$('structure-link-status').textContent='Copie o link do campo abaixo.';}
};

function renderNote(id){
 const e=notes.entry(id),dirty=e.text!==e.saved;
 if($('note-text').value!==e.text)$('note-text').value=e.text;
 $('note-text').disabled=!e.loaded;
 $('save-note').disabled=!e.loaded||e.saving||!!e.conflict||!dirty;
 $('note-status').textContent=e.error||(!e.loaded?(e.loading?'Carregando anotação…':'Abra o painel para carregar a anotação.'):e.saving?'Salvando…':dirty?'Alterações ainda não salvas.':e.version?'Anotação salva na sua conta.':'Nenhuma anotação salva para esta estrutura.');
 $('retry-note').hidden=e.loaded||e.loading||!e.error;
 $('note-conflict').hidden=!e.conflict;
 if(e.conflict)$('server-note').value=e.conflict.body;
}
$('personal-notes').addEventListener('toggle',()=>{if($('personal-notes').open&&selected&&current()?.kind!=='group')notes.load(selected);});
$('note-text').oninput=()=>{if(selected)notes.edit(selected,$('note-text').value);};
$('save-note').onclick=()=>{if(selected)notes.save(selected);};
$('retry-note').onclick=()=>{if(selected)notes.load(selected);};
$('use-server-note').onclick=()=>{if(selected)notes.useServer(selected);};
$('keep-note').onclick=()=>{if(selected)notes.keepDraft(selected);};
window.addEventListener('beforeunload',event=>{if(notes.hasUnsaved){event.preventDefault();event.returnValue='';}});

$('export-study').onclick=async()=>{
 const button=$('export-study'),status=$('export-status');
 if(notes.hasUnsaved||progress.pending.length||progress.running){status.textContent='Salve suas anotações e aguarde o progresso terminar de salvar antes de exportar.';return;}
 button.disabled=true;status.textContent='Preparando seus estudos…';
 try{await downloadStudy();status.textContent='Arquivo preparado para download. Guarde-o em um local seguro.';}
 catch{status.textContent='Não foi possível exportar. Confira a conexão e tente novamente.';}
 finally{button.disabled=false;}
};

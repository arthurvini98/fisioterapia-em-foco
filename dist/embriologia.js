import {ChallengeHistory} from './embryology-history.js';
import {structureGuide} from './embryology-guide.js';
import {readPreferences,savePreferences,shortcutAction} from './embryology-preferences.js';
import {stageIndex,stageLink} from './embryology-navigation.js';
import {highlightPart} from './embryology-selection.js';
import {applyMotion,motionCaption} from './embryology-motion.js';
import * as T from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {buildModel} from './embryology-models.js';
import {stages} from './embryology-data.js';
const $=id=>document.getElementById(id);let savedStage=null;try{savedStage=localStorage.getItem('embryology-stage');}catch{}
let preferences={speed:1,cut:true};try{preferences=readPreferences(localStorage);}catch{}
$('speed').value=preferences.speed;$('cut').checked=preferences.cut;
function rememberPreferences(){try{savePreferences(localStorage,Number($('speed').value),$('cut').checked);}catch{}}
$('speed').onchange=rememberPreferences;
let index=stageIndex(location.hash,savedStage,stages),model,scene,camera,renderer,controls,scheduled=false;
function render(){if(!renderer||scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;renderer.render(scene,camera);});}
let historyStorage=null;try{historyStorage=localStorage;}catch{}
const reviewHistory=new ChallengeHistory(historyStorage);
let challenge=null,lastChallenge=null;
let selectedPart=null,resumeAfterSelection=false,isolated=false;
function explainSelection(name){
 const guide=structureGuide(name,stages[index]);$('structure-guide').hidden=!guide;
 if(!guide)return;
 $('guide-title').textContent=name;$('guide-what').textContent=guide.what;$('guide-role').textContent=guide.role;$('guide-observe').textContent=guide.observe;$('guide-source').href=guide.source;
}
function select(name){
 if(challenge)return;
 if(selectedPart===name){clearSelection();return;}
 if(!selectedPart)resumeAfterSelection=autoplay;
 explainSelection(name);selectedPart=name;autoplay=false;pause();isolated=false;highlightPart(model,name);
 $('isolate-selection').hidden=false;$('isolate-selection').textContent='Ver só esta estrutura';$('isolate-selection').setAttribute('aria-pressed','false');focusSelection();
 $('selection').textContent=`Em destaque: ${name}. Animação pausada para observar.`;
 $('clear-selection').hidden=false;
 [...$('parts').children].forEach(button=>button.setAttribute('aria-pressed',String(button.textContent===name)));
 render();
}
function clearSelection(){
 $('structure-guide').hidden=true;
 if(model)highlightPart(model);
 selectedPart=null;isolated=false;$('isolate-selection').hidden=true;reset();$('clear-selection').hidden=true;$('selection').textContent='Escolha uma estrutura para identificá-la.';
 [...$('parts').children].forEach(button=>button.setAttribute('aria-pressed','false'));
 autoplay=resumeAfterSelection;if(autoplay)startPlayback();render();
}
$('clear-selection').onclick=clearSelection;
$('isolate-selection').onclick=()=>{if(!selectedPart)return;isolated=!isolated;highlightPart(model,selectedPart,isolated);$('isolate-selection').setAttribute('aria-pressed',String(isolated));$('isolate-selection').textContent=isolated?'Mostrar estruturas ao redor':'Ver só esta estrutura';render();};
function focusSelection(){
 model.root.updateMatrixWorld(true);const bounds=new T.Box3();
 for(const mesh of model.parts.get(selectedPart)||[])bounds.expandByObject(mesh);
 if(bounds.isEmpty())return;
 const sphere=bounds.getBoundingSphere(new T.Sphere());
 const angle=Math.min(T.MathUtils.degToRad(camera.fov/2),Math.atan(Math.tan(T.MathUtils.degToRad(camera.fov/2))*camera.aspect));
 const distance=Math.max(.4,sphere.radius/Math.sin(angle)*1.2);
 controls.target.copy(sphere.center);camera.position.copy(sphere.center).add(new T.Vector3(0,0,distance));controls.update();render();
}


function show(){
 renderScore();
 challenge=null;$('challenge').hidden=true;$('parts').hidden=false;$('start-challenge').hidden=false;
 $('structure-guide').hidden=true;
 try{localStorage.setItem('embryology-stage',stages[index].kind);}catch{}
 history.replaceState(null,'',stageLink(location.href,stages[index].kind));
 $('link-status').textContent='';
 if(selectedPart){autoplay=resumeAfterSelection;selectedPart=null;}
 $('isolate-selection').hidden=true;isolated=false;$('clear-selection').hidden=true;pause();moment=0;
 const stage=stages[index];$('viewer-stage').textContent=`${index+1}/${stages.length} · ${stage.title}`;$('title').textContent=stage.title;$('explanation').textContent=stage.text;$('observe').textContent=stage.observe;$('number').textContent=`ETAPA ${index+1} DE ${stages.length}`;
 $('prev').disabled=index===0;$('next').disabled=index===stages.length-1;
 [...$('steps').children].forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
 $('parts').replaceChildren();$('selection').textContent='Escolha uma estrutura para identificá-la.';
 if(!scene)return;
 if(model){scene.remove(model.root);model.root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
 model=buildModel(stage.kind,$('cut').checked);scene.add(model.root);
 for(const name of model.parts.keys()){const button=document.createElement('button');button.textContent=name;button.setAttribute('aria-pressed','false');button.onclick=()=>select(name);$('parts').append(button);}
 $('play').disabled=false;$('restart').disabled=false;$('timeline').disabled=false;updateMotion();
 reset();if(autoplay&&!document.hidden)startPlayback();
}
function reset(){if(!camera)return;camera.position.set(0,0,7.5);controls.target.set(0,0,0);controls.update();render();}
let playing=false,moment=0,lastTime=null,frame=null;
let autoplay=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function updateMotion(){if(!model)return;applyMotion(model,stages[index].kind,moment);$('timeline').value=Math.round(moment*1000);$('motion-caption').textContent=motionCaption(stages[index].kind,moment);render();}
function pause(){playing=false;lastTime=null;if(frame!==null)cancelAnimationFrame(frame);frame=null;$('play').textContent='Reproduzir';}
function tick(now){if(!playing)return;if(lastTime!==null)moment=(moment+Math.min(now-lastTime,100)/7000*Number($('speed').value))%1;lastTime=now;updateMotion();frame=requestAnimationFrame(tick);}
function startPlayback(){if(playing||!model)return;if(moment>=1)moment=0;playing=true;lastTime=null;$('play').textContent='Pausar';frame=requestAnimationFrame(tick);}
$('play').onclick=()=>{if(playing){autoplay=false;pause();return;}autoplay=true;startPlayback();};
$('restart').onclick=()=>{pause();moment=0;updateMotion();if(autoplay)startPlayback();};
$('timeline').oninput=()=>{autoplay=false;pause();moment=Number($('timeline').value)/1000;updateMotion();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(autoplay)startPlayback();});
stages.forEach((stage,i)=>{const button=document.createElement('button');button.textContent=`${i+1}. ${stage.title}`;button.onclick=()=>{index=i;show();};$('steps').append(button);});
$('prev').onclick=()=>{if(index>0){index--;show();}};$('next').onclick=()=>{if(index<stages.length-1){index++;show();}};$('cut').onchange=()=>{rememberPreferences();show();};$('reset').onclick=reset;
try{
 scene=new T.Scene();camera=new T.PerspectiveCamera(45,1,.01,100);renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));$('canvas').append(renderer.domElement);
 controls=new OrbitControls(camera,renderer.domElement);controls.zoomToCursor=true;controls.minDistance=.2;controls.maxDistance=14;controls.addEventListener('change',render);
 scene.add(new T.HemisphereLight(0xffffff,0x294250,2.5));const light=new T.DirectionalLight(0xffffff,3);light.position.set(2,4,6);scene.add(light);
 new ResizeObserver(()=>{const w=$('canvas').clientWidth,h=$('canvas').clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();render();}).observe($('canvas'));
 let down=null;renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});renderer.domElement.addEventListener('pointercancel',()=>{down=null;});renderer.domElement.addEventListener('pointerup',e=>{if(!down)return;const moved=Math.hypot(e.clientX-down[0],e.clientY-down[1]);down=null;if(moved>6)return;const r=renderer.domElement.getBoundingClientRect(),ray=new T.Raycaster();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(model.root.children.filter(mesh=>mesh.visible))[0];if(hit)select(hit.object.userData.label);});
 $('error').hidden=true;
}catch(error){renderer=null;scene=null;$('error').textContent='Não foi possível iniciar o 3D. Confira a aceleração gráfica do navegador. A aula em texto continua disponível.';console.error(error);}
show();

document.addEventListener('pointerdown',event=>{const settings=$('viewer-settings');if(settings.open&&!settings.contains(event.target))settings.open=false;});
document.addEventListener('keydown',event=>{const settings=$('viewer-settings');if(event.key==='Escape'&&settings.open){settings.open=false;settings.querySelector('summary').focus();}});

window.addEventListener('hashchange',()=>{index=stageIndex(location.hash,null,stages);show();});
$('copy-stage').onclick=async()=>{try{await navigator.clipboard.writeText(stageLink(location.href,stages[index].kind));$('link-status').textContent='Link da etapa copiado.';}catch{$('link-status').textContent='Copie o endereço da página na barra do navegador: ele já aponta para esta etapa.';}};

const fullscreenTarget=document.querySelector('main');
$('fullscreen').hidden=!document.fullscreenEnabled;
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await fullscreenTarget.requestFullscreen();$('viewer-settings').open=false;}catch{$('fullscreen-status').textContent='O navegador não permitiu a tela cheia.';}};
document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'Sair da tela cheia':'Tela cheia';$('fullscreen-status').textContent='';});
document.addEventListener('keydown',event=>{const action=shortcutAction(event);if(!action)return;const button=$(action);if(!button||button.disabled)return;event.preventDefault();button.click();});

function renderScore(){const score=reviewHistory.summary(stages[index].kind);$('challenge-score').textContent=`Nesta etapa: ${score.correct} acertos em ${score.total} respostas. ${reviewHistory.saved?'Histórico neste navegador (até 500 respostas no total).':'Histórico temporário: não foi possível salvar neste navegador.'}`;}
function startChallenge(){
 if(!model)return;
 const candidates=[...model.parts.keys()].filter(name=>structureGuide(name,stages[index])&&!name.startsWith('Homólogo')&&!name.startsWith('Cromátide'));
 if(candidates.length<3){$('selection').textContent='Nesta etapa, explore os movimentos. A revisão visual está disponível nas etapas de célula e fertilização.';return;}
 if(selectedPart)clearSelection();
 const eligible=$('review-mistakes').checked?candidates.filter(name=>reviewHistory.mistakes(stages[index].kind).includes(name)):candidates;
 if(!eligible.length){$('challenge-feedback').textContent='Nenhum erro pendente nesta etapa. Desmarque a opção para praticar todas as estruturas.';$('selection').textContent='Nenhum erro pendente nesta etapa.';return;}
 const alternatives=eligible.filter(name=>name!==lastChallenge),pool=alternatives.length?alternatives:eligible,answer=pool[Math.floor(Math.random()*pool.length)];lastChallenge=answer;
 const shuffled=candidates.filter(name=>name!==answer);
 for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 const options=shuffled.slice(0,2);options.splice(Math.floor(Math.random()*3),0,answer);
 challenge={answer,answered:false};autoplay=false;pause();highlightPart(model,answer);reset();
 $('parts').hidden=true;$('start-challenge').hidden=true;$('structure-guide').hidden=true;$('challenge').hidden=false;$('challenge-next').hidden=true;$('challenge-feedback').textContent='Observe o modelo e escolha uma opção.';$('selection').textContent='Você pode girar e aproximar o modelo antes de responder.';
 $('challenge-options').replaceChildren();
 for(const name of options){const button=document.createElement('button');button.textContent=name;button.onclick=()=>{
 if(challenge.answered)return;challenge.answered=true;reviewHistory.record(stages[index].kind,answer,name===answer);renderScore();
 [...$('challenge-options').children].forEach(option=>{option.disabled=true;option.classList.toggle('correct',option.textContent===answer);});
 $('challenge-feedback').textContent=name===answer?'Acertou! Veja a explicação abaixo.':`A resposta é ${answer}. Compare com a explicação abaixo.`;
 explainSelection(answer);$('challenge-next').hidden=false;
 };$('challenge-options').append(button);}
 render();
}
$('start-challenge').onclick=startChallenge;$('challenge-next').onclick=startChallenge;$('challenge-exit').onclick=show;

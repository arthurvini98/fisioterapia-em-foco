import {applyMotion,motionCaption} from './embryology-motion.js';
import * as T from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {buildModel} from './embryology-models.js';
import {stages} from './embryology-data.js';
const $=id=>document.getElementById(id);let index=0,model,scene,camera,renderer,controls,scheduled=false;
function render(){if(!renderer||scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;renderer.render(scene,camera);});}
function select(name){$('selection').textContent=name;for(const [label,meshes] of model.parts)for(const mesh of meshes)mesh.material.emissive.set(label===name?0x4a3220:0);render();}
function show(){
 pause();moment=0;
 const stage=stages[index];$('title').textContent=stage.title;$('explanation').textContent=stage.text;$('observe').textContent=stage.observe;$('number').textContent=`ETAPA ${index+1} DE ${stages.length}`;
 $('prev').disabled=index===0;$('next').disabled=index===stages.length-1;
 [...$('steps').children].forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
 $('parts').replaceChildren();$('selection').textContent='Escolha uma estrutura para identificá-la.';
 if(!scene)return;
 if(model){scene.remove(model.root);model.root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
 model=buildModel(stage.kind,$('cut').checked);scene.add(model.root);
 for(const name of model.parts.keys()){const button=document.createElement('button');button.textContent=name;button.onclick=()=>select(name);$('parts').append(button);}
 $('play').disabled=false;$('restart').disabled=false;$('timeline').disabled=false;updateMotion();
 reset();if(autoplay&&!document.hidden)startPlayback();
}
function reset(){if(!camera)return;camera.position.set(0,0,7.5);controls.target.set(0,0,0);controls.update();render();}
let playing=false,moment=0,lastTime=null,frame=null;
let autoplay=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function updateMotion(){if(!model)return;applyMotion(model,stages[index].kind,moment);$('timeline').value=Math.round(moment*1000);$('motion-caption').textContent=motionCaption(stages[index].kind);render();}
function pause(){playing=false;lastTime=null;if(frame!==null)cancelAnimationFrame(frame);frame=null;$('play').textContent='Reproduzir';}
function tick(now){if(!playing)return;if(lastTime!==null)moment=(moment+Math.min(now-lastTime,100)/7000*Number($('speed').value))%1;lastTime=now;updateMotion();frame=requestAnimationFrame(tick);}
function startPlayback(){if(playing||!model)return;if(moment>=1)moment=0;playing=true;lastTime=null;$('play').textContent='Pausar';frame=requestAnimationFrame(tick);}
$('play').onclick=()=>{if(playing){autoplay=false;pause();return;}autoplay=true;startPlayback();};
$('restart').onclick=()=>{pause();moment=0;updateMotion();if(autoplay)startPlayback();};
$('timeline').oninput=()=>{autoplay=false;pause();moment=Number($('timeline').value)/1000;updateMotion();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(autoplay)startPlayback();});
stages.forEach((stage,i)=>{const button=document.createElement('button');button.textContent=`${i+1}. ${stage.title}`;button.onclick=()=>{index=i;show();};$('steps').append(button);});
$('prev').onclick=()=>{if(index>0){index--;show();}};$('next').onclick=()=>{if(index<stages.length-1){index++;show();}};$('cut').onchange=show;$('reset').onclick=reset;
try{
 scene=new T.Scene();camera=new T.PerspectiveCamera(45,1,.01,100);renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));$('canvas').append(renderer.domElement);
 controls=new OrbitControls(camera,renderer.domElement);controls.zoomToCursor=true;controls.minDistance=3;controls.maxDistance=14;controls.addEventListener('change',render);
 scene.add(new T.HemisphereLight(0xffffff,0x294250,2.5));const light=new T.DirectionalLight(0xffffff,3);light.position.set(2,4,6);scene.add(light);
 new ResizeObserver(()=>{const w=$('canvas').clientWidth,h=$('canvas').clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();render();}).observe($('canvas'));
 let down=null;renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});renderer.domElement.addEventListener('pointercancel',()=>{down=null;});renderer.domElement.addEventListener('pointerup',e=>{if(!down)return;const moved=Math.hypot(e.clientX-down[0],e.clientY-down[1]);down=null;if(moved>6)return;const r=renderer.domElement.getBoundingClientRect(),ray=new T.Raycaster();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(model.root.children)[0];if(hit)select(hit.object.userData.label);});
 $('error').hidden=true;
}catch(error){renderer=null;scene=null;$('error').textContent='Não foi possível iniciar o 3D. Confira a aceleração gráfica do navegador. A aula em texto continua disponível.';console.error(error);}
show();

document.addEventListener('pointerdown',event=>{const settings=$('viewer-settings');if(settings.open&&!settings.contains(event.target))settings.open=false;});
document.addEventListener('keydown',event=>{const settings=$('viewer-settings');if(event.key==='Escape'&&settings.open){settings.open=false;settings.querySelector('summary').focus();}});

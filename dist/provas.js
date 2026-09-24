import {topics,cards,cardPool,shuffle,loadProgress} from './exam-data.js';
const $=id=>document.getElementById(id);
let storage;try{storage=localStorage;}catch{}
let progress=loadProgress(storage),exam='practical',topic='all',training=false,queue=[],position=0,revealed=true,assessed=new Set(),roundKnown=0,roundAgain=0;
let viewer=null,loading=null,failed=false,renderId=0;
const params=new URLSearchParams(location.hash.slice(1));if(params.get('prova')==='theory')exam='theory';if(topics.some(t=>t.exam===exam&&t.id===params.get('assunto')))topic=params.get('assunto');
function filtered(){return cardPool(exam,topic,$('weak').checked,progress);}
function writeHash(){history.replaceState(null,'','#'+new URLSearchParams({prova:exam,assunto:topic}));}
function renderSummary(){const all=cardPool(exam),known=all.filter(c=>progress[c.id]===true).length,weak=all.filter(c=>progress[c.id]===false).length;$('progress').textContent=`${known}/${all.length} lembrados · ${weak} para revisar (autoavaliação)`;$('progress-bar').max=all.length;$('progress-bar').value=known;}
function renderTopics(){
 $('syllabus-title').textContent=exam==='practical'?'Roteiro da prática':'Roteiro da teórica';
 document.querySelectorAll('[data-exam]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.exam===exam)));
 $('topics').replaceChildren();
 for(const t of [{id:'all',name:'Todos os assuntos'},...topics.filter(t=>t.exam===exam)]){const b=document.createElement('button');b.textContent=t.name;b.setAttribute('aria-pressed',String(topic===t.id));b.onclick=()=>{topic=t.id;start();};$('topics').append(b);}
}
function start(mix=false){queue=filtered();if(mix)queue=shuffle(queue);position=0;assessed=new Set();roundKnown=0;roundAgain=0;$('round-end').hidden=true;writeHash();renderTopics();renderSummary();render();}
function checklist(){
 $('checklist').replaceChildren();
 if(training){$('checklist').textContent='Volte ao modo de estudo para consultar os nomes.';return;}
 queue.forEach((c,i)=>{const b=document.createElement('button');b.textContent=`${progress[c.id]===true?'✓ ':progress[c.id]===false?'↻ ':''}${c.answer}`;b.onclick=()=>{position=i;render();$('prompt').focus({preventScroll:true});};$('checklist').append(b);});
}
function render(){
 $('round-end').hidden=true;renderId++;const c=queue[position];$('empty').hidden=!!c;$('card').hidden=!c;
 $('save-status').textContent='';checklist();if(!c){$('topic-kicker').textContent=exam==='practical'?'28 SETEMBRO · PROVA PRÁTICA':'05 OUTUBRO · PROVA TEÓRICA';$('topic-title').textContent=topics.find(t=>t.id===topic)?.name||'Todos os assuntos';$('topic-intro').textContent='Altere o assunto ou o filtro para continuar.';$('source').hidden=true;return;}
 const t=topics.find(t=>t.id===c.topic);$('topic-kicker').textContent=exam==='practical'?'28 SETEMBRO · PROVA PRÁTICA':'05 OUTUBRO · PROVA TEÓRICA';$('topic-title').textContent=t.name;$('topic-intro').textContent=t.intro;$('source').href=t.source;$('source').hidden=false;
 $('position').textContent=`ITEM ${position+1} DE ${queue.length}`;$('kind').textContent=c.visual?'IDENTIFICAÇÃO 3D':c.bone?'NOME PELA DESCRIÇÃO':'CONCEITO';
 $('prompt').textContent=c.prompt;$('answer').textContent=c.answer;$('note').textContent=c.note;
 $('atlas').hidden=!c.bone;if(c.bone)$('atlas').href='./#'+new URLSearchParams({estrutura:c.bone});
 revealed=!training;$('answer-panel').hidden=!revealed;$('assessment').hidden=!revealed;$('reveal').hidden=revealed;
 $('assessment-hint').textContent=training?'Diga sua resposta em voz alta. Depois revele e avalie se lembrou.':'Leia, localize e diga o nome. “Lembrei” e “Preciso revisar” registram sua autoavaliação.';
 $('known').disabled=$('again').disabled=assessed.has(c.id);$('prev').disabled=position===0;$('next').textContent=position===queue.length-1?'Concluir rodada':'Próximo →';
 $('visual-panel').hidden=!c.bone;$('isolate').checked=false;
 if(c.bone){$('model-caption').textContent=c.visual?'Identifique o osso amarelo. Arraste para girar; role para aproximar.':'Osso de referência inteiro em amarelo. Este cartão NÃO marca o acidente anatômico com um pino.';showModel(c,renderId);}
}
async function showModel(c,version){
 if(failed)return;
 try{
  if(!loading){$('model-status').hidden=false;loading=(async()=>{const {ExamViewer}=await import('./exam-viewer.js');viewer=new ExamViewer($('model-host'));await viewer.load();})();}
  await loading;if(version!==renderId)return;
  viewer.isolated=false;viewer.show(c);$('model-status').hidden=true;$('retry').hidden=true;
 }catch(error){failed=true;if(viewer){viewer.dispose();viewer=null;}loading=null;$('model-status').hidden=false;$('model-status').textContent='Não foi possível carregar o 3D. Você pode continuar a revisão por texto. Diagnóstico: '+error.message;$('retry').hidden=false;}
}
$('model-host').addEventListener('viewer-error',()=>{failed=true;$('model-status').hidden=false;$('model-status').textContent='O navegador interrompeu o 3D. Tente carregar novamente.';$('retry').hidden=false;});
$('retry').onclick=()=>{if(viewer)viewer.dispose();viewer=null;loading=null;failed=false;$('model-status').textContent='Preparando o modelo…';showModel(queue[position],renderId);};
function assess(known){const c=queue[position];if(!revealed||assessed.has(c.id))return;assessed.add(c.id);progress[c.id]=known;if(known)roundKnown++;else roundAgain++;let saved=true;try{storage.setItem('anatomy-exam-progress',JSON.stringify(progress));}catch{saved=false;}$('save-status').textContent=(known?'Marcado como lembrado.':'Adicionado à revisão.')+(saved?' Salvo neste navegador.':' Não foi possível salvar; o registro fica só nesta sessão.');$('known').disabled=$('again').disabled=true;renderSummary();checklist();}
$('known').onclick=()=>assess(true);$('again').onclick=()=>assess(false);
$('reveal').onclick=()=>{revealed=true;$('answer-panel').hidden=false;$('assessment').hidden=false;$('reveal').hidden=true;};
$('mode').onclick=()=>{training=!training;$('mode').setAttribute('aria-pressed',String(training));$('mode').textContent=training?'Voltar ao estudo':'Treinar sem resposta';render();};
$('prev').onclick=()=>{if(position>0){position--;render();}};
$('next').onclick=()=>{if(position<queue.length-1){position++;render();}else{$('card').hidden=true;$('round-end').hidden=false;$('round-result').textContent=`${roundKnown} lembrados, ${roundAgain} para revisar e ${queue.length-assessed.size} sem autoavaliação nesta rodada.`;$('round-end').scrollIntoView({block:'nearest'});}};
$('weak').onchange=()=>start();$('shuffle').onclick=()=>start(true);$('repeat').onclick=()=>start(true);$('repeat-weak').onclick=()=>{$('weak').checked=true;start(true);};
for(const b of document.querySelectorAll('[data-exam]'))b.onclick=()=>{exam=b.dataset.exam;topic='all';$('weak').checked=false;start();};
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>viewer?.frame(b.dataset.view);
$('isolate').onchange=()=>{if(viewer){viewer.isolated=$('isolate').checked;viewer.show(queue[position]);}};
start();

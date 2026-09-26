import {pieces,pieceRoute,pieceLink} from './piece-data.js';
import {loadPieceData} from './scan-geometry.js';
import {cards} from './exam-data.js';
const $=id=>document.getElementById(id),cache=new Map();let {piece,point:linkedPoint}=pieceRoute(location.hash),data=null,selected=null,viewer=null,hideNames=false,revealed=false,version=0,graphicsFailed=false;
let labels={front:'Anterior',back:'Posterior',lateral:'Lateral direita',medial:'Medial direita',top:'Superior',bottom:'Inferior'};
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
for(const[key,p]of Object.entries(pieces)){const b=document.createElement('button');b.textContent=p.name;b.dataset.piece=key;b.onclick=()=>{piece=key;linkedPoint=null;loadPiece();};$('piece-tabs').append(b);}
function list(){
 $('point-list').replaceChildren();let count=0;const query=normalize($('point-search').value);
 for(const[pindex,p]of data.points.entries()){if(!hideNames&&query&&!normalize(p.name).includes(query))continue;count++;const b=document.createElement('button');b.textContent=hideNames?`Ponto ${pindex+1}`:`${pindex+1}. ${p.name}`;b.setAttribute('aria-pressed',String(p.id===selected?.id));b.onclick=()=>select(p.id);$('point-list').append(b);}
 $('point-count').textContent=`${count} de ${data.points.length} pontos`;
}
function details(){
 $('point-number').textContent=selected?`PONTO ${data.points.indexOf(selected)+1} · ${selected.kind==='bone'?'OSSO INTEIRO':'ACIDENTE ANATÔMICO'}`:'ESCOLHA UM PONTO';
 $('point-name').textContent=selected?(hideNames&&!revealed?'Qual é o nome deste ponto?':selected.name):'Localize primeiro. Diga o nome.';
 const card=selected&&cards.find(c=>c.answer===selected.name||c.answer.startsWith(selected.name+' ('));
 $('point-description').textContent=selected&&(!hideNames||revealed)?(selected.note||(card&&!card.visual?card.prompt:card?.note)||'Observe a posição na peça. Use as outras vistas para reconhecer suas relações.') :'';
 $('reveal-point').hidden=!selected||!hideNames||revealed;$('copy-point').disabled=!selected;
 $('piece-description').hidden=hideNames;$('point-search').disabled=hideNames;viewer?.labels(hideNames);
}
function select(id){selected=data.points.find(p=>p.id===id);if(!selected)return;revealed=false;viewer?.select(id);$('view-status').textContent=`${labels[selected.view]} · foco no ponto ${data.points.indexOf(selected)+1}`;history.replaceState(null,'',pieceLink(piece,id));$('copy-status').textContent='';details();list();}
async function graphics(dataset,ticket){
 if(graphicsFailed)return;
 try{if(!viewer){const{PieceViewer}=await import('./piece-viewer.js');if(ticket!==version)return;viewer=new PieceViewer($('piece-host'),$('pin-layer'),select,()=>{$('view-status').textContent='Vista livre · arraste para explorar';});}viewer.isolated=$('isolate-piece').checked;viewer.showPins=$('show-pins').checked;viewer.display(dataset);if(selected)viewer.select(selected.id);viewer.labels(hideNames);$('piece-status').hidden=true;$('retry-piece').hidden=true;$('piece-host').classList.remove('loading-piece');$('pin-layer').hidden=false;}
 catch(error){graphicsFailed=true;viewer?.dispose();viewer=null;$('piece-status').hidden=false;$('piece-status').textContent='Não foi possível iniciar o 3D. Confira a aceleração gráfica do navegador. '+error.message;$('retry-piece').hidden=false;}
}
async function loadPiece(){
 const ticket=++version;$('piece-host').classList.add('loading-piece');$('pin-layer').hidden=true;selected=null;data=null;$('point-list').replaceChildren();$('point-search').value='';$('point-name').textContent='Carregando…';$('piece-status').hidden=false;$('piece-status').textContent=graphicsFailed?'O 3D está indisponível neste navegador. Use Tentar carregar novamente.':'Carregando peça…';$('point-description').textContent='';$('reveal-point').hidden=true;$('copy-point').disabled=true;$('point-count').textContent='';$('copy-status').textContent='';
 const config=pieces[piece];labels={...labels,lateral:config.side==='esquerda'?'Lateral esquerda':'Lateral direita',medial:piece==='l5-real'||piece==='lombar'?'Lateral esquerda':config.side==='esquerda'?'Medial esquerda':'Medial direita'};for(const b of document.querySelectorAll('[data-direction]'))b.textContent=labels[b.dataset.direction];$('scan-credit').hidden=true;$('piece-title').textContent=config.name;$('piece-description').textContent=config.description;$('piece-description').hidden=hideNames;
 document.querySelectorAll('[data-piece]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.piece===piece)));
 $('external-panel').hidden=!config.sketchfab;$('external-panel').open=false;$('external-host').replaceChildren();$('load-external').hidden=false;if(config.external)$('external-link').href=config.external;
 history.replaceState(null,'',pieceLink(piece,linkedPoint));
 try{if(!cache.has(piece)){const loaded=await loadPieceData(piece);if(ticket!==version)return;cache.set(piece,loaded);}data=cache.get(piece);if(ticket!==version)return;if(data.geometry){$('scan-credit').hidden=false;$('scan-source').textContent=data.source;$('scan-source').href=data.sourceUrl;$('scan-note').textContent=data.note;}list();details();await graphics(data,ticket);if(ticket!==version)return;if(linkedPoint)select(linkedPoint);else{$('view-status').textContent=`Vista ${labels[data.initialView||'front'].toLowerCase()} · peça inteira`;}$('point-name').textContent=selected?$('point-name').textContent:'Escolha um ponto numerado.';}
 catch(error){if(ticket!==version)return;$('piece-status').hidden=false;$('piece-status').textContent='Não foi possível baixar a peça. '+error.message;$('retry-piece').hidden=false;}
}
$('hide-names').onclick=()=>{hideNames=!hideNames;revealed=false;if(hideNames)$('point-search').value='';$('hide-names').setAttribute('aria-pressed',String(hideNames));$('hide-names').textContent=hideNames?'Mostrar nomes':'Esconder nomes para treinar';if(data){list();details();}};
$('reveal-point').onclick=()=>{revealed=true;details();};$('point-search').oninput=()=>{if(data)list();};
for(const b of document.querySelectorAll('[data-direction]'))b.onclick=()=>{viewer?.frame(b.dataset.direction);$('view-status').textContent=`Vista ${labels[b.dataset.direction].toLowerCase()} · peça inteira`;};
$('whole').onclick=()=>{$('isolate-piece').checked=false;if(viewer){viewer.isolated=false;viewer.paint();viewer.frame(data?.initialView||'front');}$('view-status').textContent=`Vista ${labels[data?.initialView||'front'].toLowerCase()} · peça inteira`;};
$('isolate-piece').onchange=()=>{if(viewer){viewer.isolated=$('isolate-piece').checked;viewer.paint();viewer.frame();}};
$('show-pins').onchange=()=>{if(viewer){viewer.showPins=$('show-pins').checked;viewer.loop.request();}};
$('retry-piece').onclick=()=>{viewer?.dispose();viewer=null;graphicsFailed=false;$('piece-status').textContent='Preparando a peça…';loadPiece();};
$('piece-host').addEventListener('piece-graphics-lost',()=>{graphicsFailed=true;$('piece-status').hidden=false;$('piece-status').textContent='O navegador interrompeu o 3D. Tente carregar novamente.';$('retry-piece').hidden=false;});
$('load-external').onclick=()=>{const p=pieces[piece];if(!p.sketchfab)return;const frame=document.createElement('iframe');frame.title=`${p.name} — modelo original no Sketchfab`;frame.src=`https://sketchfab.com/models/${p.sketchfab}/embed?autostart=1`;frame.allow='autoplay; fullscreen; xr-spatial-tracking';frame.allowFullscreen=true;$('external-host').replaceChildren(frame);$('load-external').hidden=true;};
$('copy-point').onclick=async()=>{if(!selected)return;try{await navigator.clipboard.writeText(new URL(pieceLink(piece,selected.id),location.href).href);$('copy-status').textContent='Link copiado.';}catch{$('copy-status').textContent='Não foi possível copiar. Use o endereço desta página.';}};
window.addEventListener('hashchange',()=>{const route=pieceRoute(location.hash);piece=route.piece;linkedPoint=route.point;loadPiece();});
loadPiece();

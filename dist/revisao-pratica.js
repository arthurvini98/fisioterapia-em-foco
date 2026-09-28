import {pieces,pieceLink} from './piece-data.js';
import {practiceCatalog} from './practice-catalog.js';
import {readPractice,practiceCounts,practiceStatus,practiceKey} from './piece-practice.js';
import {topics} from './exam-data.js';
const $=id=>document.getElementById(id);let storage;try{storage=window.localStorage;}catch{}
function link(text,url){const a=document.createElement('a');a.textContent=text;a.href=url;return a;}
function render(){
 const records=readPractice(storage),query=$('structure-search').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(),pendingOnly=$('pending-only').checked;let known=0,review=0,total=0,shown=0;const rows=[];$('practice-grid').replaceChildren();$('weak-links').replaceChildren();
 for(const [key,points] of Object.entries(practiceCatalog)){
  const counts=practiceCounts(records,key,points);known+=counts.known;review+=counts.review;total+=points.length;rows.push({key,counts});
  const matching=points.filter(point=>{
   if(pendingOnly&&practiceStatus(records,key,point.id)==='known')return false;
   return !query||(point.name+' '+pieces[key].name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query);
  });
  const card=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p'),bar=document.createElement('progress');h.textContent=pieces[key].name;p.textContent=`${counts.known}/${points.length} já sei · ${counts.review} para revisar · ${counts.unseen} sem avaliação`;bar.max=points.length;bar.value=counts.known;bar.setAttribute('aria-label',`${pieces[key].name}: marcações avaliadas como já sei`);card.append(h,p,bar,link(counts.known===points.length?'Treinar novamente →':'Treinar esta peça →',pieceLink(key)));if(matching.length){
   shown+=matching.length;const details=document.createElement('details'),summary=document.createElement('summary'),list=document.createElement('ul');summary.textContent=`Conferir ${matching.length} nomes e marcações`;details.open=!!query||pendingOnly;
   for(const point of matching){const item=document.createElement('li'),badge=document.createElement('span'),status=practiceStatus(records,key,point.id);badge.textContent=status==='known'?'Já sei':status==='review'?'Revisar':'Sem avaliação';badge.className='point-status '+(status||'unseen');item.append(link(point.name,pieceLink(key,point.id)),badge);list.append(item);}
   details.append(summary,list);card.append(details);$('practice-grid').append(card);
  }
  for(const point of points)if(practiceStatus(records,key,point.id)==='review')$('weak-links').append(link(`${point.name} · ${pieces[key].name}`,pieceLink(key,point.id)));
 }
 $('filter-count').textContent=`${shown} marcações encontradas`; $('filter-empty').hidden=shown>0;
 $('overview-status').textContent=`${known} de ${total} marcações: já sei · ${review} para revisar · ${total-known-review} sem avaliação`;$('overview-bar').max=total;$('overview-bar').value=known;$('weak-empty').hidden=review>0;
 const next=rows.find(r=>r.counts.review>0)||rows.find(r=>r.counts.unseen>0)||rows[0];$('continue-review').href=pieceLink(next.key);$('continue-review').textContent=`${known===total?'Treinar novamente':'Continuar revisão'}: ${pieces[next.key].name} →`;
}
for(const t of topics.filter(t=>t.exam==='practical'))$('practical-topics').append(link(t.name,'provas.html#'+new URLSearchParams({prova:'practical',assunto:t.id})));
$('structure-search').addEventListener('input',render);$('pending-only').addEventListener('change',render);
window.addEventListener('pageshow',render);window.addEventListener('storage',event=>{if(event.key===practiceKey||event.key===null)render();});render();

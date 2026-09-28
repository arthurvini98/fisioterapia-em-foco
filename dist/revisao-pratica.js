import {pieces,pieceLink} from './piece-data.js';
import {practiceCatalog} from './practice-catalog.js';
import {readPractice,practiceCounts,practiceStatus,practiceKey} from './piece-practice.js';
import {topics} from './exam-data.js';
const $=id=>document.getElementById(id);let storage;try{storage=window.localStorage;}catch{}
function link(text,url){const a=document.createElement('a');a.textContent=text;a.href=url;return a;}
function render(){
 const records=readPractice(storage);let known=0,review=0,total=0;const rows=[];$('practice-grid').replaceChildren();$('weak-links').replaceChildren();
 for(const [key,points] of Object.entries(practiceCatalog)){
  const counts=practiceCounts(records,key,points);known+=counts.known;review+=counts.review;total+=points.length;rows.push({key,counts});
  const card=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p'),bar=document.createElement('progress');h.textContent=pieces[key].name;p.textContent=`${counts.known}/${points.length} já sei · ${counts.review} para revisar · ${counts.unseen} sem avaliação`;bar.max=points.length;bar.value=counts.known;bar.setAttribute('aria-label',`${pieces[key].name}: marcações avaliadas como já sei`);card.append(h,p,bar,link(counts.known===points.length?'Treinar novamente →':'Treinar esta peça →',pieceLink(key)));$('practice-grid').append(card);
  for(const point of points)if(practiceStatus(records,key,point.id)==='review')$('weak-links').append(link(`${point.name} · ${pieces[key].name}`,pieceLink(key,point.id)));
 }
 $('overview-status').textContent=`${known} de ${total} marcações: já sei · ${review} para revisar · ${total-known-review} sem avaliação`;$('overview-bar').max=total;$('overview-bar').value=known;$('weak-empty').hidden=review>0;
 const next=rows.find(r=>r.counts.review>0)||rows.find(r=>r.counts.unseen>0)||rows[0];$('continue-review').href=pieceLink(next.key);$('continue-review').textContent=`${known===total?'Treinar novamente':'Continuar revisão'}: ${pieces[next.key].name} →`;
}
for(const t of topics.filter(t=>t.exam==='practical'))$('practical-topics').append(link(t.name,'provas.html#'+new URLSearchParams({prova:'practical',assunto:t.id})));
window.addEventListener('pageshow',render);window.addEventListener('storage',event=>{if(event.key===practiceKey||event.key===null)render();});render();

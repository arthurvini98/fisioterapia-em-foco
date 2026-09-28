export const practiceKey='anatomy-piece-practice-v1';
export function readPractice(storage){try{const value=JSON.parse(storage.getItem(practiceKey)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}}
export function pointKey(piece,id){return JSON.stringify([piece,id]);}
export function practiceStatus(records,piece,id){const status=records[pointKey(piece,id)];return status==='known'||status==='review'?status:null;}
export function practiceCounts(records,piece,points){const counts={known:0,review:0,unseen:0};for(const p of points)counts[practiceStatus(records,piece,p.id)||'unseen']++;return counts;}
export function pickPracticePoint(records,piece,points,current,random=Math.random){
 const pending=points.filter(p=>practiceStatus(records,piece,p.id)!=='known');let pool=pending.length?pending:points;
 if(pool.length>1)pool=pool.filter(p=>p.id!==current);
 const review=pool.filter(p=>practiceStatus(records,piece,p.id)==='review');if(review.length)pool=review;
 return pool.length?pool[Math.min(pool.length-1,Math.floor(random()*pool.length))]:null;
}
export function markPractice(records,storage,piece,id,status){if(!['known','review'].includes(status))throw Error('Status inválido');records[pointKey(piece,id)]=status;try{storage.setItem(practiceKey,JSON.stringify(records));return true;}catch{return false;}}

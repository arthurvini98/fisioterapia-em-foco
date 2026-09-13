const aliases={Patella:['rótula'],Femur:['osso da coxa'],Humerus:['osso do braço'],Tibia:['canela'],Calcaneus:['calcanhar']};
const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[ºª]/g,'').replace(/\bdireit[oa]s?\b/g,'direit').replace(/\besquerd[oa]s?\b/g,'esquerd').replace(/[^a-z0-9]+/g,' ').trim();
export function matchesStructure(record,query,groupName=''){
 const words=normalize(query).split(/\s+/).filter(Boolean);
 const haystack=normalize([record.name,record.base||'',record.id,groupName,...aliases[record.base]||[]].join(' '));
 return words.every(word=>haystack.includes(word));
}
export function matchesSide(record,side){return side==='all'||(side==='center'?!record.side:record.side===side);}
export function oppositeStructure(record,records){
 if(!record?.side)return null;
 const suffix=record.kind==='muscle'?':':'.',other=record.side==='r'?'l':'r';
 const id=record.id.slice(0,-1)+other;
 return record.id.endsWith(suffix+record.side)&&records.has(id)?id:null;
}

export function structureLink(base,id){const url=new URL(base);url.search='';url.hash=new URLSearchParams({estrutura:id}).toString();return url.href;}
export function linkedStructure(hash,records){const id=new URLSearchParams(hash.replace(/^#/,'' )).get('estrutura');return id&&records.has(id)?id:null;}

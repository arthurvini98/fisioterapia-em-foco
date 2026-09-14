export function stageIndex(hash,saved,stages){
 const key=hash.startsWith('#etapa=')?hash.slice(7):'';
 const linked=stages.findIndex(stage=>stage.kind===key);
 if(linked>=0)return linked;
 const previous=stages.findIndex(stage=>stage.kind===saved);
 return previous>=0?previous:0;
}
export function stageLink(href,kind){const url=new URL(href);url.hash='etapa='+kind;return url.href;}

export function parseStudy(text,ids){
 if(text.length>250000)throw Error('Arquivo grande demais.');
 const data=JSON.parse(text),valid=new Set(ids);
 if(data?.format!=='embryology-study'||data.version!==1||!Array.isArray(data.completedStages)||!Array.isArray(data.reviews)||data.reviews.length>500||!data.completedStages.every(id=>valid.has(id))||!data.reviews.every(e=>e&&valid.has(e.stage)&&typeof e.name==='string'&&e.name.length>0&&e.name.length<200&&typeof e.correct==='boolean'))throw Error('Arquivo de embriologia inválido.');
 return {completedStages:[...new Set(data.completedStages)],reviews:data.reviews.map(({stage,name,correct})=>({stage,name,correct}))};
}
export function mergeStudy(done,events,incoming){
 const existingStages=new Set(events.map(e=>e.stage));
 return {done:[...new Set([...done,...incoming.completedStages])],events:[...incoming.reviews.filter(e=>!existingStages.has(e.stage)),...events].slice(-500)};
}

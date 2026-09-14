export class ChallengeHistory{
 constructor(storage){this.storage=storage;this.events=[];this.saved=true;try{const data=JSON.parse(storage?.getItem('embryology-review')||'[]');if(Array.isArray(data))this.events=data.filter(e=>e&&typeof e.stage==='string'&&typeof e.name==='string'&&typeof e.correct==='boolean').slice(-500);}catch{this.saved=false;}}
 record(stage,name,correct){this.events.push({stage,name,correct});this.events=this.events.slice(-500);try{if(!this.storage)throw Error();this.storage.setItem('embryology-review',JSON.stringify(this.events));this.saved=true;}catch{this.saved=false;}}
 summary(stage){const events=this.events.filter(e=>e.stage===stage);return {total:events.length,correct:events.filter(e=>e.correct).length};}
 mistakes(stage){const latest=new Map();for(const e of this.events)if(e.stage===stage)latest.set(e.name,e.correct);return [...latest].filter(([,correct])=>!correct).map(([name])=>name);}
}

export class LessonCompletion{
 constructor(storage,ids){this.storage=storage;this.ids=new Set(ids);this.done=new Set();this.saved=true;try{const data=JSON.parse(storage?.getItem('embryology-completed')||'[]');if(Array.isArray(data))this.done=new Set(data.filter(id=>this.ids.has(id)));}catch{this.saved=false;}}
 toggle(id){if(!this.ids.has(id))return;if(this.done.has(id))this.done.delete(id);else this.done.add(id);try{if(!this.storage)throw Error();this.storage.setItem('embryology-completed',JSON.stringify([...this.done]));this.saved=true;}catch{this.saved=false;}}
 export(currentStage,reviews){return {format:'embryology-study',version:1,exportedAt:new Date().toISOString(),currentStage,completedStages:[...this.done],reviews:reviews.map(event=>({...event}))};}
}

export class ProgressStore {
 constructor(onChange=()=>{}){this.onChange=onChange;this.data={lesson:{currentStep:0,completedSteps:[]},reviews:[]};this.status='loading';this.error='';this.pending=[];this.running=null;this.loaded=false;}
 emit(){this.onChange(this);}
 async load(){
  try{const r=await fetch('/api/progress',{cache:'no-store'});if(!r.ok)throw new Error('Não foi possível carregar seu progresso.');this.data=await r.json();this.loaded=true;this.status=this.pending.length?'pending':'saved';this.error='';this.emit();return true;}
  catch(e){this.status='error';this.error=e.message;this.emit();return false;}
 }
 async enqueue(data){this.pending.push(data);this.status="saving";this.emit();return this.flush();}
 async flush(){
  if(this.running)return this.running;
  this.running=(async()=>{
   if(!this.loaded&&!(await this.load()))return false;
   this.status='saving';this.error='';this.emit();
   try{
    while(this.pending.length){const item=this.pending[0];const r=await fetch('/api/progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)});if(!r.ok)throw new Error('Não foi possível salvar. Mantenha a página aberta e tente novamente.');this.pending.shift();}
    if(!(await this.load()))return false;
    while(this.pending.length){const item=this.pending[0];const r=await fetch("/api/progress",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(item)});if(!r.ok)throw new Error("Não foi possível salvar. Tente novamente.");this.pending.shift();if(!this.pending.length&&!(await this.load()))return false;}
    return true;
   }catch(e){this.status='error';this.error=e.message;this.emit();return false;}
  })();
  try{return await this.running;}finally{this.running=null;}
 }
 async retry(){if(!this.loaded&&!(await this.load()))return false;return this.pending.length?this.flush():this.load();}
 recordReview(question){
  if(question.savedEvent)return;
  question.savedEvent=true;question.eventId=question.eventId||crypto.randomUUID();
  return this.enqueue({type:'review',eventId:question.eventId,structureId:question.id,correct:!question.hadError});
 }
 saveLesson(currentStep,completedSteps,lessonId='ombro-inicial'){return this.enqueue({type:'lesson',lessonId,currentStep,completedSteps});}
 lesson(id){return this.data.lessons?.[id]||(id==='ombro-inicial'?this.data.lesson:{currentStep:0,completedSteps:[]});}
 get mistakes(){return this.data.reviews.filter(r=>Number(r.last_correct)===0).map(r=>r.structure_id);}
}

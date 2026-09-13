export class ReviewSession {
  constructor(ids, random = Math.random, limit = Infinity) {
    this.queue = [...new Set(ids)].map(id => ({ id, retry: false }));
    for (let i=this.queue.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[this.queue[i],this.queue[j]]=[this.queue[j],this.queue[i]];}
    if(Number.isInteger(limit)&&limit>0)this.queue=this.queue.slice(0,limit);
    this.initialCount=this.queue.length;this.initialCompleted=0;this.initialFirstTry=0;this.difficultIds=new Set();
    this.completed=0;this.firstTry=0;this.mistakes=0;this.current=null;
  }
  next() {
    if(this.current&&!this.current.done)return this.current;
    const item=this.queue.shift();
    this.current=item?{...item,done:false,hadError:false}:null;
    return this.current;
  }
  answer(id) {
    if(!this.current||this.current.done)return null;
    if(id!==this.current.id){
      if(!this.current.hadError)this.mistakes++;
      this.current.hadError=true;return false;
    }
    this.finish();return true;
  }
  reveal() {
    if(!this.current||this.current.done)return;
    if(!this.current.hadError)this.mistakes++;
    this.current.hadError=true;this.finish();
  }
  finish() {
    this.current.done=true;this.completed++;
    if(!this.current.retry){this.initialCompleted++;if(!this.current.hadError)this.initialFirstTry++;}
    if(this.current.hadError)this.difficultIds.add(this.current.id);
    if(!this.current.hadError)this.firstTry++;
    else this.queue.splice(Math.min(3,this.queue.length),0,{id:this.current.id,retry:true});
  }
  get retries(){return this.queue.filter(item=>item.retry).length;}
}

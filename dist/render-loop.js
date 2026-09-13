export class FrameScheduler {
 constructor(render,schedule=callback=>requestAnimationFrame(callback)){
  this.render=render;
  this.schedule=schedule;
  this.pending=false;
 }
 request(){
  if(this.pending)return;
  this.pending=true;
  this.schedule(()=>{
   this.pending=false;
   if(this.render())this.request();
  });
 }
}

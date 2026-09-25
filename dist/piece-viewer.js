import * as T from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {FrameScheduler} from './render-loop.js';
import {focusFrame} from './focus.js';
import {directions} from './piece-data.js';
export class PieceViewer{
 constructor(host,pinLayer,onSelect,onOrbit){
  this.host=host;this.pinLayer=pinLayer;this.onSelect=onSelect;this.meshes=new Map();this.pins=new Map();this.selected=null;this.showPins=true;this.isolated=false;this.direction='front';this.raycaster=new T.Raycaster();
  this.scene=new T.Scene();this.scene.background=new T.Color(0x142f3b);this.camera=new T.PerspectiveCamera(38,1,.001,20);
  this.renderer=new T.WebGLRenderer({antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));host.prepend(this.renderer.domElement);this.renderer.domElement.tabIndex=0;this.renderer.domElement.setAttribute('aria-label','Peça anatômica 3D. Arraste para girar e role para ampliar. Use os botões de vista e a lista para selecionar pontos pelo teclado.');
  this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.zoomToCursor=true;this.controls.minDistance=.02;this.controls.maxDistance=3;
  this.loop=new FrameScheduler(()=>{const moving=this.controls.update();this.renderer.render(this.scene,this.camera);this.placePins();return moving;});this.controls.addEventListener('change',()=>this.loop.request());this.controls.addEventListener('start',onOrbit);
  this.scene.add(new T.HemisphereLight(0xe8f5ff,0x59616b,1.8));const light=new T.DirectionalLight(0xfff0d5,3.5);light.position.set(-2,3,4);this.scene.add(light);const fill=new T.DirectionalLight(0x9ccde2,1.8);fill.position.set(2,1,-3);this.scene.add(fill);
  this.observer=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.frame();});this.observer.observe(host);
  this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.dispatchEvent(new CustomEvent('piece-graphics-lost'));});
 }
 display(data){
  for(const m of this.meshes.values()){m.geometry.dispose();m.material.dispose();this.scene.remove(m);}this.meshes.clear();this.pinLayer.replaceChildren();this.pins.clear();this.data=data;this.selected=null;
  for(const [name,bone] of Object.entries(data.bones)){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(bone.vertices.flat(),3));g.setIndex(bone.triangles.flat());g.computeVertexNormals();g.computeBoundingSphere();const m=new T.Mesh(g,new T.MeshStandardMaterial({color:0xece3cb,roughness:.7,side:T.DoubleSide}));this.meshes.set(name,m);this.scene.add(m);}
  data.points.forEach((point,i)=>{const b=document.createElement('button');b.className='pin';b.textContent=i+1;b.setAttribute('aria-label',`Ponto ${i+1}: ${point.name}`);b.onclick=()=>this.onSelect(point.id);this.pinLayer.append(b);this.pins.set(point.id,b);});this.direction='front';this.paint();this.frame();
 }
 paint(){for(const[name,m]of this.meshes){const chosen=!this.selected||name===this.selected.bone;m.visible=!this.isolated||chosen;m.material.color.setHex(this.selected&&chosen?0xf2d89e:0xece3cb);m.material.transparent=!chosen;m.material.opacity=chosen?1:.25;m.material.depthWrite=chosen;}for(const[id,b]of this.pins)b.setAttribute('aria-pressed',String(id===this.selected?.id));this.loop.request();}
 select(id){this.selected=this.data.points.find(p=>p.id===id)||null;this.paint();this.frame(this.selected?.view||'front',true);}
 frame(direction=this.direction,focus=false){
  this.direction=direction;if(!this.data)return;this.camera.up.set(0,1,0);if(direction==='top')this.camera.up.set(0,0,-1);if(direction==='bottom')this.camera.up.set(0,0,1);
  let box=new T.Box3();for(const m of this.meshes.values())if(m.visible)box.expandByObject(m);if(box.isEmpty())return;
  const forward=new T.Vector3(...directions[direction]);
  if(focus&&this.selected){const boneBox=new T.Box3().setFromObject(this.meshes.get(this.selected.bone)),size=boneBox.getSize(new T.Vector3()),radius=Math.max(size.x,size.y,size.z)*.5;box=new T.Box3().setFromCenterAndSize(new T.Vector3(...this.selected.position),new T.Vector3(radius,radius,radius));}
  const frame=focusFrame(box,this.camera,forward,1.25);this.controls.target.copy(frame.center);this.camera.position.copy(frame.position);this.controls.update();this.loop.request();
 }
 labels(hidden){for(const p of this.data?.points||[]){const b=this.pins.get(p.id);b.setAttribute('aria-label',hidden?`Ponto ${b.textContent}`:`Ponto ${b.textContent}: ${p.name}`);}}
 placePins(){
  if(!this.data)return;this.camera.updateMatrixWorld();const visible=[...this.meshes.values()].filter(m=>m.visible&&m.material.opacity>.5);
  for(const p of this.data.points){const button=this.pins.get(p.id),world=new T.Vector3(...p.position),projected=world.clone().project(this.camera),mesh=this.meshes.get(p.bone);let hidden=!this.showPins||!mesh.visible||projected.z<-1||projected.z>1||Math.abs(projected.x)>1||Math.abs(projected.y)>1;
   if(!hidden){const delta=world.clone().sub(this.camera.position),distance=delta.length();this.raycaster.set(this.camera.position,delta.normalize());this.raycaster.far=distance-.001;hidden=this.raycaster.intersectObjects(visible,false).length>0;}
   button.hidden=hidden;if(!hidden){button.style.left=`${(projected.x*.5+.5)*this.host.clientWidth}px`;button.style.top=`${(-projected.y*.5+.5)*this.host.clientHeight}px`;}
  }
 }
 dispose(){this.observer.disconnect();this.controls.dispose();for(const m of this.meshes.values()){m.geometry.dispose();m.material.dispose();}this.renderer.dispose();this.renderer.domElement.remove();this.pinLayer.replaceChildren();}
}

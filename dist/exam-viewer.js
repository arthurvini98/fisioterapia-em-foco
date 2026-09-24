import * as T from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {FrameScheduler} from './render-loop.js';
import {focusFrame} from './focus.js';
import {contextNames} from './exam-data.js';
export class ExamViewer{
 constructor(host){
  this.host=host;this.scene=new T.Scene();this.scene.background=new T.Color(0x142f3b);this.camera=new T.PerspectiveCamera(38,1,.001,50);
  this.renderer=new T.WebGLRenderer({antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));host.append(this.renderer.domElement);
  this.renderer.domElement.tabIndex=0;this.renderer.domElement.setAttribute('aria-label','Modelo 3D. Arraste para girar; use a roda para aproximar. Use os botões de vista para se orientar.');
  this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.zoomToCursor=true;this.controls.minDistance=.025;this.controls.maxDistance=8;
  this.loop=new FrameScheduler(()=>{const moving=this.controls.update();this.renderer.render(this.scene,this.camera);return moving;});
  this.controls.addEventListener('change',()=>this.loop.request());
  this.scene.add(new T.HemisphereLight(0xffffff,0x617f91,2.6));const light=new T.DirectionalLight(0xfff0d7,3);light.position.set(-2,3,4);this.scene.add(light);const back=new T.DirectionalLight(0xaedbff,2);back.position.set(2,1,-3);this.scene.add(back);
  this.meshes=new Map();this.isolated=false;this.direction='front';
  this.observer=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.frame();});this.observer.observe(host);
  this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.dispatchEvent(new CustomEvent('viewer-error'));});
 }
 async load(){
  const get=async(url,method)=>{const r=await fetch(url);if(!r.ok)throw Error(`${url}: HTTP ${r.status}`);return r[method]();};
  [this.manifest,this.buffer]=await Promise.all([get('skeleton.json','json'),get('skeleton.bin','arrayBuffer')]);
 }
 show(card){
  this.card=card;const names=contextNames(card,this.manifest);for(const mesh of this.meshes.values())mesh.visible=false;
  for(const name of names){
   let mesh=this.meshes.get(name);
   if(!mesh){const item=this.manifest.meshes.find(m=>m.name===name);if(!item)throw Error('Estrutura não disponível: '+name);
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(this.buffer,item.positionOffset,item.vertexCount*3),3));geometry.setIndex(new T.BufferAttribute(new Uint32Array(this.buffer,item.indexOffset,item.indexCount),1));geometry.computeVertexNormals();
    mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({roughness:.65,side:T.DoubleSide}));this.meshes.set(name,mesh);this.scene.add(mesh);
   }
   const selected=name===card.bone;mesh.visible=!this.isolated||selected;mesh.material.color.setHex(selected?0xffce66:0xcbd9dc);mesh.material.transparent=!selected;mesh.material.opacity=selected?1:.22;mesh.material.depthWrite=selected;
  }
  this.direction='front';this.frame();
 }
 frame(direction=this.direction){
  this.direction=direction;if(!this.card)return;
  const box=new T.Box3();for(const mesh of this.meshes.values())if(mesh.visible)box.expandByObject(mesh);if(box.isEmpty())return;
  this.camera.up.set(0,1,0);if(direction==='top')this.camera.up.set(0,0,-1);
  const vectors={front:[0,0,1],back:[0,0,-1],side:[1,0,0],top:[0,1,0]};const f=focusFrame(box,this.camera,new T.Vector3(...vectors[direction]),1.3);this.camera.position.copy(f.position);this.controls.target.copy(f.center);this.controls.update();this.loop.request();
 }
 dispose(){this.observer.disconnect();this.controls.dispose();for(const mesh of this.meshes.values()){mesh.geometry.dispose();mesh.material.dispose();}this.renderer.dispose();this.renderer.domElement.remove();}
}

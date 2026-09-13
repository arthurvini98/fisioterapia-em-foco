import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {focusFrame,lessonRegionBounds} from '../dist/focus.js';
import {lessons,lessonOrder} from '../dist/lesson-data.js';
const boxes=new Map(),groups=new Map();
for(const file of ['skeleton','shoulder']){
 const bytes=fs.readFileSync(`dist/${file}.bin`),buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
 const manifest=JSON.parse(fs.readFileSync(`dist/${file}.json`));
 for(const m of manifest.meshes){
  const b=new THREE.Box3().setFromBufferAttribute(new THREE.BufferAttribute(new Float32Array(buffer,m.positionOffset,m.vertexCount*3),3)),id=m.id||m.name;
  if(!boxes.has(id))boxes.set(id,new THREE.Box3());boxes.get(id).union(b);
  if(file==='skeleton'){if(!groups.has(m.topic))groups.set(m.topic,new THREE.Box3());groups.get(m.topic).union(b);}
 }
}
groups.get('skull').union(groups.get('mandible'));
const bounds=id=>(id.startsWith('group:')?groups.get(id.slice(6)):boxes.get(id)).clone();
let frames=0,activities=0;
for(const lesson of Object.values(lessons))for(const step of lesson.steps){
 const box=step.focus?bounds(step.focus):lessonRegionBounds(step,bounds);
 assert.ok(!box.isEmpty(),lesson.id+' '+step.title);
 if(step.target){activities++;assert.ok(box.intersectsBox(bounds(step.target)),step.target+' outside question region');}
 for(const aspect of [.45,1,1.8]){
  const camera=new THREE.PerspectiveCamera(38,aspect,.005,50);const frame=focusFrame(box,camera,new THREE.Vector3(0,0,1));
  assert.ok(frame.position.z>frame.center.z);assert.ok(frame.position.distanceTo(frame.center)<=8);
  camera.position.copy(frame.position);camera.lookAt(frame.center);camera.updateMatrixWorld();
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new THREE.Vector3(x,y,z).project(camera);assert.ok(Math.abs(p.x)<=1.001&&Math.abs(p.y)<=1.001&&Math.abs(p.z)<=1.001);}
  frames++;
 }
}
const html=fs.readFileSync('dist/index.html','utf8'),app=fs.readFileSync('dist/app.js','utf8'),ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size);for(const [,id]of app.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(id),id);
console.log(`PASS: ${lessonOrder.length} lessons, ${activities} activities, ${frames} frontal frames including narrow screens, all UI bindings`);

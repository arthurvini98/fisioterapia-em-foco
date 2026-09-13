import assert from 'node:assert/strict';
import fs from 'node:fs';
import {lessonNavigation,lessonPracticeIds,learnedStructureIds} from '../dist/study.js';
import {lessons} from '../dist/lesson-data.js';
import {boneRecord} from '../dist/catalog.js';
import {ReviewSession} from '../dist/review.js';
import * as THREE from '../dist/vendor/three.module.js';
import {landmarkRegionBounds,focusFrame} from '../dist/focus.js';
let nav=lessonNavigation({currentStep:0,completedSteps:[]},10);assert.deepEqual(nav.steps.filter(s=>s.available).map(s=>s.index),[0]);
nav=lessonNavigation({currentStep:1,completedSteps:[0,1,2,3]},10);assert.equal(nav.firstPending,4);assert.deepEqual(nav.steps.filter(s=>s.available).map(s=>s.index),[0,1,2,3,4]);
nav=lessonNavigation({currentStep:9,completedSteps:[0,2,9]},10);assert.equal(nav.firstPending,1);assert.equal(nav.steps[8].available,false);
assert.equal(lessonNavigation({currentStep:0,completedSteps:[0,1]},2).firstPending,null);
const manifest=JSON.parse(fs.readFileSync('dist/skeleton.json')),shoulder=JSON.parse(fs.readFileSync('dist/shoulder.json'));
const records=new Map(manifest.meshes.map(m=>[m.name,boneRecord(m)]));for(const m of shoulder.meshes)records.set(m.id,{quizEligible:true});
const saved={};const read=id=>saved[id]||{currentStep:0,completedSteps:[]};
assert.deepEqual(learnedStructureIds(lessons,read,records),[]);
saved['ombro-inicial']={currentStep:2,completedSteps:[0,1]};
assert.deepEqual(learnedStructureIds(lessons,read,records),['Scapula.r']);
saved['joelho-inicial']={currentStep:2,completedSteps:[0,1]};
let learned=learnedStructureIds(lessons,read,records);assert.ok(learned.includes('Femur.r'));assert.ok(!learned.includes('Patella.r'));
saved['quadril-inicial']={currentStep:7,completedSteps:[5,6]};
learned=learnedStructureIds(lessons,read,records);assert.equal(learned.filter(id=>id==='Femur.r').length,1);
const snapshot=JSON.stringify(saved);learnedStructureIds(lessons,read,records);assert.equal(JSON.stringify(saved),snapshot);
let total=0;
for(const lesson of Object.values(lessons)){
 const ids=lessonPracticeIds(lesson,records);assert.ok(ids.length>0);assert.equal(new Set(ids).size,ids.length);
 assert.ok(ids.every(id=>records.get(id).quizEligible&&!id.startsWith('group:')));total+=ids.length;
 const session=new ReviewSession(ids,()=>0);let question=session.next();assert.equal(session.answer('wrong'),false);session.reveal();assert.equal(session.retries,1);
 let rounds=0;while((question=session.next())){assert.equal(session.answer(question.id),true);assert.ok(++rounds<100);}
 assert.equal(session.completed,ids.length+1);assert.equal(session.mistakes,1);assert.equal(session.retries,0);
}
const shoulderIds=lessonPracticeIds(lessons['ombro-inicial'],records);assert.ok(shoulderIds.includes('Scapula.r')&&shoulderIds.includes('muscle:deltoid:r'));
const bytes=fs.readFileSync('dist/skeleton.bin'),buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),anchors=JSON.parse(fs.readFileSync('dist/landmarks.json')).bones;
for(const [id,points] of Object.entries(anchors)){
 const m=manifest.meshes.find(m=>m.name===id),box=new THREE.Box3().setFromBufferAttribute(new THREE.BufferAttribute(new Float32Array(buffer,m.positionOffset,m.vertexCount*3),3));
 for(const point of points){const local=landmarkRegionBounds(point.position,box),center=local.getCenter(new THREE.Vector3());assert.ok(center.distanceTo(new THREE.Vector3().fromArray(point.position))<1e-10);assert.ok(local.getSize(new THREE.Vector3()).y<box.getSize(new THREE.Vector3()).y/2);
  for(const aspect of [.45,1,1.8]){const camera=new THREE.PerspectiveCamera(38,aspect,.005,50),frame=focusFrame(local,camera,new THREE.Vector3(0,0,1));assert.ok(frame.position.z>frame.center.z);camera.position.copy(frame.position);camera.lookAt(frame.center);camera.updateMatrixWorld();const p=center.clone().project(camera);assert.ok(Math.abs(p.x)<1e-8&&Math.abs(p.y)<1e-8);}
 }
}
console.log(`PASS: learned structures, deduplication, unlocked step navigation, missing-step detection, ${total} lesson review structures, retries and 12 landmark close-ups`);

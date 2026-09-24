import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import * as T from '../dist/vendor/three.module.js';
import {cards,topics,cardPool,shuffle,loadProgress} from '../dist/exam-data.js';
import {contextNames} from '../dist/exam-data.js';
import {focusFrame} from '../dist/focus.js';
const manifest=JSON.parse(fs.readFileSync('dist/skeleton.json')),ids=new Set(manifest.meshes.map(m=>m.name));
assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);
for(const c of cards){assert.ok(topics.some(t=>t.id===c.topic));assert.ok(c.answer&&c.prompt);if(c.bone)assert.ok(ids.has(c.bone),c.bone);if(c.visual)assert.ok(c.bone);}
assert.equal(topics.filter(t=>t.exam==='practical').length,7);
assert.equal(cardPool('practical','hand').filter(c=>c.visual).length,13);
assert.equal(cardPool('practical','foot').filter(c=>c.visual).length,12);
assert.equal(cardPool('practical','sternum').length,3);
assert.ok(cardPool('theory').every(c=>!c.visual));
const c=cards[0],state={[c.id]:false};assert.deepEqual(cardPool('practical','all',true,state),[c]);state[c.id]=true;assert.equal(cardPool('practical','all',true,state).length,0);
assert.deepEqual(loadProgress({getItem:()=>JSON.stringify({[c.id]:false,fake:true,[cards[1].id]:'true'})}),{[c.id]:false});
assert.deepEqual(loadProgress({getItem:()=>'{oops'}),{});assert.deepEqual(loadProgress(null),{});
assert.deepEqual(new Set(shuffle(cards,()=>.5)),new Set(cards));
// Use the published binary, preserving an unrelated local binary modification.
const bytes=execFileSync('git',['show','HEAD:dist/skeleton.bin'],{maxBuffer:20*1024*1024}),buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
for(const card of cards.filter(c=>c.bone)){
 const names=contextNames(card,manifest);assert.ok(names.includes(card.bone));const box=new T.Box3();
 for(const name of names){const m=manifest.meshes.find(m=>m.name===name);box.union(new T.Box3().setFromBufferAttribute(new T.BufferAttribute(new Float32Array(buffer,m.positionOffset,m.vertexCount*3),3)));}
 for(const aspect of [.7,1.8])for(const direction of [[0,0,1],[0,0,-1],[1,0,0],[0,1,0]]){const camera=new T.PerspectiveCamera(38,aspect,.001,50);if(direction[1])camera.up.set(0,0,-1);const frame=focusFrame(box,camera,new T.Vector3(...direction),1.3);camera.position.copy(frame.position);camera.lookAt(frame.center);camera.updateMatrixWorld();for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new T.Vector3(x,y,z).project(camera);assert.ok(Math.abs(p.x)<=1.001&&Math.abs(p.y)<=1.001);}}
}
const html=fs.readFileSync('dist/provas.html','utf8'),js=fs.readFileSync('dist/provas.js','utf8'),bindings=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(bindings).size,bindings.length);for(const[,id]of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(bindings.includes(id),id);
console.log(`PASS: ${cards.length} cards, ${cards.filter(c=>c.visual).length} visual targets, persisted review filters, all model IDs and camera views, UI bindings`);

import assert from 'node:assert/strict';import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {pieces,pieceRoute,pieceLink,directions} from '../dist/piece-data.js';
import {focusFrame} from '../dist/focus.js';
let count=0,anatomical=0;
for(const key of Object.keys(pieces).filter(k=>!k.endsWith('-real'))){
 const data=JSON.parse(fs.readFileSync(`dist/pecas/${key}.json`));assert.equal(new Set(data.points.map(p=>p.id)).size,data.points.length);
 for(const[name,bone]of Object.entries(data.bones)){assert.ok(bone.vertices.length);for(const p of bone.vertices)assert.ok(p.length===3&&p.every(Number.isFinite));for(const tri of bone.triangles)assert.ok(tri.length===3&&tri.every(i=>Number.isInteger(i)&&i>=0&&i<bone.vertices.length));}
 for(const p of data.points){count++;assert.ok(p.name&&!p.name.endsWith('.r'));assert.ok(data.bones[p.bone]);assert.ok(directions[p.view]);assert.deepEqual(pieceRoute('#'+pieceLink(key,p.id).split('#')[1]),{piece:key,point:p.id});const box=new T.Box3().setFromPoints(data.bones[p.bone].vertices.map(v=>new T.Vector3(...v)));
  assert.ok(box.clone().expandByScalar(.002).containsPoint(new T.Vector3(...p.position)),`${p.id}: outside bone`);
  if(p.kind==='landmark'){anatomical++;assert.ok(p.source.endsWith('.j'));assert.ok(p.surfaceDistance<.001||['Vertebral foramen','Obturator foramen'].includes(p.id));}
  for(const aspect of [.65,1.6])for(const [view,vector]of Object.entries(directions)){const camera=new T.PerspectiveCamera(38,aspect,.001,20);if(view==='top')camera.up.set(0,0,-1);if(view==='bottom')camera.up.set(0,0,1);const frame=focusFrame(box,camera,new T.Vector3(...vector),1.25);camera.position.copy(frame.position);camera.lookAt(frame.center);camera.updateMatrixWorld();for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const projected=new T.Vector3(x,y,z).project(camera);assert.ok(Math.abs(projected.x)<=1.001&&Math.abs(projected.y)<=1.001&&Math.abs(projected.z)<=1.001);}}
 }
}
assert.equal(count,64);assert.equal(anatomical,36);assert.equal(pieceRoute('#peca=__proto__').piece,'quadril-real');
const html=fs.readFileSync('dist/pecas.html','utf8'),js=fs.readFileSync('dist/pecas.js','utf8'),ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);for(const[,id]of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(id),id);
console.log('PASS: 64 points (36 original anatomical annotations), valid geometry, surface proximity, all six camera views and direct links');

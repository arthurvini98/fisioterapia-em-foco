import assert from 'node:assert/strict';
import {buildModel} from '../dist/embryology-models.js';
import {applyMotion} from '../dist/embryology-motion.js';
for(const kind of ['cell','meiosis1','meiosis2','route','approach','fusion','activation','zygote']){
 const model=buildModel(kind);applyMotion(model,kind,0);const start=model.root.children.map(m=>m.position.toArray());
 applyMotion(model,kind,1);applyMotion(model,kind,0);assert.deepEqual(model.root.children.map(m=>m.position.toArray()),start);
 for(let t=0;t<=1;t+=.1){applyMotion(model,kind,t);assert.ok(model.root.children.every(m=>[...m.position.toArray(),...m.scale.toArray()].every(Number.isFinite)));}
}
console.log('PASS: repeatable seeking and finite animated transforms across all stages');

import assert from 'node:assert/strict';
import {stages} from '../dist/embryology-data.js';
import {buildModel} from '../dist/embryology-models.js';
assert.equal(stages.length,8);
for(const stage of stages)for(const cut of [true,false]){
 const model=buildModel(stage.kind,cut);assert.ok(model.parts.size>1);
 model.root.traverse(o=>{if(!o.geometry)return;const a=o.geometry.attributes.position.array;assert.ok([...a].every(Number.isFinite));assert.ok(o.userData.label);o.geometry.dispose();o.material.dispose();});
}
console.log('PASS: eight stages, open/closed models, finite geometry and selectable structures');

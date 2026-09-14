import assert from 'node:assert/strict';
import {buildModel} from '../dist/embryology-models.js';
import {applyMotion,motionCaption} from '../dist/embryology-motion.js';
for(const kind of ['meiosis1','meiosis2']){
 const model=buildModel(kind),moving=model.root.children.filter(m=>m.userData.segregation);
 assert.equal(moving.length,8);
 applyMotion(model,kind,0);assert.ok(moving.every(m=>m.position.x===0));
 applyMotion(model,kind,1);
 for(const mesh of moving)assert.equal(Math.sign(mesh.position.x),mesh.userData.segregation.side);
 if(kind==='meiosis1')for(const meshes of model.parts.values())if(meshes.length===2)assert.equal(meshes[0].position.x,meshes[1].position.x);
 applyMotion(model,kind,0);assert.ok(moving.every(m=>m.position.x===0));
 assert.notEqual(motionCaption(kind,0),motionCaption(kind,.5));
}
console.log('PASS: homologs retain paired chromatids, sisters segregate oppositely, reversible timeline');

import assert from 'node:assert/strict';
import {modelAtMoment,disposeModel} from '../dist/embryology-view.js';
for(const kind of ['meiosis1','meiosis2','approach','zygote']){
 const open=modelAtMoment(kind,true,.6),closed=modelAtMoment(kind,false,.6);
 assert.deepEqual(open.root.children.map(mesh=>mesh.position.toArray()),closed.root.children.map(mesh=>mesh.position.toArray()));
 assert.equal(open.root.rotation.y,closed.root.rotation.y);disposeModel(open);disposeModel(closed);
}
const isolated=modelAtMoment('approach',false,.4,'Zona pelúcida',true);
assert.ok(isolated.parts.get('Zona pelúcida').every(mesh=>mesh.visible&&mesh.material.opacity===.94));
assert.ok(isolated.parts.get('Corona radiata').every(mesh=>!mesh.visible));disposeModel(isolated);
console.log('PASS: cut changes retain animation pose, rotation, selection and isolation');

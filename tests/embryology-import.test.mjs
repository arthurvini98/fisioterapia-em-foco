import assert from 'node:assert/strict';
import {parseStudy,mergeStudy} from '../dist/embryology-import.js';
const data={format:'embryology-study',version:1,completedStages:['cell'],reviews:[{stage:'cell',name:'Núcleo',correct:false}]};
const parsed=parseStudy(JSON.stringify(data),['cell','fusion']);
assert.throws(()=>parseStudy('{}',['cell']));assert.throws(()=>parseStudy(JSON.stringify({...data,version:2}),['cell']));
const first=mergeStudy([],[],parsed);assert.equal(first.events.length,1);assert.deepEqual(mergeStudy(first.done,first.events,parsed),first);
const local=[{stage:'cell',name:'Núcleo',correct:true}];assert.deepEqual(mergeStudy([],local,parsed).events,local);
console.log('PASS: format validation, restore, repeated import and existing answers preserved');

import assert from 'node:assert/strict';
import {LessonCompletion} from '../dist/embryology-completion.js';
let value='["cell","invalid","cell"]';const storage={getItem:()=>value,setItem:(_,v)=>{value=v;}};
const state=new LessonCompletion(storage,['cell','fusion']);assert.deepEqual([...state.done],['cell']);
state.toggle('fusion');assert.equal(new LessonCompletion(storage,['cell','fusion']).done.size,2);
state.toggle('cell');state.toggle('invalid');assert.deepEqual([...state.done],['fusion']);
const events=[{stage:'fusion',name:'Zona',correct:true}],out=state.export('fusion',events);assert.equal(out.version,1);out.reviews[0].correct=false;assert.equal(events[0].correct,true);
const blocked=new LessonCompletion(null,['cell']);blocked.toggle('cell');assert.equal(blocked.saved,false);assert.equal(blocked.done.size,1);
console.log('PASS: completion persistence, undo, invalid IDs, isolated export and blocked storage');

const path=new LessonCompletion(null,["cell","meiosis1","meiosis2"]);
assert.equal(path.nextPending("cell"),"meiosis1");
path.toggle("meiosis1");assert.equal(path.nextPending("cell"),"meiosis2");
path.toggle("meiosis2");assert.equal(path.nextPending("meiosis2"),"cell");
assert.equal(path.nextPending("cell"),"cell");
path.toggle("cell");assert.equal(path.nextPending("meiosis2"),null);
path.toggle("meiosis1");assert.equal(path.nextPending("meiosis2"),"meiosis1");
console.log("PASS: next pending stage, wraparound, completion and undo");

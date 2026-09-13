import assert from 'node:assert/strict';
import {ReviewSession} from '../dist/review.js';
const ids=Array.from({length:30},(_,i)=>'bone:'+i);
for(const limit of [5,10,20,Infinity]){
 const r=new ReviewSession([...ids,ids[0]],()=>.5,limit);assert.equal(r.initialCount,Math.min(30,limit));assert.equal(new Set(r.queue.map(q=>q.id)).size,r.initialCount);
 let q;while(q=r.next())r.answer(q.id);
 assert.equal(r.initialFirstTry,r.initialCount);assert.equal(r.initialCompleted,r.initialCount);assert.equal(r.completed,r.initialCount);assert.equal(r.difficultIds.size,0);
}
const r=new ReviewSession(['a','b'],()=>0,5);assert.equal(r.initialCount,2);
const first=r.next().id;r.answer('wrong');r.answer('wrong');r.answer(first);assert.equal(r.initialFirstTry,0);assert.equal(r.initialCompleted,1);assert.equal(r.mistakes,1);
const second=r.next().id;r.answer(second);assert.equal(r.initialFirstTry,1);
assert.equal(r.next().id,first);r.reveal();assert.equal(r.initialCompleted,2);assert.equal(r.initialFirstTry,1);
assert.equal(r.next().id,first);r.answer(first);assert.equal(r.next(),null);assert.equal(r.completed,4);assert.equal(r.firstTry,2);assert.equal(r.initialFirstTry,1);assert.deepEqual([...r.difficultIds],[first]);
const empty=new ReviewSession([],()=>0,10);assert.equal(empty.next(),null);assert.equal(empty.initialCount,0);
console.log('PASS: 5/10/20/all limits, smaller pools, deduplication, repeated errors, reveal/retry and initial score unaffected by retries');

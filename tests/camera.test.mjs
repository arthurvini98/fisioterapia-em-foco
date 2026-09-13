import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {adjustedOrbit} from '../dist/focus.js';
const target=new THREE.Vector3(.1,-.3,.2),position=target.clone().add(new THREE.Vector3(0,0,2));
const zoom=adjustedOrbit(position,target,{scale:.82});assert.ok(Math.abs(zoom.distanceTo(target)-1.64)<1e-10);
assert.ok(adjustedOrbit(zoom,target,{scale:1/.82}).distanceTo(position)<1e-10);
const rotate=adjustedOrbit(position,target,{theta:.15});assert.ok(Math.abs(rotate.distanceTo(target)-2)<1e-10);assert.ok(rotate.x>position.x);
const back=adjustedOrbit(rotate,target,{theta:-.15});assert.ok(back.distanceTo(position)<1e-10);
assert.ok(Math.abs(adjustedOrbit(position,target,{scale:.0001}).distanceTo(target)-.06)<1e-10);
assert.ok(Math.abs(adjustedOrbit(position,target,{scale:100}).distanceTo(target)-8)<1e-10);
for(const phi of [-100,100]){const p=adjustedOrbit(position,target,{phi}),s=new THREE.Spherical().setFromVector3(p.sub(target));assert.ok(s.phi>0&&s.phi<Math.PI);}
assert.deepEqual(target.toArray(),[.1,-.3,.2]);assert.deepEqual(position.toArray(),[.1,-.3,2.2]);
console.log('PASS: reversible zoom and orbit, fixed target, distance limits and pole protection');

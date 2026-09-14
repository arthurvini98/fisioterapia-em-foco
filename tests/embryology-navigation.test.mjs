import assert from 'node:assert/strict';
import {stageIndex,stageLink} from '../dist/embryology-navigation.js';
import {stages} from '../dist/embryology-data.js';
assert.equal(stageIndex('#etapa=fusion','cell',stages),5);
assert.equal(stageIndex('','fusion',stages),5);
assert.equal(stageIndex('#etapa=unknown','invalid',stages),0);
assert.equal(stageIndex('',null,stages),0);
assert.equal(stageLink('https://example.org/embriologia.html#old','zygote'),'https://example.org/embriologia.html#etapa=zygote');
console.log('PASS: direct links, saved stage, invalid values and canonical links');

import assert from 'node:assert/strict';
import {structureGuide} from '../dist/embryology-guide.js';
for(const label of ['Zona pelúcida','Corona radiata','Núcleo','Acrossomo','Homólogo A · par 1','Cromátide-irmã A · célula 1 · exemplo 1']){
 const guide=structureGuide(label);assert.ok(guide.what&&guide.role&&guide.observe);assert.ok(guide.source.startsWith('https://openstax.org/'));
}
assert.equal(structureGuide('unrecognized'),null);
console.log('PASS: guide content, dynamic chromosome labels and unknown structures');

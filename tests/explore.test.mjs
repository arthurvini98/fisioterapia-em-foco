import assert from 'node:assert/strict';
import fs from 'node:fs';
import {boneRecord,muscleInfo} from '../dist/catalog.js';
import {matchesStructure,matchesSide,oppositeStructure,structureLink,linkedStructure} from '../dist/explore.js';
const bones=JSON.parse(fs.readFileSync('dist/skeleton.json')).meshes.map(boneRecord),records=new Map(bones.map(r=>[r.id,r]));
for(const m of JSON.parse(fs.readFileSync('dist/shoulder.json')).meshes)records.set(m.id,{id:m.id,name:muscleInfo[m.muscle].name,kind:'muscle',side:m.side});
assert.ok(matchesStructure(records.get('Patella.l'),'rótula esquerda'));
assert.ok(!matchesStructure(records.get('Patella.r'),'rotula esquerda'));
assert.ok(matchesStructure(records.get('Femur.r'),'direita femur'));
assert.ok(matchesStructure(records.get('Femur.r'),'osso da coxa'));
assert.ok(matchesStructure(records.get('Calcaneus.l'),'calcanhar'));
assert.ok(matchesStructure(records.get('First metacarpal bone.r'),'1 metacarpal'));
assert.ok(matchesStructure(records.get('Atlas (C1)'),'C1'));
assert.ok(matchesStructure(records.get('Vertebra L5'),'coluna','Coluna vertebral'));
assert.ok(!matchesStructure(records.get('Femur.r'),'inexistente'));
let pairs=0;
for(const r of records.values()){
 assert.ok(matchesStructure(r,r.name));assert.ok(matchesStructure(r,''));assert.ok(matchesSide(r,'all'));
 assert.equal(matchesSide(r,'center'),!r.side);
 if(r.side){const id=oppositeStructure(r,records);assert.ok(id,r.id);assert.equal(oppositeStructure(records.get(id),records),r.id);assert.notEqual(records.get(id).side,r.side);pairs++;}
 else assert.equal(oppositeStructure(r,records),null);
}
for(const id of records.keys()){const url=structureLink('https://anatomia.test/?temporary=discard#old',id);const parsed=new URL(url);assert.equal(parsed.origin,'https://anatomia.test');assert.equal(parsed.search,'');assert.equal(linkedStructure(parsed.hash,records),id);}
assert.equal(linkedStructure('#estrutura=unknown',records),null);assert.equal(linkedStructure('#estrutura=%3Cscript%3E',records),null);assert.equal(linkedStructure('#credits',records),null);
console.log(`PASS: structure links, aliases, accents, word order, ordinal search, side filters and ${pairs} reciprocal side links`);

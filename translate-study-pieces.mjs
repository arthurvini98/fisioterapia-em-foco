import fs from 'node:fs';
import {boneRecord} from './dist/catalog.js';
const manifest=JSON.parse(fs.readFileSync('dist/skeleton.json'));
for(const key of ['mao','pe','esterno']){const path=`dist/pecas/${key}.json`,data=JSON.parse(fs.readFileSync(path));for(const p of data.points)p.name=boneRecord(manifest.meshes.find(m=>m.name===p.bone)).name;fs.writeFileSync(path,JSON.stringify(data));}

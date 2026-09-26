import assert from 'node:assert/strict';import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {decodeScan,loadPieceData} from '../dist/scan-geometry.js';
import {pieces,directions,pieceLink,pieceRoute} from '../dist/piece-data.js';
const array=b=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);
let points=0;
for(const key of ['l5-real','quadril-real']){
 const data=await loadPieceData(key,async path=>{const buf=fs.readFileSync('dist/'+path);return {ok:true,json:async()=>JSON.parse(buf),arrayBuffer:async()=>array(buf)};});
 const bone=data.bones[data.bone];assert.equal(bone.index.length/3,data.triangleCount);assert.ok(data.triangleCount>=99990);assert.ok(bone.occlusion.index.length<16000);assert.ok(pieces[key]);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(bone.position,3));g.setIndex(new T.BufferAttribute(bone.index,1));g.computeBoundingBox();const mesh=new T.Mesh(g,new T.MeshBasicMaterial({side:T.DoubleSide}));
 for(const p of data.points){points++;assert.equal(p.bone,data.bone);assert.ok(p.note&&p.name);assert.ok(g.boundingBox.clone().expandByScalar(.001).containsPoint(new T.Vector3(...p.position)));assert.deepEqual(pieceRoute('#'+pieceLink(key,p.id).split('#')[1]),{piece:key,point:p.id});
  const direction=new T.Vector3(...(data.viewDirections[p.view]||directions[p.view]));const point=new T.Vector3(...p.position),ray=new T.Raycaster(point.clone().addScaledVector(direction,1),direction.clone().negate());const hits=ray.intersectObject(mesh);
  if(p.anchor==='surface'){assert.ok(hits.length,p.id);assert.ok(hits[0].point.distanceTo(point)<.0001,p.id+' not on visible surface');}
  else assert.ok(!hits.length,p.id+' should point through the opening');
 }
 const buffer=array(fs.readFileSync(`dist/pecas/${key}.bin`));assert.throws(()=>decodeScan(buffer.slice(0,-2)),/incompleto/);const broken=buffer.slice(0);new DataView(broken).setUint32(0,0,true);assert.throws(()=>decodeScan(broken),/Formato/);
}
assert.equal(points,21);
await assert.rejects(()=>loadPieceData('../x'));
await assert.rejects(()=>loadPieceData('l5-real',async()=>({ok:true,json:async()=>({geometry:'other.bin'})})),/Arquivo/);
await assert.rejects(()=>loadPieceData('l5-real',async()=>({ok:false,status:404})),/404/);
console.log('PASS: two real scans, 21 registered points, surface/opening rays, bounded geometry, corrupt-file and HTTP handling');

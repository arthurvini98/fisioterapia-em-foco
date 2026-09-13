import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../server/index.mjs';
const dataDir=mkdtempSync(join(tmpdir(),'anatomia-public-'));
const config={dataDir,publicOrigin:'https://anatomia.test'};
let server,base;
async function start(){server=createApp(config);await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;}
async function stop(){await new Promise(r=>server.close(r));}
const call=(path,init={})=>fetch(base+path,init);
try{
 await start();
 assert.equal((await call('/healthz')).status,200);
 const first=await call('/');assert.equal(first.status,200);assert.ok((await first.text()).includes('SISTEMA'));
 const cookie=first.headers.get('set-cookie').split(';')[0];assert.match(cookie,/^__Host-anatomia=[A-Za-z0-9_-]{43}$/);assert.match(first.headers.get('set-cookie'),/Secure; HttpOnly; SameSite=Lax/);
 assert.equal((await call('/skeleton.bin',{method:'HEAD'})).status,200);
 for(const p of ['/server/index.js','/.openai/hosting.json','/%2e%2e%2fpackage.json','/package.json'])assert.equal((await call(p)).status,404,p);
 const note='/api/notes?structure=Scapula.r';
 const save=(body,version,headers={})=>call(note,{method:'PUT',headers:{'Content-Type':'application/json',Origin:config.publicOrigin,Cookie:cookie,...headers},body:JSON.stringify({body,version})});
 assert.equal((await save('my note',0)).status,200);
 assert.equal((await save('forged',1,{Origin:'https://other.test'})).status,403);
 assert.equal((await save('stale',0)).status,409);
 const forged=await call(note,{headers:{Cookie:'__Host-anatomia=not-a-valid-token','oai-authenticated-user-id':'attacker'}});
 assert.deepEqual(await forged.json(),{body:'',version:0});assert.ok(forged.headers.get('set-cookie'));
 const another=await call(note);assert.deepEqual(await another.json(),{body:'',version:0});
 assert.deepEqual(await (await call(note,{headers:{Cookie:cookie}})).json(),{body:'my note',version:1});
 const progress='/api/progress';
 assert.equal((await call(progress,{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json',Origin:config.publicOrigin},body:JSON.stringify({type:'lesson',lessonId:'ombro-inicial',currentStep:1,completedSteps:[0]})})).status,200);
 assert.equal((await (await call(progress)).json()).lessons['ombro-inicial'].currentStep,0);
 await stop();await start();
 assert.deepEqual(await (await call(note,{headers:{Cookie:cookie}})).json(),{body:'my note',version:1});
 assert.equal((await (await call(progress,{headers:{Cookie:cookie}})).json()).lessons['ombro-inicial'].currentStep,1);
 console.log('PASS: public HTTP, anonymous browser isolation, persistence, CSRF, assets and protected files');
}finally{if(server?.listening)await stop();rmSync(dataDir,{recursive:true,force:true});}

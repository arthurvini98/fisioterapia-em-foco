import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../server/index.mjs';
const dataDir=mkdtempSync(join(tmpdir(),'anatomia-test-'));
const config={username:'student',password:'test-only-password-long',dataDir,publicOrigin:'https://anatomia.test'};
const authorization='Basic '+Buffer.from(config.username+':'+config.password).toString('base64');
let server,base;
async function start(){server=createApp(config);await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;}
async function stop(){await new Promise(r=>server.close(r));}
const call=(path,init={})=>fetch(base+path,{...init,headers:{authorization,...init.headers}});
try{
 assert.throws(()=>createApp({...config,password:''}));
 await start();
 assert.equal((await fetch(base+'/healthz')).status,200);
 assert.equal((await fetch(base+'/')).status,401);
 assert.equal((await call('/',{headers:{authorization:'Basic bad'}})).status,401);
 assert.equal((await call('/')).status,200);
 assert.equal((await call('/skeleton.bin',{method:'HEAD'})).status,200);
 for(const p of ['/server/index.js','/.openai/hosting.json','/%2e%2e%2fpackage.json','/package.json'])assert.equal((await call(p)).status,404,p);
 const note='/api/notes?structure=Scapula.r';
 const save=(body,version,headers={})=>call(note,{method:'PUT',headers:{'Content-Type':'application/json',Origin:config.publicOrigin,...headers},body:JSON.stringify({body,version})});
 assert.equal((await save('remember',0)).status,200);
 assert.equal((await save('forged',1,{Origin:'https://other.test'})).status,403);
 assert.equal((await save('stale',0)).status,409);
 assert.equal((await call(note,{headers:{'oai-authenticated-user-id':'attacker'}})).status,200);
 assert.deepEqual(await (await call(note,{headers:{'oai-authenticated-user-id':'attacker'}})).json(),{body:'remember',version:1});
 assert.equal((await call('/api/progress',{method:'POST',headers:{'Content-Type':'application/json',Origin:config.publicOrigin},body:JSON.stringify({type:'lesson',lessonId:'ombro-inicial',currentStep:1,completedSteps:[0]})})).status,200);
 await stop();await start();
 assert.deepEqual(await (await call(note)).json(),{body:'remember',version:1});
 assert.equal((await (await call('/api/progress')).json()).lessons['ombro-inicial'].currentStep,1);
 console.log('PASS: Railway HTTP auth, assets, protected files, trusted identity, CSRF, notes/progress and persistence across restart');
}finally{if(server?.listening)await stop();rmSync(dataDir,{recursive:true,force:true});}

import http from 'node:http';
import {createHash,timingSafeEqual} from 'node:crypto';
import {readFileSync,statSync,createReadStream} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {openDatabase} from './database.mjs';
import {handleNotes} from '../worker/notes.js';
import {handleProgress} from '../worker/progress.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const digest=value=>createHash('sha256').update(value).digest();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.bin':'application/octet-stream','.txt':'text/plain; charset=utf-8'};
export function createApp({username,password,dataDir,publicOrigin,userId='personal-owner'}){
 if(!username||username.includes(':')||!password||password.length<16)throw new Error('Configure APP_USERNAME and APP_PASSWORD (at least 16 characters).');
 const origin=new URL(publicOrigin).origin;
 const DB=openDatabase(resolve(dataDir,'anatomia.sqlite'),resolve(root,'drizzle'));
 const assets=resolve(root,'dist');
 const ids=new Set([...JSON.parse(readFileSync(resolve(assets,'skeleton.json'))).meshes.map(m=>m.name),...JSON.parse(readFileSync(resolve(assets,'shoulder.json'))).meshes.map(m=>m.id)]);
 const expected=digest(username+':'+password);
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');
  const end=(status,text)=>{res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8'});res.end(text);};
  try{
   const url=new URL(req.url,origin);
   if(url.pathname==='/healthz'&&req.method==='GET')return end(200,'ok');
   const auth=req.headers.authorization||'';
   if(!auth.startsWith('Basic ')||!timingSafeEqual(expected,digest(Buffer.from(auth.slice(6),'base64').toString('utf8')))){
    res.setHeader('WWW-Authenticate','Basic realm="Anatomia em Foco", charset="UTF-8"');return end(401,'Entre com seu usuário e senha.');
   }
   if(url.pathname.startsWith('/api/')){
    if(!['/api/notes','/api/progress'].includes(url.pathname))return end(404,'Não encontrado');
    const chunks=[];let size=0;
    for await(const chunk of req){size+=chunk.length;if(size>32768){end(413,'Texto grande demais.');return;}chunks.push(chunk);}
    const headers=new Headers();
    for(const key of ['content-type','origin','sec-fetch-site'])if(req.headers[key])headers.set(key,req.headers[key]);
    // Only the authenticated server chooses identity; never trust a client-supplied Sites header.
    headers.set('oai-authenticated-user-id',userId);
    const request=new Request(origin+url.pathname+url.search,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
    const result=await (url.pathname==='/api/notes'?handleNotes:handleProgress)(request,{DB},ids);
    res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));return;
   }
   if(!['GET','HEAD'].includes(req.method))return end(405,'Método não permitido');
   let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{return end(400,'Endereço inválido');}
   if(pathname.split('/').some(p=>p.startsWith('.')||p==='server'))return end(404,'Não encontrado');
   const path=resolve(assets,'.'+(pathname==='/'?'/index.html':pathname));
   if(!path.startsWith(assets+sep))return end(404,'Não encontrado');
   let stat;try{stat=statSync(path);}catch{return end(404,'Não encontrado');}
   if(!stat.isFile())return end(404,'Não encontrado');
   res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Content-Length':stat.size});
   if(req.method==='HEAD')res.end();else createReadStream(path).on('error',()=>res.destroy()).pipe(res);
  }catch(error){console.error('Request failed:',error.name);if(!res.headersSent)end(500,'Não foi possível concluir. Tente novamente.');else res.destroy();}
 });
 server.requestTimeout=30000;
 server.on('close',()=>DB.close());
 return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dataDir=process.env.DATA_DIR||process.env.RAILWAY_VOLUME_MOUNT_PATH||'./data';
 if(process.env.RAILWAY_ENVIRONMENT_ID&&!process.env.RAILWAY_VOLUME_MOUNT_PATH)throw new Error('Attach a persistent Railway volume at /data before deploying.');
 const publicOrigin=process.env.APP_ORIGIN||(process.env.RAILWAY_PUBLIC_DOMAIN?'https://'+process.env.RAILWAY_PUBLIC_DOMAIN:null);
 if(process.env.RAILWAY_ENVIRONMENT_ID&&!publicOrigin)throw new Error('Generate a public domain and set APP_ORIGIN to its HTTPS URL.');
 if(process.env.RAILWAY_ENVIRONMENT_ID&&resolve(dataDir)!==resolve(process.env.RAILWAY_VOLUME_MOUNT_PATH))throw new Error('DATA_DIR must match the persistent volume mount path.');
 const app=createApp({username:process.env.APP_USERNAME,password:process.env.APP_PASSWORD,dataDir,publicOrigin:publicOrigin||'http://localhost:3000',userId:process.env.APP_USER_ID||'personal-owner'});
 app.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Anatomia em Foco ready'));
 for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{app.close(()=>process.exit(0));setTimeout(()=>process.exit(1),10000).unref();});
}

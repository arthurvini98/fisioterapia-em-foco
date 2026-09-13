import { handleNotes } from './notes.js';
import { handleProgress } from './progress.js';
export function createWorker(assets,validIds){return {async fetch(request,env){
 const path=new URL(request.url).pathname;
 if(path==='/api/notes'){try{return await handleNotes(request,env,validIds);}catch{return Response.json({error:'Não foi possível acessar a anotação.'},{status:503,headers:{'Cache-Control':'no-store'}});}}
 if(path==='/api/progress'){
  try{return await handleProgress(request,env,validIds);}catch(error){console.error('Progress unavailable',error.message);return Response.json({error:'Não foi possível acessar o progresso. Tente novamente.'},{status:503,headers:{'Cache-Control':'no-store'}});}
 }
 if(!['GET','HEAD'].includes(request.method))return new Response('Método não permitido',{status:405});
 const asset=assets[path==='/'?'/index.html':path];if(!asset)return new Response('Não encontrado',{status:404});
 const headers={'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'};
 if(request.method==='HEAD')return new Response(null,{headers});
 const decoded=Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0));return new Response(decoded,{headers});
}};}

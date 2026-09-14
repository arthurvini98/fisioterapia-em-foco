import { progressDB } from './progress.js';
const noteJSON=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function handleNotes(request,env,validIds){
 const user=request.headers.get('oai-authenticated-user-id');if(!user)return noteJSON({error:'Entre na sua conta.'},401);
 const url=new URL(request.url),id=url.searchParams.get('structure');
 if(request.method==='GET'&&url.searchParams.get('export')==='1'){
  const rows=await progressDB(env).prepare('SELECT structure_id,body,version,updated_at FROM structure_notes WHERE user_id=? ORDER BY structure_id').bind(user).all();
  return noteJSON({notes:(rows.results||[]).filter(note=>validIds.has(note.structure_id)&&note.body)});
 }
 if(!validIds.has(id))return noteJSON({error:'Estrutura inválida.'},400);
 const db=progressDB(env);
 const read=async()=>await db.prepare('SELECT body,version FROM structure_notes WHERE user_id=? AND structure_id=?').bind(user,id).first()||{body:'',version:0};
 if(request.method==='GET')return noteJSON(await read());
 if(request.method!=='PUT')return noteJSON({error:'Método inválido.'},405);
 const origin=request.headers.get('Origin');if((origin&&origin!==url.origin)||request.headers.get('Sec-Fetch-Site')==='cross-site')return noteJSON({error:'Origem inválida.'},403);
 if(!request.headers.get('Content-Type')?.includes('application/json'))return noteJSON({error:'Formato inválido.'},415);
 const raw=await request.text();if(raw.length>30000)return noteJSON({error:'Texto grande demais.'},413);
 let data;try{data=JSON.parse(raw);}catch{return noteJSON({error:'Dados inválidos.'},400);}
 if(!data||typeof data.body!=='string'||data.body.length>4000||!Number.isSafeInteger(data.version)||data.version<0||data.version>=Number.MAX_SAFE_INTEGER)return noteJSON({error:'Anotação inválida.'},400);
 const result=await db.prepare(`INSERT INTO structure_notes (user_id,structure_id,body,version,updated_at) VALUES (?,?,?,?,?)
 ON CONFLICT(user_id,structure_id) DO UPDATE SET body=excluded.body,version=excluded.version,updated_at=excluded.updated_at WHERE structure_notes.version=excluded.version-1`).bind(user,id,data.body,data.version+1,Date.now()).run();
 if(!result.meta?.changes)return noteJSON({error:'Esta anotação foi alterada em outra aba.',note:await read()},409);
 return noteJSON({body:data.body,version:data.version+1});
}

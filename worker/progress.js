import { lessonId, lessons } from '../dist/lesson-data.js';
export function progressDB(env){if(!env.DB)throw new Error('Progress database unavailable');return env.DB;}
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function handleProgress(request,env,validIds){
 const userId=request.headers.get('oai-authenticated-user-id');
 if(!userId)return json({error:'Entre na sua conta para salvar seu progresso.'},401);
 const db=progressDB(env);
 if(request.method==='GET'){
  const rows=await db.prepare('SELECT lesson_id,current_step,completed_steps FROM lesson_progress WHERE user_id = ? ORDER BY updated_at DESC, rowid DESC').bind(userId).all();
  const savedLessons=Object.fromEntries(Object.keys(lessons).map(id=>[id,{currentStep:0,completedSteps:[]}]));
  for(const row of rows.results||[])if(Object.hasOwn(lessons,row.lesson_id))savedLessons[row.lesson_id]={currentStep:row.current_step,completedSteps:JSON.parse(row.completed_steps)};
  const result=await db.prepare(`SELECT structure_id, COUNT(*) AS attempts, SUM(correct) AS first_try,
   (SELECT r2.correct FROM review_events r2 WHERE r2.user_id = r.user_id AND r2.structure_id = r.structure_id ORDER BY r2.created_at DESC, r2.rowid DESC LIMIT 1) AS last_correct
   FROM review_events r WHERE user_id = ? GROUP BY structure_id`).bind(userId).all();
  const lastLessonId=(rows.results||[]).find(row=>Object.hasOwn(lessons,row.lesson_id))?.lesson_id||lessonId;
  return json({lastLessonId,lesson:savedLessons[lessonId],lessons:savedLessons,reviews:result.results||[]});
 }
 if(request.method!=='POST')return json({error:'Método inválido.'},405);
 const site=new URL(request.url),origin=request.headers.get('Origin');
 if((origin&&origin!==site.origin)||request.headers.get('Sec-Fetch-Site')==='cross-site')return json({error:'Origem inválida.'},403);
 if(!request.headers.get('Content-Type')?.includes('application/json'))return json({error:'Formato inválido.'},415);
 const raw=await request.text();if(raw.length>4096)return json({error:'Dados grandes demais.'},413);
 let data;try{data=JSON.parse(raw);}catch{return json({error:'Dados inválidos.'},400);}
 if(!data||typeof data!=='object'||Array.isArray(data))return json({error:'Dados inválidos.'},400);
 if(data.type==='lesson'){
  const {currentStep,completedSteps}=data;
  const chosenId=data.lessonId??lessonId;
  if(typeof chosenId!=='string'||!Object.hasOwn(lessons,chosenId))return json({error:'Aula inválida.'},400);
  const lessonSteps=lessons[chosenId].steps;
  if(!Number.isInteger(currentStep)||currentStep<0||currentStep>=lessonSteps.length||!Array.isArray(completedSteps)||completedSteps.length>lessonSteps.length||!completedSteps.every(x=>Number.isInteger(x)&&x>=0&&x<lessonSteps.length))return json({error:'Etapa inválida.'},400);
  await db.prepare(`INSERT INTO lesson_progress (user_id,lesson_id,current_step,completed_steps,updated_at) VALUES (?,?,?,?,?)
   ON CONFLICT(user_id,lesson_id) DO UPDATE SET current_step=excluded.current_step,
   completed_steps=(SELECT json_group_array(value) FROM (SELECT value FROM json_each(lesson_progress.completed_steps) UNION SELECT value FROM json_each(excluded.completed_steps))), updated_at=excluded.updated_at`).bind(userId,chosenId,currentStep,JSON.stringify([...new Set(completedSteps)]),Date.now()).run();
 }else if(data.type==='review'){
  if(typeof data.eventId!=='string'||!/^[a-zA-Z0-9-]{16,80}$/.test(data.eventId)||!validIds.has(data.structureId)||typeof data.correct!=='boolean')return json({error:'Resultado inválido.'},400);
  await db.prepare('INSERT INTO review_events (user_id,event_id,structure_id,correct,created_at) VALUES (?,?,?,?,?) ON CONFLICT(user_id,event_id) DO NOTHING').bind(userId,data.eventId,data.structureId,data.correct?1:0,Date.now()).run();
 }else return json({error:'Operação inválida.'},400);
 return json({saved:true});
}

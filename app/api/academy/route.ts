import { db, identity, sameOrigin, errorResponse } from '../../../lib/server';
import { hashPassword, generateSalt } from '../../../lib/auth-util';
import course from '../../../lib/course.json';
import flows from '../../../lib/flows.json';
import {visualSources} from '../../../lib/visuals/catalog';
import {quizzes,scenarios,Question} from '../../../lib/assessments';
export const dynamic='force-dynamic';
const lessonIDs=new Set(course.lessons.map(x=>x.id));const now=()=>new Date().toISOString();
async function questionBank(id:string){if(!quizzes[id])throw new Error('Avaliação inválida.');const {results}=await db().prepare('SELECT * FROM custom_questions WHERE quiz_id=?').bind(id).all();return [...quizzes[id].questions,...results.map((x:any)=>({id:x.id,question:x.question,options:JSON.parse(x.options),answer:x.answer,explanation:x.explanation,critical:!!x.critical}))] as Question[];}
function publicNode(s:any,node:string){const n=s.nodes[node];return {text:n.text,terminal:!!n.terminal,failed:!!n.failed,choices:(n.choices||[]).map((c:any,i:number)=>({id:i,label:c.label}))};}
async function ensureCoursesTable(){try{await db().prepare('CREATE TABLE IF NOT EXISTS custom_courses (id text PRIMARY KEY NOT NULL, title text NOT NULL, description text DEFAULT "" NOT NULL, hours integer DEFAULT 20 NOT NULL, category text DEFAULT "Hardware & Diagnóstico" NOT NULL, status text DEFAULT "published" NOT NULL, modules_json text DEFAULT "[]" NOT NULL, lessons_json text DEFAULT "[]" NOT NULL, created text NOT NULL, updated text NOT NULL)').run();}catch{}}

export async function GET(){try{const u=await identity();await ensureCoursesTable();const queries=[db().prepare('SELECT * FROM progress WHERE user_id=?').bind(u.userId),db().prepare('SELECT flow_id FROM favorites WHERE user_id=?').bind(u.userId),db().prepare('SELECT * FROM lesson_content'),db().prepare('SELECT id,quiz_id,score,passed,created FROM quiz_attempts WHERE user_id=? ORDER BY created DESC').bind(u.userId),db().prepare('SELECT * FROM practices WHERE user_id=? ORDER BY created DESC').bind(u.userId),db().prepare('SELECT id,scenario,status,score,created FROM simulations WHERE user_id=? ORDER BY created DESC').bind(u.userId),db().prepare('SELECT * FROM files ORDER BY created DESC'),db().prepare('SELECT lesson_id,step,completed,updated FROM journeys WHERE user_id=? ORDER BY updated DESC').bind(u.userId)];const r=await db().batch(queries);const overrides=r[2].results as any[];const lessons=course.lessons.map(l=>{const o=overrides.find(x=>x.lesson_id===l.id);return {...l,...(o?{body:o.body,ready:!!o.ready,video:o.video}:{video:''})};});const assessments=[];for(const [id,q]of Object.entries(quizzes)){const qs=await questionBank(id);assessments.push({id,title:q.title,questions:qs.map(({answer,explanation,...rest})=>rest)});}

let customCourses:any[]=[];
try{const ccRes=await db().prepare('SELECT * FROM custom_courses ORDER BY created ASC').all();customCourses=(ccRes?.results||[]).map((c:any)=>({id:c.id,title:c.title,description:c.description||'',hours:c.hours||20,category:c.category||'Hardware & Diagnóstico',status:c.status||'published',modules:JSON.parse(c.modules_json||'[]'),lessons:JSON.parse(c.lessons_json||'[]'),created:c.created,updated:c.updated,isDefault:false}));}catch{customCourses=[];}
const courses=[{id:'default-android',title:'Formação Especialista em Diagnóstico Android',description:'Da eletrônica básica ao raciocínio de bancada. 13 módulos completos e 100 fluxogramas de diagnóstico.',hours:180,category:'Hardware & Diagnóstico',status:'published',modules:course.modules,lessons,created:'2026-01-01T00:00:00Z',updated:now(),isDefault:true},...customCourses];

let admin:any=null;if(u.admin){
let usersQuery=`SELECT u.id, u.name, u.email, u.created, COALESCE(c.username, LOWER(REPLACE(SUBSTR(u.email, 1, INSTR(u.email || '@', '@') - 1), ' ', ''))) AS username, COALESCE(c.role, CASE WHEN o.user_id IS NOT NULL THEN 'admin' ELSE 'student' END) AS role, COALESCE(c.status, 'active') AS status, CASE WHEN c.password_hash IS NOT NULL AND LENGTH(c.password_hash) > 0 THEN 1 ELSE 0 END AS has_password, CASE WHEN o.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_owner, COUNT(p.lesson_id) AS studied FROM users u LEFT JOIN user_credentials c ON c.user_id = u.id LEFT JOIN owner o ON o.user_id = u.id AND o.id = 1 LEFT JOIN progress p ON p.user_id = u.id AND p.studied = 1 GROUP BY u.id ORDER BY u.created DESC`;
let usersResult: any;
try { usersResult = await db().prepare(usersQuery).all(); } catch { usersResult = await db().prepare('SELECT u.id, u.name, u.email, u.created, u.email AS username, "student" AS role, "active" AS status, 0 AS has_password, 0 AS is_owner, COUNT(p.lesson_id) AS studied FROM users u LEFT JOIN progress p ON p.user_id=u.id AND p.studied=1 GROUP BY u.id ORDER BY u.created DESC').all(); }
const a=await db().batch([db().prepare('SELECT p.*,u.name AS user_name FROM practices p JOIN users u ON p.user_id=u.id ORDER BY p.created DESC'),db().prepare('SELECT s.*,u.name AS user_name FROM simulations s JOIN users u ON s.user_id=u.id ORDER BY s.created DESC'),db().prepare('SELECT q.id,q.quiz_id,q.score,q.passed,q.created,u.name AS user_name FROM quiz_attempts q JOIN users u ON q.user_id=u.id ORDER BY q.created DESC')]);admin={users:usersResult.results,practices:a[0].results,simulations:a[1].results,attempts:a[2].results};}
return Response.json({courses,journeyHistory:r[7].results,visualSources,user:{name:u.displayName,email:u.email,admin:u.admin},modules:course.modules,lessons,flows,progress:r[0].results,favorites:r[1].results.map((x:any)=>x.flow_id),attempts:r[3].results,practices:r[4].results,simulationHistory:r[5].results,files:r[6].results,quizzes:assessments,scenarios:Object.entries(scenarios).map(([id,s])=>({id,title:s.title,category:s.category,description:s.description})),admin},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e)}}
export async function POST(request:Request){try{sameOrigin(request);const u=await identity();if(Number(request.headers.get('content-length')||0)>250000)throw new Error('Conteúdo muito grande.');const raw=await request.text();if(raw.length>250000)throw new Error('Conteúdo muito grande.');const b=JSON.parse(raw);const action=b.action;const id=typeof b.lessonId==='string'?b.lessonId:'';const requireLesson=()=>{if(!lessonIDs.has(id))throw new Error('Aula inválida.');};const admin=()=>{if(!u.admin)throw new Error('ADMIN');};
if(action==='course-create'){admin();await ensureCoursesTable();const title=String(b.title||'').trim();const description=String(b.description||'').trim();const hours=Number(b.hours)||20;const category=String(b.category||'Hardware & Diagnóstico').trim();const status=b.status==='draft'?'draft':'published';if(!title||title.length<3)throw new Error('O título do curso deve ter pelo menos 3 caracteres.');const courseId='crs_'+crypto.randomUUID().slice(0,8);const initialModules=[{id:'M01',title:'Módulo 1: Fundamentos e Introdução',hours:Math.round(hours/2)||10,description:'Introdução e conceitos essenciais do treinamento.'}];const initialLessons=[{id:`${courseId.toUpperCase().slice(0,4)}-01`,module:'M01',title:'Aula 01: Apresentação e Objetivos',body:'## Introdução ao Curso\n\nDescreva aqui os objetivos desta aula, recursos necessários e instruções práticas para os alunos.',ready:true,video:'',minutes:60,type:'Aula Prática'}];const stamp=now();await db().prepare('INSERT INTO custom_courses(id,title,description,hours,category,status,modules_json,lessons_json,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(courseId,title,description,hours,category,status,JSON.stringify(initialModules),JSON.stringify(initialLessons),stamp,stamp).run();return Response.json({ok:true,courseId});}
else if(action==='course-update'){admin();await ensureCoursesTable();const courseId=String(b.courseId||'').trim();const title=String(b.title||'').trim();const description=String(b.description||'').trim();const hours=Number(b.hours)||20;const category=String(b.category||'Hardware & Diagnóstico').trim();const status=b.status==='draft'?'draft':'published';if(!courseId)throw new Error('ID do curso não informado.');if(!title||title.length<3)throw new Error('O título do curso deve ter pelo menos 3 caracteres.');if(courseId!=='default-android'){await db().prepare('UPDATE custom_courses SET title=?,description=?,hours=?,category=?,status=?,updated=? WHERE id=?').bind(title,description,hours,category,status,now(),courseId).run();}return Response.json({ok:true});}
else if(action==='course-delete'){admin();const courseId=String(b.courseId||'').trim();if(!courseId)throw new Error('ID do curso não informado.');if(courseId==='default-android')throw new Error('O curso padrão de formação não pode ser excluído.');await db().prepare('DELETE FROM custom_courses WHERE id=?').bind(courseId).run();return Response.json({ok:true});}
else if(action==='course-lesson-add'){admin();const courseId=String(b.courseId||'').trim();const lessonTitle=String(b.title||'').trim();const moduleId=String(b.moduleId||'M01').trim();const minutes=Number(b.minutes)||60;if(!courseId||!lessonTitle)throw new Error('Informe o curso e o título da nova aula.');if(courseId==='default-android'){throw new Error('As aulas da formação padrão são integradas ao catálogo de fluxogramas.');}const row:any=await db().prepare('SELECT lessons_json,modules_json FROM custom_courses WHERE id=?').bind(courseId).first();if(!row)throw new Error('Curso não encontrado.');const currentLessons=JSON.parse(row.lessons_json||'[]');const currentModules=JSON.parse(row.modules_json||'[]');if(!currentModules.some((m:any)=>m.id===moduleId)){currentModules.push({id:moduleId,title:`Módulo ${moduleId}`,hours:10,description:''});}const newLessonId=`${courseId.toUpperCase().slice(0,4)}-${String(currentLessons.length+1).padStart(2,'0')}`;const newLesson={id:newLessonId,module:moduleId,title:lessonTitle,body:'## Conteúdo da Aula\n\nDescreva os objetivos, medições, teoria e atividades práticas desta aula.',ready:false,video:'',minutes,type:'Aula Prática'};currentLessons.push(newLesson);const stamp=now();await db().prepare('UPDATE custom_courses SET lessons_json=?,modules_json=?,updated=? WHERE id=?').bind(JSON.stringify(currentLessons),JSON.stringify(currentModules),stamp,courseId).run();return Response.json({ok:true,lesson:newLesson});}
else if(action==='course-lesson-save'){admin();const courseId=String(b.courseId||'').trim();const lessonId=String(b.lessonId||'').trim();const body=String(b.body||'');const video=String(b.video||'').trim();const ready=!!b.ready;const title=b.title?String(b.title).trim():'';if(!courseId||!lessonId)throw new Error('Identificação da aula incompleta.');if(video&&!video.startsWith('/api/files/')){const url=new URL(video);if(url.protocol!=='https:')throw new Error('Use endereço HTTPS para vídeo.');}if(courseId==='default-android'){if(body.length<100||body.length>150000)throw new Error('Conteúdo entre 100 e 150.000 caracteres.');await db().prepare('INSERT INTO lesson_content(lesson_id,body,ready,video,updated) VALUES(?,?,?,?,?) ON CONFLICT(lesson_id) DO UPDATE SET body=excluded.body,ready=excluded.ready,video=excluded.video,updated=excluded.updated').bind(lessonId,body,ready?1:0,video,now()).run();return Response.json({ok:true});}const row:any=await db().prepare('SELECT lessons_json FROM custom_courses WHERE id=?').bind(courseId).first();if(!row)throw new Error('Curso não encontrado.');const currentLessons=JSON.parse(row.lessons_json||'[]');const idx=currentLessons.findIndex((l:any)=>l.id===lessonId);if(idx===-1)throw new Error('Aula não encontrada neste curso.');currentLessons[idx]={...currentLessons[idx],...(title?{title}:{}),body,video,ready};const stamp=now();await db().prepare('UPDATE custom_courses SET lessons_json=?,updated=? WHERE id=?').bind(JSON.stringify(currentLessons),stamp,courseId).run();return Response.json({ok:true});}
else if(action==='course-lesson-delete'){admin();const courseId=String(b.courseId||'').trim();const lessonId=String(b.lessonId||'').trim();if(!courseId||!lessonId)throw new Error('Identificação da aula incompleta.');if(courseId==='default-android')throw new Error('Aulas do curso padrão não podem ser excluídas.');const row:any=await db().prepare('SELECT lessons_json FROM custom_courses WHERE id=?').bind(courseId).first();if(!row)throw new Error('Curso não encontrado.');const currentLessons=JSON.parse(row.lessons_json||'[]');if(currentLessons.length<=1)throw new Error('O curso deve conter ao menos uma aula.');const filtered=currentLessons.filter((l:any)=>l.id!==lessonId);await db().prepare('UPDATE custom_courses SET lessons_json=?,updated=? WHERE id=?').bind(JSON.stringify(filtered),now(),courseId).run();return Response.json({ok:true});}
else if(action==='progress'){requireLesson();const l=course.lessons.find(x=>x.id===id)!;const o:any=await db().prepare('SELECT ready FROM lesson_content WHERE lesson_id=?').bind(id).first();if(b.studied&&!(o?o.ready:l.ready))throw new Error('Aula completa ainda em preparação.');await db().prepare('INSERT INTO progress(user_id,lesson_id,studied,notes,updated) VALUES(?,?,?,?,?) ON CONFLICT(user_id,lesson_id) DO UPDATE SET studied=excluded.studied,notes=excluded.notes,updated=excluded.updated').bind(u.userId,id,b.studied?1:0,String(b.notes||'').slice(0,20000),now()).run();}
else if(action==='favorite'){if(!flows.some(x=>x.numero===b.flowId))throw new Error('Fluxograma inválido.');if(b.value)await db().prepare('INSERT OR IGNORE INTO favorites(user_id,flow_id) VALUES(?,?)').bind(u.userId,b.flowId).run();else await db().prepare('DELETE FROM favorites WHERE user_id=? AND flow_id=?').bind(u.userId,b.flowId).run();}
else if(action==='practice'){requireLesson();const report=String(b.report||'').trim();if(report.length<80||report.length>20000)throw new Error('O relatório deve ter entre 80 e 20.000 caracteres.');await db().prepare('INSERT INTO practices(id,user_id,lesson_id,report,status,feedback,created) VALUES(?,?,?,?,?,?,?)').bind(crypto.randomUUID(),u.userId,id,report,'pending','',now()).run();}
else if(action==='quiz'){const qs=await questionBank(b.quizId);if(!Array.isArray(b.answers)||b.answers.length!==qs.length||b.answers.some((x:any,i:number)=>!Number.isInteger(x)||x<0||x>=qs[i].options.length))throw new Error('Responda todas as questões.');const correct=qs.filter((q,i)=>q.answer===b.answers[i]).length;const score=Math.round(correct/qs.length*100);const critical=qs.some((q,i)=>q.critical&&q.answer!==b.answers[i]);const passed=score>=70&&!critical;await db().prepare('INSERT INTO quiz_attempts(id,user_id,quiz_id,answers,score,passed,created) VALUES(?,?,?,?,?,?,?)').bind(crypto.randomUUID(),u.userId,b.quizId,JSON.stringify(b.answers),score,passed?1:0,now()).run();return Response.json({ok:true,score,passed,critical,feedback:qs.map((q,i)=>({question:q.question,correct:q.answer===b.answers[i],answer:q.options[q.answer],explanation:q.explanation}))});}
else if(action==='simulation-start'){const s=scenarios[b.scenario];if(!s)throw new Error('Cenário inválido.');const runId=crypto.randomUUID();await db().prepare('INSERT INTO simulations(id,user_id,scenario,node,trace,status,score,justification,created) VALUES(?,?,?,?,?,?,?,?,?)').bind(runId,u.userId,b.scenario,s.initial,'[]','active',0,'',now()).run();return Response.json({ok:true,runId,scenario:b.scenario,node:publicNode(s,s.initial),score:0});}
else if(action==='simulation-choice'){const r:any=await db().prepare('SELECT * FROM simulations WHERE id=? AND user_id=?').bind(String(b.runId),u.userId).first();if(!r||r.status!=='active')throw new Error('Tentativa não está ativa.');const s=scenarios[r.scenario];const n=s.nodes[r.node];if(!Number.isInteger(b.choice)||!n.choices?.[b.choice])throw new Error('Ação inválida.');const c=n.choices[b.choice];const target=s.nodes[c.next];const trace=JSON.parse(r.trace);trace.push({node:r.node,choice:b.choice,label:c.label});const score=target.failed?0:r.score+c.points;const status=target.terminal?(target.failed?'failed':'awaiting_justification'):'active';const result=await db().prepare('UPDATE simulations SET node=?,trace=?,score=?,status=? WHERE id=? AND user_id=? AND node=? AND status=?').bind(c.next,JSON.stringify(trace),score,status,r.id,u.userId,r.node,r.status).run();if(!result.meta.changes)throw new Error('A tentativa mudou; inicie novamente.');return Response.json({ok:true,runId:r.id,scenario:r.scenario,node:publicNode(s,c.next),score,status});}
else if(action==='simulation-finish'){const justification=String(b.justification||'').trim();if(justification.length<40||justification.length>10000)throw new Error('Justifique com pelo menos 40 caracteres.');const r=await db().prepare('UPDATE simulations SET justification=?,status=? WHERE id=? AND user_id=? AND status=?').bind(justification,'pending_review',String(b.runId),u.userId,'awaiting_justification').run();if(!r.meta.changes)throw new Error('Tentativa não está pronta para justificativa.');}
else if(action==='lesson-save'){admin();requireLesson();const body=String(b.body||'');if(body.length<100||body.length>150000)throw new Error('Conteúdo entre 100 e 150.000 caracteres.');const video=String(b.video||'').trim();if(video&&!video.startsWith('/api/files/')){const url=new URL(video);if(url.protocol!=='https:')throw new Error('Use endereço HTTPS para vídeo.');}await db().prepare('INSERT INTO lesson_content(lesson_id,body,ready,video,updated) VALUES(?,?,?,?,?) ON CONFLICT(lesson_id) DO UPDATE SET body=excluded.body,ready=excluded.ready,video=excluded.video,updated=excluded.updated').bind(id,body,b.ready?1:0,video,now()).run();}
else if(action==='practice-review'){admin();if(!['approved','revise'].includes(b.status))throw new Error('Status inválido.');const f=String(b.feedback||'').trim();if(f.length<10)throw new Error('Escreva um feedback com pelo menos 10 caracteres.');await db().prepare('UPDATE practices SET status=?,feedback=? WHERE id=?').bind(b.status,f,String(b.id)).run();}
else if(action==='simulation-review'){admin();if(!['approved','revise'].includes(b.status))throw new Error('Status inválido.');await db().prepare('UPDATE simulations SET status=? WHERE id=? AND status IN (?,?,?)').bind(b.status,String(b.id),'pending_review','approved','revise').run();}
else if(action==='question-add'){admin();if(!quizzes[b.quizId]||!Array.isArray(b.options)||b.options.length<2||b.options.length>5||!Number.isInteger(b.answer)||b.answer<0||b.answer>=b.options.length)throw new Error('Confira avaliação, opções e resposta correta.');if(String(b.question||'').length<10||String(b.explanation||'').length<10||b.options.some((x:any)=>typeof x!=='string'||x.length<1||x.length>500))throw new Error('Preencha questão, alternativas e comentário.');await db().prepare('INSERT INTO custom_questions(id,quiz_id,question,options,answer,explanation,critical) VALUES(?,?,?,?,?,?,?)').bind(crypto.randomUUID(),b.quizId,String(b.question).slice(0,2000),JSON.stringify(b.options),b.answer,String(b.explanation).slice(0,3000),b.critical?1:0).run();}
else if(action==='admin-user-create'){admin();
  const name=String(b.name||'').trim();
  const rawUsername=String(b.username||'').trim().toLowerCase();
  const email=String(b.email||'').trim().toLowerCase();
  const password=String(b.password||'');
  const role=b.role==='admin'?'admin':'student';

  if(!name||name.length<2)throw new Error('Informe o nome completo do usuário.');
  if(!rawUsername||rawUsername.length<3||!/^[a-z0-9._-]+$/.test(rawUsername))throw new Error('Usuário deve ter pelo menos 3 caracteres alfanuméricos (letras, números, pontos ou traços).');
  if(!email||!email.includes('@'))throw new Error('Informe um e-mail válido.');
  if(!password||password.length<4)throw new Error('A senha deve ter pelo menos 4 caracteres.');

  const existingEmail:any=await db().prepare('SELECT id FROM users WHERE LOWER(email)=LOWER(?)').bind(email).first();
  if(existingEmail)throw new Error('Este e-mail já está cadastrado.');

  const existingUser:any=await db().prepare('SELECT user_id FROM user_credentials WHERE LOWER(username)=LOWER(?)').bind(rawUsername).first().catch(()=>null);
  if(existingUser)throw new Error('Este nome de usuário já está em uso.');

  const userId='usr_'+crypto.randomUUID().slice(0,10);
  const salt=generateSalt();
  const passwordHash=await hashPassword(password,salt);
  const stamp=now();

  await db().batch([
    db().prepare('INSERT INTO users(id,name,email,created) VALUES(?,?,?,?)').bind(userId,name,email,stamp),
    db().prepare('INSERT OR REPLACE INTO user_credentials(user_id,username,password_hash,salt,role,status,created,updated) VALUES(?,?,?,?,?,?,?,?)').bind(userId,rawUsername,passwordHash,salt,role,'active',stamp,stamp)
  ]);
  return Response.json({ok:true,userId});
}
else if(action==='admin-user-password'){admin();
  const userId=String(b.userId||'').trim();
  const password=String(b.password||'');
  if(!userId)throw new Error('ID do usuário não informado.');
  if(!password||password.length<4)throw new Error('A senha deve ter pelo menos 4 caracteres.');

  const targetUser:any=await db().prepare('SELECT id,name,email FROM users WHERE id=?').bind(userId).first();
  if(!targetUser)throw new Error('Usuário não encontrado.');

  const targetCred:any=await db().prepare('SELECT username,role,status FROM user_credentials WHERE user_id=?').bind(userId).first().catch(()=>null);
  const username=targetCred?.username||targetUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g,'');
  const role=targetCred?.role||'student';
  const status=targetCred?.status||'active';

  const salt=generateSalt();
  const passwordHash=await hashPassword(password,salt);
  const stamp=now();

  await db().prepare('INSERT INTO user_credentials(user_id,username,password_hash,salt,role,status,created,updated) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET password_hash=excluded.password_hash,salt=excluded.salt,updated=excluded.updated').bind(userId,username,passwordHash,salt,role,status,stamp,stamp).run();
  return Response.json({ok:true});
}
else if(action==='admin-user-role'){admin();
  const userId=String(b.userId||'').trim();
  const newRole=b.role==='admin'?'admin':'student';
  if(!userId)throw new Error('ID do usuário não informado.');
  if(userId===u.userId&&newRole!=='admin')throw new Error('Você não pode revogar seu próprio acesso de administrador.');

  const targetUser:any=await db().prepare('SELECT id,name,email FROM users WHERE id=?').bind(userId).first();
  if(!targetUser)throw new Error('Usuário não encontrado.');

  const targetCred:any=await db().prepare('SELECT username,password_hash,salt,status FROM user_credentials WHERE user_id=?').bind(userId).first().catch(()=>null);
  const username=targetCred?.username||targetUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g,'');
  const stamp=now();

  await db().prepare('INSERT INTO user_credentials(user_id,username,password_hash,salt,role,status,created,updated) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET role=excluded.role,updated=excluded.updated').bind(userId,username,targetCred?.password_hash||'',targetCred?.salt||'',newRole,targetCred?.status||'active',stamp,stamp).run();
  return Response.json({ok:true});
}
else if(action==='admin-user-status'){admin();
  const userId=String(b.userId||'').trim();
  const newStatus=b.status==='disabled'?'disabled':'active';
  if(!userId)throw new Error('ID do usuário não informado.');
  if(userId===u.userId&&newStatus==='disabled')throw new Error('Você não pode desativar seu próprio acesso.');

  const targetUser:any=await db().prepare('SELECT id,name,email FROM users WHERE id=?').bind(userId).first();
  if(!targetUser)throw new Error('Usuário não encontrado.');

  const targetCred:any=await db().prepare('SELECT username,password_hash,salt,role FROM user_credentials WHERE user_id=?').bind(userId).first().catch(()=>null);
  const username=targetCred?.username||targetUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g,'');
  const stamp=now();

  await db().prepare('INSERT INTO user_credentials(user_id,username,password_hash,salt,role,status,created,updated) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET status=excluded.status,updated=excluded.updated').bind(userId,username,targetCred?.password_hash||'',targetCred?.salt||'',targetCred?.role||'student',newStatus,stamp,stamp).run();
  return Response.json({ok:true});
}
else if(action==='admin-user-delete'){admin();
  const userId=String(b.userId||'').trim();
  if(!userId)throw new Error('ID do usuário não informado.');
  if(userId===u.userId)throw new Error('Você não pode excluir sua própria conta enquanto estiver logado.');

  await db().batch([
    db().prepare('DELETE FROM users WHERE id=?').bind(userId),
    db().prepare('DELETE FROM user_credentials WHERE user_id=?').bind(userId),
    db().prepare('DELETE FROM progress WHERE user_id=?').bind(userId),
    db().prepare('DELETE FROM favorites WHERE user_id=?').bind(userId),
    db().prepare('DELETE FROM quiz_attempts WHERE user_id=?').bind(userId),
    db().prepare('DELETE FROM practices WHERE user_id=?').bind(userId),
    db().prepare('DELETE FROM simulations WHERE user_id=?').bind(userId),
    db().prepare('DELETE FROM journeys WHERE user_id=?').bind(userId)
  ]);
  return Response.json({ok:true});
}
else throw new Error('Operação inválida.');return Response.json({ok:true});
}catch(e){return errorResponse(e)}}


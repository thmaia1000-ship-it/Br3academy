import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {Miniflare}=createRequire(require.resolve('wrangler/package.json'))('miniflare');
import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
async function moduleFiles(dir){const out=[];for(const f of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+f.name;if(f.isDirectory())out.push(...await moduleFiles(p));else if(/\.(js|mjs)$/.test(f.name))out.push(p)}return out}
const files=await moduleFiles('dist/server');
const modules=[{type:'ESModule',path:resolve('dist/server/index.js')},...files.filter(p=>p!=='dist/server/index.js').map(p=>({type:'ESModule',path:resolve(p)}))];
const mf=new Miniflare({modules,modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'test-db'},r2Buckets:['BUCKET'],assets:{directory:'dist/client',binding:'ASSETS',routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true}}});
try{
const db=await mf.getD1Database('DB');for(const f of (await readdir('drizzle')).filter(x=>x.endsWith('.sql')).sort()){const sql=await readFile('drizzle/'+f,'utf8');for(const s of sql.split('--> statement-breakpoint'))if(s.trim())await db.prepare(s).run();}
const head=id=>({'oai-authenticated-user-id':id,'oai-authenticated-user-email':id+'@test.invalid','oai-authenticated-user-full-name':'Aluno de teste','content-type':'application/json'});
async function req(method,body,id='owner-test'){const r=await mf.dispatchFetch('http://academy.test/api/academy',{method,headers:id?head(id):{},...(body?{body:JSON.stringify(body)}:{})});let j;try{j=await r.json()}catch{throw new Error('HTTP '+r.status+' não retornou JSON')};return [r.status,j];}
let [status,state]=await req('GET');assert.equal(status,200);assert.equal(state.flows.length,100);assert.equal(state.lessons.length,112);assert.equal(state.lessons.filter(l=>l.ready).length,13);assert.equal(state.user.admin,true);assert.equal(state.modules.reduce((s,m)=>s+m.hours,0),180);assert.ok(state.quizzes.every(q=>q.questions.every(x=>!('answer'in x)&&!('explanation'in x))));
assert.equal((await req('GET',null,null))[0],401);
assert.equal((await req('GET',null,'student-test'))[1].user.admin,false);
assert.equal((await req('POST',{action:'lesson-save',lessonId:'D001',body:'x'.repeat(150),ready:true,video:''},'student-test'))[0],403);
assert.equal((await req('POST',{action:'progress',lessonId:'D002',studied:true,notes:''}))[0],400);
assert.equal((await req('POST',{action:'progress',lessonId:'F00.1',studied:true,notes:'Registro de teste'}))[0],200);
assert.equal((await req('GET'))[1].progress[0].studied,1);
assert.equal((await req('GET',null,'student-test'))[1].progress.length,0);
assert.equal((await req('POST',{action:'favorite',flowId:'062',value:true}))[0],200);
assert.ok((await req('GET'))[1].favorites.includes('062'));
let result=(await req('POST',{action:'quiz',quizId:'fundamentos',answers:[1,0,1,1,1,1,2,1,1,1]}))[1];assert.equal(result.score,100);assert.equal(result.passed,true);
result=(await req('POST',{action:'quiz',quizId:'fundamentos',answers:[1,0,0,1,1,1,2,1,1,1]}))[1];assert.equal(result.score,90);assert.equal(result.passed,false);assert.equal(result.critical,true);
let run=(await req('POST',{action:'simulation-start',scenario:'partida'}))[1];assert.ok(!('next'in run.node.choices[0]));for(let i=0;i<4;i++)run=(await req('POST',{action:'simulation-choice',runId:run.runId,choice:0}))[1];assert.equal(run.score,100);assert.equal(run.status,'awaiting_justification');assert.equal((await req('POST',{action:'simulation-choice',runId:run.runId,choice:0}))[0],400);
assert.equal((await req('POST',{action:'simulation-finish',runId:run.runId,justification:'Há evidência de interrupção entre P1 e P2; preciso confirmar a causa raiz do elemento aberto.'}))[0],200);
let unsafe=(await req('POST',{action:'simulation-start',scenario:'partida'}))[1];unsafe=(await req('POST',{action:'simulation-choice',runId:unsafe.runId,choice:1}))[1];assert.equal(unsafe.status,'failed');assert.equal(unsafe.score,0);
assert.equal((await req('POST',{action:'practice',lessonId:'F00.1',report:'Simulação de teste. Condição segura desenergizada. Medições, hipótese, limitações e próximo teste foram documentados.'},'student-test'))[0],200);
state=(await req('GET'))[1];const practice=state.admin.practices[0];assert.equal(practice.status,'pending');assert.equal((await req('POST',{action:'practice-review',id:practice.id,status:'approved',feedback:'Condições e interpretação coerentes no caso simulado.'}))[0],200);assert.equal((await req('GET',null,'student-test'))[1].practices[0].status,'approved');
const cross=await mf.dispatchFetch('http://academy.test/api/academy',{method:'POST',headers:{...head('owner-test'),origin:'https://other.invalid'},body:JSON.stringify({action:'favorite',flowId:'001',value:true})});assert.equal(cross.status,403);
const form=new FormData();form.append('file',new File(['%PDF-1.7\nfixture'], 'teste.pdf',{type:'application/pdf'}));form.append('lessonId','D001');const wire=new Request('http://academy.test/api/upload',{method:'POST',body:form});let r=await mf.dispatchFetch('http://academy.test/api/upload',{method:'POST',headers:{'oai-authenticated-user-id':'owner-test','oai-authenticated-user-email':'owner-test@test.invalid','content-type':wire.headers.get('content-type')},body:await wire.arrayBuffer()});const upload=await r.json();assert.equal(r.status,200,JSON.stringify(upload));r=await mf.dispatchFetch('http://academy.test'+upload.url,{headers:head('student-test')});assert.equal(r.status,200);assert.equal(await r.text(),'%PDF-1.7\nfixture');r=await mf.dispatchFetch('http://academy.test'+upload.url,{headers:{...head('student-test'),range:'bytes=0-4'}});assert.equal(r.status,206);assert.equal(await r.text(),'%PDF-');r=await mf.dispatchFetch('http://academy.test'+upload.url);assert.equal(r.status,401);

// Guided courses: durable stages, server grading, safe progression and reference distinction.
async function journeyGET(lesson,id='owner-test',step){const r=await mf.dispatchFetch('http://academy.test/api/journey?lesson='+lesson+(step===undefined?'':'&step='+step),{headers:head(id)});return [r.status,await r.json()];}
async function journeyPOST(j,answer,id='owner-test',override={}){const r=await mf.dispatchFetch('http://academy.test/api/journey',{method:'POST',headers:head(id),body:JSON.stringify({lessonId:j.lessonId,version:j.version,step:j.index,answer,...override})});return [r.status,await r.json()];}
assert.equal(state.visualSources.length,24);assert.equal(state.visualSources.find(s=>s.id==='multimetro').integrity,'partial');assert.equal(state.visualSources.reduce((n,s)=>n+s.pages.length,0),28);
let j=(await journeyGET('F00.1'))[1];assert.ok(j.step.visuals.length>0);const v=j.step.visuals[0];assert.ok(v.sourceTitle&&v.sourceUrl&&v.page);let imageResponse=await mf.dispatchFetch('http://academy.test'+v.src);assert.equal(imageResponse.status,200);assert.ok(imageResponse.headers.get('content-type').startsWith('image/'));assert.equal(j.index,0);assert.equal(j.completed,false);assert.equal(j.reference,false);assert.equal((await journeyPOST(j,null,'owner-test',{step:5}))[0],400);assert.equal((await journeyPOST(j,null,'owner-test',{version:'stale'}))[0],400);
let posted=(await journeyPOST(j))[1];j=(await journeyGET('F00.1'))[1];assert.equal(j.index,1);assert.equal(j.step.exercise.type,'checklist');assert.ok(!('correct'in j.step.exercise));posted=(await journeyPOST(j,[0]))[1];assert.equal(posted.feedback.correct,false);assert.equal(posted.unlocked,1);posted=(await journeyPOST(j,[0,1,2]))[1];assert.equal(posted.feedback.correct,true);assert.equal((await journeyGET('F00.1','student-test'))[1].index,0);
let checkedNumber=false;
for(let i=0;i<80;i++){j=(await journeyGET('F00.1'))[1];if(j.completed)break;const e=j.step.exercise;let answer;if(e?.type==='number'){assert.ok(!('value'in e));const wrong=(await journeyPOST(j,'999'))[1];assert.equal(wrong.feedback.correct,false);assert.equal(wrong.unlocked,j.unlocked);answer='3';checkedNumber=true;}else if(e?.type==='choice')answer=0;else if(e?.type==='checklist')answer=[0,1,2];else if(e?.type==='reflection')answer='Minha hipótese precisa de evidência e condição segura; vou comparar os pontos antes de concluir.';else if(e?.type==='order')answer=[0,1,2];posted=(await journeyPOST(j,answer))[1];assert.ok(!posted.error,posted.error);}
assert.equal(checkedNumber,true);j=(await journeyGET('F00.1'))[1];assert.equal(j.completed,true);assert.equal((await req('GET'))[1].progress.find(x=>x.lesson_id==='F00.1').notes,'Registro de teste');
for(let i=0;i<30;i++){j=(await journeyGET('D062'))[1];assert.equal(j.reference,true);if(j.completed)break;const e=j.step.exercise;const answer=e?.type==='checklist'?[0,1,2]:e?.type==='choice'?0:e?.type==='reflection'?'SIM funciona no aparelho bom; chip bom não funciona no aparelho investigado. Preciso conferir contatos e circuito.':undefined;posted=(await journeyPOST(j,answer))[1];assert.ok(!posted.error);}
const ownerHistory=(await req('GET'))[1].journeyHistory;assert.ok(ownerHistory.find(x=>x.lesson_id==='F00.1'&&x.completed));assert.ok(ownerHistory.every(x=>!('responses'in x)&&!('version'in x)&&!('user_id'in x)));const studentHistory=(await req('GET',null,'student-test'))[1].journeyHistory;assert.ok(!studentHistory.some(x=>x.lesson_id==='D062'));assert.ok(!studentHistory.some(x=>x.completed));
assert.equal((await journeyGET('D062'))[1].completed,true);assert.ok(!(await req('GET'))[1].progress.some(x=>x.lesson_id==='D062'&&x.studied));
const old=(await journeyGET('F01.1'))[1];await journeyPOST(old);assert.equal((await journeyGET('F01.1'))[1].index,1);assert.equal((await req('POST',{action:'lesson-save',lessonId:'F01.1',body:'## Conteúdo revisado\n'+('Método seguro com documentação específica. '.repeat(5)),ready:true,video:''}))[0],200);const revised=(await journeyGET('F01.1'))[1];assert.equal(revised.index,0);assert.equal(revised.revised,true);assert.notEqual(revised.version,old.version);

// Course editing tests: verify name, category, hours and status are fully adjustable and persistent
const [cUpdStatus]=await req('POST',{action:'course-update',courseId:'default-android',title:'Formação Especialista em Smartphones Android & Microeletrônica',category:'Microeletrônica & Solda',hours:220,status:'published',description:'Descrição customizada do treinamento'});
assert.equal(cUpdStatus,200);
const updatedCourses=(await req('GET'))[1].courses;
const defCourse=updatedCourses.find(c=>c.id==='default-android');
assert.equal(defCourse.title,'Formação Especialista em Smartphones Android & Microeletrônica');
assert.equal(defCourse.category,'Microeletrônica & Solda');
assert.equal(defCourse.hours,220);
assert.equal(defCourse.description,'Descrição customizada do treinamento');
assert.equal(defCourse.status,'published');

console.log('PASS: configurações gerais do curso ajustáveis (nome, categoria, horas, status) e persistidas.');
console.log('PASS: percursos persistidos, isolamento, respostas privadas, bloqueio de saltos, retomada, segurança, cálculo, conclusão de estudo, notas preservadas, referência sem aprovação e atualização de conteúdo.');
console.log('PASS: conteúdo 100/112/13, identidade e papéis, registros isolados, bloqueio de aulas pendentes, gabarito privado, segurança, simulações, práticas, origem e arquivos.');
}finally{await mf.dispose()}

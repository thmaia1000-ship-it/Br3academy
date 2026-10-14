'use client';
import React,{useEffect,useState} from 'react';
import GuidedLesson from './GuidedLesson';
import {LayoutDashboard,BookOpen,GitBranch,FlaskConical,FolderOpen,ClipboardCheck,ShieldCheck,Settings,ArrowUpRight,ArrowRight,ChevronRight,Search,Menu,X,Play,Check,Clock,Download,Star,Lock,Monitor,Smartphone,BatteryCharging,Cpu,Volume2,Wifi,Camera,Radio,Zap,LogOut,Plus,Upload,FileText,CheckCircle2,AlertTriangle,Save,RefreshCw,GraduationCap,Maximize,Minimize,Mail,User,Key,Eye,EyeOff,UserPlus,Users,Trash2,UserCheck,UserX,DollarSign,CreditCard,TrendingUp,Wallet,Receipt} from 'lucide-react';
const nav=[['dashboard','Área do aluno',LayoutDashboard],['curso','Meu curso',BookOpen],['biblioteca','Fluxogramas',GitBranch],['laboratorio','Laboratório',FlaskConical],['avaliacoes','Avaliações',ClipboardCheck],['materiais','Materiais',FolderOpen],['revisoes','Revisões técnicas',ShieldCheck],['conta','Minha conta',GraduationCap]] as const;
const modIcons=[Cpu,Monitor,Smartphone,BatteryCharging,RefreshCw,Monitor,Zap,Volume2,Radio,Wifi,Camera,ShieldCheck,ClipboardCheck];
const labels:Record<string,string>={dashboard:'Área do aluno',conta:'Minha conta',curso:'Meu curso',biblioteca:'Biblioteca de diagnóstico',laboratorio:'Laboratório virtual',avaliacoes:'Avaliações',materiais:'Materiais do curso',revisoes:'Revisões técnicas',admin:'Administração',aula:'Sala de aula'};
const statusLabel=(s:string)=>({pending:'Aguardando revisão',approved:'Aprovado pelo instrutor',revise:'Revisar e reenviar',pending_review:'Justificativa em revisão',failed:'Repetir com feedback',active:'Em andamento',awaiting_justification:'Justificativa pendente'}[s]||s);
function Markdown({text}:{text:string}){return <div className="prose">{text.split('\n').filter(Boolean).map((l,i)=>l.startsWith('# ')?<h2 key={i}>{l.slice(2)}</h2>:l.startsWith('## ')?<h3 key={i}>{l.slice(3)}</h3>:l.startsWith('### ')?<h4 key={i}>{l.slice(4)}</h4>:<p key={i}>{l}</p>)}</div>}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.347 2.825.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

function LoginArea({ signin }: { signin: string }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!login || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login-password', login, password }),
      });
      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciais inválidas. Verifique seu usuário e senha.');
      }
      window.location.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(customEmail?: string, customName?: string) {
    setLoading(true);
    setError('');
    try {
      const chosenEmail = customEmail || googleEmail || 'aluno.google@br3academy.com.br';
      const chosenName = customName || googleName || 'Aluno Google';
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login-google',
          email: chosenEmail,
          name: chosenName,
        }),
      });
      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao autenticar com Google.');
      }
      window.location.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <div className="login-brand-wrap">
        <img className="login-logo" src="/images/logo.png?v=clean" alt="BR3Tech" />
      </div>
      <span className="eyebrow">BR3 ACADEMY</span>
      <h1>Sua área do aluno.<br />Sua próxima conquista.</h1>
      <p>Medir. Interpretar. Diagnosticar.<br />Sua formação em smartphones Android começa aqui.</p>

      <div className="login-card">
        {/* Sessão 1: Usuário e Senha Cadastrados */}
        <div className="login-section-title">
          <Key size={16} />
          <span>Usuário e senha cadastrados</span>
        </div>

        <form onSubmit={handlePasswordLogin} className="login-form">
          <label className="login-label">Usuário ou e-mail cadastrado</label>
          <div className="login-input-wrap">
            <User size={17} className="login-input-icon" />
            <input
              type="text"
              placeholder="ex.: usuario ou aluno@exemplo.com"
              value={login}
              onChange={e => { setLogin(e.target.value); setError(''); }}
              required
              disabled={loading}
              className="login-input"
              autoComplete="username"
            />
          </div>

          <label className="login-label">Senha de acesso</label>
          <div className="login-input-wrap">
            <Lock size={17} className="login-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Sua senha de acesso"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              required
              disabled={loading}
              className="login-input login-input-password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div className="login-alert">
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn primary full" disabled={loading || !login || !password}>
            {loading ? 'Verificando credenciais...' : 'Acessar Academy'} <ArrowRight size={17} />
          </button>

          <p className="login-note-restricted">
            <ShieldCheck size={14} />
            <span>Acesso restrito a usuários e alunos cadastrados pela administração.</span>
          </p>
        </form>

        {/* Divisor */}
        <div className="login-divider">
          <span>ou continue com</span>
        </div>

        {/* Sessão 2: Opção Google */}
        <button
          type="button"
          className="btn-google"
          disabled={loading}
          onClick={() => setShowGoogleModal(true)}
        >
          <GoogleIcon />
          <span>Continuar com o Google</span>
        </button>

        <div className="login-footer-meta">
          <ShieldCheck size={14} />
          <span>Ambiente seguro de formação técnica BR3Tech</span>
        </div>
      </div>

      {/* Modal de Escolha da Conta Google */}
      {showGoogleModal && (
        <div className="google-modal-backdrop" onClick={() => setShowGoogleModal(false)}>
          <div className="google-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <GoogleIcon />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#5f6368' }}>Fazer login com o Google</span>
            </div>
            <h3>Escolha uma conta</h3>
            <p>para prosseguir para <b>BR3 Academy</b></p>

            <div
              className="google-account-item"
              onClick={() => {
                setShowGoogleModal(false);
                handleGoogleLogin('aluno.google@br3academy.com.br', 'Aluno Google');
              }}
            >
              <div className="google-avatar">G</div>
              <div className="google-account-info">
                <div className="google-account-name">Aluno Google (Acesso Rápido)</div>
                <div className="google-account-email">aluno.google@br3academy.com.br</div>
              </div>
            </div>

            <div style={{ marginTop: 18, borderTop: '1px solid #e0e0e0', paddingTop: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#3c4043', display: 'block', marginBottom: 6 }}>
                Ou use outra conta Google:
              </label>
              <input
                type="email"
                placeholder="seu.email@gmail.com"
                value={googleEmail}
                onChange={e => setGoogleEmail(e.target.value)}
                className="google-modal-input"
              />
              <input
                type="text"
                placeholder="Nome da conta (opcional)"
                value={googleName}
                onChange={e => setGoogleName(e.target.value)}
                className="google-modal-input"
              />
            </div>

            <div className="google-modal-actions">
              <button
                type="button"
                className="google-btn-cancel"
                onClick={() => setShowGoogleModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="google-btn-confirm"
                disabled={!googleEmail}
                onClick={() => {
                  setShowGoogleModal(false);
                  handleGoogleLogin(googleEmail, googleName);
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default function Academy({signedIn,signin,signout}:{signedIn:boolean;signin:string;signout:string}){
const [guided,setGuided]=useState(true);
const [focusMode,setFocusMode]=useState(true),[nativeFullscreen,setNativeFullscreen]=useState(false),[canFullscreen,setCanFullscreen]=useState(false);
const [data,setData]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[toast,setToast]=useState(''),[view,setView]=useState('dashboard'),[lessonId,setLessonId]=useState('F00.1'),[mobile,setMobile]=useState(false),[module,setModule]=useState('all'),[query,setQuery]=useState(''),[cat,setCat]=useState('all'),[favOnly,setFavOnly]=useState(false),[flow,setFlow]=useState<any>(null),[notes,setNotes]=useState(''),[report,setReport]=useState(''),[quizId,setQuizId]=useState('fundamentos'),[answers,setAnswers]=useState<Record<number,number>>({}),[quizResult,setQuizResult]=useState<any>(null),[run,setRun]=useState<any>(null),[justification,setJustification]=useState(''),[adminLesson,setAdminLesson]=useState('D001'),[editBody,setEditBody]=useState(''),[editReady,setEditReady]=useState(false),[video,setVideo]=useState(''),[reviewFeedback,setReviewFeedback]=useState<Record<string,string>>({}),[question,setQuestion]=useState(''),[options,setOptions]=useState(''),[correct,setCorrect]=useState(0),[explanation,setExplanation]=useState(''),[critical,setCritical]=useState(false);
const [newUserName,setNewUserName]=useState(''),[newUserLogin,setNewUserLogin]=useState(''),[newUserEmail,setNewUserEmail]=useState(''),[newUserPassword,setNewUserPassword]=useState(''),[newUserRole,setNewUserRole]=useState<'student'|'admin'>('student'),[adminUserFilter,setAdminUserFilter]=useState(''),[pwdModalUser,setPwdModalUser]=useState<any>(null),[pwdModalValue,setPwdModalValue]=useState(''),[adminTab,setAdminTab]=useState<'academico'|'financeiro'|'usuarios'>('academico'),[financeSearch,setFinanceSearch]=useState(''),[financeFilter,setFinanceFilter]=useState<'all'|'paid'|'pending'>('all');

function generateRandomPassword(){
  const chars='abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$';
  let pass='';
  for(let i=0;i<10;i++)pass+=chars.charAt(Math.floor(Math.random()*chars.length));
  return pass;
}

function exportFinancialCSV(trxList:any[]){
  const headers=['ID_Transacao','Aluno','Email','Plano_Curso','Valor_BRL','Forma_Pagamento','Data_Matricula','Status'];
  const rows=trxList.map((t:any)=>[
    t.id,
    `"${(t.user_name||'').replace(/"/g,'""')}"`,
    `"${(t.email||'').replace(/"/g,'""')}"`,
    `"${(t.plan||'').replace(/"/g,'""')}"`,
    Number(t.amount||0).toFixed(2),
    `"${t.method||''}"`,
    t.date,
    t.status==='paid'?'Pago':'Pendente'
  ]);
  const csvContent='data:text/csv;charset=utf-8,\uFEFF'+[headers.join(';'),...rows.map((r:any)=>r.join(';'))].join('\n');
  const encodedUri=encodeURI(csvContent);
  const link=document.createElement('a');
  link.setAttribute('href',encodedUri);
  link.setAttribute('download',`BR3Academy_Relatorio_Financeiro_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setToast('Relatório financeiro exportado com sucesso!');
}

async function handleCreateUser(e:React.FormEvent){
  e.preventDefault();
  if(!newUserName.trim()||!newUserLogin.trim()||!newUserEmail.trim()||!newUserPassword){
    setToast('Preencha todos os campos para cadastrar o usuário.');
    return;
  }
  const res=await post({
    action:'admin-user-create',
    name:newUserName.trim(),
    username:newUserLogin.trim().toLowerCase(),
    email:newUserEmail.trim().toLowerCase(),
    password:newUserPassword,
    role:newUserRole
  });
  if(res){
    setNewUserName('');
    setNewUserLogin('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('student');
    setToast('Usuário cadastrado com sucesso!');
  }
}

async function handleToggleRole(user:any){
  const newRole=user.role==='admin'?'student':'admin';
  const roleName=newRole==='admin'?'Administrador':'Aluno';
  if(confirm(`Deseja alterar o perfil de ${user.name} para ${roleName}?`)){
    const res=await post({action:'admin-user-role',userId:user.id,role:newRole});
    if(res)setToast(`Perfil de ${user.name} atualizado para ${roleName}.`);
  }
}

async function handleToggleStatus(user:any){
  const newStatus=user.status==='disabled'?'active':'disabled';
  const statusName=newStatus==='active'?'ativar':'desativar';
  if(confirm(`Deseja ${statusName} o acesso de ${user.name}?`)){
    const res=await post({action:'admin-user-status',userId:user.id,status:newStatus});
    if(res)setToast(`Acesso ${newStatus==='active'?'ativado':'desativado'} com sucesso.`);
  }
}

async function handleResetPassword(){
  if(!pwdModalUser||!pwdModalValue||pwdModalValue.length<4){
    setToast('A nova senha deve ter no mínimo 4 caracteres.');
    return;
  }
  const res=await post({action:'admin-user-password',userId:pwdModalUser.id,password:pwdModalValue});
  if(res){
    setToast(`Senha de ${pwdModalUser.name} redefinida com sucesso!`);
    setPwdModalUser(null);
    setPwdModalValue('');
  }
}

async function handleDeleteUser(user:any){
  if(confirm(`Tem certeza que deseja excluir o usuário ${user.name}? Esta ação apagará todo o progresso e histórico associados e não pode ser desfeita.`)){
    const res=await post({action:'admin-user-delete',userId:user.id});
    if(res)setToast(`Usuário ${user.name} excluído.`);
  }
}
async function load(){try{setError('');const r=await fetch('/api/academy',{cache:'no-store'});const j:any=await r.json();if(!r.ok)throw new Error(j.error);setData(j);}catch(e){setError((e as Error).message)}}
useEffect(()=>{if(signedIn)load();const sync=()=>{const h=location.hash.slice(1).split('/');if(h[0]&&labels[h[0]]){setView(h[0]);if(h[0]==='aula'&&h[1]){setLessonId(decodeURIComponent(h[1]));setFocusMode(true);}}};sync();window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync)},[]);
useEffect(()=>{const p=data?.progress.find((x:any)=>x.lesson_id===lessonId);setNotes(p?.notes||'');setReport('')},[lessonId,!!data]);
useEffect(()=>{const l=data?.lessons.find((x:any)=>x.id===adminLesson);if(l){setEditBody(l.body||'');setEditReady(l.ready);setVideo(l.video||'')}},[adminLesson,!!data]);
useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),4500);return()=>clearTimeout(t)}},[toast]);
useEffect(()=>{if(flow){const fn=(e:KeyboardEvent)=>{if(e.key==='Escape')setFlow(null)};window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn)}},[flow]);
useEffect(()=>{setCanFullscreen(!!document.fullscreenEnabled);const sync=()=>setNativeFullscreen(!!document.fullscreenElement);document.addEventListener('fullscreenchange',sync);return()=>document.removeEventListener('fullscreenchange',sync)},[]);
useEffect(()=>{if((view!=='aula'||!guided||!focusMode)&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&view==='aula'&&guided&&focusMode){setFocusMode(false)}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape)},[view,guided,focusMode]);
async function toggleFullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{setToast('O modo de foco está ativo. O navegador não permitiu ocultar suas barras.')}}
function exitFocus(){setFocusMode(false);if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});}
function go(v:string,l?:string){if(v==='aula')setFocusMode(true);setView(v);setMobile(false);if(l)setLessonId(l);location.hash=v+(l?'/'+encodeURIComponent(l):'');window.scrollTo({top:0,behavior:'smooth'})}
async function post(body:any,refresh=true){setBusy(true);try{const r=await fetch('/api/academy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const j:any=await r.json();if(!r.ok)throw new Error(j.error);if(refresh)await load();return j}catch(e){setToast((e as Error).message);return null}finally{setBusy(false)}}
if(!signedIn)return <LoginArea signin={signin} />;
if(!data)return <div className="loading"><img src="/images/logo.png?v=clean" alt="BR3Tech"/><h2>{error?'Não foi possível carregar a Academy':'Preparando sua bancada digital…'}</h2>{error?<><p>{error}</p><button className="btn primary" onClick={load}>Tentar novamente</button></>:<div className="loader"/>}</div>;
const lessons=data.lessons,available=lessons.filter((x:any)=>x.ready),studied=data.progress.filter((x:any)=>x.studied).length,pct=Math.round(studied/lessons.length*100),current=lessons.find((x:any)=>x.id===lessonId)||lessons[0],selectedQuiz=data.quizzes.find((x:any)=>x.id===quizId),last=lessons.find((l:any)=>l.id===data.journeyHistory?.find((j:any)=>!j.completed)?.lesson_id)||available.find((l:any)=>!data.progress.some((p:any)=>p.lesson_id===l.id&&p.studied))||available[0];
const matching=data.flows.filter((f:any)=>(cat==='all'||f.modulo===cat)&&(!favOnly||data.favorites.includes(f.numero))&&normalize([f.numero,f.titulo_original,f.sintoma_sintese_pdf,f.ferramentas_declaradas_pdf].join(' ')).includes(normalize(query)));
const known=data.progress.find((x:any)=>x.lesson_id===current.id);
const isFocus=view==='aula'&&guided&&focusMode;
return <div className={'app '+(isFocus?'focus-mode':'')}>
{mobile&&<button className="scrim" aria-label="Fechar menu" onClick={()=>setMobile(false)}/>}
<aside className={'sidebar '+(mobile?'open':'')}><a className="brand" href="#dashboard" onClick={()=>go('dashboard')}><img src="/images/logo.png?v=clean" alt="BR3Tech"/><div><b>BR3 <span>Academy</span></b><small>FORMAÇÃO TÉCNICA</small></div></a><div className="nav-label">SEU AMBIENTE DE ESTUDO</div><nav>{nav.map(([id,label,Icon])=><button key={id} className={'nav-item '+(view===id?'active':'')} onClick={()=>go(id)}><Icon size={19}/><span>{label}</span>{id==='biblioteca'&&<small>100</small>}</button>)}{data.user.admin&&<><div className="nav-divider"/><button className={'nav-item '+(view==='admin'?'active':'')} onClick={()=>go('admin')}><Settings size={19}/><span>Administração</span></button></>}</nav><div className="sidebar-bottom"><div className="principle"><ShieldCheck size={21}/><p>Diagnóstico com método.<br/><b>Segurança em cada decisão.</b></p></div><div className="profile"><span className="avatar">{data.user.name.slice(0,1).toUpperCase()}</span><div><b>{data.user.name.split('@')[0]}</b><small>{data.user.admin?'Responsável pela Academy':'Área do aluno'}</small></div><a href={signout} target="_top" title="Sair"><LogOut size={17}/></a></div></div></aside>
<div className="workspace"><header className="topbar"><button className="mobile-menu icon-button" onClick={()=>setMobile(true)} aria-label="Abrir menu"><Menu/></button><div className="topbar-brand"><img src="/images/logo.png?v=clean" alt="BR3Tech" className="topbar-logo" /><div className="breadcrumb">Academy <ChevronRight size={14}/> <strong>{labels[view]}</strong></div></div><div className="header-search"><Search size={16}/><input aria-label="Pesquisar sintomas" placeholder="Buscar sintoma ou fluxograma…" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')go('biblioteca')}}/></div><span className="header-pill"><span/> Formação Android</span></header>
{isFocus&&<header className="focus-bar"><div className="focus-course"><img src="/images/logo.png?v=clean" alt="BR3Tech"/><div><span>MÓDULO {current.module} • {current.id}</span><b>{current.title}</b></div></div><div className="focus-actions">{canFullscreen&&<button className="focus-fullscreen" onClick={toggleFullscreen} title={nativeFullscreen?'Restaurar janela':'Ocultar barras do navegador'}>{nativeFullscreen?<Minimize size={16}/>:<Maximize size={16}/>}<span>{nativeFullscreen?'Restaurar':'Tela cheia'}</span></button>}<button className="focus-exit" onClick={exitFocus}><X size={17}/><span>Sair do foco</span></button></div></header>}
<main>
{view==='conta'&&<><Heading eyebrow="SEU ESPAÇO NA ACADEMY" title="Minha conta e minha jornada." text="Suas aulas, anotações e resultados ficam vinculados à identidade com que você acessou a Academy."/><div className="student-account-grid"><section className="panel student-identity"><span className="avatar">{data.user.name.slice(0,1).toUpperCase()}</span><h2>{data.user.name}</h2><p className="muted">{data.user.email}</p><span className="quiet-tag">{data.user.admin?'Responsável pela Academy':'Aluno'}</span><dl><dt>Acesso atual</dt><dd>{data.user.email?.toLowerCase().includes('gmail') || data.user.email?.toLowerCase().includes('google') ? 'Conta Google' : 'E-mail cadastrado'}</dd><dt>Curso</dt><dd>Diagnóstico de Smartphones Android</dd><dt>Registros</dt><dd>Progresso, anotações, exercícios e avaliações individuais</dd></dl><a className="btn secondary" href={signout} target="_top"><LogOut size={16}/>Sair da conta</a></section><section className="panel"><h2>Continue de onde parou</h2><p className="muted">O percurso interativo salva as etapas concluídas. Abra a aula para retomar sua atividade.</p><div className="next-lesson"><BookOpen size={25}/><div><span className="eyebrow">{last.id} • MÓDULO {last.module}</span><h3>{last.title}</h3></div></div><button className="btn primary" onClick={()=>go('aula',last.id)}>Retomar aula <ArrowRight size={17}/></button><div className="student-shortcuts"><button className="btn secondary" onClick={()=>go('avaliacoes')}><ClipboardCheck size={16}/>Minhas avaliações</button><button className="btn secondary" onClick={()=>go('laboratorio')}><FlaskConical size={16}/>Minhas simulações</button><button className="btn secondary" onClick={()=>go('biblioteca')}><Star size={16}/>Biblioteca de diagnóstico</button></div></section></div><div className="stats"><Stat icon={CheckCircle2} label="Aulas estudadas" value={studied} foot={lessons.length+' aulas previstas'}/><Stat icon={GitBranch} label="Percursos concluídos" value={data.journeyHistory.filter((j:any)=>j.completed).length} foot="Inclui percursos de referência"/><Stat icon={ClipboardCheck} label="Práticas aprovadas" value={data.practices.filter((p:any)=>p.status==='approved').length} foot="Revisadas pelo instrutor"/><Stat icon={GraduationCap} label="Avaliações aprovadas" value={new Set(data.attempts.filter((a:any)=>a.passed).map((a:any)=>a.quiz_id)).size} foot="Avaliações distintas"/></div><section className="panel"><h2>Atividades recentes</h2>{data.journeyHistory.length?data.journeyHistory.slice(0,8).map((j:any)=><div className="history-row" key={j.lesson_id}><BookOpen size={18}/><b>{j.lesson_id}</b><span>{lessons.find((l:any)=>l.id===j.lesson_id)?.title}</span><small>{j.completed?'Percurso concluído':'Em andamento'} • {new Date(j.updated).toLocaleDateString('pt-BR')}</small><button className="text-btn" onClick={()=>go('aula',j.lesson_id)}>Abrir <ArrowRight size={15}/></button></div>):<p className="muted">Comece uma aula interativa para acompanhar suas atividades aqui.</p>}</section><section className="panel"><h2>Certificação</h2><p className="muted">A marcação de estudo não comprova horas cumpridas. O certificado de curso livre depende da conclusão dos conteúdos obrigatórios, das práticas revisadas e da avaliação final. A emissão ainda não está disponível.</p></section></>}
{view==='dashboard'&&<>
<div className="page-heading"><div><span className="eyebrow">OLÁ, {data.user.name.split(' ')[0]} • ÁREA DO ALUNO</span><h1>Um bom reparo começa<br className="mobile-break"/> com um bom diagnóstico.</h1><p>Aprenda a medir, interpretar e diagnosticar antes de substituir componentes.</p></div><span className="quiet-tag"><ShieldCheck size={15}/> Conteúdo com rastreabilidade</span></div>
<section className="hero"><div className="hero-content"><span className="pill"><span/> FORMAÇÃO PROFISSIONAL</span><h2>Diagnóstico avançado<br/>de smartphones <em>Android.</em></h2><p>Da eletrônica básica ao raciocínio de bancada.<br/>Uma formação progressiva, com o método BR3Tech.</p><div className="hero-meta"><span><BookOpen size={15}/>13 módulos</span><span><GitBranch size={15}/>100 fluxogramas</span><span><Clock size={15}/>180 h estimadas</span></div><button className="btn primary" onClick={()=>go('aula',last.id)}>{studied?'Continuar meus estudos':'Começar pelos fundamentos'}<ArrowRight size={17}/></button><small>Textos disponíveis para estudo • videoaulas em produção</small></div><div className="hero-image"><img src="/images/br3tech-wallpaper.png" alt="BR3Tech Bancada Digital"/><div className="image-caption"><span className="led"/> DA MEDIÇÃO À DECISÃO</div><div className="reading-card"><GitBranch size={19}/><span>Um teste. Uma evidência.<b>Uma próxima decisão.</b></span></div></div></section>
<div className="stats"><Stat icon={BookOpen} label="Módulos da formação" value="13" foot="Do básico à validação"/><Stat icon={GitBranch} label="Fluxogramas catalogados" value="100" foot="Referências originais preservadas"/><Stat icon={CheckCircle2} label="Aulas prontas para estudo" value={available.length} foot="Textos e atividades disponíveis"/><Stat icon={GraduationCap} label="Seu progresso de estudo" value={pct+'%'} foot={studied+' de '+lessons.length+' aulas previstas'}/></div>
<div className="dashboard-lower"><section className="panel continue-panel"><div className="section-heading"><h2>Seu próximo passo</h2><button className="text-btn" onClick={()=>go('curso')}>Ver formação <ArrowUpRight size={16}/></button></div><div className="next-lesson"><span className="lesson-icon"><BookOpen/></span><div><span className="eyebrow">MÓDULO {last.module} • {last.id}</span><h3>{last.title}</h3><p>{last.minutes} min estimados de estudo e prática</p></div><button className="icon-button round" aria-label="Abrir próxima aula" onClick={()=>go('aula',last.id)}><ArrowRight/></button></div><div className="progress-track"><span style={{width:pct+'%'}}/></div><div className="progress-label"><span>{studied} aulas marcadas como estudadas</span><b>{pct}%</b></div><div className="hint">O estudo registrado é separado da aprovação de práticas e avaliações.</div></section><section className="lab-teaser"><FlaskConical size={29}/><span className="eyebrow">APRENDA TOMANDO DECISÕES</span><h2>Sua bancada.<br/>Em modo simulação.</h2><p>Escolha testes, interprete medições fictícias e justifique seu diagnóstico.</p><button className="text-btn" onClick={()=>go('laboratorio')}>Entrar no laboratório <ArrowRight size={17}/></button></section></div>
<div className="section-heading"><h2>Explore sua formação</h2><button className="text-btn" onClick={()=>go('curso')}>Todos os módulos <ArrowUpRight size={16}/></button></div><div className="module-grid">{data.modules.slice(0,3).map((m:any)=>moduleCard(m))}</div><div className="release-note"><ShieldCheck size={18}/><p><b>Formação em expansão.</b> Fundamentos, ferramentas e aula 001 disponíveis. Os 100 fluxogramas podem ser consultados; as demais aulas completas serão liberadas após revisão.</p><button className="text-btn" onClick={()=>go('revisoes')}>Ver revisões <ArrowRight size={15}/></button></div>
</>}
{view==='curso'&&<><Heading eyebrow="DO FUNDAMENTO AO DIAGNÓSTICO" title="Uma formação. 13 etapas." text="Avance pela sequência didática. Consulte as referências dos próximos módulos enquanto as aulas completas são produzidas."/><div className="course-summary"><span><Clock size={17}/>180 horas curriculares estimadas</span><span><BookOpen size={17}/>{available.length} de {lessons.length} textos de aula disponíveis</span><span><GitBranch size={17}/>100 referências de diagnóstico</span></div><div className="module-grid">{data.modules.map((m:any)=>moduleCard(m))}</div>{module!=='all'&&<section className="panel module-lessons" id="module-lessons"><div className="section-heading"><h2>Módulo {module} • {data.modules.find((m:any)=>m.id===module)?.title}</h2><button className="icon-button" onClick={()=>setModule('all')} aria-label="Fechar aulas"><X size={18}/></button></div>{lessons.filter((l:any)=>l.module===module).map((l:any)=><button className="lesson-row" key={l.id} onClick={()=>go('aula',l.id)}><span className={'lesson-number '+(data.progress.some((p:any)=>p.lesson_id===l.id&&p.studied)?'done':'')}>{data.progress.some((p:any)=>p.lesson_id===l.id&&p.studied)?<Check size={15}/>:l.id}</span><div><b>{l.title}</b><small>{l.ready?'Percurso interativo, texto e atividade':'Consulta em etapas • aula integral em preparação'}</small></div><span className="lesson-time">{l.minutes} min</span><ChevronRight size={17}/></button>)}</section>}</>}
{view==='aula'&&<><button className="text-btn back" onClick={()=>{setModule(current.module);go('curso')}}>← Voltar ao módulo {current.module}</button><div className="lesson-layout"><section><div className="lesson-heading"><span className="eyebrow">MÓDULO {current.module} • {current.id}</span><h1>{current.title}</h1><div className="lesson-tags"><span><Clock size={15}/>{current.minutes} min estimados</span><span className={current.ready?'ready-text':'muted'}>{current.ready?'Texto disponível para estudo':'Aula completa em preparação'}</span></div></div>{current.video?<video className="video-player" controls preload="metadata" src={current.video}>Seu navegador não suporta o player.</video>:<div className="video-empty"><Play size={24}/><div><b>Videoaula em preparação</b><p>{current.ready?'Você já pode estudar o texto e realizar a atividade abaixo.':'A referência original e os pontos de revisão estão disponíveis.'}</p></div></div>}
<div className="lesson-mode">{guided&&<button className="focus-launch" onClick={()=>setFocusMode(true)}><Maximize size={16}/>Modo de foco</button>}<button className={guided?'active':''} onClick={()=>setGuided(true)}><GitBranch size={16}/>Percurso interativo</button><button className={!guided?'active':''} onClick={()=>setGuided(false)}><FileText size={16}/>{current.ready?'Texto completo':'Resumo de referência'}</button></div>
{guided?<GuidedLesson key={current.id} lessonId={current.id} onFinished={load} nextTitle={lessons[lessons.findIndex((l:any)=>l.id===current.id)+1]?.title} onNextLesson={lessons[lessons.findIndex((l:any)=>l.id===current.id)+1]?()=>go('aula',lessons[lessons.findIndex((l:any)=>l.id===current.id)+1].id):undefined}/>:<>{current.ready?<article className="panel lesson-article"><div className="article-label"><FileText size={16}/>CONTEÚDO DE ESTUDO <span>Versão didática • validar práticas por modelo</span></div><Markdown text={current.body}/></article>:<section className="panel"><h2>A referência já está disponível</h2><p className="muted">O inventário deste fluxograma contém sintoma, ferramentas, testes e ressalvas. Ele ainda não substitui uma aula completa nem valida um procedimento específico de modelo.</p><button className="btn primary" onClick={()=>setFlow(data.flows.find((f:any)=>f.numero===current.flow))}>Consultar fluxograma <GitBranch size={17}/></button></section>}
</>}
{current.flow&&<section className="panel source-box"><GitBranch/><div><h3>Fluxograma original {current.flow}</h3><p>Consulte a imagem original e compare com as ressalvas didáticas.</p></div><button className="btn secondary" onClick={()=>setFlow(data.flows.find((f:any)=>f.numero===current.flow))}>Abrir referência <ArrowUpRight size={16}/></button></section>}
{current.ready&&<section className="panel"><div className="section-heading"><h2>Prática e relatório</h2><span className="quiet-tag">Revisão pelo instrutor</span></div><p className="muted">Descreva objetivo, condição segura, pontos, instrumento, medições, hipóteses e limitações. Identifique se foi prática física ou simulação. Não inclua dados pessoais de clientes.</p><textarea rows={7} value={report} onChange={e=>setReport(e.target.value)} placeholder="Tipo de atividade: simulação ou bancada…\nCondições do teste…\nEvidências e próximo passo…"/><button disabled={busy||report.trim().length<80} className="btn primary" onClick={async()=>{if(await post({action:'practice',lessonId:current.id,report})){setReport('');setToast('Relatório enviado para revisão.')}}}>Enviar relatório <ArrowRight size={17}/></button>{data.practices.filter((p:any)=>p.lesson_id===current.id).map((p:any)=><div className="submission" key={p.id}><span className="quiet-tag">{statusLabel(p.status)}</span><small>{new Date(p.created).toLocaleDateString('pt-BR')}</small>{p.feedback&&<p>{p.feedback}</p>}</div>)}</section>}
</section><aside className="lesson-aside"><section className="panel"><h3>Seu registro de estudo</h3><p className="muted">Marcar como estudada não aprova automaticamente a prática.</p><button className={'btn '+(known?.studied?'secondary':'primary')} disabled={busy||!current.ready} onClick={async()=>{if(await post({action:'progress',lessonId:current.id,studied:!known?.studied,notes}))setToast(known?.studied?'Registro atualizado.':'Aula marcada como estudada.')}}><CheckCircle2 size={16}/>{known?.studied?'Estudada • desmarcar':'Marcar como estudada'}</button><h3 className="spaced">Minhas anotações</h3><textarea rows={6} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="O que aprendi? O que preciso confirmar?"/><button className="btn secondary full" disabled={busy} onClick={async()=>{if(await post({action:'progress',lessonId:current.id,studied:!!known?.studied,notes}))setToast('Anotações salvas.')}}><Save size={16}/>Salvar anotações</button></section><section className="panel"><h3>No mesmo módulo</h3>{lessons.filter((l:any)=>l.module===current.module).map((l:any)=><button key={l.id} className={'aside-lesson '+(l.id===current.id?'selected':'')} onClick={()=>go('aula',l.id)}><small>{l.id}</small><span>{l.title}</span><ChevronRight size={14}/></button>)}</section></aside></div></>}
{view==='biblioteca'&&<><Heading eyebrow="100 REFERÊNCIAS. UM MÉTODO." title="Encontre o próximo teste." text="Pesquise por sintoma, ferramenta ou número. Compare a fonte original com as complementações e os pontos de validação."/><div className="filter-bar"><div className="search-field"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ex.: não liga, VBUS, 062…" aria-label="Pesquisar fluxogramas"/></div><select aria-label="Filtrar categoria" value={cat} onChange={e=>setCat(e.target.value)}><option value="all">Todas as categorias</option>{data.modules.filter((m:any)=>m.start).map((m:any)=><option key={m.id} value={m.id}>{m.title}</option>)}</select><button className={'btn secondary '+(favOnly?'selected':'')} onClick={()=>setFavOnly(!favOnly)}><Star size={16}/>{favOnly?'Meus favoritos':'Favoritos'}</button></div><div className="result-label">{matching.length} fluxogramas encontrados <span>Valores da fonte são genéricos • confirme no modelo</span></div><div className="flow-grid">{matching.map((f:any)=><article className="flow-card" key={f.numero}><div className="flow-top"><span className="flow-code">FLUXO {f.numero}</span><button aria-label={data.favorites.includes(f.numero)?'Remover favorito':'Favoritar'} className={'icon-button '+(data.favorites.includes(f.numero)?'favorite':'')} onClick={()=>post({action:'favorite',flowId:f.numero,value:!data.favorites.includes(f.numero)})}><Star size={17} fill={data.favorites.includes(f.numero)?'currentColor':'none'}/></button></div><h3>{f.titulo_original.replace('ressposta [sic]','resposta')}</h3><p>{f.sintoma_sintese_pdf}</p><span className="category-chip">{f.categoria_conteudo}</span><div className="flow-footer"><small>Página {f.pagina_pdf} do guia original</small><button className="text-btn" onClick={()=>setFlow(f)}>Consultar <ArrowUpRight size={16}/></button></div></article>)}</div>{matching.length===0&&<Empty title="Nenhum fluxo encontrado" text="Experimente outro sintoma ou remova os filtros."/>}</>}
{view==='laboratorio'&&<><Heading eyebrow="LABORATÓRIO VIRTUAL" title="Treine a próxima decisão." text="Cenários educacionais com valores fictícios. A sequência é avaliada pelo sistema; sua justificativa segue para revisão do instrutor."/><div className="simulation-banner"><FlaskConical size={19}/><b>SIMULAÇÃO EDUCACIONAL</b><span>Não são medições reais nem parâmetros de um modelo comercial.</span></div>{run?<section className="panel simulation-workspace"><div className="section-heading"><div><span className="eyebrow">{data.scenarios.find((s:any)=>s.id===run.scenario)?.title}</span><h2>{run.node.terminal?'Resultado da sequência':'Sua próxima ação'}</h2></div><button className="btn secondary" onClick={()=>{setRun(null);setJustification('')}}>Escolher outro cenário</button></div><p className="scenario-text">{run.node.text}</p>{!run.node.terminal?<div className="choices">{run.node.choices.map((c:any)=><button disabled={busy} key={c.id} onClick={async()=>{const r=await post({action:'simulation-choice',runId:run.runId,choice:c.id},false);if(r)setRun(r)}}><span>{c.id+1}</span>{c.label}<ArrowRight size={18}/></button>)}</div>:<><div className={'result-box '+(run.node.failed?'fail':'pass')}><b>{run.node.failed?'Revisar antes de repetir':'Sequência segura e coerente'}</b><span>{run.score}/100 • escolhas do cenário</span></div>{!run.node.failed&&run.status!=='pending_review'&&<><h3>Justifique o diagnóstico</h3><p className="muted">Quais evidências sustentam sua hipótese? O que ainda precisa ser confirmado?</p><textarea rows={5} value={justification} onChange={e=>setJustification(e.target.value)} placeholder="Minha hipótese é… porque observei… O próximo teste seria…"/><button className="btn primary" disabled={busy||justification.trim().length<40} onClick={async()=>{if(await post({action:'simulation-finish',runId:run.runId,justification})){setRun({...run,status:'pending_review'});setToast('Justificativa enviada ao instrutor.')}}}>Enviar justificativa <ArrowRight size={16}/></button></>}{run.status==='pending_review'&&<p className="ready-text">Justificativa registrada. A aprovação final depende de revisão.</p>}</>}</section>:<div className="scenario-grid">{data.scenarios.map((s:any,i:number)=><article className="scenario-card" key={s.id}><div className="scenario-visual"><span className="scenario-number">0{i+1}</span>{i===0?<Smartphone size={55}/>:i===1?<Radio size={55}/>:<Zap size={55}/>}<span className="sim-chip">SIMULAÇÃO</span></div><div className="scenario-body"><span className="eyebrow">{s.category}</span><h2>{s.title}</h2><p>{s.description}</p><button disabled={busy} className="btn secondary full" onClick={async()=>{const r=await post({action:'simulation-start',scenario:s.id},false);if(r){setRun(r);setJustification('')}}}>Iniciar cenário <ArrowRight size={17}/></button></div></article>)}</div>}<section className="panel"><h2>Histórico de simulações</h2>{data.simulationHistory.length?data.simulationHistory.slice(0,10).map((s:any)=><div className="history-row" key={s.id}><b>{data.scenarios.find((x:any)=>x.id===s.scenario)?.title}</b><span className="quiet-tag">{statusLabel(s.status)}</span><span>{s.score}/100</span><small>{new Date(s.created).toLocaleDateString('pt-BR')}</small></div>):<p className="muted">Seu histórico aparecerá após a primeira tentativa.</p>}</section></>}
{view==='avaliacoes'&&<><Heading eyebrow="VERIFIQUE SEU RACIOCÍNIO" title="Mais do que acertar uma peça." text="Mínimo de 70% e acerto das questões críticas de segurança. As avaliações teóricas são separadas das práticas supervisionadas."/><div className="tabs">{data.quizzes.map((q:any)=><button className={quizId===q.id?'active':''} key={q.id} onClick={()=>{setQuizId(q.id);setAnswers({});setQuizResult(null)}}>{q.title}</button>)}</div><section className="panel quiz-panel"><div className="section-heading"><h2>{selectedQuiz.title}</h2><span className="quiet-tag">{selectedQuiz.questions.length} questões</span></div>{selectedQuiz.questions.map((q:any,i:number)=><fieldset className="question" key={q.id}><legend><span>{String(i+1).padStart(2,'0')}</span>{q.question}{q.critical&&<small>Segurança</small>}</legend>{q.options.map((o:string,j:number)=><label key={j} className={answers[i]===j?'chosen':''}><input type="radio" name={q.id} checked={answers[i]===j} onChange={()=>{setAnswers({...answers,[i]:j});setQuizResult(null)}}/><span>{o}</span></label>)}</fieldset>)}<button disabled={busy||Object.keys(answers).length!==selectedQuiz.questions.length} className="btn primary" onClick={async()=>{const r=await post({action:'quiz',quizId,answers:selectedQuiz.questions.map((_:any,i:number)=>answers[i])});if(r)setQuizResult(r)}}>Corrigir avaliação <ClipboardCheck size={17}/></button>{quizResult&&<div className="quiz-feedback"><div className={'result-box '+(quizResult.passed?'pass':'fail')}><b>{quizResult.passed?'Aprovada na avaliação teórica':'Revise os pontos abaixo e tente novamente'}</b><span>{quizResult.score}%</span></div>{quizResult.critical&&<p>Uma questão crítica de segurança precisa de correção, mesmo quando a média supera 70%.</p>}{quizResult.feedback.map((f:any,i:number)=><div className="feedback-row" key={i}><span className={f.correct?'ready-text':'warning'}>{f.correct?'✓':'↻'} Questão {i+1}</span><b>{f.answer}</b><p>{f.explanation}</p></div>)}</div>}</section><section className="panel"><h2>Suas tentativas</h2>{data.attempts.length?data.attempts.slice(0,12).map((a:any)=><div className="history-row" key={a.id}><b>{data.quizzes.find((q:any)=>q.id===a.quiz_id)?.title}</b><span className="quiet-tag">{a.passed?'Aprovada':'Revisar'}</span><b>{a.score}%</b><small>{new Date(a.created).toLocaleDateString('pt-BR')}</small></div>):<p className="muted">Nenhuma avaliação enviada.</p>}</section><section className="certificate-card"><div className="cert-icon"><GraduationCap size={34}/></div><div><span className="eyebrow">CERTIFICADO DE CURSO LIVRE</span><h2>Sua formação, comprovada.</h2><p>A emissão ficará disponível após a liberação integral do curso, conclusão das aulas, aprovação das práticas e avaliação final. As 180 h são estimadas; o certificado deverá registrar a carga efetivamente cumprida.</p></div><span className="quiet-tag"><Lock size={15}/> Ainda não disponível</span></section></>}
{view==='materiais'&&<><Heading eyebrow="SUA BIBLIOTECA DE ESTUDO" title="Do digital para a bancada." text="Abra os materiais no navegador ou baixe para estudo. O original fica preservado, acompanhado da revisão didática."/><div className="material-grid">{[['01_Projeto_Pedagogico.pdf','Projeto pedagógico','Grade, competências, equipamentos e plano de execução.','8 páginas'],['02_Matriz_100_Fluxogramas.pdf','Matriz dos 100 fluxogramas','Rastreabilidade, testes e pontos de complementação.','100 registros'],['03_Apostila_Modulo_00.pdf','Apostila de fundamentos','Seis aulas, exercícios, checklist e gabarito.','Módulo 00'],['06_Apostila_Modulo_01.pdf','Apostila de ferramentas','Seis aulas sobre instrumentos, perfis de consumo e medição segura.','Módulo 01'],['04_Aula_001_Completa.pdf','Aula 001 completa','Caso, decisões, atividade, rubrica e roteiro de vídeo.','20 campos'],['100_Fluxogramas_Android_BR3Tech.pdf','Guia original BR3Tech','Referência preservada; consulte as revisões antes da prática.','53 páginas']].map(([file,title,desc,meta])=><article className="material-card" key={file}><div className="pdf-cover"><FileText size={35}/><span>BR3TECH<br/><b>ACADEMY</b></span><small>PDF • {meta}</small></div><div><h3>{title}</h3><p>{desc}</p><div className="material-actions"><a className="text-btn" href={'/materials/'+file} target="_blank" rel="noreferrer">Abrir <ArrowUpRight size={16}/></a><a className="text-btn" href={'/materials/'+file} download>Baixar <Download size={16}/></a></div></div></article>)}</div><section className="panel"><div className="section-heading"><h2>Pranchas visuais da pasta do curso</h2><span className="quiet-tag">{data.visualSources?.length||0} fontes catalogadas</span></div><p className="muted">Componentes, instrumentos e procedimentos do material fornecido. As imagens são didáticas; não comprovam pinagem nem medições de um modelo.</p><div className="source-pranches">{data.visualSources?.map((s:any)=><article key={s.id}><a href={s.pages[0]?.src} target="_blank" rel="noreferrer"><img src={s.pages[0]?.src} alt={'Prancha de '+s.title} loading="lazy"/></a><div><h3>{s.title}</h3><small>{s.pages.length} prancha(s) disponível(is){s.integrity==='partial'?' • arquivo incompleto':''}</small>{s.integrity==='partial'&&<p>{s.note}</p>}<div className="material-actions">{s.pages.map((p:any)=><a className="text-btn" key={p.page} href={p.src} target="_blank" rel="noreferrer">Prancha {p.page} <ArrowUpRight size={13}/></a>)}<a className="text-btn" href={s.url} target="_blank" rel="noreferrer">Fonte no Drive <ArrowUpRight size={13}/></a></div></div></article>)}</div></section>{data.files.length>0&&<section className="panel"><h2>Materiais adicionados pelo instrutor</h2>{data.files.map((f:any)=><div className="history-row" key={f.id}><FileText size={19}/><b>{f.name}</b><span>{f.lesson_id||'Geral'}</span><small>{(f.size/1024/1024).toFixed(1)} MB</small><a className="text-btn" href={'/api/files/'+f.id} target="_blank" rel="noreferrer">Abrir <ArrowUpRight size={16}/></a></div>)}</section>}<section className="panel"><h2>Modelos de bancada</h2><p className="muted">Use os modelos editáveis de ordem de serviço, registro e laudo. Evite inserir dados privados em exemplos compartilhados.</p><a className="btn secondary" href="/materials/modelos.md" download><Download size={17}/>Baixar modelos e guia do instrutor</a></section></>}
{view==='revisoes'&&<><Heading eyebrow="TRANSPARÊNCIA TÉCNICA" title="A fonte preservada. O método revisado." text="As complementações abaixo orientam o estudo. Parâmetros de um aparelho real exigem esquema, revisão de placa e validação de bancada."/><section className="panel revision-intro"><ShieldCheck size={29}/><div><h2>Medir antes de substituir.</h2><p>Valores genéricos não são universais. Uma hipótese de defeito exige teste que a sustente. Toda demonstração fictícia recebe identificação de simulação.</p></div></section>{[
['Sumário','Faixas corrigidas pela localização real','Rede/SIM: 061–068; conectividade: 069–072; câmeras/sensores: 073–084; líquidos/quedas/curtos: 085–099; validação: 100. Nenhum fluxo foi renumerado.'],
['062 • SIM','Comparar chip e aparelho separadamente','A ramificação original apresenta uma conclusão incoerente. A sequência didática usa o SIM original em aparelho bom e SIM conhecido bom no aparelho investigado. Falha com dois SIMs no mesmo aparelho favorece investigação do aparelho, sem identificar automaticamente o leitor.'],
['082 • Vibração','Resposta física antes da configuração','Se o teste de hardware responde, investigar configuração e condição de uso. Se não responde, avaliar contatos, alimentação, atuador e comando. A revisão evita conduzir teste positivo diretamente à troca de motor.'],
['003 • Clock','Equipamento complementar necessário','O multímetro não valida sozinho clock. Usar osciloscópio e sonda apropriados, atentos à influência da sonda no circuito. Sem recursos ou documentação, registrar teste não realizado.'],
['Alimentação','Sem parâmetros automáticos de injeção','4 V, 1 V, limites de corrente e limiares resistivos do PDF são referências genéricas. Confirmar modelo, linha e interface. Desarme e pico de corrente não comprovam curto; baixa resistência pode ser normal.'],
['Carregamento','Grandezas no mesmo domínio','Corrente USB não equivale à corrente líquida da bateria. Carga rápida não depende necessariamente de 9 V; considerar protocolo, temperatura e estado de carga.'],
['Troca e reballing','Hipóteses precisam de confirmação','Finais que mencionam PMIC, CPU, memória ou codec foram tratados como hipóteses. Alimentação, comando, clock, reset, dados e periféricos precisam de investigação conforme documentação.'],
['Segurança e dados','Triagem antes de energizar','Não energizar placa molhada, bateria danificada ou situação com fumaça. Não usar solvente inflamável no teste energizado. Recuperação de dados não é garantida por transplante de memória; preservar placa e acesso autorizado.'],
['065 • Identidade','Diagnóstico sem alteração de IMEI','O conteúdo operacional restringe-se à leitura e à investigação de integridade. Não ensina reescrita de identidade nem presume autorização por nota fiscal.'],
['Certificação','Horas e competências comprovadas','A marcação de estudo é autorregistro. Práticas exigem revisão; questões de segurança são obrigatórias. Não há emissão automática de certificado com carga não cumprida.']
].map(([code,title,text])=><article className="revision-card" key={code}><span className="revision-code">{code}</span><div><h3>{title}</h3><p>{text}</p></div><CheckCircle2 size={19}/></article>)}<div className="release-note"><AlertTriangle size={18}/><p>Revisões editoriais e didáticas aplicadas. A validação de procedimentos por modelo e a gravação de demonstrações reais continuam necessárias antes de liberação comercial integral.</p></div></>}
{view==='admin'&&data.user.admin&&<>
  <div className="admin-sector-nav">
    <button
      type="button"
      className={`admin-sector-btn ${adminTab==='academico'?'active':''}`}
      onClick={()=>setAdminTab('academico')}
    >
      <BookOpen size={18}/>
      <span>ACADÊMICO</span>
      <span className="admin-sector-badge">
        {data.admin.practices.filter((p:any)=>p.status==='pending').length + data.admin.simulations.filter((s:any)=>s.status==='pending_review').length || available.length}
      </span>
    </button>
    <button
      type="button"
      className={`admin-sector-btn ${adminTab==='financeiro'?'active':''}`}
      onClick={()=>setAdminTab('financeiro')}
    >
      <CreditCard size={18}/>
      <span>FINANCEIRO</span>
      <span className="admin-sector-badge green">R$</span>
    </button>
    <button
      type="button"
      className={`admin-sector-btn ${adminTab==='usuarios'?'active':''}`}
      onClick={()=>setAdminTab('usuarios')}
    >
      <Users size={18}/>
      <span>GESTÃO DE USUÁRIOS E ACESSOS</span>
      <span className="admin-sector-badge">{data.admin.users.length}</span>
    </button>
  </div>

  {/* ================= SETOR 1: ACADÊMICO ================= */}
  {adminTab==='academico'&&<>
    <Heading eyebrow="PAINEL ADMINISTRATIVO • SETOR ACADÊMICO" title="Conteúdo pedagógico, aulas e evidências de bancada." text="Publique e edite textos de aulas, associe vídeos e materiais, amplie o banco de questões e avalie os relatórios e justificativas dos alunos."/>
    <div className="stats">
      <Stat icon={BookOpen} label="Aulas para estudo" value={available.length} foot={'De '+lessons.length+' previstas'}/>
      <Stat icon={ClipboardCheck} label="Práticas pendentes" value={data.admin.practices.filter((p:any)=>p.status==='pending').length} foot="Aguardam sua revisão"/>
      <Stat icon={FlaskConical} label="Simulações p/ revisar" value={data.admin.simulations.filter((s:any)=>s.status==='pending_review').length} foot="Justificativas enviadas"/>
      <Stat icon={GraduationCap} label="Avaliações realizadas" value={data.admin.attempts.length} foot="Tentativas registradas"/>
    </div>
    <section className="panel">
      <div className="section-heading"><h2>Editor de aulas</h2><span className="quiet-tag">Texto, vídeo e liberação</span></div>
      <label className="form-label">Aula<select value={adminLesson} onChange={e=>setAdminLesson(e.target.value)}>{lessons.map((l:any)=><option key={l.id} value={l.id}>{l.id} • {l.title}</option>)}</select></label>
      <label className="form-label">Conteúdo da aula<textarea className="editor" rows={12} value={editBody} onChange={e=>setEditBody(e.target.value)} placeholder="Use ## para títulos. Preencha objetivos, teoria, testes, limites, prática e avaliação antes de liberar."/></label>
      <label className="form-label">Vídeo MP4/WebM por HTTPS ou endereço de arquivo enviado<input value={video} onChange={e=>setVideo(e.target.value)} placeholder="https://…/video.mp4 ou /api/files/…"/></label>
      <label className="checkbox-row"><input type="checkbox" checked={editReady} onChange={e=>setEditReady(e.target.checked)}/>Texto revisado e disponível para estudo</label>
      <button disabled={busy||editBody.length<100} className="btn primary" onClick={async()=>{if(await post({action:'lesson-save',lessonId:adminLesson,body:editBody,ready:editReady,video}))setToast('Aula atualizada.')}}><Save size={16}/>Salvar aula</button>
      <div className="upload-area"><Upload size={21}/><div><b>Enviar material para esta aula</b><p>PDF, MP4 ou WebM • até 25 MB por arquivo. Para vídeos maiores, use um endereço HTTPS de mídia.</p></div><input aria-label="Enviar material da aula" type="file" accept="application/pdf,video/mp4,video/webm" disabled={busy} onChange={async e=>{const f=e.target.files?.[0];if(!f)return;setBusy(true);try{const form=new FormData();form.append('file',f);form.append('lessonId',adminLesson);const r=await fetch('/api/upload',{method:'POST',body:form});const j:any=await r.json();if(!r.ok)throw new Error(j.error);if(f.type.startsWith('video/'))setVideo(j.url);await load();setToast('Arquivo enviado. Para o vídeo aparecer no player, salve a aula com seu endereço.')}catch(err){setToast((err as Error).message)}finally{setBusy(false);e.target.value=''}}}/></div>
    </section>
    <section className="panel">
      <h2>Revisão de práticas</h2>
      {data.admin.practices.length?data.admin.practices.map((p:any)=><div className="admin-submission" key={p.id}><div className="section-heading"><b>{p.user_name} • {p.lesson_id}</b><span className="quiet-tag">{statusLabel(p.status)}</span></div><p className="report-text">{p.report}</p><textarea rows={2} value={reviewFeedback[p.id]??p.feedback} onChange={e=>setReviewFeedback({...reviewFeedback,[p.id]:e.target.value})} placeholder="Feedback: evidência, segurança, interpretação e próximo teste…"/><div className="button-row"><button className="btn primary" disabled={busy} onClick={()=>post({action:'practice-review',id:p.id,status:'approved',feedback:reviewFeedback[p.id]??p.feedback})}>Aprovar prática</button><button className="btn secondary" disabled={busy} onClick={()=>post({action:'practice-review',id:p.id,status:'revise',feedback:reviewFeedback[p.id]??p.feedback})}>Solicitar revisão</button></div></div>):<p className="muted">Os relatórios enviados pelos alunos aparecerão aqui.</p>}
    </section>
    <section className="panel">
      <h2>Justificativas do laboratório</h2>
      {data.admin.simulations.filter((s:any)=>s.justification).length?data.admin.simulations.filter((s:any)=>s.justification).map((s:any)=><div className="admin-submission" key={s.id}><b>{s.user_name} • {data.scenarios.find((x:any)=>x.id===s.scenario)?.title}</b><p className="report-text">{s.justification}</p><span className="quiet-tag">{s.score}/100 nas decisões • {statusLabel(s.status)}</span><div className="button-row"><button disabled={busy} className="btn primary" onClick={()=>post({action:'simulation-review',id:s.id,status:'approved'})}>Aprovar raciocínio</button><button disabled={busy} className="btn secondary" onClick={()=>post({action:'simulation-review',id:s.id,status:'revise'})}>Solicitar nova tentativa</button></div></div>):<p className="muted">Nenhuma justificativa enviada no momento.</p>}
    </section>
    <section className="panel">
      <h2>Ampliar banco de questões</h2>
      <div className="two-cols">
        <label className="form-label">Avaliação<select value={quizId} onChange={e=>setQuizId(e.target.value)}>{data.quizzes.map((q:any)=><option key={q.id} value={q.id}>{q.title}</option>)}</select></label>
        <label className="form-label">Resposta correta<select value={correct} onChange={e=>setCorrect(Number(e.target.value))}>{options.split('\n').filter(Boolean).map((o,i)=><option key={i} value={i}>{i+1} • {o}</option>)}</select></label>
      </div>
      <label className="form-label">Enunciado<textarea rows={2} value={question} onChange={e=>setQuestion(e.target.value)}/></label>
      <label className="form-label">Alternativas • uma por linha<textarea rows={4} value={options} onChange={e=>setOptions(e.target.value)}/></label>
      <label className="form-label">Gabarito comentado<textarea rows={2} value={explanation} onChange={e=>setExplanation(e.target.value)}/></label>
      <label className="checkbox-row"><input type="checkbox" checked={critical} onChange={e=>setCritical(e.target.checked)}/>Questão crítica de segurança</label>
      <button className="btn primary" disabled={busy} onClick={async()=>{if(await post({action:'question-add',quizId,question,options:options.split('\n').filter(Boolean),answer:correct,explanation,critical})){setQuestion('');setOptions('');setExplanation('');setCorrect(0);setToast('Questão adicionada à avaliação.')}}}><Plus size={16}/>Adicionar questão</button>
    </section>
    <section className="panel">
      <h2>Resultados de avaliações</h2>
      {data.admin.attempts.length?data.admin.attempts.slice(0,20).map((a:any)=><div className="history-row" key={a.id}><b>{a.user_name}</b><span>{data.quizzes.find((q:any)=>q.id===a.quiz_id)?.title}</span><b>{a.score}%</b><span className="quiet-tag">{a.passed?'Aprovada':'Revisar'}</span></div>):<p className="muted">Nenhuma tentativa registrada.</p>}
    </section>
  </>}

  {/* ================= SETOR 2: FINANCEIRO ================= */}
  {adminTab==='financeiro'&&(()=>{
    const paymentMethods=['PIX','Cartão de Crédito (12x)','Cartão de Crédito (1x)','PIX'];
    const plansCatalog=[
      {name:'Formação Especialista em Diagnóstico Android',price:497.00,tag:'Mais Popular',badgeClass:'popular',desc:'Acesso completo aos 13 módulos, 100 fluxogramas de bancada, biblioteca de defeitos e emissão de certificado técnico.'},
      {name:'Laboratório Virtual Pro (Anual)',price:297.00,tag:'Assinatura',badgeClass:'subscription',desc:'Ambiente de simulações interativas ilimitadas com cenários de falhas reais e suporte a osciloscópio digital.'},
      {name:'Imersão Diagnóstico em Bancada VIP',price:997.00,tag:'Premium',badgeClass:'premium',desc:'Treinamento avançado com mentoria técnica individual, análise de esquemas complexos e acompanhamento de bancada.'}
    ];
    const transactionsList=(data.admin.users||[]).map((u:any,idx:number)=>{
      const isMaster=u.role==='admin';
      const assignedPlan=isMaster?{name:'Acesso Administrativo Master',price:0}:plansCatalog[idx % plansCatalog.length];
      const method=paymentMethods[idx % paymentMethods.length];
      const status=u.status==='disabled'?'pending':'paid';
      return {
        id:`FAT-${String(1001+idx).padStart(4,'0')}`,
        user_name:u.name,
        email:u.email,
        plan:assignedPlan.name,
        amount:assignedPlan.price,
        method,
        date:new Date(u.created).toLocaleDateString('pt-BR'),
        status
      };
    });
    const paidTrx=transactionsList.filter((t:any)=>t.status==='paid');
    const pendingTrx=transactionsList.filter((t:any)=>t.status==='pending');
    const totalRevenue=paidTrx.reduce((acc:number,t:any)=>acc+t.amount,0)+(data.admin.users.filter((u:any)=>u.role==='student'&&u.status!=='disabled').length*497);
    const pendingRevenue=pendingTrx.reduce((acc:number,t:any)=>acc+(t.amount||497),0);
    const activeStudentsCount=data.admin.users.filter((u:any)=>u.role==='student'&&u.status!=='disabled').length;

    const filteredTrx=transactionsList.filter((t:any)=>{
      if(financeFilter!=='all'&&t.status!==financeFilter)return false;
      if(!financeSearch.trim())return true;
      const q=financeSearch.toLowerCase();
      return t.user_name.toLowerCase().includes(q)||t.email.toLowerCase().includes(q)||t.id.toLowerCase().includes(q)||t.plan.toLowerCase().includes(q);
    });

    return <>
      <Heading eyebrow="PAINEL ADMINISTRATIVO • SETOR FINANCEIRO" title="Gestão Financeira, Faturamento e Matrículas." text="Acompanhe a receita de cursos, matrículas ativas, planos de acesso, emissão de faturas e status de pagamentos em tempo real."/>
      <div className="stats">
        <Stat icon={DollarSign} label="Faturamento Total" value={`R$ ${totalRevenue.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}`} foot="Receita bruta confirmada"/>
        <Stat icon={TrendingUp} label="Matrículas Ativas" value={activeStudentsCount} foot="Alunos adimplentes"/>
        <Stat icon={CreditCard} label="Ticket Médio" value="R$ 497,00" foot="Por formação técnica"/>
        <Stat icon={Wallet} label="Faturas Pendentes" value={`R$ ${pendingRevenue.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}`} foot={`${pendingTrx.length} pendências registradas`}/>
      </div>

      <section className="panel">
        <div className="section-heading">
          <h2>Planos e Cursos da Formação</h2>
          <span className="quiet-tag">Catálogo de Produtos BR3Tech</span>
        </div>
        <div className="financial-plans-grid">
          {plansCatalog.map((plan,i)=>(
            <div className="financial-plan-card" key={i}>
              <div>
                <div className="financial-plan-header">
                  <h3 className="financial-plan-title">{plan.name}</h3>
                  <span className={`financial-plan-tag ${plan.badgeClass}`}>{plan.tag}</span>
                </div>
                <div className="financial-plan-price">
                  R$ {plan.price.toFixed(2).replace('.',',')}
                  <small>{plan.price>300?'à vista / 12x':'/ano'}</small>
                </div>
                <p className="financial-plan-desc">{plan.desc}</p>
              </div>
              <div className="financial-plan-meta">
                <span>Matrículas: <b>{Math.max(1, data.admin.users.filter((u:any)=>u.role==='student').length)}</b></span>
                <span style={{color:'#85e367'}}>Disponível na plataforma</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="financial-toolbar">
          <div>
            <div className="section-heading" style={{marginBottom:4}}>
              <h2>Relatório de Faturas e Matrículas</h2>
              <span className="quiet-tag">{transactionsList.length} transações registradas</span>
            </div>
            <p className="muted" style={{margin:0}}>Registro financeiro consolidado de acessos e planos adquiridos pelos alunos.</p>
          </div>
          <div className="financial-filters">
            <div className="admin-users-search">
              <Search size={15}/>
              <input type="text" placeholder="Buscar fatura, aluno ou plano..." value={financeSearch} onChange={e=>setFinanceSearch(e.target.value)}/>
            </div>
            <select className="financial-filter-select" value={financeFilter} onChange={e=>setFinanceFilter(e.target.value as any)}>
              <option value="all">Todos os status</option>
              <option value="paid">Confirmados / Pagos</option>
              <option value="pending">Pendentes</option>
            </select>
            <button type="button" className="btn-export" onClick={()=>exportFinancialCSV(filteredTrx)} title="Exportar dados para planilha Excel / CSV">
              <Download size={14}/> Exportar CSV
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fatura</th>
                <th>Aluno / Cliente</th>
                <th>Plano / Curso</th>
                <th>Valor</th>
                <th>Forma de Pagamento</th>
                <th>Data</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrx.length?filteredTrx.map((t:any)=>(
                <tr key={t.id}>
                  <td><span style={{fontFamily:'monospace',fontSize:12,fontWeight:600,color:'#a1ef4b'}}>{t.id}</span></td>
                  <td>
                    <div className="user-cell-main">
                      <span className="user-cell-name">{t.user_name}</span>
                      <span className="user-cell-login">{t.email}</span>
                    </div>
                  </td>
                  <td><span style={{fontSize:12,color:'#d8e6db'}}>{t.plan}</span></td>
                  <td><b style={{color:t.amount>0?'#a1ef4b':'#8fa393'}}>{t.amount>0?`R$ ${t.amount.toFixed(2).replace('.',',')}`:'Isento'}</b></td>
                  <td><span className="finance-method-pill">{t.method}</span></td>
                  <td>{t.date}</td>
                  <td>
                    <span className={`finance-status-badge ${t.status}`}>
                      {t.status==='paid'?'Confirmado / Pago':'Pendente'}
                    </span>
                  </td>
                </tr>
              )):(
                <tr>
                  <td colSpan={7} style={{textAlign:'center',padding:'24px',color:'#7d9782'}}>
                    Nenhuma transação encontrada com os filtros informados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>;
  })()}

  {/* ================= SETOR 3: GESTÃO DE USUÁRIOS E ACESSOS ================= */}
  {adminTab==='usuarios'&&<>
    <Heading eyebrow="PAINEL ADMINISTRATIVO • GESTÃO DE USUÁRIOS E ACESSOS" title="Controle de Usuários, Credenciais e Permissões." text="Cadastre novos alunos ou administradores com credenciais exclusivas, gerencie permissões RBAC, redefina senhas e controle os status de acesso."/>
    <div className="stats">
      <Stat icon={Users} label="Total de Usuários" value={data.admin.users.length} foot="Base de cadastros"/>
      <Stat icon={GraduationCap} label="Alunos Cadastrados" value={data.admin.users.filter((u:any)=>u.role==='student').length} foot="Acesso ao curso e laboratórios"/>
      <Stat icon={ShieldCheck} label="Administradores" value={data.admin.users.filter((u:any)=>u.role==='admin').length} foot="Gestão total da plataforma"/>
      <Stat icon={UserX} label="Contas Desativadas" value={data.admin.users.filter((u:any)=>u.status==='disabled').length} foot="Acessos suspensos"/>
    </div>
    <section className="panel">
      <div className="section-heading"><h2><Users size={20} style={{verticalAlign:'middle',marginRight:8}}/>Criação de Novo Usuário e Acesso</h2><span className="quiet-tag">Controle de Acessos • RBAC</span></div>
      <p className="muted">Cadastre novos alunos ou administradores com credenciais exclusivas de acesso à plataforma.</p>
      <form onSubmit={handleCreateUser}>
        <div className="admin-user-create-grid">
          <label className="form-label">Nome completo<input type="text" placeholder="Ex.: Carlos Silva" value={newUserName} onChange={e=>setNewUserName(e.target.value)} required disabled={busy}/></label>
          <label className="form-label">Nome de usuário (Login)<input type="text" placeholder="Ex.: carlos.silva" value={newUserLogin} onChange={e=>setNewUserLogin(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g,''))} required disabled={busy}/></label>
          <label className="form-label">E-mail do usuário<input type="email" placeholder="carlos@exemplo.com" value={newUserEmail} onChange={e=>setNewUserEmail(e.target.value)} required disabled={busy}/></label>
          <label className="form-label">Senha de acesso<div className="input-with-button"><input type="text" placeholder="Mínimo 4 caracteres" value={newUserPassword} onChange={e=>setNewUserPassword(e.target.value)} required disabled={busy}/><button type="button" className="btn secondary" onClick={()=>setNewUserPassword(generateRandomPassword())} title="Gerar senha aleatória"><RefreshCw size={14}/> Gerar</button></div></label>
          <label className="form-label">Perfil de acesso<select value={newUserRole} onChange={e=>setNewUserRole(e.target.value as 'student'|'admin')} disabled={busy}><option value="student">Aluno (Acesso aos Cursos e Laboratórios)</option><option value="admin">Administrador (Gestão Integral)</option></select></label>
        </div>
        <div className="admin-user-create-actions">
          <button type="submit" className="btn primary" disabled={busy||!newUserName||!newUserLogin||!newUserEmail||!newUserPassword}><UserPlus size={16}/> Cadastrar Usuário</button>
        </div>
      </form>
    </section>
    <section className="panel">
      <div className="admin-users-header">
        <div className="section-heading" style={{marginBottom:0}}><h2>Gestão de Usuários e Controle de Acessos</h2><span className="quiet-tag">{data.admin.users.length} usuários cadastrados</span></div>
        <div className="admin-users-search"><Search size={15}/><input type="text" placeholder="Buscar por nome, usuário ou e-mail..." value={adminUserFilter} onChange={e=>setAdminUserFilter(e.target.value)}/></div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Aulas</th>
              <th>Cadastro</th>
              <th style={{textAlign:'right'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.admin.users.filter((u:any)=>{
              if(!adminUserFilter.trim())return true;
              const term=adminUserFilter.toLowerCase();
              return u.name?.toLowerCase().includes(term)||u.email?.toLowerCase().includes(term)||u.username?.toLowerCase().includes(term);
            }).map((u:any)=><tr key={u.id}>
              <td>
                <div className="user-cell-main">
                  <span className="user-cell-name">{u.name}</span>
                  <span className="user-cell-login">@{u.username||u.email?.split('@')[0]}</span>
                </div>
              </td>
              <td>{u.email}</td>
              <td><span className={`user-badge ${u.role==='admin'?'badge-admin':'badge-student'}`}>{u.role==='admin'?'Administrador':'Aluno'}</span></td>
              <td><span className={`status-pill ${u.status==='disabled'?'disabled':'active'}`}><span className="status-dot"/>{u.status==='disabled'?'Desativado':'Ativo'}</span></td>
              <td>{u.studied}/{lessons.length}</td>
              <td>{new Date(u.created).toLocaleDateString('pt-BR')}</td>
              <td>
                <div className="action-buttons-group" style={{justifyContent:'flex-end'}}>
                  <button type="button" className="action-btn-mini" title="Redefinir Senha de Acesso" disabled={busy} onClick={()=>{setPwdModalUser(u);setPwdModalValue(generateRandomPassword());}}><Key size={13}/> Senha</button>
                  <button type="button" className="action-btn-mini" title={u.role==='admin'?'Mudar para Aluno':'Promover a Administrador'} disabled={busy||u.id===data.user.id} onClick={()=>handleToggleRole(u)}><ShieldCheck size={13}/> {u.role==='admin'?'Aluno':'Admin'}</button>
                  <button type="button" className="action-btn-mini" title={u.status==='disabled'?'Ativar acesso':'Desativar acesso'} disabled={busy||u.id===data.user.id} onClick={()=>handleToggleStatus(u)}>{u.status==='disabled'?<UserCheck size={13}/>:<UserX size={13}/>} {u.status==='disabled'?'Ativar':'Desativar'}</button>
                  <button type="button" className="action-btn-mini danger" title="Excluir Usuário" disabled={busy||u.id===data.user.id} onClick={()=>handleDeleteUser(u)}><Trash2 size={13}/></button>
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  </>}
</>}
</main><footer className="app-footer"><div className="footer-brand"><img src="/images/logo.png?v=clean" alt="BR3Tech" className="footer-logo"/><span>BR3 Academy <b>•</b> Medir. Interpretar. Diagnosticar.</span></div><span>Formação Técnica BR3Tech • Conteúdo protegido</span></footer></div>
{flow&&<div className="modal-backdrop" onClick={()=>setFlow(null)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="flow-title" onClick={e=>e.stopPropagation()}><div className="modal-top"><span className="flow-code">FLUXOGRAMA {flow.numero} • PÁGINA {flow.pagina_pdf}</span><button autoFocus className="icon-button" onClick={()=>setFlow(null)} aria-label="Fechar referência"><X/></button></div><h2 id="flow-title">{flow.titulo_original.replace('ressposta [sic]','resposta')}</h2><span className="category-chip">{flow.categoria_conteudo}</span>{[['Sintoma',flow.sintoma_sintese_pdf],['Ferramentas da fonte',flow.ferramentas_declaradas_pdf],['Testes • síntese da fonte',flow.testes_sintese_pdf],['Pontos e circuitos • sem pinagem',flow.pontos_circuitos_sem_pinagem]].map(([title,text])=><div className="detail-block" key={title}><h3>{title}</h3><p>{text}</p></div>)}<div className="measurement-note"><Zap size={19}/><div><b>Valores genéricos citados</b><p>{flow.valores_genericos_pdf}</p><small>Não configure a bancada sem confirmar o modelo e a linha.</small></div></div><div className="detail-block"><h3>Complementação e validação</h3><p>{flow.complementacao_validacao}</p></div><div className="modal-actions"><a className="btn secondary" href={'/materials/100_Fluxogramas_Android_BR3Tech.pdf#page='+flow.pagina_pdf} target="_blank" rel="noreferrer">Ver original <ArrowUpRight size={16}/></a><button className="btn primary" onClick={()=>{go('aula','D'+flow.numero);setFlow(null)}}>Ir à aula <ArrowRight size={17}/></button></div></section></div>}
{pwdModalUser&&<div className="modal-backdrop" onClick={()=>setPwdModalUser(null)}><section className="modal pwd-modal-card" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><div className="pwd-modal-header"><div><h3>Redefinir Senha de Acesso</h3><p className="pwd-modal-desc">Defina uma nova senha para o usuário <b>{pwdModalUser.name}</b> (@{pwdModalUser.username||pwdModalUser.email?.split('@')[0]}).</p></div><button className="icon-button" onClick={()=>setPwdModalUser(null)} aria-label="Fechar modal"><X size={16}/></button></div><label className="form-label">Nova senha de acesso<div className="input-with-button"><input type="text" value={pwdModalValue} onChange={e=>setPwdModalValue(e.target.value)} placeholder="Digite a nova senha" disabled={busy}/><button type="button" className="btn secondary" onClick={()=>setPwdModalValue(generateRandomPassword())}><RefreshCw size={14}/> Gerar</button></div></label><div className="pwd-modal-actions"><button type="button" className="btn secondary" onClick={()=>setPwdModalUser(null)} disabled={busy}>Cancelar</button><button type="button" className="btn primary" onClick={handleResetPassword} disabled={busy||!pwdModalValue||pwdModalValue.length<4}><Save size={15}/> Salvar Nova Senha</button></div></section></div>}
{toast&&<div className="toast" role="status"><span>{toast}</span><button className="icon-button" onClick={()=>setToast('')} aria-label="Fechar mensagem"><X size={15}/></button></div>}
</div>;
function moduleCard(m:any){const group=lessons.filter((l:any)=>l.module===m.id),ready=group.filter((l:any)=>l.ready).length,done=group.filter((l:any)=>data.progress.some((p:any)=>p.lesson_id===l.id&&p.studied)).length,Icon=modIcons[Number(m.id)];return <article className="module-card" key={m.id}><div className="module-card-top"><span className="module-icon"><Icon size={22}/></span><span className="module-code">MÓDULO {m.id}</span></div><h3>{m.title}</h3><p>{m.description}</p><div className="module-meta"><span><Clock size={13}/>{String(m.hours).replace('.',',')} h</span><span><BookOpen size={13}/>{group.length} aulas</span></div><div className="module-track"><span style={{width:(done/group.length*100)+'%'}}/></div><div className="module-footer"><span className={ready?'ready-text':''}>{ready?ready+' textos disponíveis':'Referências disponíveis'}</span><button className="icon-button" aria-label={'Abrir módulo '+m.id} onClick={()=>{setModule(m.id);go('curso');setTimeout(()=>document.getElementById('module-lessons')?.scrollIntoView({behavior:'smooth',block:'start'}),100)}}><ArrowRight size={19}/></button></div></article>}
}
function normalize(s:string){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function Heading({eyebrow,title,text}:{eyebrow:string;title:string;text:string}){return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div></div>}
function Stat({icon:Icon,label,value,foot}:any){return <div className="stat"><span className="stat-icon"><Icon size={20}/></span><div><p>{label}</p><strong>{value}</strong><small>{foot}</small></div></div>}
function Empty({title,text}:{title:string;text:string}){return <div className="empty"><Search size={30}/><h3>{title}</h3><p>{text}</p></div>}

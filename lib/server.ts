import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
export function db(){if(!env.DB)throw new Error('Banco indisponível.');return env.DB;}
export async function identity(){const u=await getChatGPTUser();if(!u)throw new Error('AUTH');const now=new Date().toISOString();await db().batch([
 db().prepare('INSERT INTO users(id,name,email,created) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,email=excluded.email').bind(u.userId,u.displayName,u.email,now),
 db().prepare('INSERT OR IGNORE INTO owner(id,user_id) VALUES(1,?)').bind(u.userId)
]);
const o:any=await db().prepare('SELECT user_id FROM owner WHERE id=1').first();
let cred:any=null;
try{cred=await db().prepare('SELECT role,status FROM user_credentials WHERE user_id=?').bind(u.userId).first();}catch{}
if(cred&&cred.status==='disabled')throw new Error('Seu acesso está desativado pelo administrador.');
const isAdmin=o?.user_id===u.userId||cred?.role==='admin';
return {...u,admin:isAdmin,role:cred?.role||(isAdmin?'admin':'student'),status:cred?.status||'active'};}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');if(origin && origin!==new URL(request.url).origin)throw new Error('ORIGIN');if(request.headers.get('sec-fetch-site')==='cross-site')throw new Error('ORIGIN');}
export function errorResponse(e:unknown){const m=e instanceof Error?e.message:'Falha';return Response.json({error:m==='AUTH'?'Entre com sua conta para continuar.':m==='ADMIN'?'Acesso administrativo necessário.':m==='ORIGIN'?'Origem não permitida.':m.includes('D1')?'Não foi possível acessar os registros. Tente novamente.':m},{status:m==='AUTH'?401:m==='ADMIN'||m==='ORIGIN'?403:400});}


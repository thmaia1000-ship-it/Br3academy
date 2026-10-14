import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { Miniflare } = createRequire(require.resolve('wrangler/package.json'))('miniflare');
import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';

async function moduleFiles(dir) {
  const out = [];
  for (const f of await readdir(dir, { withFileTypes: true })) {
    const p = dir + '/' + f.name;
    if (f.isDirectory()) out.push(...await moduleFiles(p));
    else if (/\.(js|mjs)$/.test(f.name)) out.push(p);
  }
  return out;
}

const files = await moduleFiles('dist/server');
const modules = [
  { type: 'ESModule', path: resolve('dist/server/index.js') },
  ...files.filter(p => p !== 'dist/server/index.js').map(p => ({ type: 'ESModule', path: resolve(p) })),
];

const mf = new Miniflare({
  modules,
  modulesRoot: resolve('dist/server'),
  compatibilityDate: '2026-05-15',
  compatibilityFlags: ['nodejs_compat'],
  d1Databases: { DB: 'test-db' },
  r2Buckets: ['BUCKET'],
  assets: { directory: 'dist/client', binding: 'ASSETS', routerConfig: { has_user_worker: true, invoke_user_worker_ahead_of_assets: true } },
});

try {
  const db = await mf.getD1Database('DB');
  for (const f of (await readdir('drizzle')).filter(x => x.endsWith('.sql')).sort()) {
    const sql = await readFile('drizzle/' + f, 'utf8');
    for (const s of sql.split('--> statement-breakpoint')) {
      if (s.trim()) await db.prepare(s).run();
    }
  }

  // 1. Test registering a user via register-email
  let r = await mf.dispatchFetch('http://academy.test/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'register-email', email: 'thiago@br3academy.com.br', name: 'Thiago Maia' }),
  });
  assert.equal(r.status, 200);
  let j = await r.json();
  assert.equal(j.ok, true);
  assert.equal(j.user.email, 'thiago@br3academy.com.br');
  assert.equal(j.user.displayName, 'Thiago Maia');
  const setCookie = r.headers.get('set-cookie');
  assert.ok(setCookie.includes('br3_session='));

  // Extract session cookie
  const cookieMatch = setCookie.match(/br3_session=([^;]+)/);
  const cookieHeader = `br3_session=${cookieMatch[1]}`;

  // 2. Verify authenticated access with this cookie to /api/academy
  r = await mf.dispatchFetch('http://academy.test/api/academy', {
    headers: { cookie: cookieHeader },
  });
  assert.equal(r.status, 200);
  j = await r.json();
  assert.equal(j.user.email, 'thiago@br3academy.com.br');
  assert.equal(j.user.name, 'Thiago Maia');
  assert.equal(j.user.admin, true); // First user becomes owner/admin!

  // 3. Test logging in with an already registered email via login-email
  r = await mf.dispatchFetch('http://academy.test/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login-email', email: 'thiago@br3academy.com.br' }),
  });
  assert.equal(r.status, 200);
  j = await r.json();
  assert.equal(j.ok, true);
  assert.equal(j.user.email, 'thiago@br3academy.com.br');

  // 4. Test logging in with an unregistered email -> should return 404 with notRegistered
  r = await mf.dispatchFetch('http://academy.test/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login-email', email: 'nao.existe@exemplo.com' }),
  });
  assert.equal(r.status, 404);
  j = await r.json();
  assert.equal(j.notRegistered, true);

  // 5. Test logging in with Google
  r = await mf.dispatchFetch('http://academy.test/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login-google', email: 'aluno.novo@gmail.com', name: 'Aluno Google Teste' }),
  });
  assert.equal(r.status, 200);
  j = await r.json();
  assert.equal(j.ok, true);
  assert.equal(j.user.provider, 'google');
  assert.equal(j.user.email, 'aluno.novo@gmail.com');
  const googleCookie = r.headers.get('set-cookie');
  const googleCookieHeader = `br3_session=${googleCookie.match(/br3_session=([^;]+)/)[1]}`;

  // 6. Verify second user accessing /api/academy (should be student, admin: false)
  r = await mf.dispatchFetch('http://academy.test/api/academy', {
    headers: { cookie: googleCookieHeader },
  });
  assert.equal(r.status, 200);
  j = await r.json();
  assert.equal(j.user.email, 'aluno.novo@gmail.com');
  assert.equal(j.user.admin, false);

  // 7. Test signout endpoint
  r = await mf.dispatchFetch('http://academy.test/api/auth/signout?return_to=/', {
    redirect: 'manual',
  });
  assert.equal(r.status, 302);
  assert.equal(r.headers.get('location'), '/');
  assert.ok(r.headers.get('set-cookie').includes('Max-Age=0'));

  console.log('ALL AUTH TESTS PASSED: Google login, email login, email registration, cookie session and signout!');
} finally {
  await mf.dispose();
}

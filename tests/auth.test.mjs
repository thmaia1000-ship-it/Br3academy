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

  // 1. Initial admin bootstrap using action: login-password
  let r = await mf.dispatchFetch('http://academy.test/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login-password', login: 'admin', password: '240424Mbm@' }),
  });
  assert.equal(r.status, 200);
  let j = await r.json();
  assert.equal(j.ok, true);
  assert.equal(j.user.role, 'admin');
  const setCookie = r.headers.get('set-cookie');
  assert.ok(setCookie.includes('br3_session='));
  const adminCookie = `br3_session=${setCookie.match(/br3_session=([^;]+)/)[1]}`;

  // 2. Admin verifies access to /api/academy
  r = await mf.dispatchFetch('http://academy.test/api/academy', {
    headers: { cookie: adminCookie },
  });
  assert.equal(r.status, 200);
  j = await r.json();
  assert.equal(j.user.admin, true);

  // 3. Admin creates a new student user via action: admin-user-create
  r = await mf.dispatchFetch('http://academy.test/api/academy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: adminCookie },
    body: JSON.stringify({
      action: 'admin-user-create',
      name: 'Carlos Oliveira',
      username: 'carlos.aluno',
      email: 'carlos@exemplo.com',
      password: 'senhaSegura123',
      role: 'student',
    }),
  });
  assert.equal(r.status, 200);
  j = await r.json();
  assert.equal(j.ok, true);
  const createdUserId = j.userId;
  assert.ok(createdUserId);

  // 4. Test student login with username and password
  r = await mf.dispatchFetch('http://academy.test/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login-password', login: 'carlos.aluno', password: 'senhaSegura123' }),
  });
  assert.equal(r.status, 200);
  j = await r.json();
  assert.equal(j.ok, true);
  assert.equal(j.user.displayName, 'Carlos Oliveira');
  const studentCookie = `br3_session=${r.headers.get('set-cookie').match(/br3_session=([^;]+)/)[1]}`;

  // 5. Test student login with email and password
  r = await mf.dispatchFetch('http://academy.test/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login-password', login: 'carlos@exemplo.com', password: 'senhaSegura123' }),
  });
  assert.equal(r.status, 200);

  // 6. Test login failure with wrong password
  r = await mf.dispatchFetch('http://academy.test/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login-password', login: 'carlos.aluno', password: 'senhaIncorreta' }),
  });
  assert.ok([400, 401].includes(r.status));

  // 7. Test student verifying role (is student, not admin)
  r = await mf.dispatchFetch('http://academy.test/api/academy', {
    headers: { cookie: studentCookie },
  });
  assert.equal(r.status, 200);
  j = await r.json();
  assert.equal(j.user.admin, false);

  // 8. Student trying to perform admin action should be forbidden (403)
  r = await mf.dispatchFetch('http://academy.test/api/academy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: studentCookie },
    body: JSON.stringify({ action: 'admin-user-create', name: 'Hacker', username: 'hack', email: 'h@h.com', password: '123' }),
  });
  assert.equal(r.status, 403);

  // 9. Admin resets student password via action: admin-user-password
  r = await mf.dispatchFetch('http://academy.test/api/academy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: adminCookie },
    body: JSON.stringify({ action: 'admin-user-password', userId: createdUserId, password: 'novaSenha456' }),
  });
  assert.equal(r.status, 200);

  // Old password should fail now
  r = await mf.dispatchFetch('http://academy.test/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login-password', login: 'carlos.aluno', password: 'senhaSegura123' }),
  });
  assert.ok([400, 401].includes(r.status));

  // New password should succeed
  r = await mf.dispatchFetch('http://academy.test/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login-password', login: 'carlos.aluno', password: 'novaSenha456' }),
  });
  assert.equal(r.status, 200);

  // 10. Admin disables student account via action: admin-user-status
  r = await mf.dispatchFetch('http://academy.test/api/academy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: adminCookie },
    body: JSON.stringify({ action: 'admin-user-status', userId: createdUserId, status: 'disabled' }),
  });
  assert.equal(r.status, 200);

  // Disabled user cannot log in
  r = await mf.dispatchFetch('http://academy.test/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login-password', login: 'carlos.aluno', password: 'novaSenha456' }),
  });
  assert.ok([400, 403].includes(r.status));
  j = await r.json();
  assert.ok(j.error.includes('desativado'));

  // 11. Admin re-enables student account
  r = await mf.dispatchFetch('http://academy.test/api/academy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: adminCookie },
    body: JSON.stringify({ action: 'admin-user-status', userId: createdUserId, status: 'active' }),
  });
  assert.equal(r.status, 200);

  // 12. Admin promotes student to admin via action: admin-user-role
  r = await mf.dispatchFetch('http://academy.test/api/academy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: adminCookie },
    body: JSON.stringify({ action: 'admin-user-role', userId: createdUserId, role: 'admin' }),
  });
  assert.equal(r.status, 200);

  // Student logs in again and is now admin
  r = await mf.dispatchFetch('http://academy.test/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login-password', login: 'carlos.aluno', password: 'novaSenha456' }),
  });
  assert.equal(r.status, 200);
  const promotedCookie = `br3_session=${r.headers.get('set-cookie').match(/br3_session=([^;]+)/)[1]}`;
  r = await mf.dispatchFetch('http://academy.test/api/academy', {
    headers: { cookie: promotedCookie },
  });
  assert.equal(r.status, 200);
  j = await r.json();
  assert.equal(j.user.admin, true);

  // 13. Test Google Sign-In
  r = await mf.dispatchFetch('http://academy.test/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login-google', email: 'aluno.google@br3academy.com.br', name: 'Aluno Google' }),
  });
  assert.equal(r.status, 200);
  j = await r.json();
  assert.equal(j.ok, true);
  assert.equal(j.user.provider, 'google');

  // 14. Admin deletes a user via action: admin-user-delete
  r = await mf.dispatchFetch('http://academy.test/api/academy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: adminCookie },
    body: JSON.stringify({ action: 'admin-user-delete', userId: createdUserId }),
  });
  assert.equal(r.status, 200);

  // Deleted user cannot log in
  r = await mf.dispatchFetch('http://academy.test/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login-password', login: 'carlos.aluno', password: 'novaSenha456' }),
  });
  assert.ok([400, 401].includes(r.status));

  // 15. Signout endpoint
  r = await mf.dispatchFetch('http://academy.test/api/auth/signout?return_to=/', {
    redirect: 'manual',
  });
  assert.equal(r.status, 302);
  assert.equal(r.headers.get('location'), '/');
  assert.ok(r.headers.get('set-cookie').includes('Max-Age=0'));

  console.log('ALL AUTH & USER MANAGEMENT TESTS PASSED: username/password auth, admin user creation, role toggling, status deactivation, password reset, deletion, and Google login!');
} finally {
  await mf.dispose();
}

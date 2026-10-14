import { db, errorResponse } from '../../../lib/server';
import { hashPassword, generateSalt, verifyPassword } from '../../../lib/auth-util';

export const dynamic = 'force-dynamic';

async function ensureCredentialsTable() {
  try {
    await db().prepare(`
      CREATE TABLE IF NOT EXISTS user_credentials (
        user_id text PRIMARY KEY NOT NULL,
        username text NOT NULL,
        password_hash text NOT NULL,
        salt text NOT NULL,
        role text DEFAULT 'student' NOT NULL,
        status text DEFAULT 'active' NOT NULL,
        created text NOT NULL,
        updated text NOT NULL
      )
    `).run();
    await db().prepare(`
      CREATE UNIQUE INDEX IF NOT EXISTS user_credentials_username_idx ON user_credentials (username)
    `).run();
  } catch {
    // Ignore if already created
  }
}

export async function POST(request: Request) {
  try {
    await ensureCredentialsTable();
    const raw = await request.text();
    const body = JSON.parse(raw);
    const action = body.action;

    // Login with registered username/email and password
    if (action === 'login-password') {
      const login = String(body.login || '').trim();
      const password = String(body.password || '');

      if (!login) {
        throw new Error('Informe seu usuário ou e-mail cadastrado.');
      }
      if (!password) {
        throw new Error('Informe sua senha de acesso.');
      }

      // Check if user exists in credentials
      let cred: any = await db()
        .prepare(`
          SELECT u.id, u.name, u.email, c.username, c.password_hash, c.salt, c.role, c.status
          FROM user_credentials c
          JOIN users u ON u.id = c.user_id
          WHERE LOWER(c.username) = LOWER(?) OR LOWER(u.email) = LOWER(?)
        `)
        .bind(login, login)
        .first();

      // If database has 0 users in user_credentials, check if we should bootstrap initial admin
      if (!cred) {
        const countRow: any = await db().prepare('SELECT COUNT(*) as count FROM user_credentials').first().catch(() => ({ count: 0 }));
        if (!countRow || countRow.count === 0) {
          // If fresh system, allow bootstrap with admin/admin or initial admin credentials
          const isInitialAdmin = login.toLowerCase() === 'admin' || login.toLowerCase() === 'thiago@br3academy.com.br';
          if (isInitialAdmin) {
            const userId = 'usr_admin_' + crypto.randomUUID().slice(0, 8);
            const salt = generateSalt();
            const passwordHash = await hashPassword(password || 'admin123', salt);
            const now = new Date().toISOString();

            await db().batch([
              db().prepare('INSERT INTO users(id, name, email, created) VALUES(?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, email=excluded.email').bind(userId, 'Administrador BR3', 'admin@br3academy.com.br', now),
              db().prepare('INSERT OR REPLACE INTO user_credentials(user_id, username, password_hash, salt, role, status, created, updated) VALUES(?, ?, ?, ?, ?, ?, ?, ?)').bind(userId, 'admin', passwordHash, salt, 'admin', 'active', now, now),
              db().prepare('INSERT OR IGNORE INTO owner(id, user_id) VALUES(1, ?)').bind(userId),
            ]);

            const sessionUser = {
              userId,
              displayName: 'Administrador BR3',
              email: 'admin@br3academy.com.br',
              fullName: 'Administrador BR3',
              role: 'admin',
              provider: 'password',
            };

            const cookieValue = encodeURIComponent(JSON.stringify(sessionUser));
            return new Response(JSON.stringify({ ok: true, user: sessionUser, bootstrapped: true }), {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': `br3_session=${cookieValue}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`,
              },
            });
          }
        }

        // If not found in user_credentials, check if user exists in users table without password
        const existingInUsers: any = await db()
          .prepare('SELECT id, name, email FROM users WHERE LOWER(email) = LOWER(?)')
          .bind(login)
          .first();

        if (existingInUsers) {
          throw new Error('Esta conta não possui senha cadastrada. Solicite ao administrador a definição de sua senha.');
        }

        throw new Error('Usuário ou senha incorretos. Verifique suas credenciais.');
      }

      // Check if user is disabled
      if (cred.status === 'disabled') {
        throw new Error('Este acesso está desativado pelo administrador.');
      }

      // Verify password
      const isValid = await verifyPassword(password, cred.salt, cred.password_hash);
      if (!isValid) {
        throw new Error('Usuário ou senha incorretos. Verifique suas credenciais.');
      }

      const sessionUser = {
        userId: cred.id,
        displayName: cred.name || cred.username,
        email: cred.email,
        fullName: cred.name,
        role: cred.role || 'student',
        provider: 'password',
      };

      const cookieValue = encodeURIComponent(JSON.stringify(sessionUser));
      return new Response(JSON.stringify({ ok: true, user: sessionUser }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `br3_session=${cookieValue}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`,
        },
      });
    }

    // Google Sign-In
    if (action === 'login-google') {
      const email = String(body.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        throw new Error('Conta Google inválida ou e-mail não informado.');
      }
      const name = String(body.name || '').trim() || email.split('@')[0];

      // Check if existing user has this email
      const existing: any = await db()
        .prepare('SELECT id, name, email FROM users WHERE LOWER(email) = LOWER(?)')
        .bind(email)
        .first();

      let cred: any = null;
      if (existing) {
        cred = await db()
          .prepare('SELECT role, status FROM user_credentials WHERE user_id=?')
          .bind(existing.id)
          .first();

        if (cred && cred.status === 'disabled') {
          throw new Error('Este acesso está desativado pelo administrador.');
        }
      }

      const userId = existing
        ? existing.id
        : 'g_' + (body.googleId ? String(body.googleId).replace(/[^a-zA-Z0-9_-]/g, '') : crypto.randomUUID().slice(0, 10));

      const sessionUser = {
        userId,
        displayName: existing ? (existing.name || name) : name,
        email,
        fullName: name,
        role: cred?.role || 'student',
        provider: 'google',
      };

      const cookieValue = encodeURIComponent(JSON.stringify(sessionUser));
      return new Response(JSON.stringify({ ok: true, user: sessionUser }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `br3_session=${cookieValue}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`,
        },
      });
    }

    // Logout
    if (action === 'logout') {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': 'br3_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
        },
      });
    }

    throw new Error('Ação não suportada.');
  } catch (e) {
    return errorResponse(e);
  }
}

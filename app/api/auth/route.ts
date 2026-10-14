import { db, errorResponse } from '../../../lib/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    const body = JSON.parse(raw);
    const action = body.action;

    if (action === 'login-email') {
      const email = String(body.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        throw new Error('Informe um e-mail válido.');
      }

      // Check if user exists in the database
      const existing: any = await db()
        .prepare('SELECT id, name, email FROM users WHERE LOWER(email) = LOWER(?)')
        .bind(email)
        .first();

      if (existing) {
        const sessionUser = {
          userId: existing.id,
          displayName: existing.name || existing.email.split('@')[0],
          email: existing.email,
          fullName: existing.name || null,
          provider: 'email',
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

      // If database has 0 users, allow the first email to register as initial owner
      const countRow: any = await db()
        .prepare('SELECT COUNT(*) as count FROM users')
        .first();

      if (!countRow || countRow.count === 0) {
        const userId = 'usr_' + crypto.randomUUID().slice(0, 10);
        const name = body.name ? String(body.name).trim() : email.split('@')[0];
        const sessionUser = {
          userId,
          displayName: name,
          email,
          fullName: name,
          provider: 'email',
        };

        const cookieValue = encodeURIComponent(JSON.stringify(sessionUser));
        return new Response(JSON.stringify({ ok: true, user: sessionUser, initial: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `br3_session=${cookieValue}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`,
          },
        });
      }

      return new Response(
        JSON.stringify({
          error: 'E-mail não encontrado entre os alunos cadastrados. Verifique se digitou o e-mail cadastrado ou faça seu primeiro acesso.',
          notRegistered: true,
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'register-email') {
      const email = String(body.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        throw new Error('Informe um e-mail válido.');
      }
      const rawName = String(body.name || '').trim();
      const displayName = rawName || email.split('@')[0];

      // Check if already registered
      const existing: any = await db()
        .prepare('SELECT id, name, email FROM users WHERE LOWER(email) = LOWER(?)')
        .bind(email)
        .first();

      const userId = existing ? existing.id : 'usr_' + crypto.randomUUID().slice(0, 10);

      const sessionUser = {
        userId,
        displayName: existing ? (existing.name || displayName) : displayName,
        email,
        fullName: displayName,
        provider: 'email',
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

      const userId = existing
        ? existing.id
        : 'g_' + (body.googleId ? String(body.googleId).replace(/[^a-zA-Z0-9_-]/g, '') : crypto.randomUUID().slice(0, 10));

      const sessionUser = {
        userId,
        displayName: existing ? (existing.name || name) : name,
        email,
        fullName: name,
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

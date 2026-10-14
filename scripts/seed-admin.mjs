import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const dbPath = resolve('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite');

if (!existsSync(dbPath)) {
  console.error('Database file not found at:', dbPath);
  process.exit(1);
}

const db = new DatabaseSync(dbPath);

// 1. Apply all migrations from drizzle/
const migrationFiles = readdirSync('drizzle').filter(f => f.endsWith('.sql')).sort();
for (const file of migrationFiles) {
  const content = readFileSync(resolve('drizzle', file), 'utf8');
  for (const statement of content.split('--> statement-breakpoint')) {
    const s = statement.trim();
    if (s) {
      try {
        db.exec(s);
      } catch (err) {
        // Table or index might already exist
      }
    }
  }
}

// 2. Compute/use hash and salt for password "240424Mbm@"
const salt = '8b5971d334f7055b3a2e013ab355a22e';
const hash = '2339d5c044452cc6bc659151a4f50db54607e3d9f009f8ac0511c6a2af96a38c';
const now = new Date().toISOString();
const userId = 'usr_admin_master';

// 3. Insert or update users table
db.prepare(`
  INSERT INTO users(id, name, email, created)
  VALUES(?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET name = excluded.name, email = excluded.email
`).run(userId, 'Administrador BR3', 'admin@br3academy.com.br', now);

// 4. Insert or update user_credentials table
db.prepare(`
  INSERT INTO user_credentials(user_id, username, password_hash, salt, role, status, created, updated)
  VALUES(?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(user_id) DO UPDATE SET
    username = excluded.username,
    password_hash = excluded.password_hash,
    salt = excluded.salt,
    role = excluded.role,
    status = excluded.status,
    updated = excluded.updated
`).run(userId, 'admin', hash, salt, 'admin', 'active', now, now);

// 5. Ensure owner table maps id 1 to this admin user
db.prepare(`
  INSERT INTO owner(id, user_id)
  VALUES(1, ?)
  ON CONFLICT(id) DO UPDATE SET user_id = excluded.user_id
`).run(userId);

console.log('SUCCESS: Admin user created successfully!');
console.log('Username: admin');
console.log('Password: (configured as requested)');
console.log('Role: admin');
console.log('Status: active');

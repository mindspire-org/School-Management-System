import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Roles that can be created by admin/owner (admin creation is restricted by controllers/routes)
export const ALLOWED_USER_ROLES = ['student', 'teacher', 'driver', 'parent', 'admin'];

// Normalize Pakistan WhatsApp numbers to +92 format for consistent login identifiers
const normalizePkPhone = (raw) => {
  if (!raw) return raw;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('92')) return `+${digits}`;
  if (digits.startsWith('0')) return `+92${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith('3')) return `+92${digits}`;
  return String(raw).startsWith('+') ? String(raw) : `+${digits}`;
};

export const findUserByEmail = async (email) => {
  const { rows } = await query('SELECT id, email, password_hash, role, name, campus_id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))', [email]);
  return rows[0] || null;
};

export const findUserByUsername = async (username) => {
  const { rows } = await query('SELECT id, username, email, password_hash, role, name, campus_id FROM users WHERE LOWER(TRIM(username)) = LOWER(TRIM($1))', [username]);
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const { rows } = await query('SELECT id, email, role, name, campus_id FROM users WHERE id = $1', [id]);
  return rows[0] || null;
};

// Create new user (admin only)
export const createUser = async ({ email, passwordHash, role = 'student', name, campusId }) => {
  // Validate role is in allowed list
  if (!ALLOWED_USER_ROLES.includes(role)) {
    throw new Error(`Invalid role: ${role}. Allowed roles are: ${ALLOWED_USER_ROLES.join(', ')}`);
  }
  const { rows } = await query(
    'INSERT INTO users (email, password_hash, role, name, campus_id) VALUES ($1,$2,$3,$4,$5) RETURNING id, email, role, name, campus_id',
    [email, passwordHash, role, name || email, campusId]
  );
  return rows[0];
};

export const updateUser = async (id, updates) => {
  const { name, email, role, passwordHash, active } = updates;
  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
  if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email); }
  if (role !== undefined) {
    if (!ALLOWED_USER_ROLES.includes(role)) throw new Error(`Invalid role`);
    fields.push(`role = $${idx++}`); values.push(role);
  }
  if (passwordHash !== undefined) { fields.push(`password_hash = $${idx++}`); values.push(passwordHash); }
  // if (active !== undefined) { fields.push(`active = $${idx++}`); values.push(active); } // Active status column not in users table yet, skipping for now unless added

  if (fields.length === 0) return null;

  values.push(id);
  const { rows } = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, email, role, name`,
    values
  );
  return rows[0];
};

export const deleteUser = async (id) => {
  const { rowCount } = await query('DELETE FROM users WHERE id = $1', [id]);
  return rowCount > 0;
};

export const createUserWith = async ({ email = null, username = null, passwordHash, role = 'student', name, campusId }) => {
  // Validate role is in allowed list
  if (!ALLOWED_USER_ROLES.includes(role)) {
    throw new Error(`Invalid role: ${role}. Allowed roles are: ${ALLOWED_USER_ROLES.join(', ')}`);
  }
  const columns = ['password_hash', 'role', 'name', 'campus_id'];
  const values = [passwordHash, role, name || email || username, campusId];
  if (email !== null && email !== undefined) { columns.unshift('email'); values.unshift(email); }
  if (username !== null && username !== undefined) { columns.unshift('username'); values.unshift(username); }
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(',');
  const { rows } = await query(`INSERT INTO users (${columns.join(',')}) VALUES (${placeholders}) RETURNING id, username, email, role, name, campus_id`, values);
  return rows[0];
};

const toSlug = (s) => String(s || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 24);

export const generateUniqueUsername = async ({ base, role }) => {
  const prefix = role === 'teacher' ? 't' : role === 'student' ? 's' : role === 'driver' ? 'd' : 'u';
  const root = [prefix, toSlug(base)].filter(Boolean).join('-') || `${prefix}`;
  let candidate = root;
  let i = 0;
  // Try plain, then with numeric suffixes
  while (true) {
    const { rows } = await query('SELECT 1 FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1', [candidate]);
    if (!rows.length) return candidate;
    i += 1;
    candidate = `${root}${i}`;
  }
};

export const generateRandomPassword = (length = 12) => {
  const buf = crypto.randomBytes(Math.max(8, length));
  return buf.toString('base64').replace(/[^A-Za-z0-9]/g, '').slice(0, length);
};

export const listUsers = async () => {
  const { rows } = await query('SELECT id, email, role, name FROM users ORDER BY id ASC');
  return rows;
};

export const backfillUsersFromDomain = async (role) => {
  let domainSql;
  if (role === 'teacher') {
    domainSql = `SELECT name, email FROM teachers WHERE email IS NOT NULL AND email <> ''
                 AND NOT EXISTS (SELECT 1 FROM users u WHERE LOWER(u.email) = LOWER(teachers.email))`;
  } else if (role === 'student') {
    domainSql = `SELECT name, email FROM students WHERE email IS NOT NULL AND email <> ''
                 AND NOT EXISTS (SELECT 1 FROM users u WHERE LOWER(u.email) = LOWER(students.email))`;
  } else if (role === 'driver') {
    domainSql = `SELECT name, email FROM drivers WHERE email IS NOT NULL AND email <> ''
                 AND NOT EXISTS (SELECT 1 FROM users u WHERE LOWER(u.email) = LOWER(drivers.email))`;
  } else {
    return { created: 0, items: [] };
  }

  const { rows } = await query(domainSql);
  if (!rows.length) return { created: 0, items: [] };

  const tempPass = Math.random().toString(36).slice(2) + 'A!9';
  const passwordHash = await bcrypt.hash(tempPass, 10);

  const created = [];
  for (const r of rows) {
    const name = r.name || r.email;
    const email = r.email;
    const { rows: ins } = await query(
      'INSERT INTO users (email, password_hash, role, name) VALUES ($1,$2,$3,$4) RETURNING id, email, role, name',
      [email, passwordHash, role, name]
    );
    if (ins[0]) created.push(ins[0]);
  }

  return { created: created.length, items: created };
};

export const ensureOwnerUser = async ({ email, password, name }) => {
  const { rows } = await query('SELECT id, role, password_hash FROM users WHERE LOWER(email) = LOWER($1)', [email]);
  if (rows[0]) {
    const id = rows[0].id;
    if (rows[0].role !== 'owner') {
      await query('UPDATE users SET role = $2 WHERE id = $1', [id, 'owner']);
    }
    // Ensure password matches desired initial owner password
    let shouldReset = false;
    try {
      const hash = rows[0].password_hash;
      if (!hash) {
        shouldReset = true;
      } else {
        const ok = await bcrypt.compare(password, hash);
        if (!ok) shouldReset = true;
      }
    } catch (_) {
      shouldReset = true;
    }
    if (shouldReset) {
      const newHash = await bcrypt.hash(password, 10);
      await query('UPDATE users SET password_hash = $2 WHERE id = $1', [id, newHash]);
    }
    return { id };
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const ins = await query(
    'INSERT INTO users (email, password_hash, role, name) VALUES ($1,$2,$3,$4) RETURNING id',
    [email, passwordHash, 'owner', name || email]
  );
  return { id: ins.rows[0]?.id };
};

export const findParentByPhone = async (phone) => {
  const p = normalizePkPhone(phone);
  // Try exact and space-stripped match
  const { rows } = await query(
    `SELECT id, family_number, primary_name, father_name, mother_name, whatsapp_phone
     FROM parents
     WHERE REPLACE(COALESCE(whatsapp_phone,''), ' ', '') = REPLACE($1, ' ', '')
        OR COALESCE(whatsapp_phone,'') = $1
     LIMIT 1`,
    [p]
  );
  return rows[0] || null;
};

export const ensureParentUserForPhone = async ({ phone, password, name }) => {
  const emailLike = normalizePkPhone(phone);
  const existing = await findUserByEmail(emailLike);
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await query(
    'INSERT INTO users (email, password_hash, role, name) VALUES ($1,$2,$3,$4) RETURNING id, email, role, name, password_hash',
    [emailLike, passwordHash, 'parent', name || emailLike]
  );
  return rows[0] || null;
};

// Create or update a parent user for a given phone, always setting the provided password
export const upsertParentUserForPhone = async ({ phone, password, name }) => {
  const emailLike = normalizePkPhone(phone);
  const existing = await findUserByEmail(emailLike);
  const passwordHash = await bcrypt.hash(password, 10);
  if (existing) {
    await query('UPDATE users SET password_hash = $2, role = $3, name = COALESCE($4, name) WHERE id = $1', [existing.id, passwordHash, 'parent', name || null]);
    return { ...existing, email: emailLike, role: 'parent', name: name || existing.name };
  }
  const { rows } = await query(
    'INSERT INTO users (email, password_hash, role, name) VALUES ($1,$2,$3,$4) RETURNING id, email, role, name, password_hash',
    [emailLike, passwordHash, 'parent', name || emailLike]
  );
  return rows[0] || null;
};

import { query } from '../config/db.js';

const genFamilyNumber = async () => {
  const make = () => Math.random().toString(36).slice(2, 10).toUpperCase();
  for (let i = 0; i < 5; i++) {
    const code = make();
    const { rows } = await query('SELECT 1 FROM parents WHERE family_number = $1', [code]);
    if (!rows[0]) return code;
  }
  return `FAM${Date.now().toString(36).toUpperCase()}`;
};

// Backfill parents table from existing students who have a family_number
export const backfillFromStudents = async () => {
  const sql = `
    -- 1) If student has familyNumber in JSON but column is NULL, copy it over
    UPDATE students s
    SET family_number = NULLIF(s.parent ->> 'familyNumber', '')
    WHERE (s.family_number IS NULL OR s.family_number = '')
      AND NULLIF(s.parent ->> 'familyNumber', '') IS NOT NULL;

    -- 2) Insert missing parents from students with a family_number
    WITH fam AS (
      SELECT DISTINCT ON (s.family_number)
             s.family_number,
             s.parent_name,
             s.parent_phone,
             s.email AS student_email,
             s.name AS student_name,
             s.parent
      FROM students s
      WHERE s.family_number IS NOT NULL AND s.family_number <> ''
      ORDER BY s.family_number, s.id DESC
    )
    INSERT INTO parents (family_number, primary_name, father_name, mother_name, whatsapp_phone, email, address)
    SELECT f.family_number,
           COALESCE(
             (f.parent -> 'father' ->> 'name'),
             (f.parent -> 'mother' ->> 'name'),
             f.parent_name,
             f.student_name
           ) AS primary_name,
           (f.parent -> 'father' ->> 'name') AS father_name,
           (f.parent -> 'mother' ->> 'name') AS mother_name,
           COALESCE(
             (f.parent -> 'father' ->> 'phone'),
             (f.parent -> 'mother' ->> 'phone'),
             f.parent_phone
           ) AS whatsapp_phone,
           COALESCE(
             (f.parent -> 'father' ->> 'email'),
             (f.parent -> 'mother' ->> 'email'),
             f.student_email
           ) AS email,
           (f.parent ->> 'address') AS address
    FROM fam f
    WHERE NOT EXISTS (
      SELECT 1 FROM parents p WHERE p.family_number = f.family_number
    );
  `;
  const res = await query(sql);
  // rowCount may not reflect both UPDATE and INSERT; return success true
  return { ok: true };
};

export const list = async ({ q, page = 1, pageSize = 50, campusId }) => {
  const where = [];
  const params = [];
  if (q) {
    params.push(`%${String(q).toLowerCase()}%`);
    where.push(`(LOWER(primary_name) LIKE $${params.length} OR LOWER(father_name) LIKE $${params.length} OR LOWER(mother_name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(family_number) LIKE $${params.length})`);
  }
  if (campusId) {
    params.push(campusId);
    where.push(`p.campus_id = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(pageSize);
  const countRes = await query(`SELECT COUNT(*)::int AS count FROM parents p ${whereSql}`, params);
  const total = countRes.rows[0]?.count || 0;
  const dataRes = await query(
    `SELECT p.id, p.family_number AS "familyNumber", p.primary_name AS "primaryName", p.father_name AS "fatherName", p.mother_name AS "motherName",
            p.whatsapp_phone AS "whatsappPhone", p.email, p.address,
            (SELECT COUNT(1)::int FROM students s WHERE s.family_number = p.family_number) AS "childrenCount"
     FROM parents p ${whereSql}
     ORDER BY p.id DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pageSize, offset]
  );
  return { rows: dataRes.rows, total, page: Number(page), pageSize: Number(pageSize) };
};

export const getById = async (id) => {
  const { rows } = await query(
    'SELECT id, family_number AS "familyNumber", primary_name AS "primaryName", father_name AS "fatherName", mother_name AS "motherName", whatsapp_phone AS "whatsappPhone", email, address FROM parents WHERE id = $1',
    [id]
  );
  const parent = rows[0];
  if (!parent) return null;
  const kidsRes = await query(
    'SELECT id, name, class, section, roll_number AS "rollNumber" FROM students WHERE family_number = $1 ORDER BY id DESC',
    [parent.familyNumber]
  );
  parent.children = kidsRes.rows;
  return parent;
};

export const ensureByFamilyNumber = async (data) => {
  const fam = (data.familyNumber || '').trim();
  if (!fam) {
    const generated = await genFamilyNumber();
    const { rows } = await query(
      'INSERT INTO parents (family_number, primary_name, father_name, mother_name, whatsapp_phone, email, address, campus_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, family_number AS "familyNumber"',
      [generated, data.primaryName || null, data.fatherName || null, data.motherName || null, data.whatsappPhone || null, data.email || null, data.address || null, data.campusId || null]
    );
    return rows[0];
  }
  const { rows } = await query('SELECT id, family_number AS "familyNumber" FROM parents WHERE family_number = $1', [fam]);
  if (rows[0]) return rows[0];
  const ins = await query(
    'INSERT INTO parents (family_number, primary_name, father_name, mother_name, whatsapp_phone, email, address, campus_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, family_number AS "familyNumber"',
    [fam, data.primaryName || null, data.fatherName || null, data.motherName || null, data.whatsappPhone || null, data.email || null, data.address || null, data.campusId || null]
  );
  return ins.rows[0];
};

export const create = async (data) => {
  const fam = data.familyNumber || (await genFamilyNumber());
  const { rows } = await query(
    `INSERT INTO parents (family_number, primary_name, father_name, mother_name, whatsapp_phone, email, address, campus_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (family_number) DO UPDATE SET primary_name = COALESCE(EXCLUDED.primary_name, parents.primary_name),
       father_name = COALESCE(EXCLUDED.father_name, parents.father_name),
       mother_name = COALESCE(EXCLUDED.mother_name, parents.mother_name),
       whatsapp_phone = COALESCE(EXCLUDED.whatsapp_phone, parents.whatsapp_phone),
       email = COALESCE(EXCLUDED.email, parents.email),
       address = COALESCE(EXCLUDED.address, parents.address)
     RETURNING id, family_number AS "familyNumber"`,
    [fam, data.primaryName || null, data.fatherName || null, data.motherName || null, data.whatsappPhone || null, data.email || null, data.address || null, data.campusId || null]
  );

  const parent = rows[0];

  // Link students if roll numbers are provided
  if (data.studentRollNumbers) {
    const rollNumbers = data.studentRollNumbers.split(',').map(s => s.trim()).filter(Boolean);
    if (rollNumbers.length > 0) {
      await query(
        `UPDATE students SET family_number = $1 WHERE roll_number = ANY($2)`,
        [fam, rollNumbers]
      );
    }
  }

  return parent;
};

export const getByUserId = async (userId) => {
  const { rows } = await query(
    'SELECT id, family_number AS "familyNumber", primary_name AS "primaryName", email FROM parents WHERE user_id = $1',
    [userId]
  );
  return rows[0];
};

export const update = async (id, data) => {
  const fields = [];
  const values = [];
  const map = {
    primaryName: 'primary_name', fatherName: 'father_name', motherName: 'mother_name', whatsappPhone: 'whatsapp_phone', email: 'email', address: 'address', campusId: 'campus_id'
  };
  Object.entries(data || {}).forEach(([k, v]) => {
    if (map[k]) { values.push(v); fields.push(`${map[k]} = $${values.length}`); }
  });
  if (!fields.length && !data.studentRollNumbers) return await getById(id);

  if (fields.length) {
    values.push(id);
    await query(`UPDATE parents SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
  }

  // Handle student linking/re-linking
  if (data.studentRollNumbers !== undefined) {
    const { family_number } = (await query('SELECT family_number FROM parents WHERE id = $1', [id])).rows[0];

    // First, clear existing links for this family number (optional, depending on business logic)
    // For now, let's keep it additive or just apply the new list
    const rollNumbers = data.studentRollNumbers.split(',').map(s => s.trim()).filter(Boolean);

    if (rollNumbers.length > 0) {
      await query(
        `UPDATE students SET family_number = $1 WHERE roll_number = ANY($2)`,
        [family_number, rollNumbers]
      );
    }
  }

  return await getById(id);
};

export const findByFamilyNumber = async (familyNumber) => {
  const { rows } = await query('SELECT id, family_number AS "familyNumber", primary_name AS "primaryName", whatsapp_phone AS "whatsappPhone" FROM parents WHERE family_number = $1', [familyNumber]);
  return rows[0] || null;
};
export const remove = async (id) => {
  const { rowCount } = await query('DELETE FROM parents WHERE id = $1', [id]);
  return rowCount > 0;
};

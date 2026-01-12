import { query } from '../config/db.js';

export const listSchemes = async (campusId) => {
  const { rows } = await query(
    `SELECT id, name, academic_year AS "academicYear", bands, is_default AS "isDefault",
            created_by AS "createdBy", created_at AS "createdAt", updated_at AS "updatedAt",
            campus_id AS "campusId"
       FROM grading_schemes
      WHERE ($1::int IS NULL OR campus_id = $1::int)
      ORDER BY (is_default DESC), updated_at DESC`,
    [campusId || null]
  );
  return rows;
};

export const getDefaultScheme = async (campusId) => {
  const { rows } = await query(
    `SELECT id, name, academic_year AS "academicYear", bands, is_default AS "isDefault",
            created_by AS "createdBy", created_at AS "createdAt", updated_at AS "updatedAt",
            campus_id AS "campusId"
       FROM grading_schemes
      WHERE is_default = TRUE AND ($1::int IS NULL OR campus_id = $1::int)
      ORDER BY updated_at DESC
      LIMIT 1`,
    [campusId || null]
  );
  return rows[0] || null;
};

export const getById = async (id) => {
  const { rows } = await query(
    `SELECT id, name, academic_year AS "academicYear", bands, is_default AS "isDefault",
            created_by AS "createdBy", created_at AS "createdAt", updated_at AS "updatedAt",
            campus_id AS "campusId"
       FROM grading_schemes
      WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const create = async ({ name, academicYear, bands, isDefault, userId, campusId }) => {
  const { rows } = await query(
    `INSERT INTO grading_schemes (name, academic_year, bands, is_default, created_by, campus_id)
     VALUES ($1, $2, $3::jsonb, COALESCE($4, FALSE), $5, $6)
     RETURNING id, name, academic_year AS "academicYear", bands, is_default AS "isDefault",
               created_by AS "createdBy", created_at AS "createdAt", updated_at AS "updatedAt",
               campus_id AS "campusId"`,
    [name || 'Default', academicYear || '', JSON.stringify(bands || {}), isDefault === true, userId || null, campusId || null]
  );
  if (rows[0]?.isDefault) {
    await setDefault(rows[0].id);
  }
  return rows[0];
};

export const update = async (id, { name, academicYear, bands, isDefault }) => {
  const fields = [];
  const params = [];
  if (name !== undefined) { params.push(name); fields.push(`name = $${params.length}`); }
  if (academicYear !== undefined) { params.push(academicYear); fields.push(`academic_year = $${params.length}`); }
  if (bands !== undefined) { params.push(JSON.stringify(bands)); fields.push(`bands = $${params.length}::jsonb`); }
  if (isDefault !== undefined) { params.push(!!isDefault); fields.push(`is_default = $${params.length}`); }
  if (!fields.length) return getById(id);
  params.push(id);
  const { rows } = await query(
    `UPDATE grading_schemes SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${params.length}
      RETURNING id, name, academic_year AS "academicYear", bands, is_default AS "isDefault",
                created_by AS "createdBy", created_at AS "createdAt", updated_at AS "updatedAt"`,
    params
  );
  if (rows[0]?.isDefault) {
    await setDefault(rows[0].id);
  }
  return rows[0] || null;
};

export const setDefault = async (id) => {
  await query(`UPDATE grading_schemes SET is_default = FALSE WHERE id <> $1`, [id]);
  await query(`UPDATE grading_schemes SET is_default = TRUE, updated_at = NOW() WHERE id = $1`, [id]);
  return getById(id);
};

export const computeGrade = (percentage, bands = {}) => {
  const entries = Object.entries(bands || {}).map(([k, v]) => [k, Number(v) || 0]);
  entries.sort((a, b) => b[1] - a[1]);
  for (const [grade, min] of entries) {
    if (percentage >= min) return grade;
  }
  return 'F';
};

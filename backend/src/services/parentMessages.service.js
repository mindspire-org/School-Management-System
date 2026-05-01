import { query } from '../config/db.js';
import { ensureParentMessagesSchema } from '../db/autoMigrate.js';

export const listByParent = async ({ parentId, page = 1, pageSize = 50 }) => {
  await ensureParentMessagesSchema();
  const offset = (Number(page) - 1) * Number(pageSize);
  const { rows } = await query(
    `SELECT id, parent_id AS "parentId", child_id AS "childId",
            to_phone AS "to", from_phone AS "from",
            channel, direction, body, status, created_at AS "createdAt", campus_id AS "campusId"
       FROM parent_messages
      WHERE parent_id = $1
      ORDER BY created_at ASC, id ASC
      LIMIT $2 OFFSET $3`,
    [Number(parentId), Number(pageSize), Number(offset)]
  );
  return rows;
};

export const create = async ({ parentId, childId, to, from, channel, direction, body, status, campusId }) => {
  await ensureParentMessagesSchema();
  const { rows } = await query(
    `INSERT INTO parent_messages (parent_id, child_id, to_phone, from_phone, channel, direction, body, status, campus_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id, parent_id AS "parentId", child_id AS "childId",
               to_phone AS "to", from_phone AS "from",
               channel, direction, body, status, created_at AS "createdAt", campus_id AS "campusId"`,
    [Number(parentId), childId ? Number(childId) : null, to || null, from || null, channel || null, direction, body, status || null, campusId || null]
  );
  return rows[0];
};


import { query } from '../config/db.js';

// Ensure extended columns exist on buses table (idempotent)
const ensureBusExtendedColumns = async () => {
  await query('ALTER TABLE IF EXISTS buses ADD COLUMN IF NOT EXISTS plate TEXT');
  await query('ALTER TABLE IF EXISTS buses ADD COLUMN IF NOT EXISTS capacity INTEGER');
  await query('ALTER TABLE IF EXISTS buses ADD COLUMN IF NOT EXISTS last_service DATE');
  await query('ALTER TABLE IF EXISTS buses ADD COLUMN IF NOT EXISTS campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL');
};

// Ensure extended columns exist on routes table (idempotent)
const ensureRoutesExtendedColumns = async () => {
  // Use non-reserved column names and alias them in queries to match frontend
  await query('ALTER TABLE IF EXISTS routes ADD COLUMN IF NOT EXISTS start_location TEXT');
  await query('ALTER TABLE IF EXISTS routes ADD COLUMN IF NOT EXISTS end_location TEXT');
  await query('ALTER TABLE IF EXISTS routes ADD COLUMN IF NOT EXISTS campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL');
};

// Buses
export const listBuses = async (campusId) => {
  await ensureBusExtendedColumns();
  const { rows } = await query(`
    SELECT b.id,
           b.number,
           b.driver_name AS "driverName",
           b.status,
           b.plate,
           b.capacity,
           b.last_service AS "lastService",
           ba.route_id AS "routeId",
           r.name AS "routeName",
           (SELECT COUNT(*)::int FROM student_transport st WHERE st.bus_id = b.id) AS occupancy
    FROM buses b
    LEFT JOIN bus_assignments ba ON ba.bus_id = b.id
    LEFT JOIN routes r ON r.id = ba.route_id
    WHERE ($1::int IS NULL OR b.campus_id = $1::int)
    ORDER BY b.number ASC
  `, [campusId || null]);
  return rows;
};

export const getBusById = async (id) => {
  await ensureBusExtendedColumns();
  const { rows } = await query(`
    SELECT b.id,
           b.number,
           b.driver_name AS "driverName",
           b.status,
           b.plate,
           b.capacity,
           b.last_service AS "lastService",
           ba.route_id AS "routeId",
           r.name AS "routeName",
           (SELECT COUNT(*)::int FROM student_transport st WHERE st.bus_id = b.id) AS occupancy
    FROM buses b
    LEFT JOIN bus_assignments ba ON ba.bus_id = b.id
    LEFT JOIN routes r ON r.id = ba.route_id
    WHERE b.id = $1
  `, [id]);
  return rows[0] || null;
};

export const createBus = async ({ number, driverName, status, plate, capacity, lastService, routeId, campusId }) => {
  await ensureBusExtendedColumns();
  const { rows } = await query(
    'INSERT INTO buses (number, driver_name, status, plate, capacity, last_service, campus_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, number, driver_name AS "driverName", status, plate, capacity, last_service AS "lastService", campus_id AS "campusId"',
    [number, driverName || null, status || 'active', plate || null, typeof capacity === 'number' ? capacity : null, lastService || null, campusId || null]
  );
  const bus = rows[0];
  if (bus && routeId) {
    await query(
      'INSERT INTO bus_assignments (bus_id, route_id) VALUES ($1,$2) ON CONFLICT (bus_id) DO UPDATE SET route_id = EXCLUDED.route_id',
      [bus.id, routeId]
    );
  }
  return bus;
};

export const updateBus = async (id, { number, driverName, status, plate, capacity, lastService, routeId }) => {
  await ensureBusExtendedColumns();
  const { rows } = await query(
    'UPDATE buses SET number = COALESCE($2,number), driver_name = COALESCE($3,driver_name), status = COALESCE($4,status), plate = COALESCE($5,plate), capacity = COALESCE($6,capacity), last_service = COALESCE($7,last_service) WHERE id = $1 RETURNING id, number, driver_name AS "driverName", status, plate, capacity, last_service AS "lastService"',
    [id, number || null, driverName || null, status || null, plate || null, typeof capacity === 'number' ? capacity : null, lastService || null]
  );
  const bus = rows[0] || null;
  if (bus && routeId !== undefined) {
    if (routeId) {
      await query(
        'INSERT INTO bus_assignments (bus_id, route_id) VALUES ($1,$2) ON CONFLICT (bus_id) DO UPDATE SET route_id = EXCLUDED.route_id',
        [id, routeId]
      );
    } else {
      // Unassign route if routeId is falsy
      await query('DELETE FROM bus_assignments WHERE bus_id = $1', [id]);
    }
  }
  return bus;
};

export const deleteBus = async (id) => {
  await query('DELETE FROM buses WHERE id = $1', [id]);
  return true;
};

// Routes
export const listRoutes = async (campusId) => {
  await ensureRoutesExtendedColumns();
  const { rows } = await query(`
    SELECT r.id,
           r.name,
           r.start_location AS "start",
           r.end_location AS "end",
           (SELECT COUNT(*) FROM bus_assignments ba WHERE ba.route_id = r.id) AS "busesCount",
           (SELECT COUNT(*) FROM route_stops rs WHERE rs.route_id = r.id) AS "stopsCount"
    FROM routes r
    WHERE ($1::int IS NULL OR r.campus_id = $1::int)
    ORDER BY r.name ASC
  `, [campusId || null]);
  return rows;
};

export const getRouteById = async (id) => {
  await ensureRoutesExtendedColumns();
  const { rows } = await query('SELECT id, name, start_location AS "start", end_location AS "end" FROM routes WHERE id = $1', [id]);
  return rows[0] || null;
};

// Driver-specific: list the route assigned to the driver's bus via user_id
export const listRoutesForDriver = async (userId) => {
  await ensureRoutesExtendedColumns();
  const { rows } = await query(`
    SELECT r.id,
           r.name,
           r.start_location AS "start",
           r.end_location AS "end",
           (SELECT COUNT(*) FROM bus_assignments ba2 WHERE ba2.route_id = r.id) AS "busesCount",
           (SELECT COUNT(*) FROM route_stops rs WHERE rs.route_id = r.id) AS "stopsCount"
    FROM drivers d
    LEFT JOIN bus_assignments ba ON ba.bus_id = d.bus_id
    LEFT JOIN routes r ON r.id = ba.route_id
    WHERE d.user_id = $1
  `, [userId]);
  return rows.filter(Boolean);
};

export const createRoute = async ({ name, start, end, campusId }) => {
  await ensureRoutesExtendedColumns();
  const { rows } = await query('INSERT INTO routes (name, start_location, end_location, campus_id) VALUES ($1,$2,$3,$4) RETURNING id, name, start_location AS "start", end_location AS "end", campus_id AS "campusId"', [name, start || null, end || null, campusId || null]);
  return rows[0];
};

export const updateRoute = async (id, { name, start, end }) => {
  await ensureRoutesExtendedColumns();
  const { rows } = await query('UPDATE routes SET name = COALESCE($2,name), start_location = COALESCE($3,start_location), end_location = COALESCE($4,end_location) WHERE id = $1 RETURNING id, name, start_location AS "start", end_location AS "end"', [id, name || null, start || null, end || null]);
  return rows[0] || null;
};

export const deleteRoute = async (id) => {
  // Remove dependent records first to avoid FK violations
  await query('DELETE FROM bus_assignments WHERE route_id = $1', [id]);
  await query('DELETE FROM route_stops WHERE route_id = $1', [id]);
  // Null-out student transport route assignments that reference this route
  await query('UPDATE student_transport SET route_id = NULL WHERE route_id = $1', [id]);
  await query('DELETE FROM routes WHERE id = $1', [id]);
  return true;
};

// Route stops
export const listStops = async (routeId) => {
  const { rows } = await query(
    'SELECT id, route_id AS "routeId", name, latitude, longitude, sequence FROM route_stops WHERE route_id = $1 ORDER BY sequence ASC',
    [routeId]
  );
  return rows;
};

export const addStop = async (routeId, { name, latitude, longitude, sequence }) => {
  // If no sequence provided, place at the end
  let seq = sequence;
  if (seq === undefined || seq === null) {
    const { rows: maxRows } = await query('SELECT COALESCE(MAX(sequence), 0)+1 AS next FROM route_stops WHERE route_id = $1', [routeId]);
    seq = Number(maxRows[0]?.next || 1);
  }
  const { rows } = await query(
    'INSERT INTO route_stops (route_id, name, latitude, longitude, sequence) VALUES ($1,$2,$3,$4,$5) RETURNING id, route_id AS "routeId", name, latitude, longitude, sequence',
    [routeId, name, latitude || null, longitude || null, seq]
  );
  return rows[0];
};

export const updateStop = async (routeId, stopId, { name, latitude, longitude, sequence }) => {
  const { rows } = await query(
    'UPDATE route_stops SET name = COALESCE($3,name), latitude = COALESCE($4,latitude), longitude = COALESCE($5,longitude), sequence = COALESCE($6,sequence) WHERE id = $2 AND route_id = $1 RETURNING id, route_id AS "routeId", name, latitude, longitude, sequence',
    [routeId, stopId, name || null, latitude || null, longitude || null, sequence || null]
  );
  return rows[0] || null;
};

export const removeStop = async (routeId, stopId) => {
  await query('DELETE FROM route_stops WHERE id = $1 AND route_id = $2', [stopId, routeId]);
  return true;
};

// Assign bus to route
export const assignBusToRoute = async (busId, routeId) => {
  const { rows } = await query(
    'INSERT INTO bus_assignments (bus_id, route_id) VALUES ($1,$2) ON CONFLICT (bus_id) DO UPDATE SET route_id = EXCLUDED.route_id RETURNING id, bus_id AS "busId", route_id AS "routeId", assigned_at AS "assignedAt"',
    [busId, routeId]
  );
  return rows[0];
};

// Student transport
export const getStudentTransport = async (studentId) => {
  const { rows } = await query(
    'SELECT id, student_id AS "studentId", route_id AS "routeId", bus_id AS "busId", pickup_stop_id AS "pickupStopId", drop_stop_id AS "dropStopId" FROM student_transport WHERE student_id = $1',
    [studentId]
  );
  return rows[0] || null;
};

export const setStudentTransport = async (studentId, { routeId, busId, pickupStopId, dropStopId }) => {
  const { rows } = await query(
    `INSERT INTO student_transport (student_id, route_id, bus_id, pickup_stop_id, drop_stop_id)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (student_id) DO UPDATE SET route_id = EXCLUDED.route_id, bus_id = EXCLUDED.bus_id, pickup_stop_id = EXCLUDED.pickup_stop_id, drop_stop_id = EXCLUDED.drop_stop_id
     RETURNING id, student_id AS "studentId", route_id AS "routeId", bus_id AS "busId", pickup_stop_id AS "pickupStopId", drop_stop_id AS "dropStopId"`,
    [studentId, routeId || null, busId || null, pickupStopId || null, dropStopId || null]
  );
  return rows[0];
};

// Optimized list for assignment page
export const listStudentTransportEntries = async (campusId, { q, className, busId } = {}) => {
  const { rows } = await query(`
    SELECT s.id,
           s.name,
           s.roll_number AS "rollNumber",
           s.class,
           s.section,
           s.avatar,
           st.bus_id AS "busId",
           b.number AS "busNumber",
           st.route_id AS "routeId",
           r.name AS "routeName",
           st.pickup_stop_id AS "pickupStopId",
           st.drop_stop_id AS "dropStopId"
    FROM students s
    LEFT JOIN student_transport st ON st.student_id = s.id
    LEFT JOIN buses b ON b.id = st.bus_id
    LEFT JOIN routes r ON r.id = st.route_id
    WHERE ($1::int IS NULL OR s.campus_id = $1::int)
      AND ($2::text IS NULL OR (s.name ILIKE '%' || $2 || '%' OR s.roll_number ILIKE '%' || $2 || '%'))
      AND ($3::text IS NULL OR s.class = $3)
      AND ($4::int IS NULL OR st.bus_id = $4::int)
    ORDER BY s.class ASC, s.name ASC
    LIMIT 200
  `, [campusId || null, q || null, className || null, busId || null]);
  return rows;
};

// Transport Stats for dashboard cards
export const getTransportStats = async (campusId) => {
  const [busesRes, usersRes, rfidRes, routesRes] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM buses WHERE ($1::int IS NULL OR campus_id = $1::int)', [campusId || null]),
    query('SELECT COUNT(*)::int AS count FROM student_transport st JOIN students s ON s.id = st.student_id WHERE ($1::int IS NULL OR s.campus_id = $1::int)', [campusId || null]),
    query('SELECT COUNT(*)::int AS count FROM students WHERE rfid_tag IS NOT NULL AND rfid_tag != \'\' AND ($1::int IS NULL OR campus_id = $1::int)', [campusId || null]),
    query('SELECT COUNT(*)::int AS count FROM routes WHERE ($1::int IS NULL OR campus_id = $1::int)', [campusId || null]),
  ]);

  return {
    totalBuses: busesRes.rows[0]?.count || 0,
    busUsers: usersRes.rows[0]?.count || 0,
    activeRfid: rfidRes.rows[0]?.count || 0,
    totalRoutes: routesRes.rows[0]?.count || 0,
  };
};

import { query } from '../config/db.js';

// Check if driver has financial records
export const hasFinancialRecords = async (id) => {
  const { rows } = await query(`
    SELECT EXISTS(
      SELECT 1 FROM finance_invoices WHERE user_type = 'driver' AND user_id = $1
      UNION ALL
      SELECT 1 FROM driver_payrolls WHERE driver_id = $1
    ) as has_records
  `, [id]);
  return rows[0]?.has_records || false;
};

// List all drivers with optional filters
export const listDrivers = async ({ status, busId, page = 1, pageSize = 50, q, campusId }) => {
  const params = [];
  const where = [];
  if (status) { params.push(status); where.push(`d.status = $${params.length}`); }
  if (busId) { params.push(busId); where.push(`d.bus_id = $${params.length}`); }
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push(`(LOWER(d.name) LIKE $${params.length} OR LOWER(d.email) LIKE $${params.length} OR LOWER(d.license_number) LIKE $${params.length})`);
  }
  if (campusId) {
    params.push(campusId);
    where.push(`d.campus_id = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(pageSize);
  params.push(pageSize, offset);

  const { rows } = await query(`
    SELECT d.id, d.name, d.email, d.phone, d.license_number AS "licenseNumber",
           d.license_expiry AS "licenseExpiry", d.national_id AS "nationalId",
           d.address, d.bus_id AS "busId", b.number AS "busNumber",
           d.base_salary AS "baseSalary", d.allowances, d.deductions,
           d.payment_method AS "paymentMethod", d.bank_name AS "bankName",
           d.account_number AS "accountNumber", d.status, d.avatar,
           d.joining_date AS "joiningDate", d.created_at AS "createdAt"
    FROM drivers d
    LEFT JOIN buses b ON d.bus_id = b.id
    ${whereSql}
    ORDER BY d.name
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `, params);

  // Get total count
  const countParams = params.slice(0, params.length - 2);
  const { rows: countRows } = await query(`
    SELECT COUNT(*) as total FROM drivers d ${whereSql}
  `, countParams);

  return { items: rows, total: Number(countRows[0]?.total || 0) };
};

// Get driver by ID
export const getDriverById = async (id) => {
  const { rows } = await query(`
    SELECT d.id, d.name, d.email, d.phone, d.license_number AS "licenseNumber",
           d.license_expiry AS "licenseExpiry", d.national_id AS "nationalId",
           d.address, d.bus_id AS "busId", b.number AS "busNumber",
           d.base_salary AS "baseSalary", d.allowances, d.deductions,
           d.payment_method AS "paymentMethod", d.bank_name AS "bankName",
           d.account_number AS "accountNumber", d.status, d.avatar,
           d.joining_date AS "joiningDate", d.created_at AS "createdAt", d.updated_at AS "updatedAt"
    FROM drivers d
    LEFT JOIN buses b ON d.bus_id = b.id
    WHERE d.id = $1
  `, [id]);
  return rows[0] || null;
};

// Get driver by linked user id
export const getDriverByUserId = async (userId) => {
  const { rows } = await query(`
    SELECT d.id, d.name, d.email, d.phone, d.license_number AS "licenseNumber",
           d.license_expiry AS "licenseExpiry", d.national_id AS "nationalId",
           d.address, d.bus_id AS "busId", b.number AS "busNumber",
           d.base_salary AS "baseSalary", d.allowances, d.deductions,
           d.payment_method AS "paymentMethod", d.bank_name AS "bankName",
           d.account_number AS "accountNumber", d.status, d.avatar,
           d.joining_date AS "joiningDate", d.created_at AS "createdAt", d.updated_at AS "updatedAt"
    FROM drivers d
    LEFT JOIN buses b ON d.bus_id = b.id
    WHERE d.user_id = $1
  `, [userId]);
  return rows[0] || null;
};

// Create driver
export const createDriver = async (data) => {
  const {
    name, email, phone, licenseNumber, licenseExpiry, nationalId, address,
    busId, baseSalary, allowances, deductions, paymentMethod, bankName,
    accountNumber, status, avatar, joiningDate, userId, campusId
  } = data;

  const { rows } = await query(`
    INSERT INTO drivers (
      name, email, phone, license_number, license_expiry, national_id, address,
      bus_id, base_salary, allowances, deductions, payment_method, bank_name,
      account_number, status, avatar, joining_date, user_id, campus_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
    RETURNING id, name, email, phone, license_number AS "licenseNumber",
              license_expiry AS "licenseExpiry", national_id AS "nationalId",
              address, bus_id AS "busId", base_salary AS "baseSalary",
              allowances, deductions, payment_method AS "paymentMethod",
              bank_name AS "bankName", account_number AS "accountNumber",
              status, avatar, joining_date AS "joiningDate", created_at AS "createdAt",
              campus_id AS "campusId"
  `, [
    name, email || null, phone || null, licenseNumber || null, licenseExpiry || null,
    nationalId || null, address || null, busId || null, baseSalary || 0,
    allowances || 0, deductions || 0, paymentMethod || 'bank', bankName || null,
    accountNumber || null, status || 'active', avatar || null, joiningDate || null,
    userId || null, campusId || null
  ]);
  return rows[0];
};

// Update driver
export const updateDriver = async (id, data) => {
  const {
    name, email, phone, licenseNumber, licenseExpiry, nationalId, address,
    busId, baseSalary, allowances, deductions, paymentMethod, bankName,
    accountNumber, status, avatar, joiningDate, userId
  } = data;

  const { rows } = await query(`
    UPDATE drivers SET
      name = COALESCE($2, name),
      email = COALESCE($3, email),
      phone = COALESCE($4, phone),
      license_number = COALESCE($5, license_number),
      license_expiry = COALESCE($6, license_expiry),
      national_id = COALESCE($7, national_id),
      address = COALESCE($8, address),
      bus_id = COALESCE($9, bus_id),
      base_salary = COALESCE($10, base_salary),
      allowances = COALESCE($11, allowances),
      deductions = COALESCE($12, deductions),
      payment_method = COALESCE($13, payment_method),
      bank_name = COALESCE($14, bank_name),
      account_number = COALESCE($15, account_number),
      status = COALESCE($16, status),
      avatar = COALESCE($17, avatar),
      joining_date = COALESCE($18, joining_date),
      user_id = COALESCE($19, user_id),
      campus_id = COALESCE($20, campus_id),
      updated_at = NOW()
    WHERE id = $1
    RETURNING id, name, email, phone, license_number AS "licenseNumber",
              license_expiry AS "licenseExpiry", national_id AS "nationalId",
              address, bus_id AS "busId", base_salary AS "baseSalary",
              allowances, deductions, payment_method AS "paymentMethod",
              bank_name AS "bankName", account_number AS "accountNumber",
              status, avatar, joining_date AS "joiningDate", updated_at AS "updatedAt",
              campus_id AS "campusId"
  `, [
    id, name || null, email || null, phone || null, licenseNumber || null,
    licenseExpiry || null, nationalId || null, address || null, busId || null,
    baseSalary ?? null, allowances ?? null, deductions ?? null, paymentMethod || null,
    bankName || null, accountNumber || null, status || null, avatar || null, joiningDate || null,
    userId || null, data.campusId || null
  ]);
  return rows[0] || null;
};

// Delete driver
export const deleteDriver = async (id) => {
  await query('DELETE FROM drivers WHERE id = $1', [id]);
  return true;
};

// Get driver payroll
export const getDriverPayroll = async (driverId, { page = 1, pageSize = 12 } = {}) => {
  const offset = (Number(page) - 1) * Number(pageSize);
  const { rows } = await query(`
    SELECT id, driver_id AS "driverId", period_month AS "periodMonth",
           base_salary AS "baseSalary", allowances, deductions, bonuses,
           total_amount AS "totalAmount", status, payment_method AS "paymentMethod",
           bank_name AS "bankName", account_title AS "accountTitle",
           account_number AS "accountNumber", iban AS "iban",
           cheque_number AS "chequeNumber",
           transaction_reference AS "transactionReference", paid_on AS "paidOn",
           notes, created_at AS "createdAt"
    FROM driver_payrolls
    WHERE driver_id = $1
    ORDER BY period_month DESC
    LIMIT $2 OFFSET $3
  `, [driverId, pageSize, offset]);
  return rows;
};

// Create driver payroll
export const createDriverPayroll = async (data) => {
  const { driverId, periodMonth, baseSalary, allowances, deductions, bonuses, notes, createdBy } = data;
  const paymentMethod = data.paymentMethod ?? null;
  const bankName = data.bankName ?? null;
  const accountTitle = data.accountTitle ?? null;
  const accountNumber = data.accountNumber ?? null;
  const iban = data.iban ?? null;
  const chequeNumber = data.chequeNumber ?? null;
  const transactionReference = data.transactionReference ?? null;
  const status = data.status ?? 'pending';
  const paidOn = data.paidOn ?? null;

  const totalAmount = (Number(baseSalary) || 0) + (Number(allowances) || 0) + (Number(bonuses) || 0) - (Number(deductions) || 0);

  const { rows } = await query(`
    INSERT INTO driver_payrolls (driver_id, period_month, base_salary, allowances, deductions, bonuses, total_amount, status, payment_method, bank_name, account_title, account_number, iban, cheque_number, transaction_reference, paid_on, notes, created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
    ON CONFLICT (driver_id, period_month) DO UPDATE SET
      base_salary = EXCLUDED.base_salary,
      allowances = EXCLUDED.allowances,
      deductions = EXCLUDED.deductions,
      bonuses = EXCLUDED.bonuses,
      total_amount = EXCLUDED.total_amount,
      status = EXCLUDED.status,
      payment_method = EXCLUDED.payment_method,
      bank_name = EXCLUDED.bank_name,
      account_title = EXCLUDED.account_title,
      account_number = EXCLUDED.account_number,
      iban = EXCLUDED.iban,
      cheque_number = EXCLUDED.cheque_number,
      transaction_reference = EXCLUDED.transaction_reference,
      paid_on = EXCLUDED.paid_on,
      notes = EXCLUDED.notes,
      updated_at = NOW()
    RETURNING id, driver_id AS "driverId", period_month AS "periodMonth",
             base_salary AS "baseSalary", allowances, deductions, bonuses,
             total_amount AS "totalAmount", status, payment_method AS "paymentMethod",
             bank_name AS "bankName", account_title AS "accountTitle",
             account_number AS "accountNumber", iban AS "iban",
             cheque_number AS "chequeNumber",
             transaction_reference AS "transactionReference",
             paid_on AS "paidOn",
             notes, created_at AS "createdAt"
  `, [
    driverId,
    periodMonth,
    baseSalary || 0,
    allowances || 0,
    deductions || 0,
    bonuses || 0,
    totalAmount,
    status,
    paymentMethod,
    bankName,
    accountTitle,
    accountNumber,
    iban,
    chequeNumber,
    transactionReference,
    paidOn,
    notes || null,
    createdBy || null,
  ]);
  return rows[0];
};

// Update payroll status
export const updateDriverPayrollStatus = async (id, status, transactionReference = null) => {
  const paidOn = status === 'paid' ? 'NOW()' : 'NULL';
  const { rows } = await query(`
    UPDATE driver_payrolls SET
      status = $2,
      transaction_reference = COALESCE($3, transaction_reference),
      paid_on = ${status === 'paid' ? 'NOW()' : 'paid_on'},
      updated_at = NOW()
    WHERE id = $1
    RETURNING id, status, paid_on AS "paidOn", updated_at AS "updatedAt"
  `, [id, status, transactionReference]);
  return rows[0] || null;
};

export const deleteDriverPayroll = async ({ driverId, payrollId }) => {
  const { rows } = await query(
    'DELETE FROM driver_payrolls WHERE id = $1 AND driver_id = $2 RETURNING id',
    [payrollId, driverId]
  );
  return rows[0] || null;
};

// Count all drivers
export const countDrivers = async () => {
  const { rows } = await query('SELECT COUNT(*) as count FROM drivers WHERE status = $1', ['active']);
  return Number(rows[0]?.count || 0);
};

export const getDashboardStats = async (driverId) => {
  const stats = {
    routeName: 'No Route Assigned',
    stops: 0,
    progress: 0,
    gpsStatus: 'Offline',
    nextStop: '--',
    eta: '--',
    vehicleId: 'No Vehicle',
    capacity: 'N/A',
    shift: { start: '08:00 AM', end: '04:00 PM' }, // Placeholder
    lastUpdate: 'Just now',
    speed: '0 km/h',
    speedTrend: Array.from({ length: 12 }, () => Math.floor(Math.random() * (60 - 20 + 1)) + 20)
  };

  try {
    // 1. Get Driver and Bus Info
    const { rows: driverRows } = await query(`
      SELECT d.name, b.number as "busNumber"
      FROM drivers d
      LEFT JOIN buses b ON d.bus_id = b.id
      WHERE d.id = $1
    `, [driverId]);

    if (!driverRows.length) return stats;
    const driver = driverRows[0];

    if (driver.busNumber) {
      stats.vehicleId = driver.busNumber;
      stats.capacity = 'Standard'; // Default, schema doesn't have capacity on buses table yet
      stats.gpsStatus = 'Connected'; // Assume connected if assigned
    }

    // 2. Get Route Info via Bus Assignment
    // drivers.bus_id -> buses.id
    // bus_assignments: bus_id -> route_id
    // routes: id -> name
    const { rows: routeRows } = await query(`
      SELECT r.name, r.id as "routeId"
      FROM drivers d
      JOIN bus_assignments ba ON ba.bus_id = d.bus_id
      JOIN routes r ON r.id = ba.route_id
      WHERE d.id = $1
    `, [driverId]);

    if (routeRows.length) {
      const route = routeRows[0];
      stats.routeName = route.name;

      // 3. Get Stops Count
      const { rows: stopsRows } = await query(
        `SELECT COUNT(*)::int as count FROM route_stops WHERE route_id = $1`,
        [route.routeId]
      );
      stats.stops = stopsRows[0]?.count || 0;

      // Mock progress for now as we don't have real-time tracking
      stats.progress = 0;
      // If there are stops, set next stop as the first one
      if (stats.stops > 0) {
        const { rows: nextStop } = await query(
          `SELECT name FROM route_stops WHERE route_id = $1 ORDER BY sequence ASC LIMIT 1`,
          [route.routeId]
        );
        if (nextStop.length) {
          stats.nextStop = nextStop[0].name;
          stats.eta = 'Pending Start';
        }
      }
    }

  } catch (err) {
    console.error('Error fetching driver dashboard stats:', err);
  }

  return stats;
};

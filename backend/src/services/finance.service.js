import { query } from '../config/db.js';

// ========================================
// USER EXISTENCE CHECKS
// ========================================

// Check if any users exist (students, teachers, or drivers)
export const checkUsersExist = async ({ campusId } = {}) => {
  const { rows } = await query(
    `
      SELECT
        (SELECT COUNT(*) FROM students WHERE ($1::int IS NULL OR campus_id = $1::int)) as students,
        (SELECT COUNT(*) FROM teachers WHERE ($1::int IS NULL OR campus_id = $1::int)) as teachers,
        (SELECT COUNT(*) FROM drivers WHERE ($1::int IS NULL OR campus_id = $1::int)) as drivers
    `,
    [campusId || null]
  );
  const counts = rows[0] || { students: 0, teachers: 0, drivers: 0 };
  return {
    hasUsers: (Number(counts.students) + Number(counts.teachers) + Number(counts.drivers)) > 0,
    counts: {
      students: Number(counts.students),
      teachers: Number(counts.teachers),
      drivers: Number(counts.drivers)
    }
  };
};

export const getDashboardAnalytics = async ({ userType, days = 14, campusId } = {}) => {
  const u = userType || null;
  const safeDays = Math.max(1, Math.min(60, Number(days) || 14));

  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (safeDays - 1));
  const startDate = start.toISOString().slice(0, 10);

  const categories = [];
  const keys = [];
  for (let i = safeDays - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    keys.push(key);
    categories.push(key.slice(5));
  }

  const { rows: trendRows } = await query(
    `
      SELECT TO_CHAR(DATE(paid_at), 'YYYY-MM-DD') AS day, COALESCE(SUM(amount), 0) AS total
      FROM finance_payments
      WHERE paid_at >= $2::date
        AND ($1::text IS NULL OR user_type = $1::text)
        AND ($3::int IS NULL OR campus_id = $3::int)
      GROUP BY DATE(paid_at)
      ORDER BY day ASC
    `,
    [u, startDate, campusId || null]
  );

  const trendMap = new Map();
  for (const r of trendRows) {
    trendMap.set(String(r.day), Math.round(Number(r.total) || 0));
  }
  const trendData = keys.map((k) => Math.round(Number(trendMap.get(k) || 0)));
  const trendHasAny = trendData.some((v) => v > 0);

  const { rows: methodRows } = await query(
    `
      SELECT COALESCE(NULLIF(TRIM(LOWER(method)), ''), 'unknown') AS method,
             COALESCE(SUM(amount), 0) AS total
      FROM finance_payments
      WHERE ($1::text IS NULL OR user_type = $1::text)
        AND ($2::int IS NULL OR campus_id = $2::int)
      GROUP BY COALESCE(NULLIF(TRIM(LOWER(method)), ''), 'unknown')
      ORDER BY total DESC
      LIMIT 10
    `,
    [u, campusId || null]
  );

  const methodLabels = methodRows.map((r) => String(r.method || 'unknown'));
  const methodSeries = methodRows.map((r) => Math.round(Number(r.total) || 0));
  const methodHasAny = methodSeries.some((v) => v > 0);

  const { rows: agingRows } = await query(
    `
      WITH inv AS (
        SELECT
          balance,
          CASE WHEN due_date IS NOT NULL AND due_date < CURRENT_DATE THEN CURRENT_DATE - due_date ELSE 0 END AS days_overdue
        FROM finance_invoices
        WHERE status != 'paid'
          AND status != 'cancelled'
          AND balance > 0
          AND ($1::text IS NULL OR user_type = $1::text)
          AND ($2::int IS NULL OR campus_id = $2::int)
      )
      SELECT
        CASE
          WHEN days_overdue BETWEEN 0 AND 7 THEN '0-7d'
          WHEN days_overdue BETWEEN 8 AND 14 THEN '8-14d'
          WHEN days_overdue BETWEEN 15 AND 30 THEN '15-30d'
          WHEN days_overdue BETWEEN 31 AND 60 THEN '31-60d'
          ELSE '60+d'
        END AS bucket,
        COALESCE(SUM(balance), 0) AS total
      FROM inv
      GROUP BY bucket
    `,
    [u, campusId || null]
  );

  const bucketOrder = ['0-7d', '8-14d', '15-30d', '31-60d', '60+d'];
  const bucketMap = new Map();
  for (const r of agingRows) {
    bucketMap.set(String(r.bucket), Math.round(Number(r.total) || 0));
  }
  const agingData = bucketOrder.map((b) => Math.round(Number(bucketMap.get(b) || 0)));
  const agingHasAny = agingData.some((v) => v > 0);

  const { rows: topRows } = await query(
    `
      SELECT user_type AS "userType", user_id AS "userId", balance
      FROM finance_invoices
      WHERE status != 'paid'
        AND status != 'cancelled'
        AND balance > 0
        AND ($1::text IS NULL OR user_type = $1::text)
        AND ($2::int IS NULL OR campus_id = $2::int)
      ORDER BY balance DESC
      LIMIT 8
    `,
    [u, campusId || null]
  );

  for (const row of topRows) {
    row.userName = await getUserName(row.userType, row.userId);
  }

  const topCategories = topRows.map((r) => String(r.userName || 'Unknown').slice(0, 12));
  const topData = topRows.map((r) => Math.round(Number(r.balance) || 0));
  const topHasAny = topData.some((v) => v > 0);

  return {
    collectionsTrend: {
      categories,
      series: trendHasAny ? [{ name: 'Collected', data: trendData }] : [],
    },
    paymentMethods: {
      labels: methodLabels,
      series: methodHasAny ? methodSeries : [],
    },
    overdueAging: {
      categories: bucketOrder,
      series: agingHasAny ? [{ name: 'Outstanding', data: agingData }] : [],
    },
    topOutstanding: {
      categories: topCategories,
      series: topHasAny ? [{ name: 'Balance', data: topData }] : [],
    },
  };
};

// Get users by type for selection dropdown
export const getUsersByType = async (userType) => {
  let sql, params = [];
  switch (userType) {
    case 'student':
      sql = `SELECT id, name, email, roll_number AS "rollNumber", class, section 
             FROM students ORDER BY name`;
      break;
    case 'teacher':
      sql = `SELECT id, name, email, employee_id AS "employeeId", department, designation,
                    COALESCE(base_salary, 0)::numeric AS "baseSalary",
                    COALESCE(allowances, 0)::numeric AS allowances,
                    COALESCE(deductions, 0)::numeric AS deductions,
                    payment_method AS "paymentMethod",
                    bank_name AS "bankName",
                    account_number AS "accountNumber",
                    iban AS "iban"
             FROM teachers ORDER BY name`;
      break;
    case 'driver':
      sql = `SELECT id, name, email, license_number AS "licenseNumber", phone,
                    COALESCE(base_salary, 0)::numeric AS "baseSalary",
                    COALESCE(allowances, 0)::numeric AS allowances,
                    COALESCE(deductions, 0)::numeric AS deductions,
                    payment_method AS "paymentMethod",
                    bank_name AS "bankName",
                    account_number AS "accountNumber",
                    iban AS "iban"
             FROM drivers ORDER BY name`;
      break;
    default:
      throw new Error('Invalid user type');
  }
  const { rows } = await query(sql, params);
  return rows;
};

export const getUsersByTypeScoped = async (userType, { campusId } = {}) => {
  const params = [];
  const campusWhere = [];
  if (campusId) {
    params.push(campusId);
    campusWhere.push(`campus_id = $${params.length}`);
  }
  const whereSql = campusWhere.length ? `WHERE ${campusWhere.join(' AND ')}` : '';

  let sql;
  switch (userType) {
    case 'student':
      sql = `SELECT id, name, email, roll_number AS "rollNumber", class, section FROM students ${whereSql} ORDER BY name`;
      break;
    case 'teacher':
      sql = `SELECT id, name, email, employee_id AS "employeeId", department, designation,
                    COALESCE(base_salary, 0)::numeric AS "baseSalary",
                    COALESCE(allowances, 0)::numeric AS allowances,
                    COALESCE(deductions, 0)::numeric AS deductions,
                    payment_method AS "paymentMethod",
                    bank_name AS "bankName",
                    account_number AS "accountNumber",
                    iban AS "iban"
             FROM teachers ${whereSql} ORDER BY name`;
      break;
    case 'driver':
      sql = `SELECT id, name, email, license_number AS "licenseNumber", phone,
                    COALESCE(base_salary, 0)::numeric AS "baseSalary",
                    COALESCE(allowances, 0)::numeric AS allowances,
                    COALESCE(deductions, 0)::numeric AS deductions,
                    payment_method AS "paymentMethod",
                    bank_name AS "bankName",
                    account_number AS "accountNumber",
                    iban AS "iban"
             FROM drivers ${whereSql} ORDER BY name`;
      break;
    default:
      throw new Error('Invalid user type');
  }
  const { rows } = await query(sql, params);
  return rows;
};

// Validate user exists
export const validateUserExists = async (userType, userId) => {
  let sql;
  switch (userType) {
    case 'student':
      sql = 'SELECT id FROM students WHERE id = $1';
      break;
    case 'teacher':
      sql = 'SELECT id FROM teachers WHERE id = $1';
      break;
    case 'driver':
      sql = 'SELECT id FROM drivers WHERE id = $1';
      break;
    default:
      return false;
  }
  const { rows } = await query(sql, [userId]);
  return rows.length > 0;
};

// ========================================
// DASHBOARD STATISTICS
// ========================================

export const getDashboardStats = async ({ userType, campusId } = {}) => {
  const u = userType || null;
  const { rows } = await query(`
    SELECT
      -- Student fees (shown for all or student)
      CASE WHEN $1::text IS NULL OR $1::text = 'student' THEN
        COALESCE((SELECT SUM(total) FROM finance_invoices WHERE user_type = 'student' AND invoice_type = 'fee' AND ($2::int IS NULL OR campus_id = $2::int)), 0)
      ELSE 0 END AS "studentFeesTotal",
      CASE WHEN $1::text IS NULL OR $1::text = 'student' THEN
        COALESCE((SELECT SUM(balance) FROM finance_invoices WHERE user_type = 'student' AND invoice_type = 'fee' AND status != 'paid' AND ($2::int IS NULL OR campus_id = $2::int)), 0)
      ELSE 0 END AS "studentFeesOutstanding",
      CASE WHEN $1::text IS NULL OR $1::text = 'student' THEN
        COALESCE((SELECT SUM(total) FROM finance_invoices WHERE user_type = 'student' AND invoice_type = 'fee' AND status = 'paid' AND ($2::int IS NULL OR campus_id = $2::int)), 0)
      ELSE 0 END AS "studentFeesPaid",
      
      -- Teacher payroll (shown for all or teacher)
      CASE WHEN $1::text IS NULL OR $1::text = 'teacher' THEN
        COALESCE((SELECT SUM(total_amount) FROM teacher_payrolls WHERE ($2::int IS NULL OR campus_id = $2::int)), 0)
      ELSE 0 END AS "teacherPayrollTotal",
      CASE WHEN $1::text IS NULL OR $1::text = 'teacher' THEN
        COALESCE((SELECT SUM(total_amount) FROM teacher_payrolls WHERE status = 'paid' AND ($2::int IS NULL OR campus_id = $2::int)), 0)
      ELSE 0 END AS "teacherPayrollPaid",
      CASE WHEN $1::text IS NULL OR $1::text = 'teacher' THEN
        COALESCE((SELECT SUM(total_amount) FROM teacher_payrolls WHERE status = 'pending' AND ($2::int IS NULL OR campus_id = $2::int)), 0)
      ELSE 0 END AS "teacherPayrollPending",
      
      -- Driver payroll (shown for all or driver)
      CASE WHEN $1::text IS NULL OR $1::text = 'driver' THEN
        COALESCE((SELECT SUM(total_amount) FROM driver_payrolls WHERE ($2::int IS NULL OR campus_id = $2::int)), 0)
      ELSE 0 END AS "driverPayrollTotal",
      CASE WHEN $1::text IS NULL OR $1::text = 'driver' THEN
        COALESCE((SELECT SUM(total_amount) FROM driver_payrolls WHERE status = 'paid' AND ($2::int IS NULL OR campus_id = $2::int)), 0)
      ELSE 0 END AS "driverPayrollPaid",
      CASE WHEN $1::text IS NULL OR $1::text = 'driver' THEN
        COALESCE((SELECT SUM(total_amount) FROM driver_payrolls WHERE status = 'pending' AND ($2::int IS NULL OR campus_id = $2::int)), 0)
      ELSE 0 END AS "driverPayrollPending",
      
      -- Invoice counts by status (scoped by userType when provided)
      (SELECT COUNT(*) FROM finance_invoices WHERE status = 'pending' AND ($1::text IS NULL OR user_type = $1::text) AND ($2::int IS NULL OR campus_id = $2::int)) AS "invoicesPending",
      (SELECT COUNT(*) FROM finance_invoices WHERE status = 'paid' AND ($1::text IS NULL OR user_type = $1::text) AND ($2::int IS NULL OR campus_id = $2::int)) AS "invoicesPaid",
      (SELECT COUNT(*) FROM finance_invoices WHERE status = 'overdue' AND ($1::text IS NULL OR user_type = $1::text) AND ($2::int IS NULL OR campus_id = $2::int)) AS "invoicesOverdue",

      -- Recent collections (scoped by userType when provided)
      COALESCE((SELECT SUM(amount) FROM finance_payments WHERE paid_at >= NOW() - INTERVAL '30 days' AND ($1::text IS NULL OR user_type = $1::text) AND ($2::int IS NULL OR campus_id = $2::int)), 0) AS "collectionsLast30Days",
      COALESCE((SELECT SUM(amount) FROM finance_payments WHERE paid_at >= NOW() - INTERVAL '7 days' AND ($1::text IS NULL OR user_type = $1::text) AND ($2::int IS NULL OR campus_id = $2::int)), 0) AS "collectionsLast7Days",
      COALESCE((SELECT SUM(amount) FROM finance_payments WHERE DATE(paid_at) = CURRENT_DATE AND ($1::text IS NULL OR user_type = $1::text) AND ($2::int IS NULL OR campus_id = $2::int)), 0) AS "collectionsToday"
  `, [u, campusId || null]);

  const stats = rows[0] || {};
  return {
    studentFees: {
      total: Number(stats.studentFeesTotal) || 0,
      outstanding: Number(stats.studentFeesOutstanding) || 0,
      paid: Number(stats.studentFeesPaid) || 0
    },
    teacherPayroll: {
      total: Number(stats.teacherPayrollTotal) || 0,
      paid: Number(stats.teacherPayrollPaid) || 0,
      pending: Number(stats.teacherPayrollPending) || 0
    },
    driverPayroll: {
      total: Number(stats.driverPayrollTotal) || 0,
      paid: Number(stats.driverPayrollPaid) || 0,
      pending: Number(stats.driverPayrollPending) || 0
    },
    invoices: {
      pending: Number(stats.invoicesPending) || 0,
      paid: Number(stats.invoicesPaid) || 0,
      overdue: Number(stats.invoicesOverdue) || 0
    },
    collections: {
      last30Days: Number(stats.collectionsLast30Days) || 0,
      last7Days: Number(stats.collectionsLast7Days) || 0,
      today: Number(stats.collectionsToday) || 0
    }
  };
};

// ========================================
// UNIFIED INVOICES
// ========================================

// List unified invoices
export const listUnifiedInvoices = async ({ userType, userId, userIds, status, invoiceType, page = 1, pageSize = 50, campusId }) => {
  const params = [];
  const where = [];

  if (userType) { params.push(userType); where.push(`user_type = $${params.length}`); }
  if (userId) { params.push(userId); where.push(`user_id = $${params.length}`); }
  if (userIds && Array.isArray(userIds) && userIds.length > 0) {
    const placeholders = userIds.map((_, i) => `$${params.length + i + 1}`).join(',');
    where.push(`user_id IN (${placeholders})`);
    params.push(...userIds);
  }
  if (status) { params.push(status); where.push(`status = $${params.length}`); }
  if (invoiceType) { params.push(invoiceType); where.push(`invoice_type = $${params.length}`); }
  if (campusId) { params.push(campusId); where.push(`campus_id = $${params.length}`); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(pageSize);
  params.push(pageSize, offset);

  const { rows } = await query(`
    SELECT id, invoice_number AS "invoiceNumber", user_type AS "userType", user_id AS "userId",
           invoice_type AS "invoiceType", description, amount, tax, discount, total, balance,
           status, due_date AS "dueDate", period_month AS "periodMonth", issued_at AS "issuedAt",
           created_at AS "createdAt", campus_id AS "campusId"
    FROM finance_invoices ${whereSql}
    ORDER BY created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `, params);

  // Get user names
  for (const row of rows) {
    row.userName = await getUserName(row.userType, row.userId);
  }

  // Get total count
  const countParams = params.slice(0, params.length - 2);
  const { rows: countRows } = await query(
    `SELECT COUNT(*) as total FROM finance_invoices ${whereSql}`,
    countParams
  );

  return { items: rows, total: Number(countRows[0]?.total || 0) };
};

// Get user name helper
async function getUserName(userType, userId) {
  let sql;
  switch (userType) {
    case 'student': sql = 'SELECT name FROM students WHERE id = $1'; break;
    case 'teacher': sql = 'SELECT name FROM teachers WHERE id = $1'; break;
    case 'driver': sql = 'SELECT name FROM drivers WHERE id = $1'; break;
    default: return 'Unknown';
  }
  const { rows } = await query(sql, [userId]);
  return rows[0]?.name || 'Unknown';
}

// Create unified invoice
export const createUnifiedInvoice = async (data, createdBy = null) => {
  const {
    userType, userId, invoiceType, description, amount, tax = 0,
    discount = 0, dueDate, periodMonth, campusId
  } = data;

  // Validate user exists
  const exists = await validateUserExists(userType, userId);
  if (!exists) {
    throw new Error(`${userType} with ID ${userId} does not exist`);
  }

  const total = Number(amount) + Number(tax) - Number(discount);
  const balance = total;

  // Generate invoice number
  const { rows: countRows } = await query('SELECT COUNT(*) as c FROM finance_invoices');
  const invoiceNumber = `INV-${String(Number(countRows[0].c) + 1).padStart(6, '0')}`;

  const { rows } = await query(`
    INSERT INTO finance_invoices (
      invoice_number, user_type, user_id, invoice_type, description,
      amount, tax, discount, total, balance, due_date, period_month, created_by, campus_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    RETURNING id, invoice_number AS "invoiceNumber", user_type AS "userType", user_id AS "userId",
              invoice_type AS "invoiceType", description, amount, tax, discount, total, balance,
              status, due_date AS "dueDate", period_month AS "periodMonth", issued_at AS "issuedAt",
              created_at AS "createdAt", campus_id AS "campusId"
  `, [
    invoiceNumber, userType, userId, invoiceType, description || null,
    amount, tax, discount, total, balance, dueDate || null, periodMonth || null, createdBy, campusId || null
  ]);

  const invoice = rows[0];
  invoice.userName = await getUserName(userType, userId);
  return invoice;
};

// Get invoice by ID
export const getUnifiedInvoiceById = async (id) => {
  const { rows } = await query(`
    SELECT id, invoice_number AS "invoiceNumber", user_type AS "userType", user_id AS "userId",
           invoice_type AS "invoiceType", description, amount, tax, discount, total, balance,
           status, due_date AS "dueDate", period_month AS "periodMonth", issued_at AS "issuedAt",
           created_at AS "createdAt", updated_at AS "updatedAt"
    FROM finance_invoices WHERE id = $1
  `, [id]);

  if (!rows[0]) return null;
  rows[0].userName = await getUserName(rows[0].userType, rows[0].userId);
  return rows[0];
};

// Update invoice
export const updateUnifiedInvoice = async (id, data) => {
  const { amount, tax, discount, status, dueDate, description } = data;

  const { rows } = await query(`
    UPDATE finance_invoices SET
      amount = COALESCE($2, amount),
      tax = COALESCE($3, tax),
      discount = COALESCE($4, discount),
      total = COALESCE($2, amount) + COALESCE($3, tax) - COALESCE($4, discount),
      status = COALESCE($5, status),
      due_date = COALESCE($6, due_date),
      description = COALESCE($7, description),
      updated_at = NOW()
    WHERE id = $1
    RETURNING id, invoice_number AS "invoiceNumber", user_type AS "userType", user_id AS "userId",
              invoice_type AS "invoiceType", description, amount, tax, discount, total, balance,
              status, due_date AS "dueDate", updated_at AS "updatedAt"
  `, [id, amount ?? null, tax ?? null, discount ?? null, status || null, dueDate || null, description || null]);

  return rows[0] || null;
};

// Delete invoice
export const deleteUnifiedInvoice = async (id) => {
  await query('DELETE FROM finance_invoices WHERE id = $1', [id]);
  return true;
};

// ========================================
// UNIFIED PAYMENTS
// ========================================

// List payments
export const listUnifiedPayments = async ({ userType, userId, invoiceId, campusId, page = 1, pageSize = 50 }) => {
  const params = [];
  const where = [];

  if (userType) { params.push(userType); where.push(`fp.user_type = $${params.length}`); }
  if (userId) { params.push(userId); where.push(`fp.user_id = $${params.length}`); }
  if (invoiceId) { params.push(invoiceId); where.push(`fp.invoice_id = $${params.length}`); }

  if (campusId) { params.push(campusId); where.push(`fp.campus_id = $${params.length}`); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(pageSize);
  params.push(pageSize, offset);

  const { rows } = await query(`
    SELECT fp.id, fp.invoice_id AS "invoiceId", fi.invoice_number AS "invoiceNumber",
           fp.user_type AS "userType", fp.user_id AS "userId",
           fp.amount, fp.method, fp.reference_number AS "referenceNumber",
           fp.notes, fp.paid_at AS "paidAt"
    FROM finance_payments fp
    JOIN finance_invoices fi ON fp.invoice_id = fi.id
    ${whereSql}
    ORDER BY fp.paid_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `, params);

  // Get user names
  for (const row of rows) {
    row.userName = await getUserName(row.userType, row.userId);
  }

  return { items: rows };
};

// Create payment
export const createUnifiedPayment = async (data, receivedBy = null) => {
  const { invoiceId, amount, method, referenceNumber, notes } = data;

  // Get invoice details
  const invoice = await getUnifiedInvoiceById(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const { rows } = await query(`
    INSERT INTO finance_payments (invoice_id, user_type, user_id, amount, method, reference_number, notes, received_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, invoice_id AS "invoiceId", user_type AS "userType", user_id AS "userId",
              amount, method, reference_number AS "referenceNumber", notes, paid_at AS "paidAt"
  `, [invoiceId, invoice.userType, invoice.userId, amount, method || null, referenceNumber || null, notes || null, receivedBy]);

  // Update invoice balance
  const newBalance = Math.max(0, Number(invoice.balance) - Number(amount));
  const newStatus = newBalance <= 0 ? 'paid' : (newBalance < Number(invoice.total) ? 'partial' : invoice.status);

  await query(`
    UPDATE finance_invoices SET balance = $2, status = $3, updated_at = NOW() WHERE id = $1
  `, [invoiceId, newBalance, newStatus]);

  const payment = rows[0];
  payment.userName = await getUserName(payment.userType, payment.userId);
  return payment;
};

// ========================================
// RECEIPTS
// ========================================

// List receipts
export const listReceipts = async ({ userType, userId, userIds, campusId, page = 1, pageSize = 50 }) => {
  const params = [];
  const where = [];

  if (userType) { params.push(userType); where.push(`fr.user_type = $${params.length}`); }
  if (userId) { params.push(userId); where.push(`fr.user_id = $${params.length}`); }
  if (userIds && Array.isArray(userIds) && userIds.length > 0) {
    const placeholders = userIds.map((_, i) => `$${params.length + i + 1}`).join(',');
    where.push(`fr.user_id IN (${placeholders})`);
    params.push(...userIds);
  }
  if (campusId) { params.push(campusId); where.push(`fi.campus_id = $${params.length}`); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(pageSize);
  params.push(pageSize, offset);

  const { rows } = await query(`
    SELECT fr.id, fr.receipt_number AS "receiptNumber", fr.payment_id AS "paymentId",
           fr.user_type AS "userType", fr.user_id AS "userId", fr.amount,
           fr.issued_at AS "issuedAt", fr.printed_at AS "printedAt",
           fp.method AS "paymentMethod", fi.invoice_number AS "invoiceNumber"
    FROM finance_receipts fr
    JOIN finance_payments fp ON fr.payment_id = fp.id
    JOIN finance_invoices fi ON fp.invoice_id = fi.id
    ${whereSql}
    ORDER BY fr.issued_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `, params);

  // Get user names
  for (const row of rows) {
    row.userName = await getUserName(row.userType, row.userId);
  }

  return { items: rows };
};

// Create receipt
export const createReceipt = async (paymentId, createdBy = null) => {
  const { rows: existingRows } = await query(`
    SELECT fr.id, fr.receipt_number AS "receiptNumber", fr.payment_id AS "paymentId",
           fr.user_type AS "userType", fr.user_id AS "userId", fr.amount,
           fr.issued_at AS "issuedAt", fr.printed_at AS "printedAt",
           fp.method AS "paymentMethod", fp.reference_number AS "referenceNumber", fp.paid_at AS "paidAt",
           fi.invoice_number AS "invoiceNumber"
      FROM finance_receipts fr
      JOIN finance_payments fp ON fr.payment_id = fp.id
      JOIN finance_invoices fi ON fp.invoice_id = fi.id
     WHERE fr.payment_id = $1
     ORDER BY fr.issued_at DESC
     LIMIT 1
  `, [paymentId]);
  if (existingRows[0]) {
    const receipt = existingRows[0];
    receipt.userName = await getUserName(receipt.userType, receipt.userId);
    return receipt;
  }

  const { rows: paymentRows } = await query(
    `SELECT id, user_type, user_id, amount FROM finance_payments WHERE id = $1`,
    [paymentId]
  );
  if (!paymentRows[0]) throw new Error('Payment not found');
  const payment = paymentRows[0];

  // Generate receipt number
  const { rows: countRows } = await query('SELECT COUNT(*) as c FROM finance_receipts');
  const receiptNumber = `RCT-${String(Number(countRows[0].c) + 1).padStart(6, '0')}`;

  const { rows } = await query(`
    INSERT INTO finance_receipts (receipt_number, payment_id, user_type, user_id, amount, created_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `, [receiptNumber, paymentId, payment.user_type, payment.user_id, payment.amount, createdBy]);

  const receiptId = rows?.[0]?.id;
  if (!receiptId) throw new Error('Failed to create receipt');

  const { rows: receiptRows } = await query(`
    SELECT fr.id, fr.receipt_number AS "receiptNumber", fr.payment_id AS "paymentId",
           fr.user_type AS "userType", fr.user_id AS "userId", fr.amount,
           fr.issued_at AS "issuedAt", fr.printed_at AS "printedAt",
           fp.method AS "paymentMethod", fp.reference_number AS "referenceNumber", fp.paid_at AS "paidAt",
           fi.invoice_number AS "invoiceNumber"
      FROM finance_receipts fr
      JOIN finance_payments fp ON fr.payment_id = fp.id
      JOIN finance_invoices fi ON fp.invoice_id = fi.id
     WHERE fr.id = $1
     LIMIT 1
  `, [receiptId]);

  const receipt = receiptRows?.[0];
  if (!receipt) throw new Error('Failed to load receipt');
  receipt.userName = await getUserName(receipt.userType, receipt.userId);
  return receipt;
};

// ========================================
// OUTSTANDING FEES
// ========================================

export const getOutstandingFees = async ({ userType, userIds, campusId, page = 1, pageSize = 50 }) => {
  const params = [];
  const where = ["status != 'paid'", "status != 'cancelled'", "balance > 0"];

  if (userType) { params.push(userType); where.push(`user_type = $${params.length}`); }
  if (userIds && Array.isArray(userIds) && userIds.length > 0) {
    const placeholders = userIds.map((_, i) => `$${params.length + i + 1}`).join(',');
    where.push(`user_id IN (${placeholders})`);
    params.push(...userIds);
  }
  if (campusId) {
    params.push(campusId);
    where.push(`campus_id = $${params.length}`);
  }
  const whereSql = `WHERE ${where.join(' AND ')}`;
  const offset = (Number(page) - 1) * Number(pageSize);
  params.push(pageSize, offset);

  const { rows } = await query(`
    SELECT id, invoice_number AS "invoiceNumber", user_type AS "userType", user_id AS "userId",
           invoice_type AS "invoiceType", total, balance, status, due_date AS "dueDate",
           issued_at AS "issuedAt",
           CASE WHEN due_date < CURRENT_DATE THEN CURRENT_DATE - due_date ELSE 0 END AS "daysOverdue"
    FROM finance_invoices
    ${whereSql}
    ORDER BY due_date ASC NULLS LAST
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `, params);

  // Get user names
  for (const row of rows) {
    row.userName = await getUserName(row.userType, row.userId);
  }

  return { items: rows };
};

// ========================================
// PAYROLL (Teachers + Drivers combined)
// ========================================

export const getPayrollSummary = async ({ role, periodMonth, status, campusId, page = 1, pageSize = 50 }) => {
  const results = [];
  const offset = (Number(page) - 1) * Number(pageSize);

  // Get teacher payrolls
  if (!role || role === 'teacher') {
    const tParams = [];
    const tWhere = [];
    if (periodMonth) { tParams.push(periodMonth); tWhere.push(`period_month = $${tParams.length}`); }
    if (status) { tParams.push(status); tWhere.push(`status = $${tParams.length}`); }
    if (campusId) { tParams.push(campusId); tWhere.push(`t.campus_id = $${tParams.length}`); }
    const tWhereSql = tWhere.length ? `WHERE ${tWhere.join(' AND ')}` : '';

    const { rows: teacherRows } = await query(`
      SELECT tp.id, 'teacher' AS role, tp.teacher_id AS "userId", t.name AS "userName",
             tp.period_month AS "periodMonth", tp.base_salary AS "baseSalary",
             tp.allowances, tp.deductions, tp.bonuses, tp.total_amount AS "totalAmount",
             tp.status, tp.paid_on AS "paidOn",
             tp.payment_method AS "paymentMethod",
             tp.bank_name AS "bankName",
             tp.account_title AS "accountTitle",
             tp.account_number AS "accountNumber",
             tp.iban AS "iban",
             tp.cheque_number AS "chequeNumber",
             tp.transaction_reference AS "transactionReference"
      FROM teacher_payrolls tp
      JOIN teachers t ON tp.teacher_id = t.id
      ${tWhereSql}
      ORDER BY tp.period_month DESC
    `, tParams);
    results.push(...teacherRows);
  }

  // Get driver payrolls
  if (!role || role === 'driver') {
    const dParams = [];
    const dWhere = [];
    if (periodMonth) { dParams.push(periodMonth); dWhere.push(`period_month = $${dParams.length}`); }
    if (status) { dParams.push(status); dWhere.push(`status = $${dParams.length}`); }
    if (campusId) { dParams.push(campusId); dWhere.push(`d.campus_id = $${dParams.length}`); }
    const dWhereSql = dWhere.length ? `WHERE ${dWhere.join(' AND ')}` : '';

    const { rows: driverRows } = await query(`
      SELECT dp.id, 'driver' AS role, dp.driver_id AS "userId", d.name AS "userName",
             dp.period_month AS "periodMonth", dp.base_salary AS "baseSalary",
             dp.allowances, dp.deductions, dp.bonuses, dp.total_amount AS "totalAmount",
             dp.status, dp.paid_on AS "paidOn",
             dp.payment_method AS "paymentMethod",
             dp.bank_name AS "bankName",
             dp.account_title AS "accountTitle",
             dp.account_number AS "accountNumber",
             dp.iban AS "iban",
             dp.cheque_number AS "chequeNumber",
             dp.transaction_reference AS "transactionReference"
      FROM driver_payrolls dp
      JOIN drivers d ON dp.driver_id = d.id
      ${dWhereSql}
      ORDER BY dp.period_month DESC
    `, dParams);
    results.push(...driverRows);
  }

  // Sort and paginate
  results.sort((a, b) => new Date(b.periodMonth) - new Date(a.periodMonth));
  const paginated = results.slice(offset, offset + Number(pageSize));

  return { items: paginated, total: results.length };
};

// ========================================
// FINANCIAL RECORD CHECKS
// ========================================

export const hasFinancialRecords = async (userType, userId) => {
  const { rows } = await query(`
    SELECT EXISTS(
      SELECT 1 FROM finance_invoices WHERE user_type = $1 AND user_id = $2
    ) as has_records
  `, [userType, userId]);
  return rows[0]?.has_records || false;
};

// ========================================
// LEGACY SUPPORT - Keep existing student-only functions
// ========================================

export const listInvoices = async ({ studentId, status, page = 1, pageSize = 50 }) => {
  const params = [];
  const where = [];
  if (studentId) { params.push(studentId); where.push(`student_id = $${params.length}`); }
  if (status) { params.push(status); where.push(`status = $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(pageSize);
  params.push(pageSize, offset);
  const { rows } = await query(
    `SELECT id, student_id AS "studentId", amount, status, due_date AS "dueDate", issued_at AS "issuedAt"
     FROM fee_invoices ${whereSql}
     ORDER BY id DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
};

export const getInvoiceById = async (id) => {
  const { rows } = await query(
    'SELECT id, student_id AS "studentId", amount, status, due_date AS "dueDate", issued_at AS "issuedAt" FROM fee_invoices WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

export const createInvoice = async ({ studentId, amount, status, dueDate }) => {
  const { rows } = await query(
    'INSERT INTO fee_invoices (student_id, amount, status, due_date) VALUES ($1,$2,COALESCE($3,\'pending\'),$4) RETURNING id, student_id AS "studentId", amount, status, due_date AS "dueDate", issued_at AS "issuedAt"',
    [studentId, amount, status || null, dueDate || null]
  );
  return rows[0];
};

export const updateInvoice = async (id, { amount, status, dueDate }) => {
  const { rows } = await query(
    'UPDATE fee_invoices SET amount = COALESCE($2,amount), status = COALESCE($3,status), due_date = COALESCE($4,due_date) WHERE id = $1 RETURNING id, student_id AS "studentId", amount, status, due_date AS "dueDate", issued_at AS "issuedAt"',
    [id, amount || null, status || null, dueDate || null]
  );
  return rows[0] || null;
};

export const deleteInvoice = async (id) => {
  await query('DELETE FROM fee_invoices WHERE id = $1', [id]);
  return true;
};

export const listPayments = async (invoiceId) => {
  const { rows } = await query(
    'SELECT id, invoice_id AS "invoiceId", amount, method, paid_at AS "paidAt" FROM fee_payments WHERE invoice_id = $1 ORDER BY paid_at DESC',
    [invoiceId]
  );
  return rows;
};

export const addPayment = async (invoiceId, { amount, method }) => {
  const { rows } = await query(
    'INSERT INTO fee_payments (invoice_id, amount, method) VALUES ($1,$2,$3) RETURNING id, invoice_id AS "invoiceId", amount, method, paid_at AS "paidAt"',
    [invoiceId, amount, method || null]
  );
  return rows[0];
};

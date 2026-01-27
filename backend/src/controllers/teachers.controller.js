import * as teachers from '../services/teachers.service.js';
import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';
import * as authSvc from '../services/auth.service.js';

const coerceString = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const str = typeof value === 'string' ? value.trim() : String(value).trim();
  return str.length ? str : null;
};

const coerceNumber = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const coerceDate = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const str = typeof value === 'string' ? value.trim() : String(value).trim();
  return str.length ? str : null;
};

const coerceArray = (value, partial) => {
  if (value === undefined) return partial ? undefined : [];

  let arr = [];
  if (Array.isArray(value)) {
    arr = value;
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return partial ? undefined : [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) arr = parsed;
      } catch {
        arr = trimmed.split(',');
      }
    } else {
      arr = trimmed.split(',');
    }
  }

  const cleaned = arr.map((entry) => coerceString(entry)).filter((entry) => entry);
  return cleaned;
};

const normalizeTeacherPayload = (raw = {}, { partial = false } = {}) => {
  const data = {};

  const assignString = (field, source = field) => {
    const value = coerceString(raw[source]);
    if (value !== undefined) data[field] = value;
  };

  const assignNumber = (field) => {
    const value = coerceNumber(raw[field]);
    if (value !== undefined) data[field] = value;
  };

  const assignDate = (field) => {
    const value = coerceDate(raw[field]);
    if (value !== undefined) data[field] = value;
  };

  const assignArray = (field) => {
    const value = coerceArray(raw[field], partial);
    if (value !== undefined) data[field] = Array.from(new Set(value));
  };

  assignString('name');
  assignString('email');
  assignString('phone');
  assignString('qualification');
  assignString('employmentType');
  assignString('employeeId');
  assignString('department');
  assignString('designation');
  assignNumber('experienceYears');
  assignString('specialization');
  assignString('employmentStatus');
  assignString('currency');
  assignString('payFrequency');
  assignString('paymentMethod');
  assignString('bankName');
  assignString('accountNumber');
  assignString('iban');
  assignString('gender');
  assignString('bloodGroup');
  assignString('religion');
  assignString('nationalId');
  assignString('address1');
  assignString('address2');
  assignString('city');
  assignString('state');
  assignString('postalCode');
  assignString('emergencyName');
  assignString('emergencyPhone');
  assignString('emergencyRelation');

  if (data.email) data.email = data.email.toLowerCase();

  assignDate('joiningDate');
  assignDate('probationEndDate');
  assignDate('contractEndDate');
  assignDate('dob');

  assignNumber('workHoursPerWeek');
  assignNumber('baseSalary');
  assignNumber('allowances');
  assignNumber('deductions');

  assignArray('subjects');
  assignArray('classes');

  const avatar = coerceString(raw.avatar) ?? coerceString(raw.photo) ?? coerceString(raw.photoUrl) ?? coerceString(raw.profilePhoto) ?? coerceString(raw.profilePhotoUrl);
  if (avatar !== undefined) data.avatar = avatar;

  const explicitSubject = coerceString(raw.subject);
  if (explicitSubject !== undefined) data.subject = explicitSubject;

  if (!('subject' in data) && data.specialization) data.subject = data.specialization;
  if (!('subject' in data) && Array.isArray(data.subjects) && data.subjects.length) data.subject = data.subjects[0];

  if (!partial) {
    if (!('employmentStatus' in data) || !data.employmentStatus) data.employmentStatus = 'active';
    if (!('employmentType' in data) || !data.employmentType) data.employmentType = 'fullTime';
    if (!('currency' in data) || !data.currency) data.currency = 'PKR';
    if (!('payFrequency' in data) || !data.payFrequency) data.payFrequency = 'monthly';
    if (!('paymentMethod' in data) || !data.paymentMethod) data.paymentMethod = 'bank';
    if (!('subjects' in data)) data.subjects = [];
    if (!('classes' in data)) data.classes = [];
    if (!('allowances' in data)) data.allowances = 0;
    if (!('deductions' in data)) data.deductions = 0;
  }

  if (data.employmentStatus && !data.status) data.status = data.employmentStatus;

  if (!partial && !('baseSalary' in data)) data.baseSalary = 0;

  return data;
};

export const list = async (req, res, next) => {
  try {
    // If a teacher is logged in, only return their own record
    if (req.user?.role === 'teacher') {
      const self = await teachers.getByUserId(req.user.id);
      return res.json({ rows: self ? [self] : [], total: self ? 1 : 0, page: 1, pageSize: 1 });
    }
    const { page = 1, pageSize = 50, q } = req.query;
    const isGlobalAdmin = req.user?.role === 'owner' || req.user?.role === 'superadmin';
    const requestedCampusId = req.query.campusId ? Number(req.query.campusId) : undefined;
    const campusId = isGlobalAdmin
      ? (requestedCampusId ?? req.user?.campusId)
      : req.user?.campusId;

    // Force campus scoping for owner/superadmin: never return all campuses by default
    if (isGlobalAdmin && !campusId) {
      return res.json({ rows: [], total: 0, page: Number(page), pageSize: Number(pageSize) });
    }
    const result = await teachers.list({
      page: Number(page),
      pageSize: Number(pageSize),
      q,
      campusId
    });
    return res.json(result);
  } catch (e) {
    next(e);
  }
};

export const getById = async (req, res, next) => {
  try {
    if (req.user?.role === 'teacher') {
      const self = await teachers.getByUserId(req.user.id);
      if (!self || self.id !== Number(req.params.id)) return res.status(403).json({ message: 'Forbidden' });
    }
    const teacher = await teachers.getById(Number(req.params.id));
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    return res.json(teacher);
  } catch (e) {
    next(e);
  }
};

export const getSchedule = async (req, res, next) => {
  try {
    if (req.user?.role === 'teacher') {
      const self = await teachers.getByUserId(req.user.id);
      if (!self || self.id !== Number(req.params.id)) return res.status(403).json({ message: 'Forbidden' });
    }
    const schedule = await teachers.getSchedule(Number(req.params.id));
    return res.json(schedule);
  } catch (e) {
    next(e);
  }
};

export const create = async (req, res, next) => {
  try {
    const payload = normalizeTeacherPayload(req.body, { partial: false });
    let credentials = null;
    // Auto-provision user account if not already linked
    if (!payload.userId) {
      let user = null;
      if (payload.email) {
        try { user = await authSvc.findUserByEmail(payload.email); } catch (_) { user = null; }
      }
      if (!user) {
        const username = await authSvc.generateUniqueUsername({ base: payload.name || payload.email || 'teacher', role: 'teacher' });
        const password = authSvc.generateRandomPassword(12);
        const passwordHash = await bcrypt.hash(password, 10);
        user = await authSvc.createUserWith({
          email: payload.email || null,
          username,
          passwordHash,
          role: 'teacher',
          name: payload.name || username,
          campusId: req.user?.campusId || payload.campusId
        });
        credentials = { username, password };
      }
      if (user) payload.userId = user.id;
    }

    if (!payload.campusId) payload.campusId = req.user?.campusId;
    if (!payload.campusId) return res.status(400).json({ message: 'Campus ID is required' });

    const created = await teachers.create(payload);
    const resp = credentials ? { ...created, credentials } : created;
    return res.status(201).json(resp);
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const payload = normalizeTeacherPayload(req.body, { partial: true });
    const updated = await teachers.update(Number(req.params.id), payload);
    if (!updated) return res.status(404).json({ message: 'Teacher not found' });
    return res.json(updated);
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    const ok = await teachers.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ message: 'Teacher not found' });
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

export const listSchedules = async (req, res, next) => {
  try {
    let { teacherId, day, dayOfWeek, className, section } = req.query;
    if (req.user?.role === 'teacher') {
      const self = await teachers.getByUserId(req.user.id);
      teacherId = self?.id;
    }
    const schedules = await teachers.listSchedules({
      teacherId: teacherId ? Number(teacherId) : undefined,
      dayOfWeek: day ?? dayOfWeek,
      className,
      section,
      campusId: req.user?.campusId,
    });
    return res.json(schedules);
  } catch (e) {
    next(e);
  }
};

export const createScheduleSlot = async (req, res, next) => {
  try {
    const created = await teachers.createScheduleSlot({
      teacherId: Number(req.body.teacherId),
      dayOfWeek: req.body.dayOfWeek ?? req.body.day,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      class: req.body.class ?? req.body.className,
      section: req.body.section,
      subject: req.body.subject,
      room: req.body.room,
      timeSlotIndex: req.body.timeSlotIndex ?? req.body.timeSlot,
      timeSlotLabel: req.body.timeSlotLabel ?? req.body.label,
    });
    return res.status(201).json(created);
  } catch (e) {
    next(e);
  }
};

export const updateScheduleSlot = async (req, res, next) => {
  try {
    const updated = await teachers.updateScheduleSlot(Number(req.params.scheduleId), req.body);
    if (!updated) return res.status(404).json({ message: 'Schedule slot not found' });
    return res.json(updated);
  } catch (e) {
    next(e);
  }
};

export const deleteScheduleSlot = async (req, res, next) => {
  try {
    const ok = await teachers.deleteScheduleSlot(Number(req.params.scheduleId));
    if (!ok) return res.status(404).json({ message: 'Schedule slot not found' });
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

export const listAttendance = async (req, res, next) => {
  try {
    const { date } = req.query;
    let { teacherId } = req.query;
    if (req.user?.role === 'teacher') {
      const self = await teachers.getByUserId(req.user.id);
      teacherId = self?.id;
    }

    const isGlobalAdmin = req.user?.role === 'owner' || req.user?.role === 'superadmin';
    const requestedCampusId = req.query.campusId ? Number(req.query.campusId) : undefined;
    const campusId = isGlobalAdmin
      ? (requestedCampusId ?? req.user?.campusId)
      : req.user?.campusId;

    const records = await teachers.getAttendanceByDate({
      date,
      teacherId: teacherId ? Number(teacherId) : undefined,
      campusId
    });
    return res.json({ date, records });
  } catch (e) {
    next(e);
  }
};

export const saveAttendance = async (req, res, next) => {
  try {
    const entries = Array.isArray(req.body.entries)
      ? req.body.entries.map((entry) => ({
        teacherId: Number(entry.teacherId),
        status: entry.status,
        checkInTime: entry.checkInTime,
        checkOutTime: entry.checkOutTime,
        remarks: entry.remarks,
      }))
      : [];
    const records = await teachers.upsertAttendanceEntries({
      date: req.body.date,
      entries,
      recordedBy: req.user?.id,
    });
    return res.json({ date: req.body.date, records });
  } catch (e) {
    next(e);
  }
};

export const listPayrolls = async (req, res, next) => {
  try {
    let teacherId = req.query.teacherId ? Number(req.query.teacherId) : undefined;
    if (req.user?.role === 'teacher') {
      const self = await teachers.getByUserId(req.user.id);
      teacherId = self?.id;
    }

    const isGlobalAdmin = req.user?.role === 'owner' || req.user?.role === 'superadmin';
    const requestedCampusId = req.query.campusId ? Number(req.query.campusId) : undefined;
    const campusId = isGlobalAdmin
      ? (requestedCampusId ?? req.user?.campusId)
      : req.user?.campusId;

    // Force campus scoping for owner/superadmin: never return all campuses by default
    if (isGlobalAdmin && !campusId) {
      return res.json([]);
    }
    const payrolls = await teachers.listPayrolls({
      month: req.query.month,
      status: req.query.status,
      teacherId,
      campusId,
    });
    return res.json(payrolls);
  } catch (e) {
    next(e);
  }
};

export const createPayroll = async (req, res, next) => {
  try {
    const payload = {
      teacherId: Number(req.body.teacherId),
      periodMonth: req.body.periodMonth || req.body.month,
      baseSalary: req.body.baseSalary,
      allowances: req.body.allowances,
      deductions: req.body.deductions,
      bonuses: req.body.bonuses,
      status: req.body.status,
      paymentMethod: req.body.paymentMethod,
      bankName: req.body.bankName,
      accountTitle: req.body.accountTitle,
      accountNumber: req.body.accountNumber,
      iban: req.body.iban,
      chequeNumber: req.body.chequeNumber,
      transactionReference: req.body.transactionReference,
      paidOn: req.body.paidOn,
      notes: req.body.notes,
      createdBy: req.user?.id,
    };
    const created = await teachers.createPayroll(payload);
    return res.status(201).json(created);
  } catch (e) {
    next(e);
  }
};

export const updatePayroll = async (req, res, next) => {
  try {
    const updated = await teachers.updatePayroll(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: 'Payroll record not found' });
    return res.json(updated);
  } catch (e) {
    next(e);
  }
};

export const deletePayroll = async (req, res, next) => {
  try {
    const campusId = req.user?.campusId;
    if (!campusId) return res.status(400).json({ message: 'campusId is required' });

    const { rows } = await query(
      `SELECT tp.id
         FROM teacher_payrolls tp
         JOIN teachers t ON t.id = tp.teacher_id
        WHERE tp.id = $1 AND t.campus_id = $2
        LIMIT 1`,
      [Number(req.params.id), Number(campusId)]
    );
    if (!rows.length) return res.status(404).json({ message: 'Payroll record not found' });

    const deleted = await teachers.deletePayroll(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: 'Payroll record not found' });
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

export const listPerformanceReviews = async (req, res, next) => {
  try {
    let teacherId = req.query.teacherId ? Number(req.query.teacherId) : undefined;
    if (req.user?.role === 'teacher') {
      const self = await teachers.getByUserId(req.user.id);
      teacherId = self?.id;
    }
    const reviews = await teachers.listPerformanceReviews({
      periodType: req.query.periodType || req.query.period,
      teacherId,
    });
    return res.json(reviews);
  } catch (e) {
    next(e);
  }
};

export const createPerformanceReview = async (req, res, next) => {
  try {
    const payload = {
      teacherId: Number(req.body.teacherId),
      periodType: req.body.periodType,
      periodLabel: req.body.periodLabel,
      periodStart: req.body.periodStart,
      periodEnd: req.body.periodEnd,
      overallScore: req.body.overallScore,
      studentFeedbackScore: req.body.studentFeedbackScore,
      attendanceScore: req.body.attendanceScore,
      classManagementScore: req.body.classManagementScore,
      examResultsScore: req.body.examResultsScore,
      status: req.body.status,
      improvement: req.body.improvement,
      remarks: req.body.remarks,
      createdBy: req.user?.id,
    };
    const created = await teachers.createPerformanceReview(payload);
    return res.status(201).json(created);
  } catch (e) {
    next(e);
  }
};

export const updatePerformanceReview = async (req, res, next) => {
  try {
    const updated = await teachers.updatePerformanceReview(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: 'Performance review not found' });
    return res.json(updated);
  } catch (e) {
    next(e);
  }
};

export const listSubjects = async (req, res, next) => {
  try {
    const subjects = await teachers.listSubjects({ campusId: req.user?.campusId });
    return res.json(subjects);
  } catch (e) {
    next(e);
  }
};

export const listSubjectsByClass = async (req, res, next) => {
  try {
    const items = await teachers.listSubjectsByClass({
      className: req.query.className || undefined,
      section: req.query.section || undefined,
      campusId: req.user?.campusId,
    });
    return res.json(items);
  } catch (e) {
    next(e);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const subject = await teachers.createSubject(req.body);
    return res.status(201).json(subject);
  } catch (e) {
    next(e);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await teachers.updateSubject(Number(req.params.id), req.body);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    return res.json(subject);
  } catch (e) {
    next(e);
  }
};

export const removeSubject = async (req, res, next) => {
  try {
    const ok = await teachers.removeSubject(Number(req.params.id));
    if (!ok) return res.status(404).json({ message: 'Subject not found' });
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

export const listSubjectAssignments = async (req, res, next) => {
  try {
    const assignments = await teachers.listSubjectAssignments({
      teacherId: req.query.teacherId ? Number(req.query.teacherId) : undefined,
      subjectId: req.query.subjectId ? Number(req.query.subjectId) : undefined,
      campusId: req.user?.campusId,
    });
    return res.json(assignments);
  } catch (e) {
    next(e);
  }
};

export const assignSubject = async (req, res, next) => {
  try {
    const assignment = await teachers.assignSubject({
      teacherId: Number(req.body.teacherId),
      subjectId: Number(req.body.subjectId),
      isPrimary: req.body.isPrimary,
      classes: req.body.classes,
      academicYear: req.body.academicYear,
      assignedBy: req.user?.id,
    });
    return res.status(201).json(assignment);
  } catch (e) {
    next(e);
  }
};

export const updateSubjectAssignment = async (req, res, next) => {
  try {
    const assignment = await teachers.updateSubjectAssignment(Number(req.params.assignmentId), req.body);
    if (!assignment) return res.status(404).json({ message: 'Subject assignment not found' });
    return res.json(assignment);
  } catch (e) {
    next(e);
  }
};

export const removeSubjectAssignment = async (req, res, next) => {
  try {
    const ok = await teachers.removeSubjectAssignment(Number(req.params.assignmentId));
    if (!ok) return res.status(404).json({ message: 'Subject assignment not found' });
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    let teacherId = req.params.id ? Number(req.params.id) : undefined;
    if (req.user?.role === 'teacher') {
      const self = await teachers.getByUserId(req.user.id);
      if (!self) return res.status(404).json({ message: 'Teacher profile not found' });
      // If asking for a specific ID that isn't their own, forbid
      if (teacherId && teacherId !== self.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      teacherId = self.id;
    }

    if (!teacherId) return res.status(400).json({ message: 'Teacher ID required' });

    const stats = await teachers.getDashboardStats(teacherId);
    return res.json(stats);
  } catch (e) {
    next(e);
  }
};

export const listMyClasses = async (req, res, next) => {
  try {
    let teacherId = req.query.teacherId ? Number(req.query.teacherId) : undefined;
    if (req.user?.role === 'teacher') {
      const self = await teachers.getByUserId(req.user.id);
      teacherId = self?.id;
    }
    if (!teacherId) return res.status(400).json({ message: 'Teacher ID required' });
    const rows = await teachers.getMyClassesSummary(teacherId);
    return res.json({ rows });
  } catch (e) {
    next(e);
  }
};

export const listStudentsBySubject = async (req, res, next) => {
  try {
    let teacherId = req.query.teacherId ? Number(req.query.teacherId) : undefined;
    if (req.user?.role === 'teacher') {
      const self = await teachers.getByUserId(req.user.id);
      teacherId = self?.id;
    }
    if (!teacherId) return res.status(400).json({ message: 'Teacher ID required' });
    const data = await teachers.getStudentsBySubject(teacherId, {
      q: req.query.q || req.query.search,
      grade: req.query.grade || req.query.className || req.query.class,
      subject: req.query.subject,
    });
    return res.json({ rows: data });
  } catch (e) {
    next(e);
  }
};

import * as students from '../services/students.service.js';
import bcrypt from 'bcryptjs';
import * as authSvc from '../services/auth.service.js';
import cloudinary from '../config/cloudinary.js';
import { ensureStudentExtendedColumns, ensureFinanceConstraints, ensureParentsSchema } from '../db/autoMigrate.js';
import * as parentsSvc from '../services/parents.service.js';
import { upsertParentUserForPhone } from '../services/auth.service.js';
import * as teachersSvc from '../services/teachers.service.js';

export const list = async (req, res, next) => {
  try {
    await ensureStudentExtendedColumns();
    // If a student is logged in, only return their own record
    if (req.user?.role === 'student') {
      const self = await students.getByUserId(req.user.id);
      return res.json({ rows: self ? [self] : [], total: self ? 1 : 0, page: 1, pageSize: 1 });
    }

    let { page = 1, pageSize = 50, q, class: cls, section, familyNumber } = req.query;

    // If a parent is logged in, restrict to their children
    if (req.user?.role === 'parent') {
      const parent = await parentsSvc.getByUserId(req.user.id);
      if (!parent) return res.json({ rows: [], total: 0, page, pageSize });
      familyNumber = parent.familyNumber;
    }

    const campusId = req.user?.campusId;

    let allowedClassSections;
    if (req.user?.role === 'teacher') {
      allowedClassSections = await teachersSvc.getTeachingScopesByUserId(req.user.id);
      if (!allowedClassSections.length) {
        return res.json({ rows: [], total: 0, page: Number(page), pageSize: Number(pageSize) });
      }
    }

    const result = await students.list({
      page: Number(page),
      pageSize: Number(pageSize),
      q,
      class: cls,
      section,
      familyNumber,
      campusId,
      allowedClassSections
    });
    return res.json(result);
  } catch (e) { next(e); }
};

export const getById = async (req, res, next) => {
  try {
    await ensureStudentExtendedColumns();
    // Enforce self-only access for students
    if (req.user?.role === 'student') {
      const self = await students.getByUserId(req.user.id);
      if (!self || self.id !== Number(req.params.id)) return res.status(403).json({ message: 'Forbidden' });
    }
    const student = await students.getById(Number(req.params.id));
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Teacher: only allow access to students in teacher's scheduled classes/sections
    if (req.user?.role === 'teacher') {
      const scopes = await teachersSvc.getTeachingScopesByUserId(req.user.id);
      const ok = scopes.some((s) => {
        if (!s?.className) return false;
        if (String(s.className) !== String(student.class)) return false;
        if (s.section) return String(s.section) === String(student.section);
        return true;
      });
      if (!ok) return res.status(403).json({ message: 'Forbidden' });
    }

    return res.json(student);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    await ensureStudentExtendedColumns();
    await ensureParentsSchema();
    const payload = { ...req.body };

    if (!payload.avatar) {
      payload.avatar = payload.photo || payload.photoUrl || payload.imageUrl || payload.personal?.photo || null;
    }

    let credentials = null;
    // Upload base64 avatar to Cloudinary if provided
    if (payload.avatar && typeof payload.avatar === 'string' && payload.avatar.startsWith('data:')) {
      try {
        const upload = await cloudinary.uploader.upload(payload.avatar, { folder: 'students' });
        payload.avatar = upload.secure_url;
      } catch (_) {
        // If upload fails, keep the provided avatar as-is
      }
    }
    // Ensure a parents record exists and attach family number
    try {
      const p = payload.parent || {};
      const g = p.guardian || {};
      const familyNumberInput = payload.familyNumber || p.familyNumber;
      const ensured = await parentsSvc.ensureByFamilyNumber({
        familyNumber: familyNumberInput,
        primaryName: (p?.hasGuardian && g?.name) || p?.father?.name || p?.mother?.name || payload.parentName || payload.name || null,
        fatherName: p?.father?.name || null,
        motherName: p?.mother?.name || null,
        whatsappPhone: (p?.hasGuardian && g?.phone) || p?.father?.phone || p?.mother?.phone || null,
        email: p?.father?.email || p?.mother?.email || payload.email || null,
        address: p?.address || null,
      });
      if (ensured?.familyNumber) payload.familyNumber = ensured.familyNumber;
      // If a Parent/Guardian Portal password was provided, create/update a parent user now
      const pwd = (p?.hasGuardian && g?.portalPassword) || p?.portalPassword;
      const conf = (p?.hasGuardian && g?.portalPasswordConfirm) || p?.portalPasswordConfirm;
      const phone = (p?.hasGuardian && g?.phone) || p?.father?.phone || p?.mother?.phone;
      const parentName = (p?.hasGuardian && g?.name) || p?.father?.name || p?.mother?.name || payload.parentName || payload.name || 'Parent';
      if (pwd && String(pwd).length >= 4 && phone) {
        if (!conf || String(conf) === String(pwd)) {
          try { await upsertParentUserForPhone({ phone, password: String(pwd), name: parentName }); } catch (_) { }
        }
      }
    } catch (_) { }

    // Auto-provision user account if not already linked
    if (!payload.userId) {
      let user = null;
      if (payload.email) {
        try { user = await authSvc.findUserByEmail(payload.email); } catch (_) { user = null; }
      }
      if (!user) {
        const base = payload.rollNumber || payload.name || payload.email || 'student';
        const username = await authSvc.generateUniqueUsername({ base, role: 'student' });
        const password = authSvc.generateRandomPassword(12);
        const passwordHash = await bcrypt.hash(password, 10);
        user = await authSvc.createUserWith({
          email: payload.email || null,
          username,
          passwordHash,
          role: 'student',
          name: payload.name || username,
          campusId: req.user?.campusId || payload.campusId
        });
        credentials = { username, password };
      }
      if (user) payload.userId = user.id;
    }

    if (!payload.campusId) payload.campusId = req.user?.campusId;
    if (!payload.campusId) return res.status(400).json({ message: 'Campus ID is required' });

    const created = await students.create(payload);
    const resp = credentials ? { ...created, credentials } : created;
    return res.status(201).json(resp);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    await ensureStudentExtendedColumns();
    const data = { ...req.body };

    if (!data.avatar) {
      data.avatar = data.photo || data.photoUrl || data.imageUrl || data.personal?.photo;
    }

    // Upload base64 avatar to Cloudinary if provided on update
    if (data.avatar && typeof data.avatar === 'string' && data.avatar.startsWith('data:')) {
      try {
        const upload = await cloudinary.uploader.upload(data.avatar, { folder: 'students' });
        data.avatar = upload.secure_url;
      } catch (_) {
        // If upload fails, keep the provided avatar as-is
      }
    }
    // If Parent/Guardian portal password is supplied on update, upsert the parent user
    try {
      const p = data.parent || {};
      const g = p.guardian || {};
      const pwd = (p?.hasGuardian && g?.portalPassword) || p?.portalPassword;
      const conf = (p?.hasGuardian && g?.portalPasswordConfirm) || p?.portalPasswordConfirm;
      const phone = (p?.hasGuardian && g?.phone) || p?.father?.phone || p?.mother?.phone;
      const parentName = (p?.hasGuardian && g?.name) || p?.father?.name || p?.mother?.name || data.parentName || data.name || 'Parent';
      if (pwd && String(pwd).length >= 4 && phone) {
        if (!conf || String(conf) === String(pwd)) {
          try { await upsertParentUserForPhone({ phone, password: String(pwd), name: parentName }); } catch (_) { }
        }
      }
    } catch (_) { }

    const updated = await students.update(Number(req.params.id), data);
    if (!updated) return res.status(404).json({ message: 'Student not found' });
    return res.json(updated);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    const ok = await students.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ message: 'Student not found' });
    return res.json({ success: true });
  } catch (e) { next(e); }
};

// Attendance (per-student)
export const listAttendance = async (req, res, next) => {
  try {
    const studentId = Number(req.params.id);
    if (req.user?.role === 'student') {
      const self = await students.getByUserId(req.user.id);
      if (!self || self.id !== studentId) return res.status(403).json({ message: 'Forbidden' });
    }
    if (req.user?.role === 'teacher') {
      const st = await students.getById(studentId);
      if (!st) return res.status(404).json({ message: 'Student not found' });
      const scopes = await teachersSvc.getTeachingScopesByUserId(req.user.id);
      const ok = scopes.some((s) => {
        if (!s?.className) return false;
        if (String(s.className) !== String(st.class)) return false;
        if (s.section) return String(s.section) === String(st.section);
        return true;
      });
      if (!ok) return res.status(403).json({ message: 'Forbidden' });
    }
    const { startDate, endDate, page = 1, pageSize = 50 } = req.query;
    const data = await students.listAttendance(studentId, { startDate, endDate, page: Number(page), pageSize: Number(pageSize) });
    return res.json(data);
  } catch (e) { next(e); }
};

export const addAttendance = async (req, res, next) => {
  try {
    const studentId = Number(req.params.id);
    const created = await students.addAttendance(studentId, req.body);
    return res.status(201).json(created);
  } catch (e) { next(e); }
};

export const updateAttendance = async (req, res, next) => {
  try {
    const updated = await students.updateAttendance(Number(req.params.attendanceId), req.body);
    if (!updated) return res.status(404).json({ message: 'Attendance not found' });
    return res.json(updated);
  } catch (e) { next(e); }
};

export const removeAttendance = async (req, res, next) => {
  try {
    const ok = await students.removeAttendance(Number(req.params.attendanceId));
    if (!ok) return res.status(404).json({ message: 'Attendance not found' });
    return res.json({ success: true });
  } catch (e) { next(e); }
};

// Performance
export const getPerformance = async (req, res, next) => {
  try {
    if (req.user?.role === 'student') {
      const self = await students.getByUserId(req.user.id);
      if (!self || self.id !== Number(req.params.id)) return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.user?.role === 'teacher') {
      const st = await students.getById(Number(req.params.id));
      if (!st) return res.status(404).json({ message: 'Student not found' });
      const scopes = await teachersSvc.getTeachingScopesByUserId(req.user.id);
      const ok = scopes.some((s) => {
        if (!s?.className) return false;
        if (String(s.className) !== String(st.class)) return false;
        if (s.section) return String(s.section) === String(st.section);
        return true;
      });
      if (!ok) return res.status(403).json({ message: 'Forbidden' });
    }

    const data = await students.getPerformance(Number(req.params.id));
    return res.json(data);
  } catch (e) { next(e); }
};

// Fees
export const getFees = async (req, res, next) => {
  try {
    await ensureFinanceConstraints();
    if (req.user?.role === 'student') {
      const self = await students.getByUserId(req.user.id);
      if (!self || self.id !== Number(req.params.id)) return res.status(403).json({ message: 'Forbidden' });
    }
    const data = await students.getFees(Number(req.params.id));
    return res.json(data);
  } catch (e) { next(e); }
};

export const listFeePayments = async (req, res, next) => {
  try {
    await ensureFinanceConstraints();
    const studentId = Number(req.params.id);
    if (req.user?.role === 'student') {
      const self = await students.getByUserId(req.user.id);
      if (!self || self.id !== studentId) return res.status(403).json({ message: 'Forbidden' });
    }
    const rows = await students.listFeePayments(studentId);
    return res.json({ items: rows });
  } catch (e) {
    next(e);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    await ensureFinanceConstraints();
    if (req.user?.role === 'student') {
      const self = await students.getByUserId(req.user.id);
      if (!self || self.id !== Number(req.params.id)) return res.status(403).json({ message: 'Forbidden' });
    }
    const created = await students.recordPayment(Number(req.params.id), req.body);
    if (!created) return res.status(404).json({ message: 'Invoice not found for student' });
    return res.status(201).json(created);
  } catch (e) { next(e); }
};

export const createInvoice = async (req, res, next) => {
  try {
    await ensureFinanceConstraints();
    const created = await students.createInvoice(Number(req.params.id), req.body);
    return res.status(201).json(created);
  } catch (e) { next(e); }
};

export const updateInvoice = async (req, res, next) => {
  try {
    await ensureFinanceConstraints();
    const row = await students.updateInvoice(
      Number(req.params.id),
      Number(req.params.invoiceId),
      req.body
    );
    if (!row) return res.status(404).json({ message: 'Invoice not found for student' });
    return res.json(row);
  } catch (e) { next(e); }
};

// Transport
export const getTransport = async (req, res, next) => {
  try {
    if (req.user?.role === 'student') {
      const self = await students.getByUserId(req.user.id);
      if (!self || self.id !== Number(req.params.id)) return res.status(403).json({ message: 'Forbidden' });
    }
    const data = await students.getTransport(Number(req.params.id));
    return res.json(data || {});
  } catch (e) { next(e); }
};

export const updateTransport = async (req, res, next) => {
  try {
    const data = await students.updateTransport(Number(req.params.id), req.body);
    return res.json(data);
  } catch (e) { next(e); }
};

export const updateSelfProfile = async (req, res, next) => {
  try {
    await ensureStudentExtendedColumns();
    if (req.user?.role !== 'student') return res.status(403).json({ message: 'Forbidden' });
    const self = await students.getByUserId(req.user.id);
    if (!self) return res.status(404).json({ message: 'Student profile not found' });
    const allowed = {
      name: req.body?.name,
      email: req.body?.email,
      parentName: req.body?.parentName,
      parentPhone: req.body?.parentPhone,
      personal: req.body?.personal,
      parent: req.body?.parent,
      avatar: req.body?.avatar,
    };
    delete allowed.campusId;

    const updated = await students.update(self.id, allowed);
    if (!updated) return res.status(404).json({ message: 'Student profile not found' });
    return res.json(updated);
  } catch (e) {
    next(e);
  }
};

export const changeMyPassword = async (req, res, next) => {
  try {
    if (req.user?.role !== 'student') return res.status(403).json({ message: 'Forbidden' });

    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'currentPassword and newPassword are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const full = req.user?.email
      ? await authSvc.findUserByEmail(req.user.email)
      : null;
    if (!full) return res.status(404).json({ message: 'User not found' });
    const ok = await bcrypt.compare(String(currentPassword), full.password_hash || '');
    if (!ok) return res.status(401).json({ message: 'Invalid current password' });

    const passwordHash = await bcrypt.hash(String(newPassword), 10);
    await authSvc.updateUser(req.user.id, { passwordHash });

    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    let studentId = req.params.id ? Number(req.params.id) : undefined;
    if (req.user?.role === 'student') {
      const self = await students.getByUserId(req.user.id);
      if (!self) return res.status(404).json({ message: 'Student profile not found' });
      if (studentId && studentId !== self.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      studentId = self.id;
    }

    if (!studentId) return res.status(400).json({ message: 'Student ID required' });

    const stats = await students.getDashboardStats(studentId);
    return res.json(stats);
  } catch (e) {
    next(e);
  }
};

export const getAttendanceTrend = async (req, res, next) => {
  try {
    let studentId = req.params.id ? Number(req.params.id) : undefined;
    if (req.user?.role === 'student') {
      const self = await students.getByUserId(req.user.id);
      if (!self) return res.status(404).json({ message: 'Student profile not found' });
      studentId = self.id;
    }
    if (!studentId) return res.status(400).json({ message: 'Student ID required' });
    const trend = await students.getAttendanceTrend(studentId);
    return res.json(trend);
  } catch (e) {
    next(e);
  }
};

export const listMySubjectTeachers = async (req, res, next) => {
  try {
    if (req.user?.role !== 'student') return res.status(403).json({ message: 'Forbidden' });
    const self = await students.getByUserId(req.user.id);
    if (!self) return res.status(404).json({ message: 'Student profile not found' });
    const rows = await students.listSubjectTeachers({ studentId: self.id, campusId: req.user?.campusId });
    return res.json({ items: rows });
  } catch (e) {
    next(e);
  }
};

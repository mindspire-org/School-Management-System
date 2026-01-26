import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as teacherController from '../controllers/teachers.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const attendanceStatuses = ['present', 'absent', 'late'];
const payrollStatuses = ['pending', 'processing', 'paid', 'failed', 'cancelled'];
const timePattern = /^([01]\d|2[0-3]):[0-5]\d(?:[:][0-5]\d)?$/;
const monthPattern = /^\d{4}-\d{2}$/;

router.get(
  '/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 200 }),
    query('q').optional().isString(),
  ],
  validate,
  teacherController.list
);

const optionalString = (field) => body(field).optional({ checkFalsy: true }).isString().trim();

const sharedOptionalValidators = [
  body('experienceYears').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  optionalString('specialization'),
  body('probationEndDate').optional({ checkFalsy: true }).isISO8601(),
  body('contractEndDate').optional({ checkFalsy: true }).isISO8601(),
  body('workHoursPerWeek').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('allowances').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('deductions').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('currency').optional({ checkFalsy: true }).isLength({ min: 1, max: 8 }),
  body('payFrequency').optional({ checkFalsy: true }).isIn(['monthly', 'biweekly', 'weekly']),
  body('paymentMethod').optional({ checkFalsy: true }).isIn(['bank', 'cash', 'cheque']),
  optionalString('bankName'),
  optionalString('accountNumber'),
  optionalString('iban'),
  optionalString('bloodGroup'),
  optionalString('religion'),
  optionalString('nationalId'),
  optionalString('address1'),
  optionalString('address2'),
  optionalString('city'),
  optionalString('state'),
  optionalString('postalCode'),
  optionalString('emergencyName'),
  optionalString('emergencyPhone'),
  optionalString('emergencyRelation'),
  optionalString('avatar'),
];

const createTeacherValidators = [
  body('name').isString().trim().notEmpty(),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body('phone').isString().trim().notEmpty(),
  body('qualification').isString().trim().notEmpty(),
  body('employmentType').isIn(['fullTime', 'partTime']),
  body('employmentStatus').optional({ checkFalsy: true }).isIn(['active', 'inactive', 'on_leave', 'resigned']),
  body('joiningDate').isISO8601(),
  body('employeeId').isString().trim().notEmpty(),
  body('department').isString().trim().notEmpty(),
  body('designation').isString().trim().notEmpty(),
  body('gender').isIn(['male', 'female', 'other']),
  body('dob').isISO8601(),
  body('subjects').isArray({ min: 1 }),
  body('subjects.*').isString().trim().notEmpty(),
  body('classes').isArray({ min: 1 }),
  body('classes.*').isString().trim().notEmpty(),
  body('baseSalary').isFloat({ min: 0 }),
  ...sharedOptionalValidators,
];

const updateTeacherValidators = [
  body('name').optional({ nullable: true }).isString().trim().notEmpty(),
  body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
  body('phone').optional({ nullable: true }).isString().trim().notEmpty(),
  body('qualification').optional({ checkFalsy: true }).isString().trim().notEmpty(),
  body('employmentType').optional({ checkFalsy: true }).isIn(['fullTime', 'partTime']),
  body('joiningDate').optional({ checkFalsy: true }).isISO8601(),
  body('employeeId').optional({ checkFalsy: true }).isString().trim().notEmpty(),
  body('department').optional({ checkFalsy: true }).isString().trim().notEmpty(),
  body('designation').optional({ checkFalsy: true }).isString().trim().notEmpty(),
  body('gender').optional({ checkFalsy: true }).isIn(['male', 'female', 'other']),
  body('dob').optional({ checkFalsy: true }).isISO8601(),
  body('subjects').optional().isArray({ min: 1 }),
  body('subjects.*').optional().isString().trim().notEmpty(),
  body('classes').optional().isArray({ min: 1 }),
  body('classes.*').optional().isString().trim().notEmpty(),
  body('baseSalary').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  ...sharedOptionalValidators,
];

router.post(
  '/',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  createTeacherValidators,
  validate,
  teacherController.create
);

router.get(
  '/attendance',
  authenticate,
  [query('date').isISO8601(), query('teacherId').optional().isInt({ min: 1 })],
  validate,
  teacherController.listAttendance
);

router.post(
  '/attendance',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [
    body('date').isISO8601(),
    body('entries').isArray({ min: 1 }),
    body('entries.*.teacherId').isInt({ min: 1 }),
    body('entries.*.status').isIn(attendanceStatuses),
    body('entries.*.checkInTime').optional({ checkFalsy: true }).matches(timePattern),
    body('entries.*.checkOutTime').optional({ checkFalsy: true }).matches(timePattern),
    body('entries.*.remarks').optional().isString().trim(),
  ],
  validate,
  teacherController.saveAttendance
);

router.get(
  '/payrolls',
  authenticate,
  [
    query('month').optional().matches(monthPattern),
    query('teacherId').optional().isInt({ min: 1 }),
    query('status').optional().isIn(payrollStatuses),
  ],
  validate,
  teacherController.listPayrolls
);

router.post(
  '/payrolls',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [
    body('teacherId').isInt({ min: 1 }),
    body('periodMonth').optional().matches(monthPattern),
    body('month').optional().matches(monthPattern),
    body('baseSalary').isFloat({ min: 0 }),
    body('allowances').optional({ checkFalsy: true }).isFloat({ min: 0 }),
    body('deductions').optional({ checkFalsy: true }).isFloat({ min: 0 }),
    body('bonuses').optional({ checkFalsy: true }).isFloat({ min: 0 }),
    body('status').optional().isIn(payrollStatuses),
    body('paymentMethod').optional({ checkFalsy: true }).isIn(['bank', 'cash', 'cheque']),
    optionalString('paymentMethod'),
    optionalString('bankName'),
    optionalString('accountTitle'),
    optionalString('accountNumber'),
    optionalString('iban'),
    optionalString('chequeNumber'),
    optionalString('transactionReference'),
    optionalString('notes'),
    body('paidOn').optional({ checkFalsy: true }).isISO8601(),
    body().custom((_, { req }) => {
      if (!req.body.periodMonth && !req.body.month) {
        throw new Error('periodMonth or month is required');
      }
      return true;
    }),
  ],
  validate,
  teacherController.createPayroll
);

router.patch(
  '/payrolls/:id',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [
    param('id').isInt(),
    body('periodMonth').optional().matches(monthPattern),
    body('month').optional().matches(monthPattern),
    body('baseSalary').optional({ checkFalsy: true }).isFloat({ min: 0 }),
    body('allowances').optional({ checkFalsy: true }).isFloat({ min: 0 }),
    body('deductions').optional({ checkFalsy: true }).isFloat({ min: 0 }),
    body('bonuses').optional({ checkFalsy: true }).isFloat({ min: 0 }),
    body('status').optional().isIn(payrollStatuses),
    body('paymentMethod').optional({ checkFalsy: true }).isIn(['bank', 'cash', 'cheque']),
    optionalString('paymentMethod'),
    optionalString('bankName'),
    optionalString('accountTitle'),
    optionalString('accountNumber'),
    optionalString('iban'),
    optionalString('chequeNumber'),
    optionalString('transactionReference'),
    optionalString('notes'),
    body('paidOn').optional({ checkFalsy: true }).isISO8601(),
  ],
  validate,
  teacherController.updatePayroll
);

router.delete(
  '/payrolls/:id',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [param('id').isInt()],
  validate,
  teacherController.deletePayroll
);

router.get(
  '/performance',
  authenticate,
  [query('periodType').optional().isString(), query('teacherId').optional().isInt({ min: 1 })],
  validate,
  teacherController.listPerformanceReviews
);

router.post(
  '/performance',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [
    body('teacherId').isInt({ min: 1 }),
    body('periodType').isString().trim().notEmpty(),
    optionalString('periodLabel'),
    body('periodStart').optional({ checkFalsy: true }).isISO8601(),
    body('periodEnd').optional({ checkFalsy: true }).isISO8601(),
    body('overallScore').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100 }),
    body('studentFeedbackScore').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100 }),
    body('attendanceScore').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100 }),
    body('classManagementScore').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100 }),
    body('examResultsScore').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100 }),
    optionalString('status'),
    body('improvement').optional({ checkFalsy: true }).isFloat({ min: -100, max: 100 }),
    optionalString('remarks'),
  ],
  validate,
  teacherController.createPerformanceReview
);

router.patch(
  '/performance/:id',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [
    param('id').isInt(),
    body('teacherId').optional({ checkFalsy: true }).isInt({ min: 1 }),
    body('periodType').optional({ checkFalsy: true }).isString().trim(),
    optionalString('periodLabel'),
    body('periodStart').optional({ checkFalsy: true }).isISO8601(),
    body('periodEnd').optional({ checkFalsy: true }).isISO8601(),
    body('overallScore').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100 }),
    body('studentFeedbackScore').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100 }),
    body('attendanceScore').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100 }),
    body('classManagementScore').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100 }),
    body('examResultsScore').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100 }),
    optionalString('status'),
    body('improvement').optional({ checkFalsy: true }).isFloat({ min: -100, max: 100 }),
    optionalString('remarks'),
  ],
  validate,
  teacherController.updatePerformanceReview
);

router.get(
  '/subjects',
  authenticate,
  [],
  validate,
  teacherController.listSubjects
);

router.get(
  '/subjects/by-class',
  authenticate,
  [query('className').optional().isString(), query('section').optional().isString()],
  validate,
  teacherController.listSubjectsByClass
);

router.post(
  '/subjects',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [body('name').isString().trim().notEmpty(), optionalString('code'), optionalString('department'), optionalString('description')],
  validate,
  teacherController.createSubject
);

router.patch(
  '/subjects/:id',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [
    param('id').isInt(),
    optionalString('name'),
    optionalString('code'),
    optionalString('department'),
    optionalString('description'),
  ],
  validate,
  teacherController.updateSubject
);

router.delete(
  '/subjects/:id',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [param('id').isInt()],
  validate,
  teacherController.removeSubject
);

router.get(
  '/subjects/assignments',
  authenticate,
  [
    query('teacherId').optional().isInt({ min: 1 }),
    query('subjectId').optional().isInt({ min: 1 }),
  ],
  validate,
  teacherController.listSubjectAssignments
);

router.get(
  '/my-classes',
  authenticate,
  [query('teacherId').optional().isInt({ min: 1 }), query('q').optional().isString()],
  validate,
  teacherController.listMyClasses
);

router.get(
  '/students-by-subject',
  authenticate,
  [
    query('teacherId').optional().isInt({ min: 1 }),
    query('q').optional().isString(),
    query('search').optional().isString(),
    query('grade').optional().isString(),
    query('className').optional().isString(),
    query('class').optional().isString(),
    query('subject').optional().isString(),
  ],
  validate,
  teacherController.listStudentsBySubject
);

router.post(
  '/subjects/assignments',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [
    body('teacherId').isInt({ min: 1 }),
    body('subjectId').isInt({ min: 1 }),
    body('isPrimary').optional().isBoolean(),
    body('classes').optional().isArray(),
    optionalString('academicYear'),
  ],
  validate,
  teacherController.assignSubject
);

router.patch(
  '/subjects/assignments/:assignmentId',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [
    param('assignmentId').isInt(),
    body('teacherId').optional({ checkFalsy: true }).isInt({ min: 1 }),
    body('subjectId').optional({ checkFalsy: true }).isInt({ min: 1 }),
    body('isPrimary').optional().isBoolean(),
    body('classes').optional().isArray(),
    optionalString('academicYear'),
  ],
  validate,
  teacherController.updateSubjectAssignment
);

router.delete(
  '/subjects/assignments/:assignmentId',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [param('assignmentId').isInt()],
  validate,
  teacherController.removeSubjectAssignment
);

router.get(
  '/schedules',
  authenticate,
  [
    query('teacherId').optional().isInt({ min: 1 }),
    query('day').optional().isString().trim(),
    query('dayOfWeek').optional().isString().trim(),
  ],
  validate,
  teacherController.listSchedules
);

router.post(
  '/schedules',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [
    body('teacherId').isInt({ min: 1 }),
    body('dayOfWeek').optional().isString().trim(),
    body('day').optional().isString().trim(),
    body('startTime').matches(timePattern),
    body('endTime').matches(timePattern),
    optionalString('class'),
    optionalString('className'),
    optionalString('section'),
    optionalString('subject'),
    optionalString('room'),
    body('timeSlotIndex').optional({ checkFalsy: true }).isInt({ min: 1 }),
    optionalString('timeSlotLabel'),
    body().custom((_, { req }) => {
      if (!req.body.dayOfWeek && !req.body.day) {
        throw new Error('dayOfWeek or day is required');
      }
      return true;
    }),
  ],
  validate,
  teacherController.createScheduleSlot
);

router.put(
  '/schedules/:scheduleId',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [
    param('scheduleId').isInt(),
    body('dayOfWeek').optional().isString().trim(),
    body('day').optional().isString().trim(),
    body('startTime').optional({ checkFalsy: true }).matches(timePattern),
    body('endTime').optional({ checkFalsy: true }).matches(timePattern),
    optionalString('class'),
    optionalString('className'),
    optionalString('section'),
    optionalString('subject'),
    optionalString('room'),
    body('timeSlotIndex').optional({ checkFalsy: true }).isInt({ min: 1 }),
    optionalString('timeSlotLabel'),
  ],
  validate,
  teacherController.updateScheduleSlot
);

router.delete(
  '/schedules/:scheduleId',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [param('scheduleId').isInt()],
  validate,
  teacherController.deleteScheduleSlot
);

router.get(
  '/:id/schedule',
  authenticate,
  [param('id').isInt()],
  validate,
  teacherController.getSchedule
);

router.get(
  '/:id/dashboard-stats',
  authenticate,
  [param('id').isInt()],
  validate,
  teacherController.getDashboardStats
);

router.get(
  '/:id',
  authenticate,
  [param('id').isInt()],
  validate,
  teacherController.getById
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [param('id').isInt(), ...updateTeacherValidators],
  validate,
  teacherController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'owner', 'superadmin'),
  [param('id').isInt()],
  validate,
  teacherController.remove
);

export default router;

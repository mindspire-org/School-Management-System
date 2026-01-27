import { Router } from 'express';
import authRoutes from './auth.routes.js';
import studentRoutes from './students.routes.js';
import teacherRoutes from './teachers.routes.js';
import driversRoutes from './drivers.routes.js';
import assignmentRoutes from './assignments.routes.js';
import attendanceRoutes from './attendance.routes.js';
import transportRoutes from './transport.routes.js';
import rfidRoutes from './rfid.routes.js';
import financeRoutes from './finance.routes.js';
import communicationRoutes from './communication.routes.js';
import reportsRoutes from './reports.routes.js';
import settingsRoutes from './settings.routes.js';
import notificationsRoutes from './notifications.routes.js';
import examsRoutes from './exams.routes.js';
import resultsRoutes from './results.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import classRoutes from './classes.routes.js';
import syllabusRoutes from './syllabus.routes.js';
import gradingRoutes from './grading.routes.js';
import alertsRoutes from './alerts.routes.js';
import rbacRoutes from './rbac.routes.js';
import parentsRoutes from './parents.routes.js';
import expensesRoutes from './expenses.routes.js';
import campusRoutes from './campuses.routes.js';
import masterDataRoutes from './masterData.routes.js';
import sharedContentRoutes from './sharedContent.routes.js';

// New module routes
import inventoryRoutes from './inventory.routes.js';
import receptionRoutes from './reception.routes.js';
import cardManagementRoutes from './cardManagement.routes.js';
import eventsCertificatesRoutes from './eventsCertificates.routes.js';
import certificatesRoutes from './certificates.routes.js';
import hrRoutes from './hr.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/drivers', driversRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/transport', transportRoutes);
router.use('/rfid', rfidRoutes);
router.use('/finance', financeRoutes);
router.use('/communication', communicationRoutes);
router.use('/reports', reportsRoutes);
router.use('/settings', settingsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/alerts', alertsRoutes);
router.use('/exams', examsRoutes);
router.use('/results', resultsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/classes', classRoutes);
router.use('/syllabus', syllabusRoutes);
router.use('/grading', gradingRoutes);
router.use('/rbac', rbacRoutes);
router.use('/parents', parentsRoutes);
router.use('/expenses', expensesRoutes);
router.use('/campuses', campusRoutes);
router.use('/master-data', masterDataRoutes);
router.use('/shared-content', sharedContentRoutes);

// New module routes
router.use('/inventory', inventoryRoutes);
router.use('/reception', receptionRoutes);
router.use('/card-management', cardManagementRoutes);
router.use('/events-certificates', eventsCertificatesRoutes);
router.use('/certificates', certificatesRoutes);
router.use('/hr', hrRoutes);

export default router;

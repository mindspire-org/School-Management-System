import { Router } from 'express';
import * as controller from '../controllers/masterData.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Middleware
router.use(authenticate);
router.use(authorize('admin', 'owner'));

// Subjects
router.get('/subjects', controller.getSubjects);
router.post('/subjects', controller.createSubject);
router.put('/subjects/:id', controller.updateSubject);
router.delete('/subjects/:id', controller.deleteSubject);

// Designations
router.get('/designations', controller.getDesignations);
router.post('/designations', controller.createDesignation);
router.put('/designations/:id', controller.updateDesignation);
router.delete('/designations/:id', controller.deleteDesignation);

// Fee Rules
router.get('/fee-rules', controller.getFeeRules);
router.post('/fee-rules', controller.createFeeRule);
router.put('/fee-rules/:id', controller.updateFeeRule);
router.delete('/fee-rules/:id', controller.deleteFeeRule);

// Departments
router.get('/departments', controller.getDepartments);
router.post('/departments', controller.createDepartment);
router.put('/departments/:id', controller.updateDepartment);
router.delete('/departments/:id', controller.deleteDepartment);

export default router;

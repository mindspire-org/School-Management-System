import { Router } from 'express';
import { body, param } from 'express-validator';
import * as controller from '../controllers/transport.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/stats', authenticate, controller.getStats);
router.get('/student-entries', authenticate, controller.listStudentEntries);

router.get('/buses', authenticate, controller.listBuses);
router.get('/buses/:id', authenticate, [param('id').isInt()], validate, controller.getBusById);
router.post(
  '/buses',
  authenticate,
  authorize('admin', 'owner'),
  [
    body('number').isString().notEmpty(),
    body('driverName').optional().isString(),
    body('status').optional().isIn(['active', 'maintenance', 'inactive']),
    body('plate').optional().isString(),
    body('capacity').optional().isInt({ min: 0 }),
    body('lastService').optional().isISO8601(),
    body('routeId').optional().isInt({ min: 1 })
  ],
  validate,
  controller.createBus
);
router.put(
  '/buses/:id',
  authenticate,
  authorize('admin', 'owner'),
  [
    param('id').isInt(),
    body('number').optional().isString(),
    body('driverName').optional().isString(),
    body('status').optional().isIn(['active', 'maintenance', 'inactive']),
    body('plate').optional().isString(),
    body('capacity').optional().isInt({ min: 0 }),
    body('lastService').optional().isISO8601(),
    body('routeId').optional().isInt({ min: 1 })
  ],
  validate,
  controller.updateBus
);
router.delete('/buses/:id', authenticate, authorize('admin', 'owner'), [param('id').isInt()], validate, controller.deleteBus);

router.get('/routes', authenticate, controller.listRoutes);
router.get('/routes/:id', authenticate, [param('id').isInt()], validate, controller.getRouteById);
router.post('/routes', authenticate, authorize('admin', 'owner'), [body('name').isString().notEmpty()], validate, controller.createRoute);
router.put('/routes/:id', authenticate, authorize('admin', 'owner'), [param('id').isInt()], validate, controller.updateRoute);
router.delete('/routes/:id', authenticate, authorize('admin', 'owner'), [param('id').isInt()], validate, controller.deleteRoute);

router.get('/routes/:id/stops', authenticate, [param('id').isInt()], validate, controller.listStops);
router.post(
  '/routes/:id/stops',
  authenticate,
  authorize('admin', 'owner'),
  [param('id').isInt(), body('name').isString().notEmpty(), body('latitude').optional().isFloat(), body('longitude').optional().isFloat(), body('sequence').optional().isInt({ min: 1 })],
  validate,
  controller.addStop
);
router.put(
  '/routes/:id/stops/:stopId',
  authenticate,
  authorize('admin', 'owner'),
  [param('id').isInt(), param('stopId').isInt()],
  validate,
  controller.updateStop
);
router.delete(
  '/routes/:id/stops/:stopId',
  authenticate,
  authorize('admin', 'owner'),
  [param('id').isInt(), param('stopId').isInt()],
  validate,
  controller.removeStop
);

router.post(
  '/assign-bus',
  authenticate,
  authorize('admin', 'owner'),
  [body('busId').isInt(), body('routeId').isInt()],
  validate,
  controller.assignBusToRoute
);

router.get('/students/:studentId', authenticate, [param('studentId').isInt()], validate, controller.getStudentTransport);
router.put(
  '/students/:studentId',
  authenticate,
  authorize('admin', 'owner'),
  [param('studentId').isInt()],
  validate,
  controller.setStudentTransport
);

export default router;

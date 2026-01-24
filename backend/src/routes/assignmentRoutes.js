const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/assignmentController');

router.get('/', auth(['admin', 'teacher', 'student']), ctrl.list);
router.post('/', auth(['admin', 'teacher']), ctrl.create);
router.get('/:id', auth(['admin', 'teacher', 'student']), ctrl.get);
router.put('/:id', auth(['admin', 'teacher']), ctrl.update);
router.delete('/:id', auth(['admin']), ctrl.remove);
router.post('/:id/submit', auth(['student']), ctrl.submit);

module.exports = router;

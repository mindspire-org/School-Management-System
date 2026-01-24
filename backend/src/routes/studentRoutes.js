const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/studentController');

router.get('/', auth(['admin']), ctrl.list);
router.post('/', auth(['admin']), ctrl.create);
router.get('/:id', auth(['admin', 'teacher']), ctrl.get);
router.put('/:id', auth(['admin']), ctrl.update);
router.delete('/:id', auth(['admin']), ctrl.remove);
router.get('/:id/schedule', auth(['admin','teacher','student']), ctrl.schedule);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/authController');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/logout', auth(), ctrl.logout);
router.post('/refresh', auth(), ctrl.refresh);
router.get('/profile', auth(), ctrl.profile);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { isAuthenticated, isGuest } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/me', isAuthenticated, auth.me);
router.post('/register', isGuest, upload.single('avatar'), auth.register);
router.post('/login', isGuest, auth.login);
router.post('/logout', isAuthenticated, auth.logout);

module.exports = router;

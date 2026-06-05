const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');
const { isGuest, isAuthenticated } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/register', isGuest, auth.showRegister);
router.post('/register', isGuest, upload.single('avatar'), validateRegister, auth.register);
router.get('/login', isGuest, auth.showLogin);
router.post('/login', isGuest, validateLogin, auth.login);
router.post('/logout', isAuthenticated, auth.logout);
router.get('/logout', isAuthenticated, auth.logout);

module.exports = router;

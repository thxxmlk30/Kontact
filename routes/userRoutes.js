const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/profile', isAuthenticated, user.viewProfile);
router.get('/profile/edit', isAuthenticated, user.showEditProfile);
router.post('/profile/edit', isAuthenticated, upload.single('avatar'), user.updateProfile);

router.get('/users/me', isAuthenticated, user.getProfile);
router.get('/users/search', isAuthenticated, user.searchUser);
router.get('/users/:id', isAuthenticated, user.viewProfile);

module.exports = router;

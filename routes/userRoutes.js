const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/profile', isAuthenticated, user.getProfile);
router.put('/profile', isAuthenticated, upload.single('avatar'), user.updateProfile);
router.get('/search', isAuthenticated, user.searchUser);
router.get('/:id', isAuthenticated, user.getUser);

module.exports = router;

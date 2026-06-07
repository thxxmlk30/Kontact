const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { isAdmin } = require('../middleware/authMiddleware');

router.get('/stats', isAdmin, admin.dashboard);
router.get('/users', isAdmin, admin.getUsers);
router.get('/posts', isAdmin, admin.getPosts);
router.patch('/users/:id/toggle', isAdmin, admin.toggleStatus);
router.delete('/posts/:id', isAdmin, admin.deletePost);
router.delete('/users/:id', isAdmin, admin.deleteUser);

module.exports = router;

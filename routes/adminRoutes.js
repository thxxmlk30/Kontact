const express = require('express');
const router  = express.Router();
const admin   = require('../controllers/adminController');
const { isAdmin } = require('../middleware/authMiddleware');

router.get('/',                  isAdmin, admin.dashboard);
router.get('/users',             isAdmin, admin.getUsers);
router.get('/posts',             isAdmin, admin.getPosts);
router.post('/users/:id/toggle', isAdmin, admin.toggleStatus);
router.post('/posts/:id/delete', isAdmin, admin.deletePost);
router.post('/users/:id/delete', isAdmin, admin.deleteUser);

module.exports = router;
const express = require('express');
const router = express.Router();
const notif = require('../controllers/notificationController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', isAuthenticated, notif.getAll);
router.patch('/read-all', isAuthenticated, notif.markAll);
router.patch('/:id', isAuthenticated, notif.markOne);

module.exports = router;

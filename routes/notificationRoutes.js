const express = require('express');
const router  = express.Router();
const notif   = require('../controllers/notificationController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', isAuthenticated, notif.getAll);
module.exports = router;
const express = require('express');
const router = express.Router();
const messages = require('../controllers/messageController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', isAuthenticated, messages.getConversations);
router.get('/:userId', isAuthenticated, messages.openConversation);
router.post('/', isAuthenticated, messages.send);

module.exports = router;

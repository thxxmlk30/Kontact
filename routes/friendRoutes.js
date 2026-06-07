const express = require('express');
const router = express.Router();
const friend = require('../controllers/friendController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', isAuthenticated, friend.getList);
router.get('/requests', isAuthenticated, friend.getRequests);
router.get('/suggestions', isAuthenticated, friend.getSuggestions);
router.post('/request/:id', isAuthenticated, friend.sendRequest);
router.post('/respond/:id', isAuthenticated, friend.respond);
router.delete('/:id', isAuthenticated, friend.remove);

module.exports = router;

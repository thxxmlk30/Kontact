const express = require('express');
const router  = express.Router();
const friend  = require('../controllers/friendController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/friends/request/:id', isAuthenticated, friend.sendRequest);
router.post('/friends/respond/:id', isAuthenticated, friend.respond);
router.get('/friends',              isAuthenticated, friend.getList);
router.get('/friends/requests',     isAuthenticated, friend.getRequests);

module.exports = router;
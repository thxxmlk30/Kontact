const express = require('express');
const router = express.Router();
const like = require('../controllers/likeController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/', isAuthenticated, like.toggleLike);
router.get('/post/:postId/count', isAuthenticated, like.getLikeCount);

module.exports = router;

const express = require('express');
const router = express.Router();
const comment = require('../controllers/commentController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/', isAuthenticated, comment.createComment);
router.get('/post/:postId', isAuthenticated, comment.getCommentsByPost);
router.delete('/:id', isAuthenticated, comment.deleteComment);

module.exports = router;

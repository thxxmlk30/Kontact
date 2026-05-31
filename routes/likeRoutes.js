const express = require('express');
const router = express.Router();

const likeController = require('../controllers/likeController');
const authMiddleware = require('../middleware/authMiddleware');

// Liker / enlever le like d’un post
router.post('/', authMiddleware.isLoggedIn, likeController.toggleLike);

// Compter les likes d’un post
router.get('/post/:postId/count', authMiddleware.isLoggedIn, likeController.getLikeCount);

module.exports = router;
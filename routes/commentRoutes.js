const express = require('express');
const router = express.Router();

const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

// Ajouter un commentaire
router.post('/', authMiddleware.isLoggedIn, commentController.createComment);

// Récupérer tous les commentaires d’un post
router.get('/post/:postId', authMiddleware.isLoggedIn, commentController.getCommentsByPost);

// Supprimer un commentaire
router.delete('/:id', authMiddleware.isLoggedIn, commentController.deleteComment);

module.exports = router;
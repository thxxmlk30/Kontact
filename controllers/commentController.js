const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

const commentController = {
  async createComment(req, res) {
    try {
      const userId = req.session.user.id;
      const { postId, content } = req.body;

      if (!postId || !content || content.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Le contenu du commentaire est obligatoire.'
        });
      }

      const newComment = await Comment.create({
        post_id: postId,
        user_id: userId,
        content: content.trim()
      });

      await Notification.create({
        user_id: req.body.postOwnerId,
        type: 'comment',
        ref_id: newComment.insertId,
        is_read: 0
      });

      return res.status(201).json({
        success: true,
        message: 'Commentaire ajouté avec succès.',
        commentId: newComment.insertId
      });
    } catch (error) {
      console.error('createComment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du commentaire.'
      });
    }
  },

  async getCommentsByPost(req, res) {
    try {
      const { postId } = req.params;

      const comments = await Comment.findByPostId(postId);

      return res.status(200).json({
        success: true,
        comments
      });
    } catch (error) {
      console.error('getCommentsByPost error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des commentaires.'
      });
    }
  },

  async deleteComment(req, res) {
    try {
      const userId = req.session.user.id;
      const { id } = req.params;

      const comment = await Comment.findById(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Commentaire introuvable.'
        });
      }

      if (comment.user_id !== userId && req.session.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Action non autorisée.'
        });
      }

      await Comment.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Commentaire supprimé avec succès.'
      });
    } catch (error) {
      console.error('deleteComment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du commentaire.'
      });
    }
  }
};

module.exports = commentController;
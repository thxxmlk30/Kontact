const Like = require('../models/Like');
const Notification = require('../models/Notification');

const likeController = {
  async toggleLike(req, res) {
    try {
      const userId = req.session.user.id;
      const { postId, postOwnerId } = req.body;

      if (!postId) {
        return res.status(400).json({
          success: false,
          message: 'postId est obligatoire.'
        });
      }

      const existingLike = await Like.findByUserAndPost(userId, postId);

      if (existingLike) {
        await Like.delete(existingLike.id);

        return res.status(200).json({
          success: true,
          action: 'unliked',
          message: 'Like retiré.'
        });
      }

      const newLike = await Like.create({
        user_id: userId,
        post_id: postId
      });

      if (postOwnerId && Number(postOwnerId) !== Number(userId)) {
        await Notification.create({
          user_id: postOwnerId,
          type: 'like',
          ref_id: newLike.insertId,
          is_read: 0
        });
      }

      return res.status(201).json({
        success: true,
        action: 'liked',
        message: 'Post liké avec succès.',
        likeId: newLike.insertId
      });
    } catch (error) {
      console.error('toggleLike error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du like.'
      });
    }
  },

  async getLikeCount(req, res) {
    try {
      const { postId } = req.params;

      const count = await Like.countByPostId(postId);

      return res.status(200).json({
        success: true,
        count
      });
    } catch (error) {
      console.error('getLikeCount error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du comptage des likes.'
      });
    }
  }
};

module.exports = likeController;
const Like = require('../models/Like');
const Notification = require('../models/Notification');
const Post = require('../models/Post');

exports.toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.body;
    if (!postId) return res.status(400).json({ message: 'postId est obligatoire.' });

    const post = await Post.getById(postId);
    if (!post) return res.status(404).json({ message: 'Publication introuvable.' });

    const action = await Like.toggle(req.session.user.id, postId);
    if (action === 'liked' && post.user_id !== req.session.user.id) {
      await Notification.create(post.user_id, 'like', postId);
    }

    const count = await Like.countByPostId(postId);
    return res.json({ action, count });
  } catch (err) {
    return next(err);
  }
};

exports.getLikeCount = async (req, res, next) => {
  try {
    const count = await Like.countByPostId(req.params.postId);
    return res.json({ count });
  } catch (err) {
    return next(err);
  }
};

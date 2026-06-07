const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Post = require('../models/Post');

exports.createComment = async (req, res, next) => {
  try {
    const { postId, content } = req.body;
    if (!postId || !content || !content.trim()) {
      return res.status(400).json({ message: 'Le commentaire est obligatoire.' });
    }

    const post = await Post.getById(postId);
    if (!post) return res.status(404).json({ message: 'Publication introuvable.' });

    const result = await Comment.create({
      post_id: postId,
      user_id: req.session.user.id,
      content: content.trim()
    });

    if (post.user_id !== req.session.user.id) {
      await Notification.create(post.user_id, 'comment', result.insertId);
    }

    return res.status(201).json({ id: result.insertId, message: 'Commentaire ajoute.' });
  } catch (err) {
    return next(err);
  }
};

exports.getCommentsByPost = async (req, res, next) => {
  try {
    const comments = await Comment.getByPost(req.params.postId);
    return res.json({ comments });
  } catch (err) {
    return next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Commentaire introuvable.' });
    if (comment.user_id !== req.session.user.id && req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Action non autorisee.' });
    }

    await Comment.delete(req.params.id);
    return res.json({ message: 'Commentaire supprime.' });
  } catch (err) {
    return next(err);
  }
};

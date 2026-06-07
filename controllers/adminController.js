const User = require('../models/User');
const Post = require('../models/Post');
const db = require('../config/db');

exports.dashboard = async (req, res, next) => {
  try {
    const [[usersCount]] = await db.execute('SELECT COUNT(*) AS total FROM users');
    const [[postsCount]] = await db.execute('SELECT COUNT(*) AS total FROM posts');
    const [[commentsCount]] = await db.execute('SELECT COUNT(*) AS total FROM comments');
    const [[messagesCount]] = await db.execute('SELECT COUNT(*) AS total FROM messages');
    const [[pendingRequests]] = await db.execute(
      "SELECT COUNT(*) AS total FROM friend_requests WHERE status = 'pending'"
    );

    return res.json({
      stats: {
        users: usersCount.total,
        posts: postsCount.total,
        comments: commentsCount.total,
        messages: messagesCount.total,
        pendingRequests: pendingRequests.total
      }
    });
  } catch (err) {
    return next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.getAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.getAll();
    return res.json({ posts });
  } catch (err) {
    return next(err);
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    await User.updateStatus(req.params.id, newStatus);
    return res.json({ status: newStatus });
  } catch (err) {
    return next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    await Post.delete(req.params.id);
    return res.json({ message: 'Publication supprimee.' });
  } catch (err) {
    return next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (Number(req.params.id) === Number(req.session.user.id)) {
      return res.status(400).json({ message: 'Impossible de supprimer votre propre compte.' });
    }
    await User.delete(req.params.id);
    return res.json({ message: 'Utilisateur supprime.' });
  } catch (err) {
    return next(err);
  }
};

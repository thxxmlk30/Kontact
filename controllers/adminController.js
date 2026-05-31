const User = require('../models/User');
const Post = require('../models/Post');
const db   = require('../config/db');

exports.dashboard = async (req, res) => {
  const [usersCount] = await db.execute('SELECT COUNT(*) as total FROM users');
  const [postsCount] = await db.execute('SELECT COUNT(*) as total FROM posts');
  const [msgsCount]  = await db.execute('SELECT COUNT(*) as total FROM messages');
  res.render('admin/dashboard', {
    stats: {
      users: usersCount[0].total,
      posts: postsCount[0].total,
      messages: msgsCount[0].total
    }
  });
};

exports.getUsers = async (req, res) => {
  const users = await User.getAll();
  res.render('admin/users', { users });
};

exports.getPosts = async (req, res) => {
  const posts = await Post.getAll();
  res.render('admin/posts', { posts });
};

exports.toggleStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  const newStatus = user.status === 'active' ? 'suspended' : 'active';
  await User.updateStatus(req.params.id, newStatus);
  res.redirect('/admin/users');
};

exports.deletePost = async (req, res) => {
  await Post.delete(req.params.id);
  res.redirect('/admin/posts');
};

exports.deleteUser = async (req, res) => {
  await User.delete(req.params.id);
  res.redirect('/admin/users');
};
const Post    = require('../models/Post');
const Comment = require('../models/Comment');

exports.getFeed = async (req, res) => {
  const posts = await Post.getFeed(req.session.user.id);
  res.render('feed/index', { posts });
};

exports.showCreate = (req, res) => res.render('posts/create', { error: null });

exports.create = async (req, res) => {
  const { content, visibility } = req.body;
  const image = req.file ? req.file.filename : null;
  await Post.create({ user_id: req.session.user.id, content, image, visibility });
  res.redirect('/feed');
};

exports.getDetail = async (req, res) => {
  const post     = await Post.getById(req.params.id);
  const comments = await Comment.getByPost(req.params.id);
  res.render('posts/detail', { post, comments });
};

exports.update = async (req, res) => {
  await Post.update(req.params.id, req.body.content);
  res.redirect(`/posts/${req.params.id}`);
};

exports.delete = async (req, res) => {
  await Post.delete(req.params.id);
  res.redirect('/feed');
};
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const mapPost = (post) => ({
  id: post.id,
  user_id: post.user_id,
  content: post.content,
  image: post.image,
  visibility: post.visibility,
  created_at: post.created_at,
  updated_at: post.updated_at,
  author: {
    id: post.user_id,
    fullname: post.fullname,
    username: post.username,
    avatar: post.avatar
  },
  likes_count: Number(post.likes_count || 0),
  comments_count: Number(post.comments_count || 0),
  user_liked: Number(post.user_liked || 0) > 0
});

exports.getFeed = async (req, res, next) => {
  try {
    const posts = await Post.getFeed(req.session.user.id);
    return res.json({ posts: posts.map(mapPost) });
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { content, visibility } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Le contenu est obligatoire.' });
    }

    const image = req.file ? req.file.filename : null;
    const postId = await Post.create({
      user_id: req.session.user.id,
      content: content.trim(),
      image,
      visibility
    });
    const post = await Post.getById(postId);

    return res.status(201).json({ post: mapPost(post) });
  } catch (err) {
    return next(err);
  }
};

exports.getDetail = async (req, res, next) => {
  try {
    const post = await Post.getById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Publication introuvable.' });
    const comments = await Comment.getByPost(req.params.id);
    return res.json({ post: mapPost(post), comments });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const post = await Post.getById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Publication introuvable.' });
    if (post.user_id !== req.session.user.id && req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Action non autorisee.' });
    }

    await Post.update(req.params.id, req.body.content || post.content);
    return res.json({ message: 'Publication mise a jour.' });
  } catch (err) {
    return next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const post = await Post.getById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Publication introuvable.' });
    if (post.user_id !== req.session.user.id && req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Action non autorisee.' });
    }

    await Post.delete(req.params.id);
    return res.json({ message: 'Publication supprimee.' });
  } catch (err) {
    return next(err);
  }
};

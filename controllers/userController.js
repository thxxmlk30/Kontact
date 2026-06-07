const User = require('../models/User');
const Post = require('../models/Post');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user.id);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    const posts = await Post.getByUser(req.params.id);
    return res.json({ user, posts });
  } catch (err) {
    return next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const current = await User.findById(req.session.user.id);
    const avatar = req.file ? req.file.filename : current.avatar;
    const data = {
      fullname: req.body.fullname || current.fullname,
      username: req.body.username || current.username,
      bio: req.body.bio || '',
      avatar,
      cover_image: current.cover_image
    };

    await User.update(req.session.user.id, data);
    const user = await User.findById(req.session.user.id);
    req.session.user = { ...req.session.user, ...user };
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
};

exports.searchUser = async (req, res, next) => {
  try {
    const users = await User.search(req.query.q || '', req.session.user.id);
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
};

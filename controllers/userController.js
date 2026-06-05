const User = require('../models/User');
const Post = require('../models/Post');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve.' });
    }

    return res.json(user);
  } catch (err) {
    return next(err);
  }
};

exports.viewProfile = async (req, res, next) => {
  try {
    const userId = req.params.id || req.session.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).render('errors/404');
    }

    const posts = await Post.getByUser(userId);
    return res.render('profile/view', { user, posts });
  } catch (err) {
    return next(err);
  }
};

exports.showEditProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user.id);
    return res.render('profile/edit', { user, error: null });
  } catch (err) {
    return next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const current = await User.findById(req.session.user.id);
    const avatar = req.file ? req.file.filename : current.avatar;

    await User.update(req.session.user.id, {
      fullname: req.body.fullname || current.fullname,
      username: req.body.username || current.username,
      bio: req.body.bio || current.bio,
      avatar
    });

    req.session.user = {
      ...req.session.user,
      fullname: req.body.fullname || current.fullname,
      username: req.body.username || current.username,
      avatar
    };

    return res.redirect('/profile');
  } catch (err) {
    return next(err);
  }
};

exports.searchUser = async (req, res, next) => {
  try {
    const users = await User.search(req.query.q || req.query.username || '');
    return res.json(users);
  } catch (err) {
    return next(err);
  }
};

const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.showRegister = (req, res) => {
  res.render('auth/register', { error: null });
};

exports.showLogin = (req, res) => {
  res.render('auth/login', { error: null });
};

exports.register = async (req, res, next) => {
  try {
    const { fullname, username, email, password } = req.body;
    const avatar = req.file ? req.file.filename : undefined;

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(409).render('auth/register', { error: 'Email deja utilise.' });
    }

    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(409).render('auth/register', { error: 'Nom utilisateur deja utilise.' });
    }

    const hash = await bcrypt.hash(password, 10);
    await User.create({ fullname, username, email, password: hash, avatar });

    return res.redirect('/login');
  } catch (err) {
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).render('auth/login', { error: 'Identifiants incorrects.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).render('auth/login', { error: 'Compte suspendu.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).render('auth/login', { error: 'Identifiants incorrects.' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      avatar: user.avatar,
      role: user.role
    };

    return res.redirect('/feed');
  } catch (err) {
    return next(err);
  }
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }

    res.clearCookie(process.env.SESSION_NAME || 'kontact.sid');
    return res.redirect('/login');
  });
};

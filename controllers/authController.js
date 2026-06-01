<<<<<<< HEAD
const bcrypt = require('bcrypt');
const User   = require('../models/User');

exports.showRegister = (req, res) => res.render('auth/register', { error: null });
exports.showLogin    = (req, res) => res.render('auth/login',    { error: null });

exports.register = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;
    const existing = await User.findByEmail(email);
    if (existing) return res.render('auth/register', { error: 'Email déjà utilisé.' });
    const hash = await bcrypt.hash(password, 10);
    await User.create({ fullname, username, email, password: hash });
    res.redirect('/login');
  } catch (err) {
    res.render('auth/register', { error: 'Erreur lors de l\'inscription.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.render('auth/login', { error: 'Identifiants incorrects.' });
    if (user.status === 'suspended') return res.render('auth/login', { error: 'Compte suspendu.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.render('auth/login', { error: 'Identifiants incorrects.' });
    req.session.user = { id: user.id, username: user.username, fullname: user.fullname, avatar: user.avatar, role: user.role };
    res.redirect('/feed');
  } catch (err) {
    res.render('auth/login', { error: 'Erreur serveur.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
=======
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    User.create({ username, email, password: hashedPassword }, (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de l\'inscription', error: err });
      res.status(201).json({ message: 'Inscription réussie' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  User.findByEmail(email, async (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  });
};

exports.logout = (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
>>>>>>> c9614ff (feat:auth,user controllers, routes et middlewares)
};
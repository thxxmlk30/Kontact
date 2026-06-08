const bcrypt = require('bcryptjs');
const User = require('../models/User');

const toPublicUser = (user) => ({
  id: user.id,
  fullname: user.fullname,
  username: user.username,
  email: user.email,
  bio: user.bio,
  avatar: user.avatar,
  cover_image: user.cover_image,
  role: user.role,
  status: user.status,
  created_at: user.created_at
});

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user.id);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { fullname, username, email, password } = req.body;
    const avatar = req.file ? req.file.filename : undefined;

    if (!fullname || !username || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caracteres.' });
    }

    if (await User.findByEmail(email)) {
      return res.status(409).json({ message: 'Email deja utilise.' });
    }

    if (await User.findByUsername(username)) {
      return res.status(409).json({ message: 'Nom utilisateur deja utilise.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await User.create({ fullname, username, email, password: hash, avatar });
    const user = await User.findById(result.insertId);
    req.session.user = toPublicUser(user);

    return res.status(201).json({ user: req.session.user });
  } catch (err) {
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // L'identifiant peut être un email ou un nom d'utilisateur
    const user = await User.findByUsernameOrEmail(email);

    const passwordMatches = user && (
      user.password.startsWith('$2')
        ? await bcrypt.compare(password, user.password)
        : password === user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Compte suspendu.' });
    }

    req.session.user = toPublicUser(user);
    return res.json({ user: req.session.user });
  } catch (err) {
    return next(err);
  }
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie(process.env.SESSION_NAME || 'kontact.sid');
    return res.json({ message: 'Deconnexion reussie.' });
  });
};

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }

  return res.status(401).json({ message: 'Authentification requise.' });
};

const isGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.status(409).json({ message: 'Utilisateur deja connecte.' });
  }

  return next();
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({ message: 'Acces administrateur requis.' });
};

module.exports = isAuthenticated;
module.exports.isAuthenticated = isAuthenticated;
module.exports.isLoggedIn = isAuthenticated;
module.exports.isGuest = isGuest;
module.exports.isAdmin = isAdmin;

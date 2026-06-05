const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }

  return res.redirect('/login');
};

const isGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/feed');
  }

  return next();
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }

  return res.status(403).render('errors/404');
};

module.exports = isAuthenticated;
module.exports.isAuthenticated = isAuthenticated;
module.exports.isLoggedIn = isAuthenticated;
module.exports.isGuest = isGuest;
module.exports.isAdmin = isAdmin;

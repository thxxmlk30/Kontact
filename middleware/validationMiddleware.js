const renderOrJson = (req, res, view, message) => {
  if (req.accepts('html')) {
    return res.status(400).render(view, { error: message });
  }

  return res.status(400).json({ message });
};

exports.validateRegister = (req, res, next) => {
  const { fullname, username, email, password } = req.body;

  if (!fullname || !username || !email || !password) {
    return renderOrJson(req, res, 'auth/register', 'Tous les champs sont obligatoires.');
  }

  if (password.length < 6) {
    return renderOrJson(req, res, 'auth/register', 'Le mot de passe doit contenir au moins 6 caracteres.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return renderOrJson(req, res, 'auth/register', 'Email invalide.');
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return renderOrJson(req, res, 'auth/login', 'Email et mot de passe requis.');
  }

  next();
};

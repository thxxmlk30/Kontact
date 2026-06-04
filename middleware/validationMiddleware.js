exports.validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: 'Tous les champs sont obligatoires' });

  if (password.length < 6)
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ message: 'Email invalide' });

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email et mot de passe requis' });

  next();
};
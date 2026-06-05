module.exports = (err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  if (req.accepts('html')) {
    return res.status(err.status || 500).render('errors/500');
  }

  return res.status(err.status || 500).json({
    message: err.message || 'Erreur serveur.'
  });
};

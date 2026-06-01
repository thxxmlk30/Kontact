const User = require('../models/User');

exports.getProfile = (req, res) => {
  User.findById(req.user.id, (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(results[0]);
  });
};

exports.updateProfile = (req, res) => {
  const { username, avatar } = req.body;
  User.update(req.user.id, { username, avatar }, (err, result) => {
    if (err)
      return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    res.json({ message: 'Profil mis à jour avec succès' });
  });
};

exports.searchUser = (req, res) => {
  const { username } = req.query;
  const db = require('../config/db');
  const sql = `SELECT id, username, email, avatar FROM users WHERE username LIKE ?`;
  db.query(sql, [`%${username}%`], (err, results) => {
    if (err)
      return res.status(500).json({ message: 'Erreur serveur' });
    res.json(results);
  });
};
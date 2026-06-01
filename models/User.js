const db = require('../config/db');

const User = {
  create: (userData, callback) => {
    const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.query(sql, [userData.username, userData.email, userData.password], callback);
  },

  findByEmail: (email, callback) => {
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.query(sql, [email], callback);
  },

  findById: (id, callback) => {
    const sql = `SELECT id, username, email, avatar, created_at FROM users WHERE id = ?`;
    db.query(sql, [id], callback);
  },

  update: (id, data, callback) => {
    const sql = `UPDATE users SET username = ?, avatar = ? WHERE id = ?`;
    db.query(sql, [data.username, data.avatar, id], callback);
  }
};

module.exports = User;
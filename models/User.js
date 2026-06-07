const db = require('../config/db');

const query = (sql, params) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

const User = {
  create: async ({ fullname, username, email, password, avatar }) => {
    const sql = `
      INSERT INTO users (fullname, username, email, password, avatar)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [fullname, username, email, password, avatar ?? null]);
    return result.insertId;
  },

  findByEmail: async (email) => {
    const rows = await query(`SELECT * FROM users WHERE email = ?`, [email]);
    return rows[0] ?? null;
  },

  findByUsername: async (username) => {
    const rows = await query(`SELECT * FROM users WHERE username = ?`, [username]);
    return rows[0] ?? null;
  },

  findById: async (id) => {
    const rows = await query(
      `SELECT id, fullname, username, email, bio, avatar, cover_image, role, status, created_at
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] ?? null;
  },

  update: async (id, { username, avatar }) => {
    await query(`UPDATE users SET username = ?, avatar = ? WHERE id = ?`, [username, avatar, id]);
  },
};

module.exports = User;
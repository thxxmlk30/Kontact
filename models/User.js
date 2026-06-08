const db = require('../config/db');

const query = async (sql, params) => {
  const [results] = await db.query(sql, params);
  return results;
};

const User = {
  create: async ({ fullname, username, email, password, avatar }) => {
    const sql = `
      INSERT INTO users (fullname, username, email, password, avatar)
      VALUES (?, ?, ?, ?, ?)
    `;
    return query(sql, [fullname, username, email, password, avatar ?? 'default-avatar.png']);
  },

  findByEmail: async (email) => {
    const rows = await query(`SELECT * FROM users WHERE email = ?`, [email]);
    return rows[0] ?? null;
  },

  findByUsernameOrEmail: async (identifier) => {
    const rows = await query(
      `SELECT * FROM users WHERE email = ? OR username = ?`,
      [identifier, identifier]
    );
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

  getAll: async () => {
    return query(`SELECT id, fullname, username, email, role, status, created_at FROM users ORDER BY created_at DESC`);
  },

  update: async (id, { fullname, username, bio, avatar, cover_image }) => {
    const sql = `
      UPDATE users 
      SET fullname = ?, username = ?, bio = ?, avatar = ?, cover_image = ? 
      WHERE id = ?
    `;
    return query(sql, [fullname, username, bio, avatar, cover_image, id]);
  },

  updateStatus: async (id, status) => {
    return query(`UPDATE users SET status = ? WHERE id = ?`, [status, id]);
  },

  delete: async (id) => {
    return query(`DELETE FROM users WHERE id = ?`, [id]);
  },

  search: async (q, userId) => {
    const sql = `
      SELECT id, fullname, username, avatar
      FROM users
      WHERE (fullname LIKE ? OR username LIKE ?)
        AND id != ?
      LIMIT 20
    `;
    const pattern = `%${q}%`;
    return query(sql, [pattern, pattern, userId]);
  },
};

module.exports = User;

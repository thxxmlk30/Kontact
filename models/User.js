const db = require('../config/db');

class User {
  static async create(data) {
    const [result] = await db.execute(
      `INSERT INTO users (fullname, username, email, password, avatar)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.fullname,
        data.username,
        data.email,
        data.password,
        data.avatar || 'default-avatar.png'
      ]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findByUsername(username) {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT id, fullname, username, email, bio, avatar, cover_image, role, status, created_at
       FROM users
       WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async update(id, data) {
    const [result] = await db.execute(
      `UPDATE users
       SET fullname = ?, username = ?, bio = ?, avatar = ?
       WHERE id = ?`,
      [data.fullname, data.username, data.bio || null, data.avatar || 'default-avatar.png', id]
    );
    return result.affectedRows;
  }

  static async search(term) {
    const like = `%${term || ''}%`;
    const [rows] = await db.execute(
      `SELECT id, fullname, username, email, avatar
       FROM users
       WHERE fullname LIKE ? OR username LIKE ? OR email LIKE ?
       ORDER BY fullname ASC
       LIMIT 30`,
      [like, like, like]
    );
    return rows;
  }

  static async getAll() {
    const [rows] = await db.execute(
      `SELECT id, fullname, username, email, avatar, role, status, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    return rows;
  }

  static async updateStatus(id, status) {
    const [result] = await db.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = User;

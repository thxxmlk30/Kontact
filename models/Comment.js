const db = require('../config/db');

class Comment {
  static async create(post_id, user_id, content) {
    const [result] = await db.execute(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [post_id, user_id, content]
    );
    return result.insertId;
  }

  static async getByPost(post_id) {
    const [rows] = await db.execute(`
      SELECT c.*, u.fullname, u.username, u.avatar
      FROM comments c JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ? ORDER BY c.created_at ASC
    `, [post_id]);
    return rows;
  }

  static async delete(id) {
    await db.execute('DELETE FROM comments WHERE id = ?', [id]);
  }
}

module.exports = Comment;

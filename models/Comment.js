const db = require('../config/db');

class Comment {
  static async create(dataOrPostId, userId, content) {
    const data = typeof dataOrPostId === 'object'
      ? dataOrPostId
      : { post_id: dataOrPostId, user_id: userId, content };

    const [result] = await db.execute(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [data.post_id, data.user_id, data.content]
    );
    return result;
  }

  static async getByPost(postId) {
    const [rows] = await db.execute(`
      SELECT c.*, u.fullname, u.username, u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [postId]);
    return rows;
  }

  static async findByPostId(postId) {
    return this.getByPost(postId);
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM comments WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM comments WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Comment;

const db = require('../config/db');

class Like {
  static async findByUserAndPost(userId, postId) {
    const [rows] = await db.execute(
      'SELECT * FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );
    return rows[0] || null;
  }

  static async create(data) {
    const [result] = await db.execute(
      'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
      [data.user_id, data.post_id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM likes WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async toggle(userId, postId) {
    const existing = await this.findByUserAndPost(userId, postId);
    if (existing) {
      await this.delete(existing.id);
      return 'unliked';
    }

    await this.create({ user_id: userId, post_id: postId });
    return 'liked';
  }

  static async countByPostId(postId) {
    const [rows] = await db.execute('SELECT COUNT(*) AS total FROM likes WHERE post_id = ?', [postId]);
    return rows[0].total;
  }

  static async count(postId) {
    return this.countByPostId(postId);
  }
}

module.exports = Like;

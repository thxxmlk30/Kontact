const db = require('../config/db');

class Post {
  static async create(data) {
    const { user_id, content, image, visibility } = data;
    const [result] = await db.execute(
      'INSERT INTO posts (user_id, content, image, visibility) VALUES (?, ?, ?, ?)',
      [user_id, content, image || null, visibility || 'public']
    );
    return result.insertId;
  }

  static async getFeed(userId) {
    const [rows] = await db.execute(`
      SELECT p.*, u.fullname, u.username, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS user_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.visibility = 'public'
        OR p.user_id = ?
        OR p.user_id IN (
          SELECT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
          FROM friend_requests WHERE status = 'accepted' AND (sender_id = ? OR receiver_id = ?)
        )
      ORDER BY p.created_at DESC
      LIMIT 50
    `, [userId, userId, userId, userId, userId]);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(`
      SELECT p.*, u.fullname, u.username, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count
      FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?
    `, [id]);
    return rows[0];
  }

  static async getByUser(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  static async update(id, content) {
    await db.execute('UPDATE posts SET content = ? WHERE id = ?', [content, id]);
  }

  static async delete(id) {
    await db.execute('DELETE FROM posts WHERE id = ?', [id]);
  }

  static async getAll() {
    const [rows] = await db.execute(
      'SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC'
    );
    return rows;
  }
}

module.exports = Post;
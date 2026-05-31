const db = require('../config/db');

class Like {
  static async toggle(user_id, post_id) {
    const [existing] = await db.execute(
      'SELECT id FROM likes WHERE user_id = ? AND post_id = ?', [user_id, post_id]
    );
    if (existing.length > 0) {
      await db.execute('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [user_id, post_id]);
      return 'unliked';
    } else {
      await db.execute('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [user_id, post_id]);
      return 'liked';
    }
  }

  static async count(post_id) {
    const [rows] = await db.execute('SELECT COUNT(*) as total FROM likes WHERE post_id = ?', [post_id]);
    return rows[0].total;
  }
}

module.exports = Like;
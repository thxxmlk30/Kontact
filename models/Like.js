const db = require('../config/db');

const query = async (sql, params) => {
  const [results] = await db.query(sql, params);
  return results;
};

const Like = {
  toggle: async (user_id, post_id) => {
    const existing = await query(
      `SELECT id FROM likes WHERE user_id = ? AND post_id = ?`,
      [user_id, post_id]
    );

    if (existing.length > 0) {
      await query(`DELETE FROM likes WHERE user_id = ? AND post_id = ?`, [user_id, post_id]);
      return 'unliked';
    } else {
      await query(`INSERT INTO likes (user_id, post_id) VALUES (?, ?)`, [user_id, post_id]);
      return 'liked';
    }
  },

  countByPostId: async (post_id) => {
    const rows = await query(`SELECT COUNT(*) as total FROM likes WHERE post_id = ?`, [post_id]);
    return rows[0].total;
  }
};

module.exports = Like;
